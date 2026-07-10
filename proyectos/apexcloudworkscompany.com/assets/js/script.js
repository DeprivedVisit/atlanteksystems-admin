/* ══════════════════════════════════════════════
   APEX CLOUDWORKS — script.js
══════════════════════════════════════════════ */

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
/* Solo se ocultan las secciones si el observer existe y el usuario no pidió
   reducción de movimiento — el contenido nunca queda gateado por JS. */
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('reveal-ready');
  const ro = new IntersectionObserver(
    es => es.forEach(e => { if(e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }),
    { threshold: 0.08 }
  );
  const revealAll = () => document.querySelectorAll('.reveal:not(.in)').forEach(el => { el.classList.add('in'); ro.unobserve(el); });
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
  // Safety: si a los 5s algo sigue oculto (capturas headless, crawlers sin
  // scroll, tabs en background), se revela solo — el contenido nunca se pierde.
  setTimeout(revealAll, 5000);
  window.addEventListener('beforeprint', revealAll);
}

/* ── Nav: visibilidad + link activo ─────────── */
const navLinks = document.querySelectorAll('.nav-links a');
const pageSecs = document.querySelectorAll('section[id]');
const siteNav  = document.getElementById('site-nav');
const heroEl   = document.querySelector('.hero-ide-full');
window.addEventListener('scroll', () => {
  // El nav entra cuando el hero-simulador ya casi salió del viewport
  if (siteNav && heroEl) {
    siteNav.classList.toggle('nav-visible', window.scrollY > heroEl.offsetHeight - 120);
  }
  let cur='';
  pageSecs.forEach(s=>{ if(window.scrollY>=s.offsetTop-100) cur=s.id; });
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

  // El toast es fixed bottom-left — en vez de adivinar qué secciones lo tapan,
  // se revisa en cada scroll si su propio rectángulo choca con texto real (títulos,
  // párrafos, listas, tarjetas) y se auto-oculta. Generaliza a cualquier sección/tarjeta
  // sin necesitar una lista de IDs a mano.
  const textNodes = Array.from(document.querySelectorAll(
    '.sec-head, p, li, h1, h2, h3, label, input, textarea, select, button, a, ' +
    '.pr-card, .pf-card, .srv-card, .test-card, .sobre-card, .cf-field, .wa-portal-link'
  ));
  let suppressRAF = null;
  function checkOverlap() {
    suppressRAF = null;
    const tRect = toast.getBoundingClientRect();
    if (tRect.width === 0) return;
    const hit = textNodes.some(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      return !(r.right < tRect.left || r.left > tRect.right || r.bottom < tRect.top || r.top > tRect.bottom);
    });
    toast.classList.toggle('suppressed', hit);
  }
  window.addEventListener('scroll', () => {
    if (suppressRAF) return;
    suppressRAF = requestAnimationFrame(checkOverlap);
  }, { passive: true });
})();

