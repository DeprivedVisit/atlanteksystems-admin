/* ══════════════════════════════════════════════
   backgrounds.js — Fondos animados · cc-root
   Construye los 5 estados del proceso y cambia
   el fondo activo según el scroll de la página.
══════════════════════════════════════════════ */

(function () {
  const root = document.getElementById('cc-root');
  if (!root) return;

  /* ── Paleta de color por estado ──────────── */
  const STATES = [
    { hex: '#D97757', rgb: '217,119,87'  },  /* 0 Brief   */
    { hex: '#F2A93C', rgb: '242,169,60'  },  /* 1 Análisis */
    { hex: '#46C8C0', rgb: '70,200,192'  },  /* 2 Build    */
    { hex: '#B589E8', rgb: '181,137,232' },  /* 3 Deploy   */
    { hex: '#74CF8B', rgb: '116,207,139' },  /* 4 Live     */
  ];

  /* ── Construir estructura HTML ───────────── */
  const layer = document.createElement('div');
  layer.className = 'cc-layer';

  /* BG 0: Brief — dot grid + chat bubble */
  layer.insertAdjacentHTML('beforeend', `
    <div class="cc-bg cc-bg-0 active">
      <div class="cc-dots"></div>
      <div class="cc-bubble">
        &rsaquo; hola, necesito una web para mi negocio
        <span class="cc-cursor"></span>
      </div>
    </div>
  `);

  /* BG 1: Análisis — code rain */
  const rain = [
    `{stack:["react","tailwind"]}\nanalyze(brief)\n&gt; rubro: gastronomia\n&gt; tono: calido\nbuild.scaffold()\ndeploy.queue()\n{stack:["react","tailwind"]}\nanalyze(brief)\n&gt; rubro: gastronomia\n&gt; tono: calido\nbuild.scaffold()\ndeploy.queue()`,
    `def palette():\n primary=#C24B2E\n fonts=[Anton]\nsections=[hero,about,cta]\nroute(plan)\ndef palette():\n primary=#C24B2E\n fonts=[Anton]\nsections=[hero,about,cta]\nroute(plan)`,
    `01001 APEX 01\nparse(message)\nintent=BUILD_WEB\nscore=0.98\nschedule.task()\n01001 APEX 01\nparse(message)\nintent=BUILD_WEB\nscore=0.98\nschedule.task()`,
    `tokens++\ncontext.load()\nthink...\nplan.ready\nemit(spec)\ntokens++\ncontext.load()\nthink...\nplan.ready\nemit(spec)`,
  ];
  layer.insertAdjacentHTML('beforeend', `
    <div class="cc-bg cc-bg-1">
      ${rain.map(t => `<div class="cc-rain-col">${t}</div>`).join('')}
    </div>
  `);

  /* BG 2: Build — grid + oscilloscope */
  layer.insertAdjacentHTML('beforeend', `
    <div class="cc-bg cc-bg-2">
      <div class="cc-grid"></div>
      <div class="cc-scope">
        <svg viewBox="0 0 1600 240" preserveAspectRatio="none">
          <path d="M0 120 Q50 20 100 120 T200 120 T300 120 T400 120 T500 120 T600 120 T700 120 T800 120 T900 120 T1000 120 T1100 120 T1200 120 T1300 120 T1400 120 T1500 120 T1600 120"
            fill="none" stroke="var(--glow)" stroke-width="2.5"
            style="filter:drop-shadow(0 0 8px rgba(var(--glowRgb),.7))"></path>
        </svg>
      </div>
      <div class="cc-build-log">
        <div class="cc-log-line">+ hero.section</div>
        <div class="cc-log-line">+ nav + footer</div>
        <div class="cc-log-line warn">~ revision 1/2</div>
        <div class="cc-log-line ok">&#10003; aprobado</div>
      </div>
    </div>
  `);

  /* BG 3: Deploy — LED bars + 89ms ghost */
  const ledDelays = [
    [1.4, 1.9, 1.1, 2.2, 1.6, 2.0],
    [1.7, 1.2, 2.1, 1.5, 1.9, 2.3],
    [2.0, 1.4, 1.8, 1.1, 2.2, 1.9],
  ];
  const barsHtml = ledDelays.map(segs =>
    `<div class="cc-led-bar">${segs.map(d =>
      `<span class="cc-led-seg" style="animation-duration:${d}s"></span>`
    ).join('')}</div>`
  ).join('');
  layer.insertAdjacentHTML('beforeend', `
    <div class="cc-bg cc-bg-3">
      <div class="cc-led-row">${barsHtml}</div>
      <div class="cc-ms-ghost"><span class="cc-ms-text">89ms</span></div>
    </div>
  `);

  /* BG 4: Live — bar chart + sparkline */
  const barDefs = [
    { h: '38%', d: 1.4 }, { h: '58%', d: 1.7, delay: -.3 },
    { h: '48%', d: 1.5, delay: -.6 }, { h: '82%', d: 1.9, delay: -.2, accent: true },
    { h: '66%', d: 1.6, delay: -.9 }, { h: '94%', d: 2.1, delay: -.5 },
  ];
  const barsLive = barDefs.map(b =>
    `<div class="cc-bar${b.accent ? ' accent' : ''}" style="height:${b.h};animation-duration:${b.d}s${b.delay ? `;animation-delay:${b.delay}s` : ''}"></div>`
  ).join('');
  layer.insertAdjacentHTML('beforeend', `
    <div class="cc-bg cc-bg-4">
      <div class="cc-hlines"></div>
      <div class="cc-bars">${barsLive}</div>
      <svg class="cc-sparkline" viewBox="0 0 600 120" preserveAspectRatio="none">
        <polyline points="0,90 80,70 160,78 240,40 320,52 400,22 480,34 600,8"
          fill="none" stroke="var(--accent)" stroke-width="2.5"
          style="filter:drop-shadow(0 0 6px var(--accent))"></polyline>
      </svg>
    </div>
  `);

  /* Scanlines + vignette + progress */
  layer.insertAdjacentHTML('beforeend', `
    <div class="cc-scanlines"></div>
    <div class="cc-vignette"></div>
    <div class="cc-progress"><div class="cc-progress-fill" data-progress></div></div>
  `);

  root.appendChild(layer);

  /* ── Lógica de scroll ────────────────────── */
  const bgs  = Array.from(root.querySelectorAll('.cc-bg'));
  const prog = root.querySelector('[data-progress]');
  const n    = bgs.length;
  let last = 0, raf = null;

  function update() {
    const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const p     = Math.min(1, Math.max(0, window.scrollY / total));
    const idx   = Math.min(n - 1, Math.floor(p * n));

    if (prog) prog.style.width = (p * 100).toFixed(2) + '%';
    if (idx === last) return;

    const state = STATES[idx];
    root.style.setProperty('--glow',    state.hex);
    root.style.setProperty('--glowRgb', state.rgb);

    bgs[last].classList.remove('active');
    bgs[idx].classList.add('active');
    last = idx;
  }

  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = null; update(); });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
