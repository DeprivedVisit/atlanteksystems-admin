/* ══════════════════════════════════════════════
   APEX CLOUDWORKS — mac-float.js
   MacBook flotante que acompaña el scroll de todas las secciones.
   Progressive enhancement puro: sin GSAP, en mobile o con
   prefers-reduced-motion, simplemente no se activa (el elemento
   queda oculto vía CSS por defecto).
══════════════════════════════════════════════ */

(function initMacFloat() {
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(min-width: 900px)').matches) return;

  const macFloat = document.getElementById('mac-float');
  const lidWrap  = document.getElementById('mac-lid-wrap');
  const screenEl = document.getElementById('mac-screen-content');
  if (!macFloat || !screenEl) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ── Contenido de pantalla por sección — texto plano, cero riesgo XSS ── */
  const TPL = {
    hero: [
      { cls: 'mac-ghost', lines: [['mac-ghost-logo', 'APEX'], ['mac-ghost-sub', 'Cloud Work']] }
    ],
    trabajo: [
      { cls: 'mac-urlbar', text: 'melasblock.apex' },
      { cls: 'mac-thumb' },
      { cls: 'mac-thumb mac-thumb--sm' },
      { cls: 'mac-pill', text: 'LIVE' }
    ],
    servicios: [
      { cls: 'mac-line', parts: [['', '$ deploy landing '], ['ok', '✓']] },
      { cls: 'mac-line', parts: [['', '$ deploy saas '],    ['ok', '✓']] },
      { cls: 'mac-line', parts: [['', '$ deploy ia '],      ['ok', '✓']] }
    ],
    proceso: [
      { cls: 'mac-steps', steps: [1, 1, 1, 0, 0] },
      { cls: 'mac-line', text: 'Brief → Deploy' }
    ],
    explora: [
      { cls: 'mac-line', text: 'precios.json' },
      { cls: 'mac-line', text: 'portafolio.md' },
      { cls: 'mac-line', text: 'proceso.log' }
    ],
    precios: [
      { cls: 'mac-price', text: '$350' },
      { cls: 'mac-line mac-dim', text: 'Setup inicial' }
    ],
    testimonios: [
      { cls: 'mac-line', parts: [['ok', '● '],   ['', 'melasblock — LIVE']] },
      { cls: 'mac-line', parts: [['ok', '● '],   ['', 'cbd-balance — LIVE']] },
      { cls: 'mac-line', parts: [['warn', '● '], ['', 'ecopollo — EN DEV']] }
    ],
    sobre: [
      { cls: 'mac-line', text: 'Garett Barrantes' },
      { cls: 'mac-line mac-dim', text: 'Cartago, Costa Rica' }
    ],
    faq: [
      { cls: 'mac-line', text: '¿Cuánto tarda?' },
      { cls: 'mac-line mac-dim', text: '48–72h' }
    ],
    contacto: [
      { cls: 'mac-ghost', lines: [['mac-ghost-logo', 'Cotizar'], ['mac-ghost-sub', '→ WhatsApp']] }
    ]
  };

  /* ── Construye el contenido de pantalla sin innerHTML de texto libre ── */
  function renderScreen(key) {
    const rows = TPL[key] || TPL.hero;
    screenEl.textContent = '';
    rows.forEach(row => {
      const div = document.createElement('div');
      div.className = row.cls;
      if (row.text) {
        div.textContent = row.text;
      } else if (row.parts) {
        row.parts.forEach(([cls, text]) => {
          const span = document.createElement('span');
          if (cls) span.className = cls;
          span.textContent = text;
          div.appendChild(span);
        });
      } else if (row.lines) {
        row.lines.forEach(([cls, text]) => {
          const span = document.createElement('span');
          span.className = cls;
          span.textContent = text;
          div.appendChild(span);
        });
      } else if (row.steps) {
        row.steps.forEach(on => {
          const span = document.createElement('span');
          if (on) span.className = 'on';
          div.appendChild(span);
        });
      }
      screenEl.appendChild(div);
    });
  }

  /* ── Orden de secciones: lado (l/r/bg) + clave de contenido ── */
  const SECTIONS = [
    { el: document.querySelector('.hero'),         side: 'bg', key: 'hero' },
    { el: document.getElementById('trabajo'),      side: 'r',  key: 'trabajo' },
    { el: document.getElementById('servicios'),    side: 'l',  key: 'servicios' },
    { el: document.getElementById('proceso'),      side: 'r',  key: 'proceso' },
    { el: document.getElementById('explora'),      side: 'l',  key: 'explora' },
    { el: document.getElementById('precios'),      side: 'r',  key: 'precios' },
    { el: document.getElementById('testimonios'),  side: 'l',  key: 'testimonios' },
    { el: document.getElementById('sobre'),        side: 'r',  key: 'sobre' },
    { el: document.getElementById('faq'),          side: 'l',  key: 'faq' },
    { el: document.getElementById('contacto'),     side: 'bg', key: 'contacto' }
  ].filter(s => s.el);

  const X = { l: '-32vw', r: '26vw', bg: '0vw' };

  let current = -1;
  function applySection(i) {
    if (i === current) return;
    current = i;
    const s = SECTIONS[i];
    gsap.to(macFloat, { x: X[s.side], duration: .9, ease: 'power3.out', overwrite: 'auto' });
    macFloat.classList.toggle('mac-bg', s.side === 'bg');
    renderScreen(s.key);
  }

  SECTIONS.forEach((s, i) => {
    ScrollTrigger.create({
      trigger: s.el,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => applySection(i),
      onEnterBack: () => applySection(i)
    });
  });

  document.documentElement.classList.add('mac-ready');
  applySection(0);

  /* ── Levitación idle — independiente del scroll ── */
  gsap.to(lidWrap, { y: 14, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
})();
