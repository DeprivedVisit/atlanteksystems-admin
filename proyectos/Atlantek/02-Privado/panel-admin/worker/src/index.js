/**
 * Atlantek Auth Worker
 * JWT-based authentication with HttpOnly cookies
 * Roles: admin, vendedor, cliente
 */

import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'atlantek_auth';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 8 * 60 * 60, // 8 hours
};

const ROLE_PERMISSIONS = {
  admin: ['*'], // Full access
  vendedor: ['leads:read', 'leads:write', 'clientes:read', 'clientes:write', 'documentos:read', 'catalogo:read'],
  cliente: ['documentos:read_own', 'catalogo:read'],
};

const DEFAULT_USER = {
  id: 'admin-1',
  nombre: 'Administrador',
  email: 'soporte@atlanteksystems.com',
  role: 'admin',
};

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

function createSessionToken(payload) {
  const secret = new TextEncoder().encode(ATLANTEK_JWT_SECRET);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRY_HOURS}h`)
    .sign(secret);
}

async function verifySessionToken(token) {
  try {
    const secret = new TextEncoder().encode(ATLANTEK_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}

function setAuthCookie(response, token) {
  response.headers.append('Set-Cookie', `${COOKIE_NAME}=${token}; ${Object.entries(COOKIE_OPTIONS).map(([k, v]) => `${k}=${v}`).join('; ')}`);
  return response;
}

function clearAuthCookie(response) {
  response.headers.append('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
  return response;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    const response = new Response();
    Object.entries(corsHeaders()).forEach(([k, v]) => response.headers.set(k, v));

    // Health check
    if (path === '/api/auth/health') {
      return new Response(JSON.stringify({ ok: true, service: 'atlantek-auth' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }

    // Login
    if (path === '/api/auth/login' && request.method === 'POST') {
      try {
        const { password, remember } = await request.json();
        
        if (!password) {
          return new Response(JSON.stringify({ ok: false, error: 'Password requerido' }), {
            status: 400,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          });
        }

        // Verify password (in production, fetch from secure store)
        const isValid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
        
        if (!isValid) {
          return new Response(JSON.stringify({ ok: false, error: 'Credenciales inválidas' }), {
            status: 401,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          });
        }

        // Create session token
        const token = await createSessionToken({
          sub: DEFAULT_USER.id,
          nombre: DEFAULT_USER.nombre,
          email: DEFAULT_USER.email,
          role: DEFAULT_USER.role,
          iat: Math.floor(Date.now() / 1000),
        });

        // Store session in KV for revocation support
        if (env.AUTH_KV) {
          await env.AUTH_KV.put(`session:${DEFAULT_USER.id}`, token, { expirationTtl: JWT_EXPIRY_HOURS * 3600 });
        }

        const res = new Response(JSON.stringify({ 
          ok: true, 
          user: DEFAULT_USER,
          token 
        }), {
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        });
        
        return setAuthCookie(res, token);
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: 'Error interno' }), {
          status: 500,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        });
      }
    }

    // Verify token / get current user
    if (path === '/api/auth/me' && request.method === 'GET') {
      const cookieHeader = request.headers.get('Cookie') || '';
      const tokenMatch = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      const token = tokenMatch ? tokenMatch[1] : null;

      if (!token) {
        return new Response(JSON.stringify({ ok: false, error: 'No autenticado' }), {
          status: 401,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        });
      }

      const payload = await verifySessionToken(token);
      
      if (!payload) {
        const res = new Response(JSON.stringify({ ok: false, error: 'Token inválido o expirado' }), {
          status: 401,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        });
        return clearAuthCookie(res);
      }

      // Check if session revoked in KV
      if (env.AUTH_KV) {
        const stored = await env.AUTH_KV.get(`session:${payload.sub}`);
        if (stored !== token) {
          const res = new Response(JSON.stringify({ ok: false, error: 'Sesión revocada' }), {
            status: 401,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          });
          return clearAuthCookie(res);
        }
      }

      return new Response(JSON.stringify({ 
        ok: true, 
        user: {
          id: payload.sub,
          nombre: payload.nombre,
          email: payload.email,
          role: payload.role,
        }
      }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }

    // Logout
    if (path === '/api/auth/logout' && request.method === 'POST') {
      const cookieHeader = request.headers.get('Cookie') || '';
      const tokenMatch = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      const token = tokenMatch ? tokenMatch[1] : null;

      if (token && env.AUTH_KV) {
        try {
          const payload = await verifySessionToken(token);
          if (payload?.sub) {
            await env.AUTH_KV.delete(`session:${payload.sub}`);
          }
        } catch (e) {}
      }

      const res = new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
      return clearAuthCookie(res);
    }

    // Refresh token
    if (path === '/api/auth/refresh' && request.method === 'POST') {
      const cookieHeader = request.headers.get('Cookie') || '';
      const tokenMatch = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      const token = tokenMatch ? tokenMatch[1] : null;

      if (!token) {
        return new Response(JSON.stringify({ ok: false, error: 'No autenticado' }), {
          status: 401,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        });
      }

      const payload = await verifySessionToken(token);
      if (!payload) {
        return new Response(JSON.stringify({ ok: false, error: 'Token inválido' }), {
          status: 401,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        });
      }

      // Create new token with fresh expiry
      const newToken = await createSessionToken({
        sub: payload.sub,
        nombre: payload.nombre,
        email: payload.email,
        role: payload.role,
      });

      if (env.AUTH_KV) {
        await env.AUTH_KV.put(`session:${payload.sub}`, newToken, { expirationTtl: JWT_EXPIRY_HOURS * 3600 });
      }

      const res = new Response(JSON.stringify({ ok: true, token: newToken }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
      return setAuthCookie(res, newToken);
    }

    // Middleware: verify auth for protected routes
    if (path.startsWith('/api/protected/')) {
      const cookieHeader = request.headers.get('Cookie') || '';
      const tokenMatch = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      const token = tokenMatch ? tokenMatch[1] : null;

      if (!token) {
        return new Response(JSON.stringify({ ok: false, error: 'No autenticado' }), {
          status: 401,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        });
      }

      const payload = await verifySessionToken(token);
      if (!payload) {
        return new Response(JSON.stringify({ ok: false, error: 'Token inválido' }), {
          status: 401,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        });
      }

      // Add user info to request headers for downstream
      const newHeaders = new Headers(request.headers);
      newHeaders.set('X-User-Id', payload.sub);
      newHeaders.set('X-User-Role', payload.role);
      newHeaders.set('X-User-Nombre', payload.nombre);

      // Forward to actual handler (would need routing logic)
      return new Response(JSON.stringify({ ok: false, error: 'Endpoint no implementado' }), {
        status: 404,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ ok: false, error: 'Endpoint no encontrado' }), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  },

  // Scheduled: cleanup expired sessions
  async scheduled(event, env, ctx) {
    if (env.AUTH_KV) {
      // KV auto-expires, but we could add manual cleanup here if needed
      console.log('Auth worker: scheduled cleanup');
    }
  }
};

// Environment variables (set in wrangler.toml or Cloudflare dashboard)
const ATLANTEK_JWT_SECRET = globalThis.ATLANTEK_JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRY_HOURS = parseInt(globalThis.JWT_EXPIRY_HOURS || '8', 10);
const ADMIN_PASSWORD_HASH = globalThis.ADMIN_PASSWORD_HASH || 'YXRsYW50ZWsyMDI2';