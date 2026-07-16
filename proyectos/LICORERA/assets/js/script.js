/* ============================================
   JIMÉNEZ LICORES — Apex Cloud Work
   Age gate · Nav móvil · Catálogo filtrable · Reveal
   ============================================ */

const WA_NUMBER = '50663144171';

/* ---------- Catálogo ----------
   price: colones (₡) según tarjetas del cliente (jul 2026).
   Sin price = se muestra "Consultar precio". */
const PRODUCTS = [
  // Tequila
  { slug: 'patron-silver',      name: 'Patrón Silver',                 detail: '1L · con estuche',   cat: 'tequila' },
  { slug: 'patron-anejo',       name: 'Patrón Añejo',                  detail: '750ml · con estuche',cat: 'tequila' },
  { slug: '1800-silver',        name: 'Tequila 1800 Silver',           detail: '750ml',              cat: 'tequila' },
  { slug: '1800-reposado',      name: 'Tequila 1800 Reposado',         detail: '750ml',              cat: 'tequila', price: 12000 },
  { slug: '1800-anejo',         name: 'Tequila 1800 Añejo',            detail: '750ml',              cat: 'tequila' },
  { slug: 'cuervo-silver',      name: 'Jose Cuervo Especial Silver',   detail: '1L',                 cat: 'tequila', price: 10000 },
  { slug: 'cuervo-gold',        name: 'Jose Cuervo Especial Gold',     detail: '1L',                 cat: 'tequila', price: 10000 },

  // Ron
  { slug: 'flor-coco',          name: 'Flor de Caña Coco',             detail: '750ml',              cat: 'ron', price: 8000 },
  { slug: 'flor-perfect10',     name: 'Flor de Caña Perfect 10',       detail: '1L',                 cat: 'ron' },
  { slug: 'flor-centenario-12', name: 'Flor de Caña Centenario 12',    detail: '750ml · con estuche',cat: 'ron' },
  { slug: 'flor-reserva-7',     name: 'Flor de Caña Gran Reserva 7',   detail: '1L',                 cat: 'ron', price: 8500 },
  { slug: 'centenario-7',       name: 'Ron Centenario 7 Añejo Especial', detail: '750ml',            cat: 'ron', price: 9000 },
  { slug: 'morgan-spiced',      name: 'Captain Morgan Spiced',         detail: '1L',                 cat: 'ron', price: 9500 },
  { slug: 'morgan-black',       name: 'Captain Morgan Black Jamaica',  detail: '700ml',              cat: 'ron' },
  { slug: 'morgan-white',       name: 'Captain Morgan White',          detail: '1.14L',              cat: 'ron' },
  { slug: 'morgan-private',     name: 'Captain Morgan Private Stock',  detail: '1L',                 cat: 'ron', price: 17000 },
  { slug: 'bacardi-blanca',     name: 'Bacardí Carta Blanca',          detail: '1L',                 cat: 'ron', price: 7000 },
  { slug: 'bacardi-oro',        name: 'Bacardí Carta Oro',             detail: '1L',                 cat: 'ron', price: 7000 },
  { slug: 'cortez-blanco',      name: 'Ron Cortez Blanco',             detail: '1L',                 cat: 'ron' },
  { slug: 'cortez-oro',         name: 'Ron Cortez Oro',                detail: '1L',                 cat: 'ron', price: 5000 },
  { slug: 'malibu',             name: 'Malibu Coconut',                detail: '1L',                 cat: 'ron', price: 10000 },

  // Whisky
  { slug: 'jd-old7',            name: "Jack Daniel's Old No.7",        detail: '1L',                 cat: 'whisky' },
  { slug: 'jd-honey',           name: "Jack Daniel's Tennessee Honey", detail: '1L',                 cat: 'whisky', price: 17000 },
  { slug: 'jd-fire',            name: "Jack Daniel's Tennessee Fire",  detail: '1L',                 cat: 'whisky', price: 17000 },
  { slug: 'jd-apple',           name: "Jack Daniel's Tennessee Apple", detail: '1L',                 cat: 'whisky' },
  { slug: 'jw-red',             name: 'Johnnie Walker Red Label',      detail: '1L · con estuche',   cat: 'whisky', price: 10000 },
  { slug: 'jw-black',           name: 'Johnnie Walker Black Label 12', detail: '1L · con estuche',   cat: 'whisky', price: 19000 },
  { slug: 'chivas-12',          name: 'Chivas Regal 12 Años',          detail: '1L · con estuche',   cat: 'whisky', price: 18500 },
  { slug: 'oldparr-12',         name: 'Old Parr 12 Años',              detail: '1L',                 cat: 'whisky' },
  { slug: 'oldparr-18',         name: 'Old Parr 18 Años',              detail: '750ml · con estuche',cat: 'whisky' },
  { slug: 'buchanans-12',       name: "Buchanan's DeLuxe 12 Años",     detail: '1L',                 cat: 'whisky' },
  { slug: 'buchanans-master',   name: "Buchanan's Master",             detail: '750ml',              cat: 'whisky' },
  { slug: 'black-white',        name: 'Black & White',                 detail: '1L',                 cat: 'whisky', price: 8500 },
  { slug: 'jb-rare',            name: 'J&B Rare',                      detail: '1L',                 cat: 'whisky', price: 10000 },
  { slug: 'label5',             name: 'Label 5 Bourbon Barrel',        detail: '700ml',              cat: 'whisky' },
  { slug: '8pm',                name: '8PM Grain Blended',             detail: 'Celebration Pack',   cat: 'whisky' },
  { slug: 'royal-circle',       name: 'Royal Circle Premium',          detail: '1L · con estuche',   cat: 'whisky', price: 6000 },
  { slug: 'royal-circle-honey', name: 'Royal Circle Honey',            detail: '1L · con estuche',   cat: 'whisky', price: 6000 },

  // Vodka
  { slug: 'absolut',            name: 'Absolut Vodka',                 detail: '1L',                 cat: 'vodka', price: 10000 },
  { slug: 'smirnoff',           name: 'Smirnoff N°21',                 detail: '1L',                 cat: 'vodka', price: 9000 },

  // Gin
  { slug: 'gordons',            name: "Gordon's London Dry",           detail: '1L',                 cat: 'gin', price: 10000 },
  { slug: 'ninnoff-pink',       name: 'Ninnoff Gin Botanicals Pink',   detail: '900ml',              cat: 'gin' },

  // Licores y Cremas
  { slug: 'jager-original',     name: 'Jägermeister',                  detail: '1L',                 cat: 'licores', price: 11000 },
  { slug: 'jager-manifest',     name: 'Jägermeister Manifest',         detail: '1L',                 cat: 'licores' },
  { slug: 'jager-orange',       name: 'Jägermeister Orange',           detail: '1L',                 cat: 'licores', price: 15000 },
  { slug: 'jager-winter',       name: 'Jägermeister Winter Edition',   detail: '700ml',              cat: 'licores', price: 14000 },
  { slug: 'jager-pack',         name: 'Jägermeister Pack + Vasos',     detail: '1.75L · dispensador',cat: 'licores' },
  { slug: 'baileys',            name: 'Baileys Original',              detail: '1L',                 cat: 'licores' },
  { slug: 'amarula',            name: 'Amarula Cream',                 detail: '1L',                 cat: 'licores', price: 12500 },
  { slug: 'brogans',            name: 'Brogans Irish Cream',           detail: '1L',                 cat: 'licores' },
  { slug: 'tequila-rose',       name: 'Tequila Rose Strawberry',       detail: '750ml',              cat: 'licores', price: 12000 },
  { slug: 'fireball',           name: 'Fireball Cinnamon Whisky',      detail: '1L',                 cat: 'licores', price: 10000 },
  { slug: 'campari',            name: 'Campari',                       detail: '1L',                 cat: 'licores', price: 9000 },
  { slug: 'hpnotiq',            name: 'Hpnotiq',                       detail: '750ml',              cat: 'licores', price: 14000 },
  { slug: 'fernet',             name: 'Fernet-Branca',                 detail: '750ml',              cat: 'licores', price: 12000 },
  { slug: 'tequilero-morango',  name: 'Tequilero Morango',             detail: '750ml',              cat: 'licores' },

  // Aguardiente
  { slug: 'antioqueno-rojo',    name: 'Aguardiente Antioqueño 29°',    detail: '750ml',              cat: 'aguardiente' },
  { slug: 'antioqueno-verde',   name: 'Antioqueño 24° Sin Azúcar',     detail: '750ml',              cat: 'aguardiente' },
  { slug: 'amarillo',           name: 'Amarillo de Manzanares',        detail: '1L · sin azúcar',    cat: 'aguardiente', price: 11000 },
];

