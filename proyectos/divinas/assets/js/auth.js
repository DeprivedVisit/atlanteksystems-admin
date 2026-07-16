const AUTH_KEY = 'divinas_session';
const USERS_KEY = 'divinas_users';
const SESSION_DAYS = 7; // la sesión se recuerda 7 días

// ── SHA-256 via Web Crypto API (reemplaza djb2 trivial) ──
async function hash(str) {
  const buf = new TextEncoder().encode(str);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const ADMIN_EMAIL = 'admin@divinas.com';
// Pre-computed SHA-256 de 'admin123' — CAMBIAR ESTE VALOR EN PRODUCCIÓN
const ADMIN_PASS_HASH = '240be518fabd2724ddb6f05eeb5500d0f365e9f65c138e204e1e1947e53e58c2';

// Emails siempre normalizados: "Ana@Gmail.com " === "ana@gmail.com"
function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function registerUser(name, email, phone, password) {
  const users = getUsers();
  const normEmail = normalizeEmail(email);
  if (users.find(u => normalizeEmail(u.email) === normEmail)) return { ok: false, error: 'Este correo ya está registrado.' };
  const user = { id: 'U' + Date.now().toString(36).toUpperCase(), name, email: normEmail, phone, passwordHash: await hash(password), registeredAt: new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }) };
  users.push(user);
  saveUsers(users);
  return { ok: true, user };
}

async function loginUser(email, password) {
  const users = getUsers();
  const normEmail = normalizeEmail(email);
  const passHash = await hash(password);
  const user = users.find(u => normalizeEmail(u.email) === normEmail && u.passwordHash === passHash);
  if (!user) return { ok: false, error: 'Correo o contraseña incorrectos.' };
  const session = { userId: user.id, name: user.name, email: user.email, type: 'user' };
  saveSession(session);
  return { ok: true, session };
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

// Sesión en localStorage con expiración — sobrevive al cierre de pestaña/navegador
function saveSession(session) {
  session.expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  sessionStorage.removeItem(AUTH_KEY); // limpia formato viejo
}

function getSession() {
  try {
    // migración: sesiones viejas vivían en sessionStorage
    const raw = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
    const session = JSON.parse(raw);
    if (!session) return null;
    if (session.expiresAt && Date.now() > session.expiresAt) { logout(); return null; }
    return session;
  }
  catch { return null; }
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
}

function requireAuth(redirect = 'index.html') {
  const session = getSession();
  if (!session || session.type !== 'user') { window.location.href = redirect; return null; }
  return session;
}

function requireAdmin(redirect = 'index.html') {
  const session = getSession();
  if (!session || session.type !== 'admin') { window.location.href = redirect; return null; }
  return session;
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('hamburgerBtn');
  const links = document.querySelector('.nav-links');
  if (btn && links) {
    btn.addEventListener('click', () => {
      links.classList.toggle('mobile-open');
      btn.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('nav') && links.classList.contains('mobile-open')) {
        links.classList.remove('mobile-open');
        btn.classList.remove('active');
      }
    });
  }
});
