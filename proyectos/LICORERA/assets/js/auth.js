/* ============================================
   JIMÉNEZ LICORES — Auth admin (metodología Apex/Divinas)
   SHA-256 via Web Crypto · sesión localStorage con expiración
   ============================================ */

const AUTH_KEY = 'jl_session';
const SESSION_DAYS = 7;

async function hash(str) {
  const buf = new TextEncoder().encode(str);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const ADMIN_EMAIL = 'admin@jimenezlicores.com';
// Pre-computed SHA-256 de 'admin123' — CAMBIAR ESTE VALOR EN PRODUCCIÓN
const ADMIN_PASS_HASH = '240be518fabd2724ddb6f05eeb5500d0f365e9f65c138e204e1e1947e53e58c2';

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

async function loginAdmin(email, password) {
  const passHash = await hash(password);
  if (normalizeEmail(email) === ADMIN_EMAIL && passHash === ADMIN_PASS_HASH) {
    const session = { userId: 'admin', name: 'Admin', email: ADMIN_EMAIL, type: 'admin' };
    saveSession(session);
    return { ok: true, session };
  }
  return { ok: false, error: 'Credenciales de admin incorrectas.' };
}

function saveSession(session) {
  session.expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem(AUTH_KEY));
    if (!session) return null;
    if (session.expiresAt && Date.now() > session.expiresAt) { logout(); return null; }
    return session;
  }
  catch { return null; }
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
}