const CAT_LABELS = {
  tequila: 'Tequila',
  ron: 'Ron',
  whisky: 'Whisky',
  vodka: 'Vodka',
  gin: 'Gin',
  licores: 'Licores y Cremas',
  aguardiente: 'Aguardiente',
};

/* ---------- Age gate ---------- */
const ageGate = document.getElementById('ageGate');

if (localStorage.getItem('jl_age_ok') !== '1') {
  ageGate.hidden = false;
  document.body.style.overflow = 'hidden';
}

document.getElementById('ageYes').addEventListener('click', () => {
  localStorage.setItem('jl_age_ok', '1');
  ageGate.hidden = true;
  document.body.style.overflow = '';
});

document.getElementById('ageNo').addEventListener('click', () => {
  window.location.href = 'https://www.google.com';
});

/* ---------- Nav móvil ---------- */
const navLinks = document.getElementById('navLinks');

const mobileToggle = document.getElementById('mobileToggle');

mobileToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  mobileToggle.setAttribute('aria-expanded', open);
});

navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    navLinks.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
  }
});

/* ---------- Render catálogo ---------- */
const grid = document.getElementById('catalogGrid');
const emptyMsg = document.getElementById('catalogEmpty');
const searchBox = document.getElementById('searchBox');

let activeCat = 'todos';

