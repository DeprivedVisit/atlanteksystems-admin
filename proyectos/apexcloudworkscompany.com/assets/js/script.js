/* ══════════════════════════════════════════════
   APEX CLOUDWORKS — script.js
══════════════════════════════════════════════ */


/* ── Claude typing animation ────────────────── */
(function () {
  const el = document.getElementById('claude-output');
  if (!el) return;
  const messages = [
    { role:'user',   text:'Quiero una landing para Skindoctors CR' },
    { role:'claude', text:'Perfecto. Creo la landing mobile-first con sistema de leads a WhatsApp y Google Sheets. Deploy en AWS CloudFront. Lista en 48h.' },
    { role:'user',   text:'Necesito automatización de leads también y analíticas' },
    { role:'gemini', text:'Yo me encargo: configuro un workflow en n8n + analíticas en tiempo real integradas a Google Sheets. Todo en producción en 24h.' },
    { role:'user',   text:'¡Excelente equipo!' },
  ];
  let mIdx=0, cIdx=0, div=null;
  function next() {
    if (mIdx >= messages.length) {
      mIdx = 0;
      // Limpiar sin innerHTML
      while (el.firstChild) el.removeChild(el.firstChild);
    }
    const m = messages[mIdx];
    div = document.createElement('div');
    div.className = 'ct-msg ct-' + m.role;
    if (m.role === 'claude' || m.role === 'gemini') {
      const avatar = document.createElement('div');
      avatar.className = 'ct-avatar';
      avatar.textContent = m.role === 'claude' ? '◆' : '✦';
      const text = document.createElement('span');
      text.className = m.role === 'claude' ? 'ct-text' : 'ct-gemini-text';
      div.appendChild(avatar);
      div.appendChild(text);
    } else {
      const text = document.createElement('span');
      text.className = 'ct-user-text';
      div.appendChild(text);
    }
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
    cIdx = 0;
    type();
  }
  function type() {
    const m=messages[mIdx];
    const s=div.querySelector('.ct-text,.ct-user-text,.ct-gemini-text');
    if(cIdx<m.text.length){ s.textContent+=m.text[cIdx++]; el.scrollTop=el.scrollHeight; setTimeout(type,m.role==='claude'?20:32); }
    else { mIdx++; setTimeout(next,1600); }
  }
  setTimeout(next,900);
})();


/* ── Proceso Accordion ──────────────────────── */
function toggleStep(btn) {
  const item = btn.closest('.proc-item');
  const open = item.classList.contains('open');
  document.querySelectorAll('.proc-item.open').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.proc-body').style.maxHeight = null;
    i.querySelector('.proc-btn').setAttribute('aria-expanded', 'false');
  });
  if (!open) {
    item.classList.add('open');
    const body = item.querySelector('.proc-body');
    body.style.maxHeight = body.scrollHeight + 'px';
    btn.setAttribute('aria-expanded', 'true');
  }
}

function initProcessAccordion() {
  // Wire click handlers (no onclick inline)
  document.querySelectorAll('.proc-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleStep(btn));
  });
  // Open first item
  const firstOpen = document.querySelector('.proc-item.open');
  if (firstOpen) {
    const body = firstOpen.querySelector('.proc-body');
    const btn  = firstOpen.querySelector('.proc-btn');
    if (body) body.style.maxHeight = body.scrollHeight + 'px';
    if (btn)  btn.setAttribute('aria-expanded', 'true');
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initProcessAccordion);
} else {
  initProcessAccordion();
}

/* ── FAQ ────────────────────────────────────── */
function tfaq(btn) {
  const item = btn.closest('.faq-item');
  const open = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-body').style.maxHeight = null;
    i.querySelector('.faq-btn').setAttribute('aria-expanded','false');
  });
  if (!open) {
    item.classList.add('open');
    const b = item.querySelector('.faq-body');
    b.style.maxHeight = b.scrollHeight + 'px';
    btn.setAttribute('aria-expanded','true');
  }
}

// Wire FAQ buttons (no onclick inline)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.faq-btn').forEach(btn => {
    btn.addEventListener('click', () => tfaq(btn));
  });
});

/* ── Scroll reveal ──────────────────────────── */
const ro = new IntersectionObserver(
  es => es.forEach(e => { if(e.isIntersecting) e.target.classList.add('in'); }),
  { threshold: 0.08 }
);
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

