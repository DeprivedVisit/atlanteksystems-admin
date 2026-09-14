/* ══════════════════════════════════════════════
   APEX CLOUDWORKS — mac-scroll-sequence.js
   MacBook fotoreal — 33 frames dibujados en <canvas> según progreso
   de scroll de toda la página (estilo AirPods/Vision Pro de Apple).

   Dormido por diseño: si assets/img/laptop-sequence/frame-001.png no
   existe todavía, este script no hace nada y mac-float.js (versión
   CSS) sigue siendo lo que se ve. En cuanto los 33 frames reales
   estén en esa carpeta, este script toma el control solo — no hay
   que tocar HTML/CSS ni desactivar nada a mano.
══════════════════════════════════════════════ */

(function initMacScrollSequence() {
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(min-width: 900px)').matches) return;

  const FRAME_COUNT = 33;
  const FRAME_PATH  = i => `assets/img/laptop-sequence/frame-${String(i + 1).padStart(3, '0')}.png`;

  const canvas = document.getElementById('laptop-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const images = new Array(FRAME_COUNT);
  const loaded = new Array(FRAME_COUNT).fill(false);

  /* ── Frame 1 primero — decide si la secuencia real existe ── */
  const first = new Image();
  first.onload = () => {
    images[0] = first;
    loaded[0] = true;
    canvas.classList.add('mac-seq-ready');

    // Toma el control: apaga el MacBook CSS de respaldo.
    const fallback = document.getElementById('mac-float');
    if (fallback) fallback.remove();

    setupCanvas();
    drawFrame(0);
    registerScrollTrigger();
    loadRemainingFrames();
  };
  first.onerror = () => { /* sin frames reales todavía — no hacer nada */ };
  first.src = FRAME_PATH(0);

  function setupCanvas() {
    const resize = () => {
      const dpr  = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width  = Math.round(rect.width  * dpr);
      canvas.height = Math.round(rect.height * dpr);
      drawFrame(lastDrawn);
    };
    window.addEventListener('resize', resize, { passive: true });
    resize();
  }

  let lastDrawn = 0;
  function drawFrame(idx) {
    // Si el frame pedido no cargó todavía, usa el último disponible —
    // evita parpadeo/blanco mientras el resto de la secuencia baja.
    let i = idx;
    while (i > 0 && !loaded[i]) i--;
    if (!loaded[i]) return;
    lastDrawn = i;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images[i], 0, 0, canvas.width, canvas.height);
  }

  function registerScrollTrigger() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: 'main#main-content',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate(self) {
        const idx = Math.min(FRAME_COUNT - 1, Math.floor(self.progress * FRAME_COUNT));
        drawFrame(idx);
      }
    });
  }

  /* ── Resto de frames — carga progresiva, no bloquea el primer render ── */
  function loadRemainingFrames() {
    let i = 1;
    function loadNext() {
      if (i >= FRAME_COUNT) return;
      const idx = i++;
      const img = new Image();
      img.onload  = () => { images[idx] = img; loaded[idx] = true; };
      img.onerror = () => {};
      img.src = FRAME_PATH(idx);
      if ('requestIdleCallback' in window) requestIdleCallback(loadNext, { timeout: 300 });
      else setTimeout(loadNext, 60);
    }
    loadNext();
  }
})();
