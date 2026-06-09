// ============================================================
// EcoPollo Cartago — Carrito de Compras
// Compartido entre catalogo.html e index.html
// ============================================================

var CARRITO_KEY = 'ep-carrito';

var CarritoUI = {

  // Leer carrito
  get: function() {
    try { return JSON.parse(localStorage.getItem(CARRITO_KEY) || '[]'); }
    catch(e) { return []; }
  },

  // Guardar carrito
  save: function(items) {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(items));
    this.updateBadge();
    this.updateDrawer();
  },

  // Agregar producto
  add: function(producto) {
    var items = this.get();
    var idx = items.findIndex(function(i) { return i.cod === producto.cod; });
    if (idx >= 0) {
      items[idx].cant += (producto.cant || 1);
    } else {
      items.push({
        cod: producto.cod,
        nom: producto.nom,
        precio: producto.precio,
        und: producto.und || 'UND',
        cant: producto.cant || 1,
        cat: producto.cat || ''
      });
    }
    this.save(items);
    this.showToast('✅ ' + producto.nom + ' agregado al carrito');
  },

  // Quitar producto
  remove: function(cod) {
    var items = this.get().filter(function(i) { return i.cod !== cod; });
    this.save(items);
  },

  // Cambiar cantidad
  setCant: function(cod, cant) {
    var items = this.get();
    var idx = items.findIndex(function(i) { return i.cod === cod; });
    if (idx >= 0) {
      if (cant <= 0) { items.splice(idx, 1); }
      else { items[idx].cant = cant; }
    }
    this.save(items);
  },

  // Vaciar
  clear: function() {
    localStorage.removeItem(CARRITO_KEY);
    this.updateBadge();
    this.updateDrawer();
  },

  // Total items
  totalItems: function() {
    return this.get().reduce(function(t, i) { return t + i.cant; }, 0);
  },

  // Total precio
  totalPrecio: function(descuento) {
    var desc = descuento || 0;
    return this.get().reduce(function(t, i) {
      var p = desc > 0 ? Math.round(i.precio * (1 - desc/100)) : i.precio;
      return t + (p * i.cant);
    }, 0);
  },

  // Actualizar badge
  updateBadge: function() {
    var badges = document.querySelectorAll('.carrito-badge');
    var total = this.totalItems();
    badges.forEach(function(b) {
      b.textContent = total;
      b.style.display = total > 0 ? 'flex' : 'none';
    });
  },

  // Actualizar drawer
  updateDrawer: function() {
    var drawer = document.getElementById('carrito-drawer');
    if (!drawer) return;
    var items = this.get();
    var lista = document.getElementById('carrito-lista');
    var totalEl = document.getElementById('carrito-total');
    var emptyEl = document.getElementById('carrito-empty');
    var footerEl = document.getElementById('carrito-footer');

    if (!items.length) {
      if (lista) lista.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';

    var self = this;
    if (lista) {
      lista.innerHTML = items.map(function(item) {
        return '<div class="carrito-item" id="citem-' + item.cod + '">' +
          '<div class="ci-info">' +
            '<div class="ci-nom">' + item.nom + '</div>' +
            '<div class="ci-precio">₡' + item.precio.toLocaleString('es-CR') + '/' + item.und + '</div>' +
          '</div>' +
          '<div class="ci-controls">' +
            '<button class="ci-btn" onclick="CarritoUI.setCant(\'' + item.cod + '\',' + (item.cant-1) + ')">−</button>' +
            '<span class="ci-cant">' + item.cant + '</span>' +
            '<button class="ci-btn" onclick="CarritoUI.setCant(\'' + item.cod + '\',' + (item.cant+1) + ')">+</button>' +
            '<button class="ci-del" onclick="CarritoUI.remove(\'' + item.cod + '\')">🗑</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    var total = this.totalPrecio();
    if (totalEl) totalEl.textContent = '₡' + total.toLocaleString('es-CR');
  },

  // Toast notificación
  showToast: function(msg) {
    var t = document.getElementById('carrito-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function() { t.classList.remove('show'); }, 2500);
  },

  // Abrir/cerrar drawer
  toggle: function() {
    var drawer = document.getElementById('carrito-drawer');
    if (drawer) drawer.classList.toggle('open');
  },
  open: function() {
    var drawer = document.getElementById('carrito-drawer');
    if (drawer) drawer.classList.add('open');
  },
  close: function() {
    var drawer = document.getElementById('carrito-drawer');
    if (drawer) drawer.classList.remove('open');
  },

  // Generar mensaje WhatsApp
  buildWA: function(nombre, zona, descuento) {
    var items = this.get();
    if (!items.length) return '';
    var desc = descuento || 0;
    var m = '🐔 *EcoPollo Cartago*\n\n';
    if (nombre) m += '👤 *Cliente:* ' + nombre + '\n';
    if (zona) m += '📍 *Zona:* ' + zona + '\n\n';
    m += '🛒 *Pedido:*\n';
    items.forEach(function(i) {
      var precio = desc > 0 ? Math.round(i.precio*(1-desc/100)) : i.precio;
      m += '  • ' + i.nom + ' x' + i.cant + ' ' + i.und + ' · ₡' + precio.toLocaleString('es-CR') + '\n';
    });
    var total = this.totalPrecio(desc);
    m += '\n💰 *Total estimado:* ₡' + total.toLocaleString('es-CR');
    if (desc > 0) m += ' (' + desc + '% descuento aplicado)';
    m += '\n\n¡Quiero hacer este pedido! 👋';
    return m;
  },

  // Inicializar (agregar HTML del carrito al body)
  init: function() {
    var html = `
<style>
.carrito-fab{position:fixed;bottom:80px;right:20px;width:52px;height:52px;background:linear-gradient(135deg,#4A7C2C,#2D5A1B);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px rgba(45,90,27,0.4);z-index:500;border:2px solid #F0C300;transition:all 0.2s;}
.carrito-fab:hover{transform:scale(1.1);}
.carrito-fab svg{width:24px;height:24px;color:white;}
.carrito-badge{position:absolute;top:-6px;right:-6px;width:20px;height:20px;background:#F0C300;color:#2D5A1B;border-radius:50%;font-size:11px;font-weight:800;display:none;align-items:center;justify-content:center;}
.carrito-drawer{position:fixed;right:-380px;top:0;bottom:0;width:360px;background:#FFF8EE;z-index:1000;box-shadow:-4px 0 24px rgba(0,0,0,0.15);transition:right 0.3s ease;display:flex;flex-direction:column;border-left:3px solid #F0C300;}
.carrito-drawer.open{right:0;}
.carrito-head{padding:20px;background:linear-gradient(135deg,#2D5A1B,#4A7C2C);color:white;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;}
.carrito-head h3{font-size:17px;font-weight:700;}
.carrito-close{background:rgba(255,255,255,0.15);border:none;color:white;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;}
.carrito-body{flex:1;overflow-y:auto;padding:16px;}
.carrito-empty{text-align:center;padding:40px 20px;color:#6C757D;}
.carrito-empty div{font-size:48px;margin-bottom:12px;}
.carrito-item{background:white;border-radius:12px;padding:14px;margin-bottom:10px;border:1.5px solid #EDE5D0;display:flex;justify-content:space-between;align-items:center;gap:10px;}
.ci-info{flex:1;}
.ci-nom{font-size:13px;font-weight:600;color:#1A1A1A;margin-bottom:4px;}
.ci-precio{font-size:12px;color:#6C757D;}
.ci-controls{display:flex;align-items:center;gap:6px;flex-shrink:0;}
.ci-btn{width:28px;height:28px;background:#F0C300;border:none;border-radius:50%;cursor:pointer;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;color:#2D5A1B;}
.ci-cant{font-size:14px;font-weight:700;min-width:20px;text-align:center;}
.ci-del{background:none;border:none;cursor:pointer;font-size:16px;padding:4px;}
.carrito-footer{padding:16px;background:white;border-top:2px solid #EDE5D0;flex-shrink:0;}
.carrito-total-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
.carrito-total-label{font-size:14px;color:#6C757D;font-weight:500;}
.carrito-total-val{font-size:20px;font-weight:800;color:#2D5A1B;}
.carrito-wa-btn{width:100%;padding:14px;background:#25D366;color:white;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;font-family:inherit;}
.carrito-wa-btn:hover{background:#1DAA53;transform:translateY(-1px);}
.carrito-clear{width:100%;padding:10px;background:transparent;color:#6C757D;border:1.5px solid #EDE5D0;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;margin-top:8px;font-family:inherit;transition:all 0.2s;}
.carrito-clear:hover{border-color:#BC4749;color:#BC4749;}
.carrito-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:999;}
.carrito-overlay.show{display:block;}
#carrito-toast{position:fixed;bottom:150px;left:50%;transform:translateX(-50%) translateY(20px);background:#2D5A1B;color:white;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;z-index:2000;opacity:0;transition:all 0.3s;white-space:nowrap;pointer-events:none;}
#carrito-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
@media(max-width:600px){.carrito-drawer{width:100%;right:-100%;}}
/* Checkout modal */
#checkout-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2001;align-items:center;justify-content:center;padding:16px;}
#checkout-modal.show{display:flex;}
.checkout-box{background:white;border-radius:20px;padding:24px;width:100%;max-width:360px;box-shadow:0 20px 60px rgba(0,0,0,0.25);}
.checkout-box h3{font-size:18px;font-weight:700;color:#2D5A1B;margin-bottom:6px;}
.checkout-box p{font-size:13px;color:#6C757D;margin-bottom:18px;}
.checkout-field{margin-bottom:14px;}
.checkout-field label{display:block;font-size:12px;font-weight:700;color:#2D5A1B;margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px;}
.checkout-field input,.checkout-field select{width:100%;padding:11px 14px;border:1.5px solid #EDE5D0;border-radius:10px;font-size:14px;font-family:inherit;background:white;color:#1A1A1A;outline:none;box-sizing:border-box;}
.checkout-field input:focus,.checkout-field select:focus{border-color:#4A7C2C;}
.checkout-send{width:100%;padding:14px;background:#25D366;color:white;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;font-family:inherit;}
.checkout-send:hover{background:#1DAA53;}
.checkout-cancel{width:100%;padding:10px;background:transparent;color:#6C757D;border:1.5px solid #EDE5D0;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;margin-top:8px;font-family:inherit;}
</style>

<div id="carrito-toast"></div>
<div class="carrito-overlay" id="carrito-overlay" onclick="CarritoUI.close();document.getElementById('carrito-overlay').classList.remove('show');"></div>

<div class="carrito-fab" onclick="CarritoUI.toggle();document.getElementById('carrito-overlay').classList.toggle('show');">
  <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
  <span class="carrito-badge" id="carrito-badge-fab">0</span>
</div>

<div class="carrito-drawer" id="carrito-drawer">
  <div class="carrito-head">
    <h3>🛒 Mi Carrito</h3>
    <button class="carrito-close" onclick="CarritoUI.close();document.getElementById('carrito-overlay').classList.remove('show');">✕</button>
  </div>
  <div class="carrito-body">
    <div class="carrito-empty" id="carrito-empty">
      <div>🛒</div>
      <p>Tu carrito está vacío</p>
      <p style="font-size:12px;margin-top:6px;">Agrega productos del catálogo</p>
    </div>
    <div id="carrito-lista"></div>
  </div>
  <div class="carrito-footer" id="carrito-footer" style="display:none;">
    <div class="carrito-total-row">
      <span class="carrito-total-label">Total estimado:</span>
      <span class="carrito-total-val" id="carrito-total">₡0</span>
    </div>
    <button class="carrito-wa-btn" onclick="enviarCarritoWA()">
      <svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px;"><path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.485.713.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375a9.869 9.869 0 01-1.516-5.26c0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.875 2.909 4.365 2.909 7.02-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411"/></svg>
      Pedir por WhatsApp
    </button>
    <button class="carrito-clear" onclick="if(confirm('¿Vaciar el carrito?'))CarritoUI.clear();">🗑 Vaciar carrito</button>
  </div>
</div>

<!-- Modal de checkout -->
<div id="checkout-modal">
  <div class="checkout-box">
    <h3>🐔 Confirmar pedido</h3>
    <p>Te enviamos al WhatsApp de EcoPollo para coordinar la entrega.</p>
    <div class="checkout-field">
      <label>Tu nombre *</label>
      <input type="text" id="co-nombre" placeholder="Nombre o negocio" autocomplete="name">
    </div>
    <div class="checkout-field">
      <label>Zona de entrega</label>
      <select id="co-zona">
        <option value="">— Seleccionar —</option>
        <option>Cartago centro</option>
        <option>Tres Ríos</option>
        <option>San José</option>
        <option>Heredia</option>
        <option>Alajuela</option>
        <option>Retiro</option>
        <option>Otro</option>
      </select>
    </div>
    <div class="checkout-field">
      <label>Teléfono (opcional)</label>
      <input type="tel" id="co-tel" placeholder="6000-0000" autocomplete="tel">
    </div>
    <button class="checkout-send" onclick="confirmarPedidoWA()">
      <svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px;"><path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.485.713.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375a9.869 9.869 0 01-1.516-5.26c0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.875 2.909 4.365 2.909 7.02-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411"/></svg>
      Enviar por WhatsApp
    </button>
    <button class="checkout-cancel" onclick="document.getElementById('checkout-modal').classList.remove('show');">Cancelar</button>
  </div>
</div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    this.updateBadge();
    this.updateDrawer();
  }
};

var EP_GOOGLE_URL = 'https://script.google.com/macros/s/AKfycbxi6FJKNrpugkRJV_TPCf_ZGI1bVn3YP_23KnU_F_wDaz8QEEu8ZGVcbnhcCHw5flKO/exec';

function enviarCarritoWA() {
  if (!CarritoUI.get().length) { alert('El carrito está vacío'); return; }
  var modal = document.getElementById('checkout-modal');
  if (!modal) return;
  // Pre-llenar nombre si hay usuario guardado
  var usuario = null;
  try { usuario = JSON.parse(localStorage.getItem('ep-usuario') || 'null'); } catch(e){}
  if (usuario && usuario.nombre) {
    var nomEl = document.getElementById('co-nombre');
    if (nomEl && !nomEl.value) nomEl.value = usuario.nombre;
    var telEl = document.getElementById('co-tel');
    if (telEl && !telEl.value && usuario.telefono) telEl.value = usuario.telefono;
  }
  modal.classList.add('show');
}

function confirmarPedidoWA() {
  var nombre = (document.getElementById('co-nombre').value || '').trim();
  if (!nombre) { document.getElementById('co-nombre').focus(); return; }
  var zona = document.getElementById('co-zona').value || '';
  var telefono = (document.getElementById('co-tel').value || '').trim();

  var items = CarritoUI.get();
  var productoStr = items.map(function(i) { return i.nom + ' x' + i.cant + ' ' + i.und; }).join(', ');
  var total = CarritoUI.totalPrecio();

  // Guardar en localStorage para el panel admin
  var leads = [];
  try { leads = JSON.parse(localStorage.getItem('ecopollo-leads') || '[]'); } catch(e){}
  var lead = {
    fecha: new Date().toISOString(),
    nombre: nombre,
    zona: zona,
    telefono: telefono,
    productos: productoStr,
    total: total,
    estado: 'En proceso',
    confianza: 'alta',
    fuente: 'web'
  };
  leads.push(lead);
  localStorage.setItem('ecopollo-leads', JSON.stringify(leads));

  // Enviar a Google Sheets (no-cors, falla silenciosamente si el script no lo soporta)
  try {
    fetch(EP_GOOGLE_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ accion: 'guardar', lead: lead })
    }).catch(function(){});
  } catch(e){}

  // Cerrar modal y abrir WhatsApp
  document.getElementById('checkout-modal').classList.remove('show');
  var msg = CarritoUI.buildWA(nombre, zona, 0);
  window.open('https://wa.me/50663144171?text=' + encodeURIComponent(msg), '_blank');
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { CarritoUI.init(); });
} else {
  CarritoUI.init();
}