/* ── Nav active ─────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-links a');
const pageSecs = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let cur='';
  pageSecs.forEach(s=>{ if(window.scrollY>=s.offsetTop-80) cur=s.id; });
  navLinks.forEach(a=>{ a.style.color=(a.hash==='#'+cur)?'var(--text)':''; });
},{passive:true});

/* ── Claude Toast ───────────────────────────── */
(function initClaudeToast() {
  const toast     = document.getElementById('claude-toast');
  const toggleBtn = document.getElementById('clt-toggle');
  const closeBtn  = document.getElementById('claude-toast-close');
  if (!toast) return;
  if (sessionStorage.getItem('claude_toast_dismissed')) return;

  let shown = false;

  window.addEventListener('scroll', () => {
    if (shown) return;
    if (window.scrollY > window.innerHeight * 1.2) {
      shown = true;
      toast.classList.add('show');
    }
  }, { passive: true });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      toast.classList.toggle('expanded');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.classList.remove('expanded');
      toast.classList.add('dismissed');
      sessionStorage.setItem('claude_toast_dismissed', '1');
    });
  }
})();

function dismissClaudeToast() {
  const toast = document.getElementById('claude-toast');
  if (toast) {
    toast.classList.remove('expanded');
    toast.classList.add('dismissed');
    sessionStorage.setItem('claude_toast_dismissed', '1');
  }
}

/* ── VS Code scroll scenes ───────────────────── */
(function initVscScenes() {
  const vsc = document.querySelector('.vsc');
  if (!vsc) return;

  const sceneMap = {
    'proceso':    { scene: 'proceso',   chat: 'chat-proceso'  },
    'servicios':  { scene: 'servicios', chat: 'chat-servicios'},
    'trabajo':    { scene: 'servicios', chat: 'chat-servicios'},
    'resultados': { scene: 'servicios', chat: 'chat-servicios'},
    'precios':    { scene: 'precios',   chat: 'chat-precios'  },
    'calculadora':{ scene: 'precios',   chat: 'chat-precios'  },
  };

  function activateScene(sectionId) {
    const map = sceneMap[sectionId];
    const sceneName = map ? map.scene : 'hero';
    const chatId    = map ? map.chat  : 'chat-hero';

    vsc.dataset.scene = sceneName;

    document.querySelectorAll('.vsc-chat-scene').forEach(el => {
      el.classList.toggle('active', el.id === chatId);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) activateScene(entry.target.id);
    });
  }, { threshold: 0.35 });

  const sections = ['proceso','servicios','trabajo','resultados','precios','calculadora'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  // Reset to hero when scrolled to top
  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight * 0.5) activateScene('hero');
  }, { passive: true });
})();

/* ── Dropdown ───────────────────────────────── */
const _exploreBtn = document.getElementById('nav-explore-btn');
const _dropdown   = document.getElementById('nav-dropdown');
const _ndOverlay  = document.getElementById('nd-overlay');

function closeDropdown() {
  if (!_dropdown) return;
  _dropdown.classList.remove('open');
  _dropdown.setAttribute('aria-hidden', 'true');
  if (_exploreBtn) { _exploreBtn.classList.remove('open'); _exploreBtn.setAttribute('aria-expanded','false'); }
  if (_ndOverlay)  _ndOverlay.classList.remove('active');
}

function openDropdown() {
  if (!_dropdown) return;
  closeMobileNav();
  _dropdown.classList.add('open');
  _dropdown.setAttribute('aria-hidden', 'false');
  if (_exploreBtn) { _exploreBtn.classList.add('open'); _exploreBtn.setAttribute('aria-expanded','true'); }
  if (_ndOverlay)  _ndOverlay.classList.add('active');
}

if (_exploreBtn) {
  _exploreBtn.addEventListener('click', e => {
    e.stopPropagation();
    _dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
  });
}
if (_ndOverlay) _ndOverlay.addEventListener('click', closeDropdown);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDropdown(); });

/* ── Mobile Nav ─────────────────────────────── */
function closeMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const panel  = document.getElementById('nav-mobile');
  if (!toggle || !panel) return;
  toggle.classList.remove('open');
  panel.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

