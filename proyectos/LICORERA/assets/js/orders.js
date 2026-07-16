/* ============================================
   JIMÉNEZ LICORES — Pedidos (compartido landing/admin/dashboard)
   localStorage + POST opcional a Google Apps Script
   ============================================ */

const ORDERS_KEY = 'jl_orders';

// Pegar aquí la URL del Web App al implementar apps-script/Code.gs
const APPS_SCRIPT_URL = '';

const fmtColones = (n) => '₡' + (n || 0).toLocaleString('es-CR');

function getOrders() {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; }
  catch { return []; }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function addOrder(order) {
  order.id = 'JL' + Date.now().toString(36).toUpperCase();
  order.date = new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
  order.status = 'pendiente';
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);

  if (APPS_SCRIPT_URL) {
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(order),
    }).catch(() => { /* el pedido ya quedó guardado local */ });
  }

  return order;
}

function updateOrderStatus(id, status) {
  const orders = getOrders();
  const order = orders.find(o => o.id === id);
  if (order) { order.status = status; saveOrders(orders); }
}