const fmtPrice = (n) => '₡' + n.toLocaleString('es-CR');

function waLink(p) {
  const msg = p.price
    ? `Hola, quiero pedir: ${p.name} ${p.detail} (${fmtPrice(p.price)})`
    : `Hola, quiero consultar el precio de: ${p.name}`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function render() {
  const term = searchBox.value.trim().toLowerCase();

  const visible = PRODUCTS.filter(p =>
    (activeCat === 'todos' || p.cat === activeCat) &&
    (!term ||
      p.name.toLowerCase().includes(term) ||
      p.detail.toLowerCase().includes(term) ||
      CAT_LABELS[p.cat].toLowerCase().includes(term))
  );

  grid.innerHTML = visible.map(p => `
    <article class="product-card">
      <img class="product-img" src="assets/img/products/${p.slug}.jpg" alt="${p.name}" loading="lazy">
      <div class="product-info">
        <p class="product-cat">${CAT_LABELS[p.cat]}</p>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-detail">${p.detail}</p>
        ${p.price ? `<p class="product-price">${fmtPrice(p.price)}</p>` : ''}
        <a class="product-cta" href="${waLink(p)}" target="_blank" rel="noopener">${p.price ? 'Pedir por WhatsApp' : 'Consultar precio'}</a>
      </div>
    </article>
  `).join('');

  emptyMsg.hidden = visible.length > 0;
}

document.getElementById('filters').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter');
  if (!btn) return;
  document.querySelectorAll('.filter').forEach(f => f.classList.remove('active'));
  btn.classList.add('active');
  activeCat = btn.dataset.cat;
  render();
});

searchBox.addEventListener('input', render);

render();

/* ---------- Formulario de pedido ---------- */
const orderForm = document.getElementById('orderForm');

if (orderForm) {
  const productSelect = document.getElementById('ordProduct');
  const qtyInput = document.getElementById('ordQty');
  const totalEl = document.getElementById('ordTotal');

  PRODUCTS.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.slug;
    opt.textContent = `${p.name} · ${p.detail}` + (p.price ? ` — ${fmtPrice(p.price)}` : ' — precio a consultar');
    productSelect.appendChild(opt);
  });

  function updateTotal() {
    const p = PRODUCTS.find(x => x.slug === productSelect.value);
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    totalEl.textContent = (p && p.price) ? fmtPrice(p.price * qty) : 'a confirmar';
  }

  productSelect.addEventListener('change', updateTotal);
  qtyInput.addEventListener('input', updateTotal);

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!orderForm.reportValidity()) return;

    const p = PRODUCTS.find(x => x.slug === productSelect.value);
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    const total = (p && p.price) ? p.price * qty : 0;

    const order = addOrder({
      name: document.getElementById('ordName').value.trim(),
      phone: document.getElementById('ordPhone').value.trim(),
      address: document.getElementById('ordAddress').value.trim(),
      product: p ? `${p.name} ${p.detail}` : '',
      quantity: qty,
      total,
      notes: document.getElementById('ordNotes').value.trim(),
    });

    document.getElementById('ordOk').hidden = false;

    const msg = `Hola, soy ${order.name}. Pedido ${order.id}: ${qty}× ${order.product}` +
      (total ? ` (${fmtColones(total)})` : ' (precio a confirmar)') +
      `. Entrega: ${order.address}.` + (order.notes ? ` Notas: ${order.notes}` : '');
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');

    orderForm.reset();
    updateTotal();
  });
}

/* ---------- Reveal on scroll ---------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
