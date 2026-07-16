/* ═══════════════════════════════════════════════════════════════
   INTEC · Landing pública — script.js
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

  /* ── Reveal on scroll ── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

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

  /* ── Gate de entrada: crear usuario o entrar sin usuario ──
     Con usuario (localStorage) la cotización rápida queda habilitada
     y prellenada; sin usuario, el formulario se bloquea. */
  const USER_KEY = 'intec-user';

  const gate = document.getElementById('gate');
  const gateForm = document.getElementById('gate-form');
  const gateGuest = document.getElementById('gate-guest');
  const gateError = document.getElementById('gate-error');
  const leadFormEl = document.getElementById('lead-form');
  const leadLock = document.getElementById('lead-lock');
  const leadUser = document.getElementById('lead-user');
  const leadUnlock = document.getElementById('lead-unlock');

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch (e) { return null; }
  };

  const openGate = () => { gate.hidden = false; document.body.classList.add('gate-open'); };
  const closeGate = () => { gate.hidden = true; document.body.classList.remove('gate-open'); };

  function applyAccess() {
    if (!leadFormEl) return;
    const user = getUser();
    const campos = leadFormEl.querySelectorAll('input, select, textarea, button[type="submit"]');

    if (user) {
      leadFormEl.classList.remove('is-locked');
      leadLock.hidden = true;
      campos.forEach((el) => { el.disabled = false; });
      if (!leadFormEl.nombre.value) leadFormEl.nombre.value = user.nombre || '';
      if (!leadFormEl.telefono.value) leadFormEl.telefono.value = user.telefono || '';
      leadUser.hidden = false;
      leadUser.innerHTML =
        `● Usuario: ${user.nombre.split(' ')[0]} <a href="#" id="lead-logout">Cerrar sesión</a>`;
      document.getElementById('lead-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem(USER_KEY);
        applyAccess();
        openGate();
      });
    } else {
      leadFormEl.classList.add('is-locked');
      leadLock.hidden = false;
      leadUser.hidden = true;
      campos.forEach((el) => { el.disabled = true; });
    }
  }

  if (gate && leadFormEl) {
    /* Al entrar: si no hay usuario, el gate se muestra siempre */
    if (!getUser()) openGate();
    applyAccess();

    gateGuest.addEventListener('click', () => {
      closeGate();
      applyAccess();
    });

    leadUnlock.addEventListener('click', openGate);

    gateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(gateForm);
      const user = {
        nombre: String(f.get('nombre') || '').trim(),
        telefono: String(f.get('telefono') || '').trim(),
        email: String(f.get('email') || '').trim(),
        creado: new Date().toISOString()
      };

      if (!user.nombre || !user.telefono) {
        gateError.textContent = 'Complete su nombre y teléfono.';
        gateError.classList.add('is-on');
        return;
      }
      gateError.classList.remove('is-on');

      localStorage.setItem(USER_KEY, JSON.stringify(user));

      /* Registro en Sheets (hoja Usuarios) — no bloquea la entrada si falla */
      if (typeof CONFIG !== 'undefined' && CONFIG.SHEETS_URL) {
        fetch(CONFIG.SHEETS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ token: CONFIG.TOKEN, action: 'user', user })
        }).catch(() => {});
      }

      closeGate();
      applyAccess();
    });
  }

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
        `Hola INTEC, soy ${lead.nombre} (${lead.distrito}). ` +
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
