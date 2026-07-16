/* ============================================
   JIMÉNEZ LICORES — Admin: gate + dashboard + pedidos
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Gate ---------- */
  const gate = document.getElementById('adminGate');
  const app = document.getElementById('adminApp');
  const gateError = document.getElementById('gateError');

  function checkAdmin() {
    const s = getSession();
    const ok = s && s.type === 'admin';
    gate.style.display = ok ? 'none' : 'flex';
    app.hidden = !ok;
    if (ok) render();
  }

  document.getElementById('adminLoginBtn').addEventListener('click', async () => {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const result = await loginAdmin(email, password);
    if (result.ok) { gateError.hidden = true; checkAdmin(); return; }
    gateError.textContent = result.error;
    gateError.hidden = false;
  });

  document.getElementById('adminPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('adminLoginBtn').click();
  });

  document.getElementById('adminLogout').addEventListener('click', () => {
    logout();
    checkAdmin();
  });

  /* ---------- Pedidos ---------- */
  const tbody = document.getElementById('ordersBody');
  const emptyMsg = document.getElementById('emptyMsg');
  const searchInput = document.getElementById('filterSearch');
  const statusFilter = document.getElementById('filterStatus');

  const STATUSES = ['pendiente', 'confirmado', 'entregado', 'cancelado'];

  function render() {
    const all = getOrders();

    /* Dashboard */
    document.getElementById('statTotal').textContent = all.length;
    document.getElementById('statPendiente').textContent = all.filter(o => o.status === 'pendiente').length;
    const revenue = all.filter(o => o.status === 'entregado').reduce((sum, o) => sum + (o.total || 0), 0);
    document.getElementById('statRevenue').textContent = fmtColones(revenue);

    const counts = {};
    all.forEach(o => { if (o.product) counts[o.product] = (counts[o.product] || 0) + (o.quantity || 1); });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('statTop').textContent = top ? `${top[0]} (${top[1]})` : '—';

    /* Tabla */
    let orders = all;
    const search = (searchInput.value || '').toLowerCase();
    const status = statusFilter.value;

    if (status !== 'todos') orders = orders.filter(o => o.status === status);
    if (search) orders = orders.filter(o =>
      o.name?.toLowerCase().includes(search) ||
      o.phone?.includes(search) ||
      o.id?.toLowerCase().includes(search)
    );

    emptyMsg.hidden = orders.length > 0;

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong class="mono">${o.id || '—'}</strong></td>
        <td>${o.date || '—'}</td>
        <td><strong>${o.name || '—'}</strong></td>
        <td><a class="wa-link" href="https://wa.me/506${(o.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${o.name}, recibimos tu pedido ${o.id} en Jiménez Licores.`)}" target="_blank" rel="noopener">${o.phone || '—'}</a></td>
        <td class="cell-ellipsis" title="${o.address || ''}">${o.address || '—'}</td>
        <td>${o.product || '—'}</td>
        <td>${o.quantity || 0}</td>
        <td><strong>${o.total ? fmtColones(o.total) : 'a confirmar'}</strong></td>
        <td>
          <select class="status-select status-${o.status}" data-id="${o.id}">
            ${STATUSES.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>
    `).join('');
  }

  tbody.addEventListener('change', (e) => {
    const sel = e.target.closest('.status-select');
    if (!sel) return;
    updateOrderStatus(sel.dataset.id, sel.value);
    render();
  });

  searchInput.addEventListener('input', render);
  statusFilter.addEventListener('change', render);

  document.getElementById('clearOrders').addEventListener('click', () => {
    if (confirm('¿Borrar TODOS los pedidos guardados en este navegador?')) {
      localStorage.removeItem(ORDERS_KEY);
      render();
    }
  });

  checkAdmin();
});
