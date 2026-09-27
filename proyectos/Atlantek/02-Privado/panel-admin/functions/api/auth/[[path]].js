/**
 * Atlantek Auth — Cloudflare Pages Function
 * Endpoints: /api/auth/login, /api/auth/me, /api/auth/logout, /api/auth/refresh
 * Uses KV binding AUTH_KV (configured in Pages project settings)
 * No external dependencies — uses native Web Crypto API
 */

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

// Base64URL encoding (no padding)
function base64urlEncode(data) {
  return btoa(String.fromCharCode(...new Uint8Array(data)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) str += '='.repeat(4 - pad);
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// HMAC-SHA256 signing
async function hmacSha256Sign(key, data) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
  return base64urlEncode(signature);
}

async function hmacSha256Verify(key, data, signature) {
  const expected = await hmacSha256Sign(key, data);
  return expected === signature;
}

// Create JWT token (HS256)
async function createSessionToken(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iat: now,
    exp: now + 8 * 3600, // 8 hours
  };
  const headerB64 = base64urlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(new TextEncoder().encode(JSON.stringify(claims)));
  const unsigned = `${headerB64}.${payloadB64}`;
  const signature = await hmacSha256Sign(secret, unsigned);
  return `${unsigned}.${signature}`;
}

// Verify JWT token (HS256)
async function verifySessionToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signature] = parts;
    const unsigned = `${parts[0]}.${parts[1]}`;
    const valid = await hmacSha256Verify(secret, unsigned, signature);
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
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

  // Test endpoint
  if (path === '/api/auth/test' && method === 'GET') {
    return new Response(JSON.stringify({ ok: true, test: 'Function works', env: Object.keys(env) }), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }

  // Test password verification
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