(function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const panel  = document.getElementById('nav-mobile');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.contains('open');
    if (isOpen) { closeMobileNav(); return; }
    closeDropdown();
    toggle.classList.add('open');
    panel.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  });

  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
  window.addEventListener('resize', () => { if (window.innerWidth >= 1100) { closeMobileNav(); closeDropdown(); } });
})();

/* ── Counters ───────────────────────────────── */
(function initCounters() {
  function animateCount(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = '1';
    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    (function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    })(start);
  }

  const counters = document.querySelectorAll('.js-counter');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) animateCount(e.target); });
  }, { threshold: 0.3 });

  counters.forEach(c => obs.observe(c));
})();

/* ── Calculadora ────────────────────────────── */
(function initCalculadora() {
  const typeBtns   = document.querySelectorAll('.calc-type-btn');
  const addonItems = document.querySelectorAll('.calc-addon');
  const crServicio = document.getElementById('cr-servicio');
  const crItems    = document.getElementById('cr-items');
  const crTotal    = document.getElementById('cr-total-num');
  const waBtn      = document.getElementById('btn-calc-wa');
  if (!typeBtns.length) return;

  let basePrice = 350;
  let baseName  = 'Landing Page';

  function update() {
    const addons = [];
    let total = basePrice;

    addonItems.forEach(item => {
      const cb    = item.querySelector('input[type="checkbox"]');
      const name  = item.querySelector('.addon-name').textContent;
      const price = parseInt(item.dataset.price, 10);
      if (cb.checked) { addons.push({ name, price }); total += price; }
    });

    if (crServicio) crServicio.textContent = baseName;
    if (crTotal)    crTotal.textContent    = total.toLocaleString();

    if (crItems) {
      const rows = [{ name: baseName, price: basePrice }, ...addons];
      crItems.innerHTML = rows.map(r =>
        `<div class="cr-item"><span>${r.name}</span><span class="cr-item-price">$${r.price}</span></div>`
      ).join('');
    }

    if (waBtn) {
      const addonTxt = addons.length ? '\n' + addons.map(a => '  + ' + a.name).join('\n') : '';
      const msg = encodeURIComponent(
        `Hola Garett! Me interesa:\n\n📦 ${baseName} ($${basePrice})${addonTxt}\n\n💰 Total estimado: $${total} USD\n\n¿Podemos hablar?`
      );
      waBtn.href = `https://wa.me/50663144171?text=${msg}`;
    }
  }

  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      basePrice = parseInt(btn.dataset.price, 10);
      baseName  = btn.querySelector('.ctb-name').textContent;
      update();
    });
  });

  addonItems.forEach(item => {
    item.addEventListener('click', e => {
      const cb = item.querySelector('input[type="checkbox"]');
      if (e.target !== cb) cb.checked = !cb.checked;
      item.classList.toggle('checked', cb.checked);
      update();
    });
  });

  update();
})();

/* ── Contact Form ───────────────────────────── */
(function initContactForm() {
  const CONTACT_AS_URL = 'https://script.google.com/macros/s/AKfycbz5OuFMXArst7-uol6k9Lx-qYtQusr1tpBEVbNl0HAavWG9G5T0KLXH9VoxM6D4izcHVA/exec';

  const form    = document.getElementById('contact-form');
  const errEl   = document.getElementById('cf-error');
  const succEl  = document.getElementById('cf-success');
  const submitBtn = document.getElementById('cf-submit');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const nombre   = document.getElementById('cf-nombre').value.trim();
    const contacto = document.getElementById('cf-contacto').value.trim();
    const servicio = document.getElementById('cf-servicio').value;
    const mensaje  = document.getElementById('cf-mensaje').value.trim();

    errEl.textContent = '';
    errEl.classList.remove('show');
    succEl.classList.remove('show');

    if (!nombre || !contacto) {
      errEl.textContent = 'Nombre y WhatsApp/Email son obligatorios.';
      errEl.classList.add('show');
      return;
    }

    if (!CONTACT_AS_URL) {
      // Fallback: abrir WhatsApp con los datos del formulario
      const msg = encodeURIComponent(
        `Hola! Me llamo ${nombre}.\nContacto: ${contacto}\nServicio: ${servicio || 'No especificado'}\n${mensaje ? 'Mensaje: ' + mensaje : ''}`
      );
      window.open('https://wa.me/50663144171?text=' + msg, '_blank');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    try {
      const res  = await fetch(CONTACT_AS_URL, {
        method: 'POST',
        body: JSON.stringify({ nombre, contacto, servicio, mensaje })
      });
      const data = await res.json();

      if (data.success) {
        form.reset();
        succEl.classList.add('show');
      } else {
        errEl.textContent = data.error || 'Error al enviar. Intentá de nuevo.';
        errEl.classList.add('show');
      }
    } catch (err) {
      errEl.textContent = 'Error de conexión. Escribinos directamente por WhatsApp.';
      errEl.classList.add('show');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar mensaje →';
  });
})();

