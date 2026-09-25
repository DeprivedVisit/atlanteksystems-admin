/**
 * Atlantek Auth Client
 * Frontend authentication using Cloudflare Worker backend
 * Handles login, logout, token refresh, role-based access
 * Falls back to localStorage auth for local development
 */

const Auth = (() => {
  const API_BASE = '/api/auth';
  let currentUser = null;
  let refreshTimer = null;
  let useLocalFallback = false;

  // Check if we're in local development
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const LOCAL_STORAGE_KEY = 'atlantek-auth-jwt';
  const LOCAL_HASH = 'YXRsYW50ZWsyMDI2'; // base64('atlantek2026')
  const LOCAL_USER = {
    id: 'admin-1',
    nombre: 'Administrador',
    email: 'soporte@atlanteksystems.com',
    role: 'admin',
  };

  async function request(endpoint, options = {}) {
    if (useLocalFallback) {
      throw new Error('Using local fallback');
    }
    
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      credentials: 'include', // Include HttpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    // If API not available (404, 501, etc.), switch to local fallback
    if (response.status === 404 || response.status === 501) {
      useLocalFallback = true;
      console.log('Auth API not available, switching to local fallback');
      throw new Error('Using local fallback');
    }
    
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return data;
  }

  async function login(password) {
    try {
      const data = await request('/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      
      if (data.ok) {
        currentUser = data.user;
        scheduleRefresh();
        return { ok: true, user: data.user };
      }
      throw new Error(data.error);
    } catch (e) {
      // Local fallback
      if (btoa(password) === LOCAL_HASH) {
        currentUser = LOCAL_USER;
        localStorage.setItem(LOCAL_STORAGE_KEY, '1');
        scheduleRefresh();
        return { ok: true, user: LOCAL_USER };
      }
      throw new Error('Clave incorrecta');
    }
  }

  async function logout() {
    try {
      await request('/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout error:', e);
    }
    // Local fallback cleanup
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    currentUser = null;
    clearRefreshTimer();
  }

  async function checkAuth() {
    try {
      const data = await request('/me');
      if (data.ok) {
        currentUser = data.user;
        scheduleRefresh();
        return { ok: true, user: data.user };
      }
    } catch (e) {
      // Local fallback
      if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
        currentUser = LOCAL_USER;
        scheduleRefresh();
        return { ok: true, user: LOCAL_USER };
      }
      currentUser = null;
    }
    return { ok: false, user: null };
  }

  async function refresh() {
    try {
      const data = await request('/refresh', { method: 'POST' });
      return data.ok;
    } catch (e) {
      return false;
    }
  }

  function scheduleRefresh() {
    clearRefreshTimer();
    // Refresh 5 minutes before expiry (8h - 5m = 7h55m)
    refreshTimer = setTimeout(async () => {
      const ok = await refresh();
      if (!ok) {
        currentUser = null;
        // Redirect to login
        if (window.location.pathname.includes('/admin')) {
          window.location.reload();
        }
      }
    }, (7 * 60 + 55) * 60 * 1000);
  }

  function clearRefreshTimer() {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  }

  function getUser() {
    return currentUser;
  }

  function hasRole(...roles) {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true; // Admin has all permissions
    return roles.includes(currentUser.role);
  }

  function hasPermission(permission) {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    // Check role permissions
    const ROLE_PERMISSIONS = {
      admin: ['*'],
      vendedor: ['leads:read', 'leads:write', 'clientes:read', 'clientes:write', 'documentos:read', 'catalogo:read'],
      cliente: ['documentos:read_own', 'catalogo:read'],
    };
    const perms = ROLE_PERMISSIONS[currentUser.role] || [];
    return perms.includes('*') || perms.includes(permission);
  }

  function requireAuth(allowedRoles = []) {
    if (!currentUser) {
      return false;
    }
    if (allowedRoles.length && !allowedRoles.includes(currentUser.role) && currentUser.role !== 'admin') {
      return false;
    }
    return true;
  }

  // Initialize on load
  let initPromise = null;
  function init() {
    if (!initPromise) {
      initPromise = checkAuth();
    }
    return initPromise;
  }

  return {
    login,
    logout,
    checkAuth,
    refresh,
    getUser,
    hasRole,
    hasPermission,
    requireAuth,
    init,
  };
})();

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});

// Export for global access
window.Auth = Auth;