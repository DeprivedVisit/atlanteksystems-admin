/* ══════════════════════════════════════════════
   APEX CLOUDWORKS — gsap-animations.js
══════════════════════════════════════════════ */

(function initGsapAnimations() {
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ── Hero: entrada escalonada ────────────────── */
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.hero-orb',      { opacity: 0, scale: .85, duration: .9 })
    .from('.hero-kicker',   { opacity: 0, y: 16, duration: .5 }, '-=.5')
    .from('.hero-h1',       { opacity: 0, y: 24, duration: .6 }, '-=.3')
    .from('.hero-sub',      { opacity: 0, y: 20, duration: .5 }, '-=.35')
    .from('.hero-btns > *', { opacity: 0, y: 16, duration: .45, stagger: .1 }, '-=.25');

  /* ── Hero: parallax sutil del orb en scroll ──── */
  gsap.to('.hero-orb', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* ── Portafolio: grid stagger desde el centro ── */
  const pfCards = gsap.utils.toArray('.pf-card');
  if (pfCards.length) {
    gsap.from(pfCards, {
      opacity: 0, y: 32, duration: .6, ease: 'power3.out',
      stagger: { each: .12, from: 'center' },
      scrollTrigger: { trigger: '.pf-grid', start: 'top 82%' }
    });
  }

  /* ── Servicios: filas del ledger entrando en cascada ── */
  const ledgerRows = gsap.utils.toArray('.ledger-row');
  if (ledgerRows.length) {
    gsap.from(ledgerRows, {
      opacity: 0, x: -24, duration: .5, ease: 'power3.out', stagger: .12,
      scrollTrigger: { trigger: '.ledger', start: 'top 85%' }
    });
  }

  /* ── Portafolio: tilt 3D en hover — solo desktop con mouse ── */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    pfCards.forEach(card => {
      const rotX = gsap.quickTo(card, 'rotationX', { duration: .4, ease: 'power3.out' });
      const rotY = gsap.quickTo(card, 'rotationY', { duration: .4, ease: 'power3.out' });
      gsap.set(card, { transformPerspective: 800, transformStyle: 'preserve-3d' });

      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;  // 0..1
        const py = (e.clientY - r.top)  / r.height; // 0..1
        rotY((px - .5) * 14);
        rotX((.5 - py) * 10);
      });
      card.addEventListener('mouseleave', () => { rotX(0); rotY(0); });
    });
  }
})();
