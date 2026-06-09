const WEBHOOK_URL = 'https://YOUR_N8N_INSTANCE/webhook/ecopollo-leads';

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
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
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
