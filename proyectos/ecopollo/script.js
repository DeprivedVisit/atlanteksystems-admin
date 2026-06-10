const WEBHOOK_URL = 'https://YOUR_N8N_INSTANCE/webhook/ecopollo-leads';

// ── Fondo rotativo ──────────────────────────────────────────────────────────
(function () {
  const IMGS = [
    'fondo/pexels-hariprasad-ce-512756904-34797333.jpg',
    'fondo/pexels-deniss-bojanini-174298580-12415681.jpg',
    'fondo/pexels-einfoto-2209439.jpg',
    'fondo/pexels-arti-tic-1675363189-34110265.jpg',
    'fondo/pexels-andres-carrera-189555109-11414300.jpg',
    'fondo/pexels-abhijith-ts-33843905-24973405.jpg',
    'fondo/pexels-tahir-33328012.jpg',
    'fondo/pexels-goumbik-616353.jpg',
    'fondo/pexels-alleksana-6107764.jpg',
    'fondo/pexels-ivandesignx-29887688.jpg',
  ];
  let idx = 0;
  const el = document.getElementById('heroBg');
  if (!el) return;
  el.style.backgroundImage = `url(${IMGS[0]})`;
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  setInterval(() => {
    idx = (idx + 1) % IMGS.length;
    el.style.opacity = '0';
    setTimeout(() => {
      el.style.backgroundImage = `url(${IMGS[idx]})`;
      el.style.opacity = '1';
    }, 900);
  }, 9000);
})();

const PRECIOS = {
  'Pollo entero': 1950,
  'Pechuga deshuesada': 3025,
  'Muslo entero': 1475
};

const WA_PHONE = '50688880000';

const state = {
  producto: '',
  cantidad_kg: 5,
  zona: '',
  tipo_pedido: '',
  nombre: '',
  telefono: '',
  email: '',
  total_colones: 0
};

let currentStep = 1;
const TOTAL_STEPS = 5;

// ── NAV scroll ──
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 40);
});

// ── REVEAL ──
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.1 }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── STEP LOGIC ──
function showStep(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(n === 'resumen' ? 'stepResumen' : `step${n}`);
  if (el) el.classList.add('active');
  currentStep = typeof n === 'number' ? n : TOTAL_STEPS + 1;
  updateProgress();
}

function updateProgress() {
  const pct = Math.min((currentStep / TOTAL_STEPS) * 100, 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.querySelectorAll('.ps').forEach(ps => {
    const s = parseInt(ps.dataset.step);
    ps.classList.remove('active', 'done');
    if (s === currentStep) ps.classList.add('active');
    else if (s < currentStep) ps.classList.add('done');
  });
}

// ── CARD SELECTION ──
function bindCards(selector, stateKey, nextBtn) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll(selector).forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state[stateKey] = card.dataset.val;
      if (nextBtn) document.getElementById(nextBtn).disabled = false;
    });
  });
}

bindCards('.prod-card', 'producto', 'next1');
bindCards('.zone-card', 'zona', 'next3');
bindCards('.tipo-card', 'tipo_pedido', 'next4');

// ── KG SLIDER ──
const kgSlider = document.getElementById('kgSlider');
const kgInput = document.getElementById('kgInput');
const kgDisplay = document.getElementById('kgDisplay');

function updateKg(val) {
  const kg = Math.max(1, parseInt(val) || 1);
  state.cantidad_kg = kg;
  kgDisplay.textContent = kg;
  kgSlider.value = Math.min(kg, 50);
  kgInput.value = kg;
  updateSubtotal();
}

function updateSubtotal() {
  const precio = PRECIOS[state.producto] || 0;
  const total = precio * state.cantidad_kg;
  state.total_colones = total;
  document.getElementById('subtotalPreview').textContent =
    total > 0 ? `₡ ${total.toLocaleString('es-CR')}` : '—';
}

kgSlider.addEventListener('input', e => updateKg(e.target.value));
kgInput.addEventListener('input', e => updateKg(e.target.value));

// ── STEP 5 VALIDATION ──
function validateStep5() {
  const nombre = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  document.getElementById('btnSubmit').disabled = !(nombre.length >= 2 && telefono.length >= 8);
}
document.getElementById('nombre').addEventListener('input', validateStep5);
document.getElementById('telefono').addEventListener('input', validateStep5);

