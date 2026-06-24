/* ══════════════════════════════════════════════
   APEX CLOUDWORKS — script.js
══════════════════════════════════════════════ */

/* ── Particles ──────────────────────────────── */
(function () {
  const canvas = document.getElementById('particles-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dots = [];
  const COUNT = 55, DIST = 130, C = '196,149,106';
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function Dot() { this.x=Math.random()*W; this.y=Math.random()*H; this.vx=(Math.random()-.5)*.35; this.vy=(Math.random()-.5)*.35; this.r=Math.random()*1.4+.5; }
  function init() { resize(); dots = Array.from({length:COUNT},()=>new Dot()); }
  function draw() {
    ctx.clearRect(0,0,W,H);
    dots.forEach(d => {
      d.x+=d.vx; d.y+=d.vy;
      if(d.x<0||d.x>W) d.vx*=-1;
      if(d.y<0||d.y>H) d.vy*=-1;
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${C},.28)`; ctx.fill();
    });
    for(let i=0;i<dots.length;i++) for(let j=i+1;j<dots.length;j++) {
      const dx=dots[i].x-dots[j].x, dy=dots[i].y-dots[j].y, dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<DIST) {
        ctx.beginPath(); ctx.moveTo(dots[i].x,dots[i].y); ctx.lineTo(dots[j].x,dots[j].y);
        ctx.strokeStyle=`rgba(${C},${(1-dist/DIST)*.09})`; ctx.lineWidth=.5; ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize, {passive:true});
  init(); draw();
})();

/* ── Claude typing animation ────────────────── */
(function () {
  const el = document.getElementById('claude-output');
  if (!el) return;
  const messages = [
    { role:'user',   text:'Quiero una landing para Skindoctors CR' },
    { role:'claude', text:'Perfecto. Creo la landing mobile-first con sistema de leads a WhatsApp y Google Sheets. Deploy en AWS CloudFront. Lista en 48h.' },
    { role:'user',   text:'Necesito automatización de leads también' },
    { role:'claude', text:'Configuro n8n: cada lead llega a tu Sheets en tiempo real + alerta Gmail automática. Ya está en producción para otros clientes.' },
  ];
  let mIdx=0, cIdx=0, div=null;
  function next() {
    if(mIdx>=messages.length){mIdx=0;el.innerHTML='';}
    const m=messages[mIdx];
    div=document.createElement('div');
    div.className=`ct-msg ct-${m.role}`;
    div.innerHTML=m.role==='claude'
      ? `<div class="ct-avatar">◆</div><span class="ct-text"></span>`
      : `<span class="ct-user-text"></span>`;
    el.appendChild(div); el.scrollTop=el.scrollHeight; cIdx=0; type();
  }
  function type() {
    const m=messages[mIdx];
    const s=div.querySelector('.ct-text,.ct-user-text');
    if(cIdx<m.text.length){ s.textContent+=m.text[cIdx++]; el.scrollTop=el.scrollHeight; setTimeout(type,m.role==='claude'?20:32); }
    else { mIdx++; setTimeout(next,1600); }
  }
  setTimeout(next,900);
})();

/* ── Scroll Gallery ─────────────────────────── */
(function () {
  const gallery = document.getElementById('scroll-gallery');
  if (!gallery) return;
  const bgs    = gallery.querySelectorAll('.sg-bg');
  const slides = gallery.querySelectorAll('.sg-slide');
  const dots   = gallery.querySelectorAll('.sg-dot');
  const fill   = document.getElementById('sg-fill');
  const counter = document.getElementById('sg-counter');
  const hint   = document.getElementById('sg-hint');
  const TOTAL  = slides.length;
  let current  = -1;

  function setSlide(idx) {
    if (idx === current) return;
    if (current >= 0) {
      bgs[current].classList.remove('active');
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
    }
    bgs[idx].classList.add('active');
    slides[idx].classList.add('active');
    dots[idx].classList.add('active');
    if (counter) counter.textContent = `0${idx + 1} / 0${TOTAL}`;
    if (hint) hint.classList.toggle('hidden', idx > 0);
    current = idx;
  }

  function update() {
    const rect    = gallery.getBoundingClientRect();
    const scrolled = -rect.top;
    const totalH   = gallery.offsetHeight - window.innerHeight;
    const progress = Math.min(Math.max(scrolled / totalH, 0), 1);
    const idx      = Math.min(Math.floor(progress * TOTAL), TOTAL - 1);
    if (fill) fill.style.width = (progress * 100) + '%';
    setSlide(idx < 0 ? 0 : idx);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const sectionH = gallery.offsetHeight - window.innerHeight;
      const target   = gallery.offsetTop + (i / TOTAL) * sectionH;
      window.scrollTo({ top: target, behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', update, { passive: true });
  setSlide(0); update();
})();

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
