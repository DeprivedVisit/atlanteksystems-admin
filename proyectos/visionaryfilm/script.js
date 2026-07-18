// ===== CONFIG — cambiar antes de entregar =====
const WA_NUMBER = '50600000000'; // Número de Fabian sin + ni espacios

// ===== NAV toggle móvil =====
const navToggleEl = document.getElementById('navToggle');
if (navToggleEl) {
  navToggleEl.addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });
}

// Cerrar nav al hacer click en link
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

// ===== WhatsApp flotante =====
document.getElementById('waFloat').href = `https://wa.me/${WA_NUMBER}?text=Hola%2C%20vi%20tu%20web%20y%20me%20interesa%20saber%20m%C3%A1s%20sobre%20sus%20servicios%20audiovisuales.`;

// ===== Formulario de contacto → WhatsApp =====
const contactFormEl = document.getElementById('contactForm');
if (contactFormEl) {
  contactFormEl.addEventListener('submit', e => {
    e.preventDefault();

    const nombre   = document.getElementById('cNombre').value.trim();
    const tel      = document.getElementById('cTel').value.trim();
    const servicio = document.getElementById('cServicio').value;
    const mensaje  = document.getElementById('cMensaje').value.trim();

    const txt = [
      `Hola VisionaryFilm 👋`,
      ``,
      `*Nombre:* ${nombre}`,
      `*Teléfono:* ${tel}`,
      servicio ? `*Servicio:* ${servicio}` : '',
      mensaje  ? `*Mensaje:* ${mensaje}` : '',
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(txt)}`;
    window.open(url, '_blank', 'noopener');
  });
}

// ===== Número WhatsApp visible en contact info =====
const waEl = document.getElementById('waNumber');
if (waEl && WA_NUMBER !== '50600000000') {
  const digits = WA_NUMBER.replace(/\D/g, '');
  waEl.textContent = `+${digits.slice(0,3)} ${digits.slice(3,7)}-${digits.slice(7)}`;
}

// ===== Fade-in on scroll =====
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .portfolio-item, .process-step, .pricing-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});

// ===== Reel placeholder click =====
const reelHolder = document.getElementById('reelPlaceholder');
if (reelHolder) {
  reelHolder.style.cursor = 'pointer';
  reelHolder.addEventListener('click', () => {
    const id = prompt('YouTube Video ID del reel (solo el ID):');
    if (id && id.trim()) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${id.trim()}?autoplay=1&rel=0`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.cssText = 'width:100%;height:100%;border:none;';
      reelHolder.replaceWith(iframe);
    }
  });
}

// ===== Filtro de portafolio (solo en portafolio.html) =====
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');
if (filterBtns.length && portfolioItems.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      portfolioItems.forEach(item => {
        const show = cat === 'todos' || item.dataset.category === cat;
        item.style.display = show ? '' : 'none';
      });
    });
  });
}

// ===== Nav activo según página actual =====
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === currentPage) a.classList.add('active');
});