// ── NAVIGATION ──
document.getElementById('next1').addEventListener('click', () => {
  updateSubtotal();
  showStep(2);
});
document.getElementById('next2').addEventListener('click', () => showStep(3));
document.getElementById('next3').addEventListener('click', () => showStep(4));
document.getElementById('next4').addEventListener('click', () => showStep(5));

document.getElementById('back2').addEventListener('click', () => showStep(1));
document.getElementById('back3').addEventListener('click', () => showStep(2));
document.getElementById('back4').addEventListener('click', () => showStep(3));
document.getElementById('back5').addEventListener('click', () => showStep(4));

// ── SUBMIT ──
document.getElementById('btnSubmit').addEventListener('click', async () => {
  state.nombre = document.getElementById('nombre').value.trim();
  state.telefono = document.getElementById('telefono').value.trim();
  state.email = document.getElementById('email').value.trim();

  const precio = PRECIOS[state.producto] || 0;
  state.total_colones = precio * state.cantidad_kg;

  buildResumen();
  showStep('resumen');
  sendToWebhook();
});

function buildResumen() {
  const rows = [
    ['Producto', state.producto],
    ['Cantidad', `${state.cantidad_kg} kg`],
    ['Zona', state.zona],
    ['Tipo pedido', state.tipo_pedido],
    ['Nombre', state.nombre],
    ['Teléfono', state.telefono],
  ];
  if (state.email) rows.push(['Email', state.email]);

  document.getElementById('resumenTable').innerHTML = rows.map(([k, v]) => `
    <div class="resumen-row">
      <span class="resumen-key">${k}</span>
      <span class="resumen-val">${v}</span>
    </div>
  `).join('');

  document.getElementById('resumenTotal').textContent =
    `₡ ${state.total_colones.toLocaleString('es-CR')}`;

  const msg = encodeURIComponent(
    `Hola EcoPollo 🐔, quiero confirmar mi pedido:\n\n` +
    `📦 Producto: ${state.producto}\n` +
    `⚖️ Cantidad: ${state.cantidad_kg} kg\n` +
    `💰 Total: ₡${state.total_colones.toLocaleString('es-CR')}\n` +
    `📍 Zona: ${state.zona}\n` +
    `🏷️ Tipo: ${state.tipo_pedido}\n\n` +
    `A nombre de: ${state.nombre}`
  );
  document.getElementById('btnWA').href = `https://wa.me/${WA_PHONE}?text=${msg}`;
}

async function sendToWebhook() {
  const payload = {
    nombre: state.nombre,
    telefono: state.telefono,
    email: state.email,
    producto: state.producto,
    cantidad_kg: String(state.cantidad_kg),
    total_colones: String(state.total_colones),
    zona: state.zona,
    tipo_pedido: state.tipo_pedido,
    fecha: new Date().toLocaleString('es-CR')
  };

  const sending = document.getElementById('resumenSending');
  const success = document.getElementById('resumenSuccess');

  sending.style.display = 'flex';

  try {
    if (!WEBHOOK_URL.includes('YOUR_N8N_INSTANCE')) {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    sending.style.display = 'none';
    success.style.display = 'flex';
  } catch {
    sending.style.display = 'none';
  }
}

// ── NUEVO PEDIDO ──
document.getElementById('btnNuevo').addEventListener('click', () => {
  document.querySelectorAll('.prod-card, .zone-card, .tipo-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('input[type=radio]').forEach(r => r.checked = false);
  document.getElementById('nombre').value = '';
  document.getElementById('telefono').value = '';
  document.getElementById('email').value = '';
  document.getElementById('resumenSuccess').style.display = 'none';
  Object.assign(state, { producto: '', zona: '', tipo_pedido: '', nombre: '', telefono: '', email: '', cantidad_kg: 5 });
  updateKg(5);
  document.getElementById('next1').disabled = true;
  document.getElementById('next3').disabled = true;
  document.getElementById('next4').disabled = true;
  document.getElementById('btnSubmit').disabled = true;
  showStep(1);
  document.getElementById('cotizador').scrollIntoView({ behavior: 'smooth' });
});

// Init
updateProgress();

// ══════════════════════════════════════════════════════════════════════════════
//  APPS SCRIPT URL — pegar aquí después de deploy
// ══════════════════════════════════════════════════════════════════════════════
const APPS_SCRIPT_URL = '';   // <-- pegar la URL de tu web app aquí

// ── MEGA MENU ─────────────────────────────────────────────────────────────────
const navMenuBtn  = document.getElementById('navMenuBtn');
const megaMenu    = document.getElementById('megaMenu');
const menuOverlay = document.getElementById('menuOverlay');

function toggleMenu(force) {
  const open = force !== undefined ? force : !megaMenu.classList.contains('open');
  megaMenu.classList.toggle('open', open);
  menuOverlay.classList.toggle('show', open);
  navMenuBtn.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

navMenuBtn?.addEventListener('click', () => toggleMenu());
menuOverlay?.addEventListener('click', () => toggleMenu(false));

// Cerrar al hacer click en cotizador dentro del mega menu
megaMenu?.querySelectorAll('.mega-links a').forEach(a => {
  a.addEventListener('click', () => toggleMenu(false));
});

// Quick add desde mega menu
document.querySelectorAll('.mc-add-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.mega-cat');
    const nombre  = card.dataset.nombre;
    const precio  = parseInt(card.dataset.precio);
    const imgUrl  = card.dataset.img;
    quickAdd({ nombre, precio, imgUrl });
    toggleMenu(false);
    toggleCart(true);
  });
});

