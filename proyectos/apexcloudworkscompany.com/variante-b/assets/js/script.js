'use strict';

/* ── FAQ accordion ── */
document.querySelectorAll('.vb-faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const body = btn.nextElementSibling;
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    body.style.maxHeight = open ? '0' : body.scrollHeight + 'px';
  });
});

/* ── Reveal on scroll — visible por defecto, solo se anima con JS+observer ── */
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('vb-ready');
  const ro = new IntersectionObserver(
    es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }),
    { threshold: 0.08 }
  );
  document.querySelectorAll('.vb-reveal').forEach(el => ro.observe(el));
  setTimeout(() => document.querySelectorAll('.vb-reveal:not(.in)').forEach(el => el.classList.add('in')), 5000);
}
