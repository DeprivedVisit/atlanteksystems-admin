// api.js — Sync client para Garett RPG
// Guarda en DynamoDB y cae a localStorage si no hay internet

const API_URL  = import.meta.env.VITE_API_URL  || "";
const USER_ID  = import.meta.env.VITE_USER_ID  || "garett";
const TIMEOUT  = 6000; // ms

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// ── LOCAL STORAGE FALLBACK ────────────────────────────────────────────────────
function lsLoad(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
}
function lsSave(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── API CALLS ─────────────────────────────────────────────────────────────────

/**
 * Carga el progreso del servidor.
 * Si falla, carga desde localStorage.
 */
export async function loadProgress() {
  if (!API_URL) return loadLocal();
  try {
    const res = await fetchWithTimeout(`${API_URL}/progress`);
    const data = await res.json();
    // Merge server data into localStorage as cache
    if (data.profile) {
      lsSave("grpg-xp",       data.profile.totalXP    ?? 0);
      lsSave("grpg-unlocked", JSON.parse(data.profile.unlocked ?? "[]"));
    }
    if (data.history) {
      const parsed = data.history.map(d => ({
        ...d,
        checked: typeof d.checked === "string" ? JSON.parse(d.checked) : (d.checked || {}),
      }));
      lsSave("grpg-history", parsed);
    }
    return {
      totalXP:  data.profile?.totalXP   ?? 0,
      unlocked: JSON.parse(data.profile?.unlocked ?? "[]"),
      history:  data.history ?? [],
      source:   "server",
    };
  } catch (e) {
    console.warn("⚠️ Offline — usando localStorage", e.message);
    return { ...loadLocal(), source: "local" };
  }
}

/**
 * Carga solo el día de hoy del servidor.
 */
export async function loadToday() {
  if (!API_URL) return null;
  try {
    const res  = await fetchWithTimeout(`${API_URL}/progress/today`);
    const data = await res.json();
    if (data.today) {
      lsSave("grpg-checked", data.today.checked || {});
      return data.today;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Guarda el día completado al servidor.
 * Siempre guarda también en localStorage.
 */
export async function saveDay({ checked, dayXP, completionPct, unlocked }) {
  // Siempre guarda local primero
  const prevXP = lsLoad("grpg-xp", 0);
  lsSave("grpg-xp", prevXP + dayXP);
  lsSave("grpg-checked", {});
  lsSave("grpg-unlocked", unlocked);
  const prevHistory = lsLoad("grpg-history", []);
  lsSave("grpg-history", [...prevHistory, {
    date: new Date().toISOString(),
    completionPct,
    checked,
  }]);

  if (!API_URL) return { saved: true, source: "local" };

  try {
    const res = await fetchWithTimeout(`${API_URL}/progress/save`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ checked, dayXP, completionPct, unlocked }),
    });
    const data = await res.json();
    return { ...data, source: "server" };
  } catch (e) {
    console.warn("⚠️ No se pudo sincronizar con el servidor, guardado local", e.message);
    return { saved: true, source: "local", offline: true };
  }
}

/**
 * Carga desde localStorage como fallback.
 */
function loadLocal() {
  return {
    totalXP:  lsLoad("grpg-xp",       0),
    unlocked: lsLoad("grpg-unlocked",  []),
    history:  lsLoad("grpg-history",   []),
  };
}

export { lsLoad, lsSave };