// ── USER DROPDOWN ─────────────────────────────────────────────────────────────
const navUserBtn      = document.getElementById('navUserBtn');
const navUserDropdown = document.getElementById('navUserDropdown');
let dropdownOpen = false;

function toggleUserMenu(force) {
  dropdownOpen = force !== undefined ? force : !dropdownOpen;
  if (navUserDropdown) {
    navUserDropdown.style.display = dropdownOpen ? 'block' : 'none';
  }
}

navUserBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleUserMenu();
});

document.addEventListener('click', (e) => {
  if (dropdownOpen && !navUserDropdown?.contains(e.target) && e.target !== navUserBtn) {
    toggleUserMenu(false);
  }
});

// ── SESSION ───────────────────────────────────────────────────────────────────
function getSession() {
  try { return JSON.parse(localStorage.getItem('ep_session') || 'null'); } catch { return null; }
}
function saveSession(u) { localStorage.setItem('ep_session', JSON.stringify(u)); }
function clearSession()  { localStorage.removeItem('ep_session'); }

function setNavLoggedIn(u) {
  const loginBtn   = document.getElementById('navLoginBtn');
  const userBtn    = document.getElementById('navUserBtn');
  const userNameEl = document.getElementById('navUserName');
  if (u) {
    loginBtn?.style  && (loginBtn.style.display = 'none');
    userBtn?.style   && (userBtn.style.display = 'flex');
    if (userNameEl) userNameEl.textContent = u.nombre.split(' ')[0];
  } else {
    loginBtn?.style  && (loginBtn.style.display = '');
    userBtn?.style   && (userBtn.style.display = 'none');
  }
}

// Init session
(function() {
  const u = getSession();
  if (u) setNavLoggedIn(u);
  else {
    const ub = document.getElementById('navUserBtn');
    if (ub) ub.style.display = 'none';
  }
})();

// ── AUTH MODAL ────────────────────────────────────────────────────────────────
const authModal = document.getElementById('authModal');

function openAuth(tab) {
  authModal?.classList.add('show');
  switchAuthTab(tab || 'login');
}
function closeAuth()  { authModal?.classList.remove('show'); }
function cerrarAuth() { closeAuth(); }
function abrirAuth(t) { openAuth(t); }

authModal?.addEventListener('click', (e) => { if (e.target === authModal) closeAuth(); });

function switchAuthTab(name) {
  const panels = { login: 'panelLogin', register: 'panelRegister' };
  document.getElementById('tabLogin')?.classList.toggle('active', name === 'login');
  document.getElementById('tabRegister')?.classList.toggle('active', name === 'register');
  const loginPanel = document.getElementById('panelLogin');
  const regPanel   = document.getElementById('panelRegister');
  if (loginPanel) loginPanel.style.display = name === 'login'    ? 'block' : 'none';
  if (regPanel)   regPanel.style.display   = name === 'register' ? 'block' : 'none';
  clearAuthMsgs();
}

