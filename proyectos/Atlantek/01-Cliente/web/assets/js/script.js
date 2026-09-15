/* ═══════════════════════════════════════════════════════════════
   Atlantek · Landing pública — script.js
   ═══════════════════════════════════════════════════════════════ */

(() => {
  /* ── Menú móvil ── */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('nav-burger');
  const links = document.getElementById('nav-links');

  burger.addEventListener('click', () => nav.classList.toggle('nav--open'));

  links.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') nav.classList.remove('nav--open');
  });

  /* ── Logo vuelve al principio ── */
  const brandLogo = document.getElementById('brand-logo');
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Nav con profundidad al hacer scroll ── */
  const onScroll = () => nav.classList.toggle('nav--scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Reveal on scroll ── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });

  /* Reveal escalonado: retardo creciente por posición entre hermanos */
  document.querySelectorAll('.reveal').forEach((el) => {
    const siblings = Array.prototype.filter.call(el.parentElement.children, (c) => c.classList.contains('reveal'));
    const idx = siblings.indexOf(el);
    if (idx > 0) el.style.transitionDelay = `${Math.min(idx * 0.09, 0.6)}s`;
    io.observe(el);
  });

  /* ── Stats del hero: contador animado ── */
  const countStat = (el) => {
    const target = parseFloat(el.dataset.count);
    if (Number.isNaN(target)) { el.textContent = el.dataset.count; return; }
    const dur = 900;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const ioStats = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.querySelectorAll('[data-count]').forEach(countStat);
        ioStats.unobserve(en.target);
      }
    });
  }, { threshold: 0.4 });

  const statsEl = document.querySelector('.hero__stats');
  if (statsEl) ioStats.observe(statsEl);

  /* ── Reloj de la cámara del hero ── */
  const camTime = document.getElementById('cam-time');
  if (camTime) {
    const tick = () => {
      const d = new Date();
      camTime.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map((n) => String(n).padStart(2, '0')).join(':');
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ── Usuario opcional (pre-llenado) ──
     El formulario de cotización está SIEMPRE habilitado. Si existe un
     usuario guardado, se pre-llenan nombre y teléfono. Sin registro requerido. */
  const USER_KEY = 'atlantek-user';
  const leadFormEl = document.getElementById('lead-form');
  const leadUser = document.getElementById('lead-user');

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch (e) { return null; }
  };

  function applyAccess() {
    if (!leadFormEl) return;
    const user = getUser();
    if (!user) {
      if (leadUser) leadUser.hidden = true;
      return;
    }
    if (!leadFormEl.nombre.value) leadFormEl.nombre.value = user.nombre || '';
    if (!leadFormEl.telefono.value) leadFormEl.telefono.value = user.telefono || '';
    if (leadUser) {
      leadUser.hidden = false;
      leadUser.innerHTML =
        `● Usuario: ${user.nombre.split(' ')[0]} <a href="#" id="lead-logout">Olvidar</a>`;
      document.getElementById('lead-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem(USER_KEY);
        leadUser.hidden = true;
      });
    }
  }

  applyAccess();

  /* ── Formulario de cliente nuevo ──
     Envía el lead al Apps Script (hoja "Leads"). Si falla la conexión,
     ofrece continuar por WhatsApp con el mensaje prellenado. */
  const form = document.getElementById('lead-form');
  if (form) {
    const status = document.getElementById('lead-status');
    const WA_NUM = '50672312225';

    const show = (html, tipo) => {
      status.innerHTML = html;
      status.className = 'lead-form__status ' + (tipo === 'ok' ? 'is-ok' : 'is-error');
    };

    const waLink = (lead) => {
      const txt =
        `Hola Atlantek, soy ${lead.nombre} (${lead.distrito}). ` +
        `Me interesa: ${lead.servicio} para ${lead.tipo.toLowerCase()}. ` +
        `Mi teléfono: ${lead.telefono}. ${lead.mensaje}`;
      return `https://wa.me/${WA_NUM}?text=${encodeURIComponent(txt.trim())}`;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.website.value) return; // honeypot anti-bots

      const f = new FormData(form);
      const lead = {
        nombre: String(f.get('nombre') || '').trim(),
        telefono: String(f.get('telefono') || '').trim(),
        distrito: String(f.get('distrito') || ''),
        tipo: String(f.get('tipo') || ''),
        servicio: String(f.get('servicio') || ''),
        mensaje: String(f.get('mensaje') || '').trim()
      };

      if (!lead.nombre || !lead.telefono) {
        show('Complete al menos su nombre y teléfono.', 'error');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Enviando…';

      let ok = false;
      if (typeof CONFIG !== 'undefined' && CONFIG.SHEETS_URL) {
        try {
          /* text/plain evita el preflight CORS que Apps Script no responde */
          const res = await fetch(CONFIG.SHEETS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ token: CONFIG.TOKEN, action: 'lead', lead })
          });
          ok = (await res.json()).ok === true;
        } catch (err) {
          ok = false;
        }
      }

      btn.disabled = false;
      btn.textContent = 'Enviar solicitud';

      if (ok) {
        form.reset();
        show(
          '✓ Solicitud recibida. Le contactamos por WhatsApp en horario hábil. ' +
          `Si es urgente, <a href="${waLink(lead)}" target="_blank" rel="noopener">escríbanos directo</a>.`,
          'ok'
        );
      } else {
        show(
          'No se pudo enviar automáticamente. ' +
          `<a href="${waLink(lead)}" target="_blank" rel="noopener">Enviar la solicitud por WhatsApp →</a>`,
          'error'
        );
      }
    });
  }
})();
