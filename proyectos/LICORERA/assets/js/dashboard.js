/* ============================================
   JIMÉNEZ LICORES — Dashboard cliente: mis pedidos por teléfono
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const input = document.getElementById('phoneInput');
  const list = document.getElementById('dashOrders');
  const empty = document.getElementById('dashEmpty');

  const STATUS_LABELS = {
    pendiente: 'Pendiente de confirmar',
    confirmado: 'Confirmado — en camino',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };

  function digits(s) { return (s || '').replace(/\D/g, ''); }

  function render() {
    const phone = digits(input.value);
    if (phone.length < 4) { list.innerHTML = ''; empty.hidden = true; return; }

    const orders = getOrders().filter(o => digits(o.phone).includes(phone));

    empty.hidden = orders.length > 0;

    list.innerHTML = orders.map(o => `
      <article class="order-card">
        <header>
          <strong class="order-id">${o.id}</strong>
          <span class="status-badge status-${o.status}">${STATUS_LABELS[o.status] || o.status}</span>
        </header>
        <p class="order-product">${o.quantity}× ${o.product}</p>
        <p class="order-meta">${o.date} · Entrega: ${o.address}</p>
        <p class="order-total">${o.total ? fmtColones(o.total) : 'Precio a confirmar'}</p>
      </article>
    `).join('');
  }

  document.getElementById('phoneSearch').addEventListener('click', render);
  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') render(); });
});