function clearAuthMsgs() {
  ['loginMsg','regMsg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.className = 'auth-msg'; el.textContent = ''; }
  });
}

function setLoginMsg(type, text) {
  const el = document.getElementById('loginMsg');
  if (!el) return;
  el.className = type === 'loading' ? 'auth-msg' : `auth-msg ${type}`;
  el.textContent = type === 'loading' ? 'Procesando…' : (text || '');
}

function setRegMsg(type, text) {
  const el = document.getElementById('regMsg');
  if (!el) return;
  el.className = type === 'loading' ? 'auth-msg' : `auth-msg ${type}`;
  el.textContent = type === 'loading' ? 'Procesando…' : (text || '');
}

async function doLogin() {
  const correo   = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPwd').value;
  setLoginMsg('loading');

  if (!APPS_SCRIPT_URL) {
    setLoginMsg('error', 'Servicio no configurado aún. Contactá al administrador.');
    return;
  }
  try {
    const res  = await fetch(`${APPS_SCRIPT_URL}?accion=login&correo=${encodeURIComponent(correo)}&password=${encodeURIComponent(password)}`);
    const data = await res.json();
    if (data.success) {
      saveSession(data.usuario);
      setNavLoggedIn(data.usuario);
      closeAuth();
    } else {
      setLoginMsg('error', data.error || 'Correo o contraseña incorrectos');
    }
  } catch { setLoginMsg('error', 'Error de conexión'); }
}

async function doRegister() {
  const pwd  = document.getElementById('regPwd').value;
  const pwd2 = document.getElementById('regPwd2').value;
  if (pwd !== pwd2) { setRegMsg('error', 'Las contraseñas no coinciden'); return; }

  const body = {
    accion:    'registro',
    nombre:    document.getElementById('regNombre').value.trim(),
    telefono:  document.getElementById('regTel').value.trim(),
    correo:    document.getElementById('regEmail').value.trim(),
    password:  pwd,
    zona:      document.getElementById('regZona').value,
    tipo:      document.getElementById('regTipo').value,
    direccion: document.getElementById('regDir').value.trim()
  };

  setRegMsg('loading');

  if (!APPS_SCRIPT_URL) {
    setRegMsg('error', 'Servicio no configurado aún.');
    return;
  }
  try {
    const res  = await fetch(APPS_SCRIPT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      saveSession(data.usuario);
      setNavLoggedIn(data.usuario);
      setRegMsg('ok', '¡Cuenta creada exitosamente!');
      setTimeout(closeAuth, 1200);
    } else {
      setRegMsg('error', data.error || 'Error al registrar');
    }
  } catch { setRegMsg('error', 'Error de conexión'); }
}

function cerrarSesion() {
  clearSession();
  setNavLoggedIn(null);
  const drop = document.getElementById('navUserDropdown');
  if (drop) drop.style.display = 'none';
  dropdownOpen = false;
}

// ── CARRITO ───────────────────────────────────────────────────────────────────
let cart = [];
try { cart = JSON.parse(localStorage.getItem('ep_cart') || '[]'); } catch { cart = []; }

const PRODUCT_IMGS = {
  'Pollo entero':       'fondo/pexels-hariprasad-ce-512756904-34797333.jpg',
  'Pechuga deshuesada': 'fondo/pexels-einfoto-2209439.jpg',
  'Muslo entero':       'fondo/pexels-goumbik-616353.jpg'
};

function saveCart() { localStorage.setItem('ep_cart', JSON.stringify(cart)); }

function addToCart(nombre, precio, kg, imgUrl) {
  const existing = cart.find(i => i.nombre === nombre);
  if (existing) { existing.kg += kg; }
  else { cart.push({ nombre, precio, kg: kg || 1, imgUrl: imgUrl || PRODUCT_IMGS[nombre] || '' }); }
  saveCart();
  updateCartUI();
}

function quickAdd(prod) {
  addToCart(prod.nombre, prod.precio, 1, prod.imgUrl);
}

function removeFromCart(nombre) {
  cart = cart.filter(i => i.nombre !== nombre);
  saveCart();
  updateCartUI();
}

