const ORDERS_KEY = 'divinas_orders';
const APPS_SCRIPT_URL = ''; // Pega aquí tu URL de Apps Script después de implementar

function getOrders() {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; }
  catch { return []; }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function addOrder(order) {
  const orders = getOrders();
  order.id = Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
  order.date = new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
  order.status = 'pendiente';
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

document.addEventListener('DOMContentLoaded', () => {

  const WA_NUMBER = '13055190471';
  const WA_MSG = 'Hola, quiero más información sobre Divinas Slim';

  document.querySelectorAll('.wa-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const msg = btn.dataset.msg || WA_MSG;
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  });

  const floatBtn = document.querySelector('.whatsapp-float');
  if (floatBtn) {
    floatBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MSG)}`, '_blank');
    });
  }

  const qtyEl = document.getElementById('formQty');
  const productEl = document.getElementById('formProduct');
  const totalEl = document.getElementById('formTotal');
  function updateTotal() {
    const qty = parseInt(qtyEl?.value || 1);
    const product = productEl?.value || 'Slim';
    const price = product === 'Iconic Kit' ? 45000 : 35000;
    const total = price * (qty >= 5 ? 5 : qty);
    if (totalEl) totalEl.innerHTML = `<span>Total estimado:</span> <strong>₡${total.toLocaleString()}</strong>`;
  }
  if (qtyEl) qtyEl.addEventListener('change', updateTotal);
  if (productEl) productEl.addEventListener('change', updateTotal);
  updateTotal();

  const form = document.getElementById('orderForm');
  const overlay = document.getElementById('orderConfirm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const qty = parseInt(document.getElementById('formQty').value);
      const product = document.getElementById('formProduct').value;
      const price = product === 'Iconic Kit' ? 45000 : 35000;
      const session = (typeof getSession === 'function') ? getSession() : null;
      const order = addOrder({
        name: document.getElementById('formName').value.trim(),
        phone: document.getElementById('formPhone').value.trim(),
        address: document.getElementById('formAddress').value.trim(),
        product,
        quantity: qty >= 5 ? 5 : qty,
        total: price * (qty >= 5 ? 5 : qty),
        notes: document.getElementById('formNotes').value.trim(),
        email: session?.email || '',
      });
      document.getElementById('confirmName').textContent = order.name;
      document.getElementById('confirmPhone').textContent = order.phone;
      document.getElementById('confirmId').textContent = order.id;
      overlay.classList.add('active');
      form.reset();
      updateTotal();

      if (APPS_SCRIPT_URL) {
        fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
        }).catch(() => {});
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
    const closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
  }

});
