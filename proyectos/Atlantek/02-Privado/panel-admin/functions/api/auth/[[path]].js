/**
 * Atlantek Auth — Cloudflare Pages Function
 * Endpoints: /api/auth/login, /api/auth/me, /api/auth/logout, /api/auth/refresh
 * Uses KV binding AUTH_KV (configured in Pages project settings)
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

function createSessionToken(payload, secret) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(new TextEncoder().encode(secret));
}

async function verifySessionToken(token, secret) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
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

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const response = new Response();
  Object.entries(corsHeaders()).forEach(([k, v]) => response.headers.set(k, v));

  // Health check
  if (path === '/api/auth/health' && method === 'GET') {
    return new Response(JSON.stringify({ ok: true, service: 'atlantek-auth' }), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }

  // Test endpoint - no jose
  if (path === '/api/auth/test' && method === 'GET') {
    return new Response(JSON.stringify({ ok: true, test: 'Function works', env: Object.keys(env) }), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }

  // Test password verification - no jose
  if (path === '/api/auth/test-password' && method === 'POST') {
    try {
      const { password } = await request.json();
      const hash = '90283688d6ffa15f24f1c8296639040db3afb9c9870907e64e317649eb82b20a';
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return new Response(JSON.stringify({ 
        ok: true, 
        input: password,
        computedHash: computedHash,
        expectedHash: hash,
        match: computedHash === hash
      }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }
  }

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  const JWT_SECRET = env.JWT_SECRET || 'dev-secret-change-me';
  const ADMIN_PASSWORD_HASH = env.ADMIN_PASSWORD_HASH || '90283688d6ffa15f24f1c8296639040db3afb9c9870907e64e317649eb82b20a';

  // Login
  if (path === '/api/auth/login' && method === 'POST') {
    try {
      const { password } = await request.json();
      
      if (!password) {
        return new Response(JSON.stringify({ ok: false, error: 'Password requerido' }), {
          status: 400,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        });
      }

      const isValid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
      
      if (!isValid) {
        return new Response(JSON.stringify({ ok: false, error: 'Credenciales inválidas' }), {
          status: 401,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        });
      }

      const token = await createSessionToken({
        sub: DEFAULT_USER.id,
        nombre: DEFAULT_USER.nombre,
        email: DEFAULT_USER.email,
        role: DEFAULT_USER.role,
      }, JWT_SECRET);

      // Store session in KV for revocation support
      if (env.AUTH_KV) {
        await env.AUTH_KV.put(`session:${DEFAULT_USER.id}`, token, { expirationTtl: 8 * 3600 });
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
      return new Response(JSON.stringify({ ok: false, error: 'Error interno', details: e.message }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }
  }

  // Verify token / get current user
  if (path === '/api/auth/me' && method === 'GET') {
    const cookieHeader = request.headers.get('Cookie') || '';
    const tokenMatch = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return new Response(JSON.stringify({ ok: false, error: 'No autenticado' }), {
        status: 401,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }

    const payload = await verifySessionToken(token, JWT_SECRET);
    
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
  if (path === '/api/auth/logout' && method === 'POST') {
    const cookieHeader = request.headers.get('Cookie') || '';
    const tokenMatch = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    const token = tokenMatch ? tokenMatch[1] : null;

    if (token && env.AUTH_KV) {
      try {
        const payload = await verifySessionToken(token, JWT_SECRET);
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
  if (path === '/api/auth/refresh' && method === 'POST') {
    const cookieHeader = request.headers.get('Cookie') || '';
    const tokenMatch = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return new Response(JSON.stringify({ ok: false, error: 'No autenticado' }), {
        status: 401,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }

    const payload = await verifySessionToken(token, JWT_SECRET);
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
    }, JWT_SECRET);

    if (env.AUTH_KV) {
      await env.AUTH_KV.put(`session:${payload.sub}`, newToken, { expirationTtl: 8 * 3600 });
    }

    const res = new Response(JSON.stringify({ ok: true, token: newToken }), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
    return setAuthCookie(res, newToken);
  }

  return new Response(JSON.stringify({ ok: false, error: 'Endpoint no encontrado' }), {
    status: 404,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
  });
}