function changeCartQty(nombre, delta) {
  const item = cart.find(i => i.nombre === nombre);
  if (!item) return;
  item.kg = Math.max(1, item.kg + delta);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const badge    = document.getElementById('cartBadge');
  const itemsEl  = document.getElementById('cartItems');
  const emptyEl  = document.getElementById('cartEmpty');
  const totalEl  = document.getElementById('cartTotal');
  const footerEl = document.getElementById('cartFooter');

  const totalItems = cart.reduce((s, i) => s + i.kg, 0);
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  const totalVal = cart.reduce((s, i) => s + i.precio * i.kg, 0);
  if (totalEl) totalEl.textContent = `₡ ${totalVal.toLocaleString('es-CR')}`;

  if (!itemsEl) return;

  if (cart.length === 0) {
    if (emptyEl)  emptyEl.style.display  = 'flex';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }
  if (emptyEl)  emptyEl.style.display  = 'none';
  if (footerEl) footerEl.style.display = 'block';

  const items = itemsEl.querySelectorAll('.cart-item');
  items.forEach(el => el.remove());

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="ci-img" style="background-image:url('${item.imgUrl}')"></div>
      <div class="ci-info">
        <div class="ci-name">${item.nombre}</div>
        <div class="ci-price">₡${(item.precio * item.kg).toLocaleString('es-CR')} <span class="ci-unit">(${item.kg} kg × ₡${item.precio.toLocaleString('es-CR')})</span></div>
      </div>
      <div class="ci-controls">
        <button class="ci-btn" onclick="changeCartQty('${item.nombre}',-1)">−</button>
        <span class="ci-qty">${item.kg}</span>
        <button class="ci-btn" onclick="changeCartQty('${item.nombre}',1)">+</button>
        <button class="ci-del" onclick="removeFromCart('${item.nombre}')" title="Eliminar">✕</button>
      </div>`;
    itemsEl.insertBefore(div, emptyEl);
  });
}

function toggleCart(force) {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const open = force !== undefined ? force : !sidebar?.classList.contains('open');
  sidebar?.classList.toggle('open', open);
  overlay?.classList.toggle('show', open);
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) {
    const u = getSession();
    if (u) {
      const zonaEl = document.getElementById('cartZona');
      const dirEl  = document.getElementById('cartDir');
      if (zonaEl && !zonaEl.value) zonaEl.value = u.zona || '';
      if (dirEl  && !dirEl.value)  dirEl.value  = u.direccion || '';
    }
  }
}

document.getElementById('navCartBtn')?.addEventListener('click', () => toggleCart());
document.getElementById('cartOverlay')?.addEventListener('click', () => toggleCart(false));
document.getElementById('cartClose')?.addEventListener('click', () => toggleCart(false));

function cartCheckout() {
  if (cart.length === 0) return;
  const zona = document.getElementById('cartZona')?.value.trim() || '';
  const dir  = document.getElementById('cartDir')?.value.trim()  || '';
  const u    = getSession();

  const lineas = cart.map(i => `${i.nombre} — ${i.kg} kg (₡${(i.precio*i.kg).toLocaleString('es-CR')})`).join('\n');
  const total  = cart.reduce((s,i) => s + i.precio * i.kg, 0);

  const msg = encodeURIComponent(
    `Hola EcoPollo 🐔, quiero hacer un pedido:\n\n${lineas}\n\n` +
    `💰 Total: ₡${total.toLocaleString('es-CR')}\n` +
    (zona ? `📍 Zona: ${zona}\n` : '') +
    (dir  ? `🏠 Dirección: ${dir}\n` : '') +
    (u    ? `👤 Cliente: ${u.nombre} (${u.telefono})` : '')
  );

  window.open(`https://wa.me/${WA_PHONE}?text=${msg}`, '_blank');

  if (APPS_SCRIPT_URL && u) {
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion:    'guardar_pedido',
        nombre:    u.nombre,
        correo:    u.correo,
        telefono:  u.telefono,
        productos: lineas,
        total:     total,
        zona:      zona,
        direccion: dir,
        fuente:    'carrito'
      })
    }).catch(() => {});
  }
}

document.getElementById('cartWaBtn')?.addEventListener('click', cartCheckout);

// Init carrito
updateCartUI();
