// ── Resumen de sesión — navegación del deck ──
const slides = Array.from(document.querySelectorAll('.slide'));
const counter = document.getElementById('counter');
const dotsWrap = document.getElementById('dots');
let current = 0;

slides.forEach((_, i) => {
  const d = document.createElement('button');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  d.setAttribute('aria-label', 'Ir a slide ' + (i + 1));
  d.addEventListener('click', () => go(i));
  dotsWrap.appendChild(d);
});
const dots = Array.from(dotsWrap.children);

function go(i) {
  current = Math.max(0, Math.min(slides.length - 1, i));
  slides.forEach((s, idx) => s.classList.toggle('active', idx === current));
  dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
  counter.textContent = (current + 1) + ' / ' + slides.length;
}

document.getElementById('nextBtn').addEventListener('click', () => go(current + 1));
document.getElementById('prevBtn').addEventListener('click', () => go(current - 1));

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(current + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
  if (e.key === 'Home') go(0);
  if (e.key === 'End') go(slides.length - 1);
});

let touchX = null;
document.addEventListener('touchstart', e => touchX = e.touches[0].clientX, { passive: true });
document.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
  touchX = null;
}, { passive: true });

go(0);