function dismissClaudeToast() {
  const toast = document.getElementById('claude-toast');
  if (toast) {
    toast.classList.remove('expanded');
    toast.classList.add('dismissed');
    sessionStorage.setItem('claude_toast_dismissed', '1');
  }
}

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
  const CONTACT_AS_URL = 'https://script.google.com/macros/s/AKfycby-vSmwXS5nfmYz9KcvabijWjSQth6S_oa-QzWHBqp118Hbguzr_fWIg8TF1B8YHRSoIg/exec';

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

    // Acepta un email válido o un teléfono con al menos 8 dígitos
    const esEmail    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto);
    const esTelefono = (contacto.replace(/\D/g, '').length >= 8);
    if (!esEmail && !esTelefono) {
      errEl.textContent = 'Revisá el contacto: necesito un email válido o un número de WhatsApp (mínimo 8 dígitos).';
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

/* ── Hero scene: descenso al hacer scroll ────── */
(function initApexBgParallax() {
  const scene   = document.querySelector('.apex-bg-scene');
  const circuit = document.querySelector('.apex-circuit');
  if (!scene || !circuit) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let ticking = false;
  function update() {
    const y = window.scrollY;
    // Montaña: se mueve lento (lejos). Circuitos: casi estático (más cerca del observador).
    scene.style.transform   = `translate(-50%, ${y * -0.12}px)`;
    circuit.style.transform = `translateY(${y * -0.03}px)`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
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

/* ── COLLABORATIVE BACKGROUND SIMULATION ── */
(function initBackgroundCollaboration() {
  const scene = document.querySelector('.apex-bg-scene');
  const cursorContainer = document.getElementById('apex-collab-cursors');
  if (!scene || !cursorContainer) return;

  // Don't run on mobiles or when prefers-reduced-motion is active
  if (window.matchMedia('(max-width: 767px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Mountain polygon elements
  const polyF1 = document.getElementById('poly-f1');
  const polyF2 = document.getElementById('poly-f2');
  const polyF3 = document.getElementById('poly-f3');
  const polyF4 = document.getElementById('poly-f4');
  const polyF5 = document.getElementById('poly-f5');
  const polyF6 = document.getElementById('poly-f6');

  // Nodes and Guide Lines
  const bgNodeSummit = document.getElementById('bg-node-summit');
  const bgNodeSaddle = document.getElementById('bg-node-saddle');
  const bgNodeLeftRidge = document.getElementById('bg-node-left-ridge');
  const bgNodeRightRidge = document.getElementById('bg-node-right-ridge');

  const bgLineSummitSaddle = document.getElementById('bg-line-summit-saddle');
  const bgLineSummitLeft = document.getElementById('bg-line-summit-left');
  const bgLineSummitRight = document.getElementById('bg-line-summit-right');
  const stars = document.querySelectorAll('.hs-star');

  if (!polyF1 || !bgNodeSummit) return;

  // State of the Mountain Nodes in local SVG space (viewBox 0 0 520 460)
  const nodes = {
    summit: { x: 260, y: 64, cx: 260, cy: 64, tx: 260, ty: 64 },
    saddle: { x: 260, y: 232, cx: 260, cy: 232, tx: 260, ty: 232 },
    leftRidge: { x: 224, y: 182, cx: 224, cy: 182, tx: 224, ty: 182 },
    rightRidge: { x: 300, y: 172, cx: 300, cy: 172, tx: 300, ty: 172 }
  };

  // Bot states
  const bots = {
    wilson: {
      name: 'Wilson Bot 🤖',
      class: 'wilson',
      cx: 100, cy: 100, tx: 100, ty: 100,
      state: 'WANDERING', timer: 80, speed: 0.04,
      targetNode: 'summit'
    },
    garett: {
      name: 'Garett 💻',
      class: 'garett',
      cx: 400, cy: 350, tx: 400, ty: 400,
      state: 'WANDERING', timer: 150, speed: 0.03,
      targetNode: 'saddle'
    }
  };

  function createCursors() {
    for (const key in bots) {
      const bot = bots[key];
      const el = document.createElement('div');
      el.className = `collab-cursor ${bot.class}`;
      el.innerHTML = `
        <svg class="collab-cursor-svg" width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 2V17.5L7.2 12.8L12.5 18L15 15.5L9.8 10.2L15.5 9.8L2.5 2Z" stroke="#07090e" stroke-width="1.8" fill="currentColor"/>
        </svg>
        <div class="collab-cursor-label">${bot.name}</div>
        <div class="collab-click-ring"></div>
      `;
      cursorContainer.appendChild(el);
      bot.element = el;
      // Fade in
      setTimeout(() => el.classList.add('visible'), 500);
    }
  }

  function triggerClick(bot) {
    if (!bot.element) return;
    const ring = bot.element.querySelector('.collab-click-ring');
    if (ring) {
      ring.classList.remove('collab-click-anim');
      void ring.offsetWidth;
      ring.classList.add('collab-click-anim');
    }
  }

  let time = 0;

  function update() {
    time++;

    // Bounding rect for coordinate mapping
    const rect = scene.getBoundingClientRect();
    const scaleX = rect.width / 520;
    const scaleY = rect.height / 460;

    const wilsonEditing = bots.wilson.state === 'EDITING_NODE';
    const garettEditing = bots.garett.state === 'EDITING_NODE';

    for (const key in bots) {
      const bot = bots[key];
      bot.timer--;

      switch (bot.state) {
        case 'WANDERING':
          if (bot.timer <= 0) {
            bot.state = 'APPROACHING_NODE';
            bot.timer = 300; // safety
          }
          break;

        case 'APPROACHING_NODE':
          const targetCoords = nodes[bot.targetNode];
          bot.tx = targetCoords.cx;
          bot.ty = targetCoords.cy;

          // Reached node check
          if (Math.hypot(bot.tx - bot.cx, bot.ty - bot.cy) < 6) {
            triggerClick(bot);
            bot.state = 'EDITING_NODE';
            bot.timer = 200 + Math.random() * 200; // Editing duration
          }
          break;

        case 'EDITING_NODE':
          // Modifying the node coordinates gently
          const node = nodes[bot.targetNode];
          const cycleSpeed = bot.class === 'wilson' ? 0.02 : 0.015;
          const amplitude = bot.class === 'wilson' ? 8 : 10;
          
          node.tx = node.x + Math.sin(time * cycleSpeed) * amplitude;
          node.ty = node.y + Math.cos(time * cycleSpeed * 1.5) * (amplitude * 0.6);
          
          // Cursor follows the moving node
          bot.tx = node.cx;
          bot.ty = node.cy;

          if (bot.timer <= 0) {
            bot.state = 'PAUSING';
            bot.timer = 50 + Math.random() * 80;
          }
          break;

        case 'PAUSING':
          if (bot.timer <= 0) {
            bot.state = 'WANDERING';
            // Choose random next target in top/mid area
            bot.tx = 60 + Math.random() * 400;
            bot.ty = 40 + Math.random() * 320;
            bot.timer = 150 + Math.random() * 150;
          }
          break;
      }

      // Smooth bot movement
      bot.cx += (bot.tx - bot.cx) * bot.speed;
      bot.cy += (bot.ty - bot.cy) * bot.speed;

      // Update cursor position relative to viewport / fixed background container
      if (bot.element) {
        const screenX = rect.left + bot.cx * scaleX - 2;
        const screenY = rect.top + bot.cy * scaleY - 2;
        bot.element.style.transform = `translate3d(${screenX}px, ${screenY}px, 0)`;
      }
    }

    // Nodes Easing
    for (const key in nodes) {
      const n = nodes[key];
      // If no bot is editing this node, return to default position
      let beingEdited = false;
      for (const botKey in bots) {
        if (bots[botKey].state === 'EDITING_NODE' && bots[botKey].targetNode === key) {
          beingEdited = true;
        }
      }
      if (!beingEdited) {
        n.tx = n.x;
        n.ty = n.y;
      }

      n.cx += (n.tx - n.cx) * 0.12;
      n.cy += (n.ty - n.cy) * 0.12;
    }

    // Dynamic Nodes active class mapping
    if (wilsonEditing) {
      bgNodeSummit.setAttribute('class', 'bg-node node-summit active-editing');
    } else {
      bgNodeSummit.setAttribute('class', 'bg-node node-summit');
    }
    
    if (garettEditing) {
      bgNodeSaddle.setAttribute('class', 'bg-node node-saddle active-editing');
    } else {
      bgNodeSaddle.setAttribute('class', 'bg-node node-saddle');
    }

    // Dynamic line class mapping (laser colors)
    if (wilsonEditing) {
      bgLineSummitLeft.setAttribute('class', 'bg-node-line active-editing line-wilson-active');
      bgLineSummitRight.setAttribute('class', 'bg-node-line active-editing line-wilson-active');
    } else {
      bgLineSummitLeft.setAttribute('class', 'bg-node-line');
      bgLineSummitRight.setAttribute('class', 'bg-node-line');
    }

    if (wilsonEditing && garettEditing) {
      bgLineSummitSaddle.setAttribute('class', 'bg-node-line active-editing line-both-active');
    } else if (wilsonEditing) {
      bgLineSummitSaddle.setAttribute('class', 'bg-node-line active-editing line-wilson-active');
    } else if (garettEditing) {
      bgLineSummitSaddle.setAttribute('class', 'bg-node-line active-editing line-garett-active');
    } else {
      bgLineSummitSaddle.setAttribute('class', 'bg-node-line');
    }

    // Redraw Mountain Polygons
    const dx = nodes.summit.cx - 260;
    const dy = nodes.summit.cy - 64;

    polyF1.setAttribute('points', `${nodes.summit.cx},${nodes.summit.cy} 148,232 ${nodes.leftRidge.cx},${nodes.leftRidge.cy}`);
    polyF2.setAttribute('points', `${nodes.summit.cx},${nodes.summit.cy} ${nodes.leftRidge.cx},${nodes.leftRidge.cy} ${nodes.saddle.cx},${nodes.saddle.cy}`);
    polyF3.setAttribute('points', `${nodes.summit.cx},${nodes.summit.cy} ${nodes.saddle.cx},${nodes.saddle.cy} ${nodes.rightRidge.cx},${nodes.rightRidge.cy}`);
    polyF4.setAttribute('points', `${nodes.summit.cx},${nodes.summit.cy} ${nodes.rightRidge.cx},${nodes.rightRidge.cy} 372,232`);
    polyF5.setAttribute('points', `${nodes.summit.cx},${nodes.summit.cy} ${246 + dx},${98 + dy} ${276 + dx},${98 + dy}`);
    polyF6.setAttribute('points', `${nodes.summit.cx},${nodes.summit.cy} ${276 + dx},${98 + dy} ${286 + dx},${90 + dy}`);

    // Stars offset and pulse sync with summit
    stars.forEach(star => {
      if (wilsonEditing) {
        star.classList.add('active-pulse');
      } else {
        star.classList.remove('active-pulse');
      }
      star.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });

    // Redraw nodes and guide lines
    bgNodeSummit.setAttribute('cx', nodes.summit.cx); bgNodeSummit.setAttribute('cy', nodes.summit.cy);
    bgNodeSaddle.setAttribute('cx', nodes.saddle.cx); bgNodeSaddle.setAttribute('cy', nodes.saddle.cy);
    bgNodeLeftRidge.setAttribute('cx', nodes.leftRidge.cx); bgNodeLeftRidge.setAttribute('cy', nodes.leftRidge.cy);
    bgNodeRightRidge.setAttribute('cx', nodes.rightRidge.cx); bgNodeRightRidge.setAttribute('cy', nodes.rightRidge.cy);

    bgLineSummitSaddle.setAttribute('x1', nodes.summit.cx); bgLineSummitSaddle.setAttribute('y1', nodes.summit.cy);
    bgLineSummitSaddle.setAttribute('x2', nodes.saddle.cx); bgLineSummitSaddle.setAttribute('y2', nodes.saddle.cy);

    bgLineSummitLeft.setAttribute('x1', nodes.summit.cx); bgLineSummitLeft.setAttribute('y1', nodes.summit.cy);
    bgLineSummitLeft.setAttribute('x2', nodes.leftRidge.cx); bgLineSummitLeft.setAttribute('y2', nodes.leftRidge.cy);

    bgLineSummitRight.setAttribute('x1', nodes.summit.cx); bgLineSummitRight.setAttribute('y1', nodes.summit.cy);
    bgLineSummitRight.setAttribute('x2', nodes.rightRidge.cx); bgLineSummitRight.setAttribute('y2', nodes.rightRidge.cy);

    requestAnimationFrame(update);
  }

  createCursors();
  // Small delay to let bounding rect calculate properly on page load
  setTimeout(() => {
    requestAnimationFrame(update);
  }, 300);
})();

