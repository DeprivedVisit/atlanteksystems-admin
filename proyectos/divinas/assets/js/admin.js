document.addEventListener('DOMContentLoaded', () => {

  const tbody = document.getElementById('ordersBody');
  const emptyMsg = document.getElementById('emptyMsg');
  const searchInput = document.getElementById('filterSearch');
  const statusFilter = document.getElementById('filterStatus');
  const clearBtn = document.getElementById('clearOrders');

  function render() {
    let orders = getOrders();
    const search = (searchInput?.value || '').toLowerCase();
    const status = statusFilter?.value || 'todas';

    if (status !== 'todas') orders = orders.filter(o => o.status === status);
    if (search) orders = orders.filter(o =>
      o.name?.toLowerCase().includes(search) ||
      o.phone?.includes(search) ||
      o.id?.toLowerCase().includes(search)
    );

    document.getElementById('statTotal').textContent = getOrders().length;
    document.getElementById('statPendiente').textContent = getOrders().filter(o => o.status === 'pendiente').length;
    const revenue = getOrders().reduce((sum, o) => sum + (o.total || 0), 0);
    document.getElementById('statRevenue').textContent = '₡' + revenue.toLocaleString();

    if (orders.length === 0) {
      tbody.innerHTML = '';
      emptyMsg.classList.add('show');
      return;
    }
    emptyMsg.classList.remove('show');

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong style="font-size:0.75rem;">${o.id || '—'}</strong></td>
        <td>${o.date || '—'}</td>
        <td><strong>${o.name || '—'}</strong></td>
        <td><a href="https://wa.me/13055190471?text=${encodeURIComponent('Hola ' + o.name + ', recibimos tu pedido ' + o.id)}" target="_blank" style="color:var(--accent3);text-decoration:underline;">${o.phone || '—'}</a></td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${o.address || ''}">${o.address || '—'}</td>
        <td>${o.product || '—'}</td>
        <td>${o.quantity || 0}</td>
        <td><strong>₡${(o.total || 0).toLocaleString()}</strong></td>
        <td><span class="status-badge status-${o.status}">${o.status || 'pendiente'}</span></td>
      </tr>
    `).join('');
  }

  if (searchInput) searchInput.addEventListener('input', render);
  if (statusFilter) statusFilter.addEventListener('change', render);

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Borrar todos los pedidos de prueba?')) {
        localStorage.removeItem('divinas_orders');
        render();
      }
    });
  }

  render();

});