/* ── Scroll progress bar ────────────────────── */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.body.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? Math.min(window.scrollY / max * 100, 100) : 0) + '%';
  }, { passive: true });
})();

/* ── Cursor glow ────────────────────────────── */
(function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
})();

/* ── Claude card 3D tilt ────────────────────── */
(function initCardTilt() {
  const card = document.querySelector('.claude-card');
  if (!card) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.12s ease';
  });
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 7}deg) scale(1.025)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.5s ease';
    card.style.transform  = '';
    setTimeout(() => { card.style.transition = ''; }, 500);
  });
})();

/* ── Hero typewriter ────────────────────────── */
(function initHeroTypewriter() {
  const el = document.querySelector('.hero-h1 em');
  if (!el) return;
  const phrases = ['en producción.', 'en AWS.', 'en línea hoy.', 'funcionando.'];
  let idx = 0;

  function cycle() {
    idx = (idx + 1) % phrases.length;
    el.style.opacity   = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => {
      el.textContent     = phrases[idx];
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    }, 320);
  }

  setInterval(cycle, 3600);
})();

/* ── Walking Avatars Freedom (JS dynamic movement) ────────────────────────── */
(function initWalkingAvatars() {
  const avatars = document.querySelectorAll('.walking-avatar');
  if (avatars.length === 0) return;
  if (window.matchMedia('(max-width: 767px)').matches) return; // No animar en móvil

  const speedMultiplier = 0.45; // cute, floating speed

  const data = Array.from(avatars).map((el) => {
    const rect = el.getBoundingClientRect();
    const w = rect.width || 28;
    const h = rect.height || 28;
    
    // Initial random positions
    const x = Math.random() * (window.innerWidth - w);
    const y = Math.random() * (window.innerHeight - h);
    
    // Random angle
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.3 + Math.random() * 0.7) * speedMultiplier;
    
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    el.style.position = 'fixed';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.bottom = 'auto';

    return { el, x, y, vx, vy, w, h, speed };
  });

  function update() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    data.forEach(item => {
      // Advance position
      item.x += item.vx;
      item.y += item.vy;

      // Slight direction drift (wandering)
      if (Math.random() < 0.008) {
        const changeAngle = (Math.random() - 0.5) * 0.4;
        const currentAngle = Math.atan2(item.vy, item.vx);
        const newAngle = currentAngle + changeAngle;
        item.vx = Math.cos(newAngle) * item.speed;
        item.vy = Math.sin(newAngle) * item.speed;
      }

      // Bounce horizontal
      if (item.x <= 0) {
        item.x = 0;
        item.vx = Math.abs(item.vx);
      } else if (item.x >= W - item.w) {
        item.x = W - item.w;
        item.vx = -Math.abs(item.vx);
      }

      // Bounce vertical
      if (item.y <= 0) {
        item.y = 0;
        item.vy = Math.abs(item.vy);
      } else if (item.y >= H - item.h) {
        item.y = H - item.h;
        item.vy = -Math.abs(item.vy);
      }

      // Apply positions
      item.el.style.left = `${item.x}px`;
      item.el.style.top = `${item.y}px`;

      // Flip SVG horizontally based on X direction
      const svg = item.el.querySelector('svg');
      if (svg) {
        if (item.vx > 0) {
          svg.style.transform = 'scaleX(1)';
        } else {
          svg.style.transform = 'scaleX(-1)';
        }
      }
    });

    requestAnimationFrame(update);
  }

  // Handle window resizing to keep inside bounds
  window.addEventListener('resize', () => {
    data.forEach(item => {
      item.x = Math.min(item.x, window.innerWidth - item.w);
      item.y = Math.min(item.y, window.innerHeight - item.h);
    });
  });

  // Launch movement loop
  setTimeout(() => {
    requestAnimationFrame(update);
  }, 100);
})();
