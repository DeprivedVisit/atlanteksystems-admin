/**
 * RFLX Detail · calendar.js
 * Calendario mes completo · horas 7AM–3PM · integración con preview en vivo
 */

const CONFIG = {
  hours: [7,8,9,10,11,12,13,14,15],
  minutes: [0,30],
  maxDaysAhead: 60,
  whatsappNumber: "50670352618",
  sheetsUrl: "https://script.google.com/macros/s/AKfycbxaTAhYv33Q_xg9_W8x_K5lEZagIF4p1KqlqHKedMfn2H8j9uQVk7POJVNXTQ_VQYF1/exec",
};

/* Escapa HTML — previene XSS en el panel admin */
function esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

const MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Setiembre','Octubre','Noviembre','Diciembre'];
const DAYS_LONG=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

function pad(n){ return String(n).padStart(2,'0'); }
function fmt12(h,m){
  const p=h>=12?'PM':'AM', h12=h%12===0?12:h%12;
  return m===0 ? h12+p : h12+':'+(m<10?'0'+m:m)+p;
}
function toKey(y,mo,d){ return y+'-'+pad(mo+1)+'-'+pad(d); }

/* ── Storage (localStorage + Google Sheets sync) ── */
const Store = {
  _bookings: null,
  _blocked: null,
  _synced: false,

  bookings(){
    if(this._bookings === null)
      this._bookings = JSON.parse(localStorage.getItem('rflx_bookings')||'[]');
    return this._bookings;
  },
  _saveLocal(arr){
    this._bookings = arr;
    localStorage.setItem('rflx_bookings', JSON.stringify(arr));
  },
  blockedDays(){
    if(this._blocked === null)
      this._blocked = JSON.parse(localStorage.getItem('rflx_blocked')||'[]');
    return this._blocked;
  },
  blockedSlots(){
    return JSON.parse(localStorage.getItem('rflx_blocked_slots')||'[]');
  },
  takenSlots(k){
    const direct = this.bookings().filter(b=>b.date===k&&b.status!=='cancelada').map(b=>b.slot);
    const admin  = this.blockedSlots().filter(s=>s.startsWith(k+'|')).map(s=>s.split('|')[1]);
    return new Set([...direct,...admin]);
  },

  sheetsReady(){ return CONFIG.sheetsUrl && CONFIG.sheetsUrl !== 'TU_APPS_SCRIPT_URL_AQUI'; },

  async sheetsGet(action){
    if(!this.sheetsReady()) return null;
    try{
      const r = await fetch(`${CONFIG.sheetsUrl}?action=${action}`, { method:'GET' });
      return await r.json();
    }catch(e){ console.warn('Sheets GET error:', e); return null; }
  },

  async sheetsPost(body){
    if(!this.sheetsReady()) return null;
    try{
      await fetch(CONFIG.sheetsUrl, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body),
        mode: 'no-cors',
      });
      return { ok: true };
    }catch(e){ console.warn('Sheets POST error:', e); return null; }
  },

  async syncFromSheets(){
    if(!this.sheetsReady()) return;
    try {
      const [bookingsRes, blockedRes] = await Promise.all([
        this.sheetsGet('getBookings'),
        this.sheetsGet('getBlocked'),
      ]);
      if(bookingsRes && Array.isArray(bookingsRes)){
        const localMap = {};
        (this._bookings||[]).forEach(b=>{ if(b._note) localMap[b.id] = b._note; });
        this._bookings = bookingsRes.map(b => localMap[b.id] ? {...b, _note: localMap[b.id]} : b);
        localStorage.setItem('rflx_bookings', JSON.stringify(this._bookings));
      }
      if(blockedRes){
        if(blockedRes.days){
          this._blocked = blockedRes.days;
          localStorage.setItem('rflx_blocked', JSON.stringify(blockedRes.days));
        }
        if(blockedRes.slots){
          localStorage.setItem('rflx_blocked_slots', JSON.stringify(blockedRes.slots));
        }
      }
      this._synced = true;
      console.log('✓ Sincronizado con Google Sheets');
    }catch(e){ console.warn('Sync error:', e); }
  },

  async add(b){
    const arr = this.bookings();
    arr.push(b);
    this._saveLocal(arr);
    await this.sheetsPost({ action:'addBooking', booking:b });
  },

  async cancel(id){
    this._saveLocal(this.bookings().map(b=>b.id===id?{...b,status:'cancelada'}:b));
    await this.sheetsPost({ action:'cancelBooking', id });
  },

  async complete(id){
    this._saveLocal(this.bookings().map(b=>b.id===id?{...b,status:'completada'}:b));
    await this.sheetsPost({ action:'completeBooking', id });
  },

  async updateNote(id, note){
    this._saveLocal(this.bookings().map(b=>b.id===id?{...b,_note:note}:b));
  },

  async blockDay(date){
    const arr = this.blockedDays();
    if(!arr.includes(date)){ arr.push(date); this._blocked=arr; localStorage.setItem('rflx_blocked',JSON.stringify(arr)); }
    await this.sheetsPost({ action:'blockDate', date });
  },
  async unblockDay(date){
    const arr = this.blockedDays().filter(d=>d!==date);
    this._blocked=arr; localStorage.setItem('rflx_blocked',JSON.stringify(arr));
    await this.sheetsPost({ action:'unblockDate', date });
  },

  async blockSlot(date, slot){
    const key = date+'|'+slot;
    const arr = this.blockedSlots();
    if(!arr.includes(key)){ arr.push(key); localStorage.setItem('rflx_blocked_slots', JSON.stringify(arr)); }
    await this.sheetsPost({ action:'blockSlot', date, slot });
  },
  async unblockSlot(date, slot){
    const arr = this.blockedSlots().filter(s=>s!==date+'|'+slot);
    localStorage.setItem('rflx_blocked_slots', JSON.stringify(arr));
    await this.sheetsPost({ action:'unblockSlot', date, slot });
  },
};

/* ── State ── */
const today = new Date(); today.setHours(0,0,0,0);
const maxDate = new Date(today); maxDate.setDate(today.getDate()+CONFIG.maxDaysAhead);
let year=today.getFullYear(), month=today.getMonth();
let selDate=null, selH=null, selM=null;

/* ── Helpers ── */
function dateDisplay(key){
  const [y,mo,d] = key.split('-').map(Number);
  const obj = new Date(y,mo-1,d);
  return DAYS_LONG[obj.getDay()]+', '+d+' de '+MONTHS[mo-1]+' de '+y;
}
function addDot(el,cls){
  const d=document.createElement('div');
  d.className='day-dot '+cls; el.appendChild(d);
}

/* ── Notify preview ── */
function notifyPreview(){
  if(typeof window.updatePreviewDateTime === 'function'){
    const dateStr = selDate ? dateDisplay(selDate) : null;
    const timeStr = (selH!==null && selM!==null) ? fmt12(selH,selM) : null;
    window.updatePreviewDateTime(dateStr, timeStr);
  }
}

/* ── Render calendar ── */
function renderCal(){
  document.getElementById('cal-month-title').textContent = MONTHS[month]+' '+year;
  const grid = document.getElementById('days-grid');
  grid.innerHTML = '';
  const firstDay = new Date(year,month,1).getDay();
  const total    = new Date(year,month+1,0).getDate();
  const TOTAL_SLOTS = CONFIG.hours.length * CONFIG.minutes.length;

  for(let i=0;i<firstDay;i++){
    const el=document.createElement('div'); el.className='day-cell empty'; grid.appendChild(el);
  }

  for(let d=1;d<=total;d++){
    const date  = new Date(year,month,d);
    const key   = toKey(year,month,d);
    const isSun = date.getDay()===0;
    const isPast= date<today;
    const isFut = date>maxDate;
    const isTod = date.getTime()===today.getTime();
    const isBlk = Store.blockedDays().includes(key);
    const taken = Store.takenSlots(key).size;
    const avail = TOTAL_SLOTS - taken;
    const full  = avail<=0;
    const isSel = selDate===key;

    const el=document.createElement('div'); el.className='day-cell';
    const sp=document.createElement('span'); sp.textContent=d; el.appendChild(sp);
    if(isTod) el.classList.add('today');

    if(isSun)                   el.classList.add('day-sun');
    else if(isPast||isFut||isBlk) el.classList.add('past');
    else if(full){ el.classList.add('day-busy'); addDot(el,'dot-red'); }
    else{
      el.classList.add('available');
      addDot(el, avail<=3 ? 'dot-yellow' : 'dot-green');
      el.addEventListener('click',()=>selectDate(key));
    }

    if(isSel){ el.classList.remove('available','today','past'); el.classList.add('selected'); }
    grid.appendChild(el);
  }

  const prev=document.getElementById('cal-prev');
  prev.disabled = new Date(year,month,1) <= new Date(today.getFullYear(),today.getMonth(),1);
  prev.style.opacity = prev.disabled ? .3 : 1;
}

/* ── Select date ── */
function selectDate(key){
  selDate=key; selH=null; selM=null;
  renderCal();
  renderHours(key);
  document.getElementById('hour-section').classList.add('show');
  document.getElementById('min-label').style.display='none';
  document.getElementById('min-grid').innerHTML='';
  document.getElementById('cal-summary-bar').classList.remove('show');
  notifyPreview();
  BookingForm.updateSummary();
}

/* ── Hours ── */
function renderHours(key){
  const grid=document.getElementById('hour-grid'); grid.innerHTML='';
  const taken=Store.takenSlots(key);
  CONFIG.hours.forEach(h=>{
    const allTaken=CONFIG.minutes.every(m=>taken.has(pad(h)+':'+pad(m)));
    const btn=document.createElement('button');
    btn.className='time-btn'+(allTaken?' taken':'')+(h===selH?' selected':'');
    btn.textContent=fmt12(h,0).replace(':00','');
    if(!allTaken) btn.addEventListener('click',()=>{
      selH=h; selM=null;
      renderHours(key); renderMins(key);
      notifyPreview(); BookingForm.updateSummary();
    });
    grid.appendChild(btn);
  });
}

/* ── Minutes ── */
function renderMins(key){
  const lbl=document.getElementById('min-label');
  const grid=document.getElementById('min-grid');
  lbl.style.display='block'; grid.innerHTML='';
  const taken=Store.takenSlots(key);
  CONFIG.minutes.forEach(m=>{
    const sid=pad(selH)+':'+pad(m);
    const t=taken.has(sid);
    const btn=document.createElement('button');
    btn.className='time-btn'+(t?' taken':'')+(m===selM?' selected':'');
    btn.textContent=fmt12(selH,m);
    if(!t) btn.addEventListener('click',()=>{
      selM=m; renderMins(key);
      updateSummaryBar(); notifyPreview(); BookingForm.updateSummary();
    });
    grid.appendChild(btn);
  });
}

/* ── Summary bar ── */
function updateSummaryBar(){
  if(!selDate||selH===null||selM===null) return;
  document.getElementById('summary-date').textContent=dateDisplay(selDate);
  document.getElementById('summary-time').textContent='🕐 '+fmt12(selH,selM);
  document.getElementById('cal-summary-bar').classList.add('show');
}

/* ── Booking form ── */
const BookingForm = {
  updateSummary(){
    const el=document.getElementById('appt-summary');
    const btn=document.getElementById('booking-submit');
    if(selDate&&selH!==null&&selM!==null){
      el.classList.add('visible');
      el.innerHTML=`📅 <strong>${dateDisplay(selDate)}</strong> a las <strong>${fmt12(selH,selM)}</strong>`;
      btn.disabled=false;
    } else {
      el.classList.remove('visible');
      btn.disabled=true;
    }
  },
  vals(){
    const checked = [...document.querySelectorAll('input[name="equip"]:checked')].map(c=>c.value);
    return {
      name:    document.getElementById('f-name').value.trim(),
      phone:   document.getElementById('f-phone').value.trim(),
      address: document.getElementById('f-address').value.trim(),
      vehicle: document.getElementById('f-vehicle').options[document.getElementById('f-vehicle').selectedIndex]?.text,
      service: document.getElementById('f-service').value,
      equipment: checked.length ? checked.join(', ') : 'Todo por RFLX',
      notes:   document.getElementById('f-notes').value.trim(),
      date:    selDate,
      slot:    selH!==null&&selM!==null ? pad(selH)+':'+pad(selM) : null,
      time:    selH!==null&&selM!==null ? fmt12(selH,selM) : null,
    };
  },
  validate(d){
    if(!d.name)   { this.shake('f-name');    alert('Por favor ingresá tu nombre.');    return false; }
    if(!d.phone)  { this.shake('f-phone');   alert('Por favor ingresá tu teléfono.'); return false; }
    if(!d.address){ this.shake('f-address'); alert('Por favor ingresá tu dirección.'); return false; }
    if(!d.date)   { alert('Por favor seleccioná una fecha.');  return false; }
    if(!d.slot)   { alert('Por favor seleccioná un horario.'); return false; }
    return true;
  },
  shake(id){
    const el=document.getElementById(id);
    el.style.borderColor='#cc3333';
    setTimeout(()=>el.style.borderColor='',2000);
  },
  async submit(){
    const d=this.vals();
    if(!this.validate(d)) return;
    const btn=document.getElementById('booking-submit');
    btn.disabled=true; btn.textContent='GUARDANDO...';
    const b={
      id:'RX-'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase(),
      ...d, createdAt:new Date().toISOString(), status:'confirmada',
    };
    await Store.add(b); Modal.show(b);
    btn.disabled=false; btn.textContent='CONFIRMAR CITA — ₡5.000 →';
    renderCal(); if(selDate) renderHours(selDate);
  },
};

/* ── Modal ── */
const Modal = {
  cur:null,
  show(b){
    this.cur=b;
    document.getElementById('modal-id').textContent=b.id;
    document.getElementById('modal-name').textContent=b.name;
    document.getElementById('modal-date').textContent=dateDisplay(b.date);
    document.getElementById('modal-time').textContent=b.time;
    document.getElementById('modal-service').textContent=b.service;
    document.getElementById('confirm-modal').classList.add('open');
  },
  close(){ document.getElementById('confirm-modal').classList.remove('open'); this.cur=null; },
  wa(){
    if(!this.cur) return;
    const b=this.cur;
    const txt=`🚗 *RFLX Detail — Nueva cita*\n\n👤 ${b.name}\n📱 ${b.phone}\n📍 ${b.address}\n🚙 ${b.vehicle}\n✨ ${b.service}\n🔧 Equipo: ${b.equipment||'Todo por RFLX'}\n📅 ${dateDisplay(b.date)}\n🕐 ${b.time}${b.notes?'\n📝 '+b.notes:''}\n\n💳 Costo de agendamiento: ₡5.000\n🆔 Ref: ${b.id}`;
    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(txt)}`,'_blank');
    this.close();
  },
};

/* ── Admin ── */
const Admin = {
  _pollInterval: null,
  _lastCount: 0,
  _tab: 'citas',
  _audio: new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'),

  _prices: {
    'Reflex Essential Wash':       { sedan:15000, suv:17000, xl:19000, moto:8000  },
    'Reflex Plus Wash':            { sedan:18000, suv:20000, xl:22000, moto:10000 },
    'Reflex Signature Wash':       { sedan:20000, suv:22000, xl:25000, moto:12000 },
    'Detallado Interior':          { sedan:13000, suv:15000, xl:15000, moto:6000  },
    'Detallado Exterior Signature':{ sedan:15000, suv:17000, xl:17000, moto:8000  },
    'Corrección de Vidrios':       { sedan:20000, suv:20000, xl:20000, moto:15000 },
    'Restauración de Focos':       { sedan:30000, suv:30000, xl:30000, moto:25000 },
    'Limpieza de Tapicería':       { sedan:25000, suv:30000, xl:30000, moto:10000 },
  },

  _vehKey(v){
    if(!v) return 'sedan';
    const l = v.toLowerCase();
    if(l.includes('suv')) return 'suv';
    if(l.includes('xl'))  return 'xl';
    if(l.includes('moto')) return 'moto';
    return 'sedan';
  },

  async open(){
    document.getElementById('admin-modal').classList.add('open');
    document.getElementById('admin-login-view').style.display = 'flex';
    document.getElementById('admin-dashboard-view').style.display = 'none';
    document.getElementById('admin-pass-input').value = '';
    setTimeout(()=>document.getElementById('admin-pass-input').focus(), 100);
  },

  // Generar hash de tu contraseña en consola del navegador:
  // crypto.subtle.digest('SHA-256',new TextEncoder().encode('TuContraseña')).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
  // Reemplazá HASH_AQUI con el valor obtenido
  async checkPassword(){
    const val = document.getElementById('admin-pass-input').value;
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(val));
    const hex = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    if(hex === '3482d52674d022e0b0203067772721eee78dff09732ff883abd77d31ead43265'){
      document.getElementById('admin-login-view').style.display = 'none';
      document.getElementById('admin-dashboard-view').style.display = 'block';
      this.startDashboard();
    } else {
      alert('Contraseña incorrecta');
    }
  },

  async startDashboard(){
    const status = document.getElementById('admin-sync-status');
    if(status) status.textContent = '…actualizando';
    await Store.syncFromSheets();
    this._lastCount = Store.bookings().length;
    this.renderAll();
    if(status) status.textContent = '(Actualizado ahora)';

    this._pollInterval = setInterval(async () => {
      if(status) status.textContent = '…auto-actualizando';
      await Store.syncFromSheets();
      const cur = Store.bookings().length;
      if(cur > this._lastCount) this._audio.play().catch(()=>{});
      this._lastCount = cur;
      this.renderAll();
      if(status) status.textContent = '(Actualizado: ' + new Date().toLocaleTimeString() + ')';
    }, 30000);

    document.querySelectorAll('.admin-tab').forEach(btn=>{
      btn.addEventListener('click', ()=> this.switchTab(btn.dataset.tab));
    });

    ['filter-status','filter-service','filter-from','filter-to','filter-search'].forEach(id=>{
      document.getElementById(id)?.addEventListener('input', ()=> this.renderTable());
      document.getElementById(id)?.addEventListener('change', ()=> this.renderTable());
    });
    document.getElementById('filter-clear')?.addEventListener('click', ()=>{
      ['filter-status','filter-service','filter-from','filter-to','filter-search'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.value = el.tagName==='SELECT' ? (id==='filter-status'?'all':'') : '';
      });
      this.renderTable();
    });
    document.getElementById('admin-export-btn')?.addEventListener('click', ()=> this.exportCSV());

    const tb = document.getElementById('admin-tbody');
    if(tb && !tb.dataset.delegated){
      tb.dataset.delegated = '1';
      tb.addEventListener('click', async e=>{
        const btn = e.target.closest('[data-action]');
        if(!btn) return;
        const { action, id, phone, name, date, time, service } = btn.dataset;
        if(action === 'cancel'    && confirm('¿Cancelar esta cita?')) { await Store.cancel(id); this.renderAll(); renderCal(); }
        if(action === 'complete'  && confirm('¿Marcar como completada?')) { await Store.complete(id); this.renderAll(); renderCal(); }
        if(action === 'wa')       this.sendWA(phone, name, date, time, service);
        if(action === 'reminder') this.sendReminder(phone, name, date, time, service);
        if(action === 'note')     await this.editNote(id);
      });
    }
  },

  close(){
    document.getElementById('admin-modal').classList.remove('open');
    if(this._pollInterval) clearInterval(this._pollInterval);
  },

  switchTab(tab){
    this._tab = tab;
    document.querySelectorAll('.admin-tab').forEach(t=> t.classList.toggle('active', t.dataset.tab===tab));
    document.querySelectorAll('.admin-tab-content').forEach(c=> c.style.display='none');
    const el = document.getElementById('tab-'+tab);
    if(el) el.style.display = 'block';
    if(tab==='citas')     this.renderTable();
    else if(tab==='hoy')  this.renderHoy();
    else if(tab==='clientes') this.renderClientes();
    else if(tab==='bloqueos') this.renderBloqueos();
  },

  renderAll(){
    this.renderStats();
    if(this._tab==='citas')    this.renderTable();
    else if(this._tab==='hoy') this.renderHoy();
    else if(this._tab==='bloqueos') this.renderBloqueos();
  },

  renderStats(){
    const all = Store.bookings();
    const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const hoy       = all.filter(b=> b.date===todayKey && b.status!=='cancelada').length;
    const semana    = all.filter(b=> b.status!=='cancelada' && new Date(b.date+'T12:00:00')>=startOfWeek).length;
    const pendientes= all.filter(b=> b.status==='confirmada').length;
    const completadas=all.filter(b=> b.status==='completada').length;
    const ingresosSet = all.filter(b=> b.status!=='cancelada' && new Date(b.date+'T12:00:00')>=startOfWeek);
    const ingresos  = ingresosSet.reduce((sum,b)=>{
      const p = this._prices[b.service];
      return sum + (p ? (p[this._vehKey(b.vehicle)]||15000) : 15000);
    }, 0);
    this._setCard('astat-hoy',        hoy,                       'Citas hoy');
    this._setCard('astat-semana',     semana,                    'Esta semana');
    this._setCard('astat-pendientes', pendientes,                'Pendientes');
    this._setCard('astat-completadas',completadas,               'Completadas');
    this._setCard('astat-ingresos',   '₡'+ingresos.toLocaleString(), 'Ingresos semana');
  },

  _setCard(id, val, label){
    const el = document.getElementById(id);
    if(el) el.innerHTML = `<div class="astat-num">${val}</div><div class="astat-label">${label}</div>`;
  },

  _getFiltered(){
    const status  = document.getElementById('filter-status')?.value  || 'all';
    const service = document.getElementById('filter-service')?.value || '';
    const from    = document.getElementById('filter-from')?.value    || '';
    const to      = document.getElementById('filter-to')?.value      || '';
    const search  = (document.getElementById('filter-search')?.value || '').toLowerCase();
    return Store.bookings()
      .filter(b=>{
        if(status!=='all' && b.status!==status) return false;
        if(service && b.service!==service) return false;
        if(from && b.date<from) return false;
        if(to   && b.date>to)   return false;
        if(search && !b.name?.toLowerCase().includes(search) && !b.phone?.includes(search)) return false;
        return true;
      })
      .sort((a,b)=> a.date.localeCompare(b.date)||a.slot.localeCompare(b.slot));
  },

  renderTable(){
    const bookings = this._getFiltered();
    const tb = document.getElementById('admin-tbody');
    if(!tb) return;
    if(!bookings.length){
      tb.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#666;padding:1.5rem">Sin citas</td></tr>`;
      return;
    }
    tb.innerHTML = bookings.map(b=>`
      <tr style="opacity:${b.status==='cancelada'?.4:1}">
        <td style="font-weight:bold;color:var(--yellow);white-space:nowrap;font-size:.75rem">${b.id}</td>
        <td>${esc(b.name)}</td>
        <td style="white-space:nowrap">${esc(b.phone)}</td>
        <td style="white-space:nowrap;font-size:.78rem">${dateDisplay(b.date)}</td>
        <td>${b.time}</td>
        <td style="font-size:.78rem;max-width:130px">${esc(b.service)}</td>
        <td><span class="status-pill status-${b.status}">${b.status}</span></td>
        <td>
          <div style="display:flex;gap:.25rem;flex-wrap:wrap;align-items:center">
            <button class="aaction-btn wa-btn"
              data-action="wa" data-phone="${esc(b.phone)}" data-name="${esc(b.name)}"
              data-date="${b.date}" data-time="${b.time}" data-service="${esc(b.service)}"
              title="Mensaje WA">💬</button>
            <button class="aaction-btn remind-btn"
              data-action="reminder" data-phone="${esc(b.phone)}" data-name="${esc(b.name)}"
              data-date="${b.date}" data-time="${b.time}" data-service="${esc(b.service)}"
              title="Recordatorio WA">🔔</button>
            ${b.status==='confirmada'?`
            <button class="aaction-btn complete-btn" data-action="complete" data-id="${b.id}" title="Marcar completada">✅</button>
            <button class="aaction-btn cancel-btn" data-action="cancel" data-id="${b.id}" title="Cancelar">❌</button>`:''}
            <button class="aaction-btn note-btn" data-action="note" data-id="${b.id}" title="Nota interna">${b._note?'📝':'🗒️'}</button>
          </div>
          ${b._note?`<div class="admin-note-text">${esc(b._note)}</div>`:''}
        </td>
      </tr>
    `).join('');
  },

  renderHoy(){
    const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());
    const bookings = Store.bookings()
      .filter(b=> b.date===todayKey)
      .sort((a,b)=> a.slot.localeCompare(b.slot));
    const el = document.getElementById('tab-hoy');
    if(!el) return;

    if(!bookings.length){
      el.innerHTML = '<p style="text-align:center;color:#666;padding:2rem">No hay citas para hoy.</p>';
      return;
    }

    el.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Hora</th><th>Nombre</th><th>Teléfono</th><th>Vehículo</th><th>Servicio</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody id="hoy-tbody">
        ${bookings.map(b=>`
          <tr style="opacity:${b.status==='cancelada'?.4:1}">
            <td style="font-weight:bold;color:var(--yellow)">${b.time}</td>
            <td>${esc(b.name)}</td>
            <td>${esc(b.phone)}</td>
            <td>${esc(b.vehicle)}</td>
            <td style="font-size:.78rem">${esc(b.service)}</td>
            <td><span class="status-pill status-${b.status}">${b.status}</span></td>
            <td>
              <div style="display:flex;gap:.25rem">
                <button class="aaction-btn wa-btn"
                  data-action="wa" data-phone="${esc(b.phone)}" data-name="${esc(b.name)}"
                  data-date="${b.date}" data-time="${b.time}" data-service="${esc(b.service)}">💬</button>
                <button class="aaction-btn remind-btn"
                  data-action="reminder" data-phone="${esc(b.phone)}" data-name="${esc(b.name)}"
                  data-date="${b.date}" data-time="${b.time}" data-service="${esc(b.service)}">🔔</button>
                ${b.status==='confirmada'?`
                <button class="aaction-btn complete-btn" data-action="complete" data-id="${b.id}">✅</button>
                <button class="aaction-btn cancel-btn" data-action="cancel" data-id="${b.id}">❌</button>`:''}
              </div>
            </td>
          </tr>
        `).join('')}
        </tbody>
      </table>
    `;

    // Delegación persistente — sin { once: true } para que funcione en cada re-render
    const hoyTbody = document.getElementById('hoy-tbody');
    if(hoyTbody && !hoyTbody.dataset.delegated){
      hoyTbody.dataset.delegated = '1';
      hoyTbody.addEventListener('click', async e=>{
        const btn = e.target.closest('[data-action]');
        if(!btn) return;
        const { action, id, phone, name, date, time, service } = btn.dataset;
        if(action==='cancel'   && confirm('¿Cancelar?'))          { await Store.cancel(id);   this.renderAll(); renderCal(); }
        if(action==='complete' && confirm('¿Marcar completada?')) { await Store.complete(id); this.renderAll(); renderCal(); }
        if(action==='wa')       this.sendWA(phone, name, date, time, service);
        if(action==='reminder') this.sendReminder(phone, name, date, time, service);
      });
    }
  },

  renderClientes(){
    const el = document.getElementById('tab-clientes');
    if(!el) return;
    el.innerHTML = `
      <div class="admin-filters">
        <input type="text" id="client-search-input" class="admin-filter-text" placeholder="🔍 Buscar por nombre o teléfono">
        <button class="admin-btn" id="client-search-btn">Buscar</button>
      </div>
      <div id="client-results" style="margin-top:1rem"></div>
    `;
    document.getElementById('client-search-btn').addEventListener('click', ()=> this._searchClient());
    document.getElementById('client-search-input').addEventListener('keypress', e=>{ if(e.key==='Enter') this._searchClient(); });
  },

  _searchClient(){
    const q = (document.getElementById('client-search-input')?.value||'').toLowerCase().trim();
    const out = document.getElementById('client-results');
    if(!q){ out.innerHTML='<p style="color:#666;font-size:.82rem">Ingresá un nombre o teléfono.</p>'; return; }
    const all = Store.bookings()
      .filter(b=> b.name?.toLowerCase().includes(q)||b.phone?.includes(q))
      .sort((a,b)=> b.date.localeCompare(a.date));
    if(!all.length){ out.innerHTML='<p style="color:#666;font-size:.82rem">Sin resultados.</p>'; return; }
    const valid = all.filter(b=>b.status!=='cancelada').length;
    out.innerHTML = `
      <p style="font-size:.78rem;color:#888;margin-bottom:.8rem">${all.length} citas encontradas · ${valid} no canceladas</p>
      <table class="admin-table">
        <thead><tr><th>Fecha</th><th>Hora</th><th>Nombre</th><th>Teléfono</th><th>Servicio</th><th>Vehículo</th><th>Estado</th></tr></thead>
        <tbody>
          ${all.map(b=>`
            <tr style="opacity:${b.status==='cancelada'?.4:1}">
              <td style="white-space:nowrap;font-size:.78rem">${dateDisplay(b.date)}</td>
              <td>${b.time}</td><td>${esc(b.name)}</td><td>${esc(b.phone)}</td>
              <td style="font-size:.78rem">${esc(b.service)}</td><td>${esc(b.vehicle)}</td>
              <td><span class="status-pill status-${b.status}">${b.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  renderBloqueos(){
    const el = document.getElementById('tab-bloqueos');
    if(!el) return;
    const blocked = Store.blockedDays();
    const slots   = Store.blockedSlots();
    const hoursOptions = CONFIG.hours.flatMap(h=>CONFIG.minutes.map(m=>{
      const sid=pad(h)+':'+pad(m);
      return `<option value="${sid}">${fmt12(h,m)}</option>`;
    })).join('');

    el.innerHTML = `
      <div class="admin-tools" style="flex-wrap:wrap;gap:.6rem;margin-bottom:.5rem">
        <label style="font-size:.78rem;color:#686868">Día completo:</label>
        <input type="date" id="admin-block-date" class="admin-filter-date">
        <button class="admin-btn" id="admin-block-btn">🔒 Bloquear</button>
        <button class="admin-btn danger" id="admin-unblock-btn">🔓 Desbloquear</button>
      </div>
      <div class="admin-tools" style="flex-wrap:wrap;gap:.6rem">
        <label style="font-size:.78rem;color:#686868">Horario específico:</label>
        <input type="date" id="admin-block-slot-date" class="admin-filter-date">
        <select id="admin-block-slot-hour" class="admin-filter-select">${hoursOptions}</select>
        <button class="admin-btn" id="admin-block-slot-btn">🔒 Bloquear hora</button>
        <button class="admin-btn danger" id="admin-unblock-slot-btn">🔓 Desbloquear hora</button>
      </div>
      <div style="margin-top:1.5rem">
        <p class="admin-bloqueos-heading">Días bloqueados (${blocked.length})</p>
        <div class="admin-tag-list">
          ${blocked.length ? blocked.map(d=>`<span class="admin-tag-red">${d}</span>`).join('') : '<span style="color:#666;font-size:.8rem">Ninguno</span>'}
        </div>
        <p class="admin-bloqueos-heading" style="margin-top:1rem">Horarios bloqueados (${slots.length})</p>
        <div class="admin-tag-list">
          ${slots.length ? slots.map(s=>`<span class="admin-tag-red">${s.replace('|',' · ')}</span>`).join('') : '<span style="color:#666;font-size:.8rem">Ninguno</span>'}
        </div>
      </div>
    `;

    document.getElementById('admin-block-btn').addEventListener('click',    ()=> this._blockDay());
    document.getElementById('admin-unblock-btn').addEventListener('click',  ()=> this._unblockDay());
    document.getElementById('admin-block-slot-btn').addEventListener('click',   ()=> this._blockSlot());
    document.getElementById('admin-unblock-slot-btn').addEventListener('click', ()=> this._unblockSlot());
  },

  async _blockDay(){
    const v=document.getElementById('admin-block-date')?.value; if(!v) return;
    if(Store.blockedDays().includes(v)){ alert('Ya estaba bloqueado.'); return; }
    await Store.blockDay(v); renderCal(); this.renderBloqueos(); this.renderStats();
    alert('Día bloqueado: '+v);
  },
  async _unblockDay(){
    const v=document.getElementById('admin-block-date')?.value; if(!v) return;
    await Store.unblockDay(v); renderCal(); this.renderBloqueos(); this.renderStats();
    alert('Día desbloqueado: '+v);
  },
  async _blockSlot(){
    const date=document.getElementById('admin-block-slot-date')?.value;
    const slot=document.getElementById('admin-block-slot-hour')?.value;
    if(!date||!slot){ alert('Seleccioná fecha y hora.'); return; }
    await Store.blockSlot(date,slot); renderCal(); this.renderBloqueos();
    alert('Horario bloqueado: '+date+' · '+slot);
  },
  async _unblockSlot(){
    const date=document.getElementById('admin-block-slot-date')?.value;
    const slot=document.getElementById('admin-block-slot-hour')?.value;
    if(!date||!slot){ alert('Seleccioná fecha y hora.'); return; }
    await Store.unblockSlot(date,slot); renderCal(); this.renderBloqueos();
    alert('Horario desbloqueado.');
  },

  sendWA(phone, name, date, time, service){
    const clean = phone.replace(/\D/g,'');
    const num = clean.startsWith('506') ? clean : '506'+clean;
    const txt = `Hola ${name}! 👋 Te contactamos de *RFLX Detail*.\n\nTu cita está confirmada:\n📅 ${dateDisplay(date)}\n🕐 ${time}\n✨ ${service}\n\n¿Tenés alguna consulta? Estamos para ayudarte.`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(txt)}`, '_blank');
  },
  sendReminder(phone, name, date, time, service){
    const clean = phone.replace(/\D/g,'');
    const num = clean.startsWith('506') ? clean : '506'+clean;
    const txt = `Hola ${name}! 🔔 Te recordamos tu cita con *RFLX Detail*:\n\n📅 ${dateDisplay(date)}\n🕐 ${time}\n✨ ${service}\n\nNos vemos pronto! Si necesitás hacer algún cambio, avisanos con anticipación. 🙌`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(txt)}`, '_blank');
  },

  async editNote(id){
    const b = Store.bookings().find(b=>b.id===id);
    const nota = prompt('Nota interna (solo visible en este panel):', b?._note||'');
    if(nota===null) return;
    await Store.updateNote(id, nota.trim());
    this.renderTable();
  },

  exportCSV(){
    const all = Store.bookings(); if(!all.length){ alert('No hay citas.'); return; }
    const h = ['ID','Nombre','Teléfono','Dirección','Vehículo','Servicio','Equipo','Fecha','Hora','Notas','Nota Interna','Estado','Creado'];
    const rows = all.map(b=>[b.id,b.name,b.phone,b.address,b.vehicle,b.service,b.equipment,b.date,b.time,b.notes,b._note||'',b.status,b.createdAt]
      .map(v=>`"${(v||'').replace(/"/g,'""')}"`).join(','));
    const csv = [h.join(','),...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'}));
    a.download = `rflx-citas-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  },
};

/* ── Init ── */
document.addEventListener('DOMContentLoaded', async ()=>{
  renderCal();

  let logoClicks = 0, clickTimer;
  document.querySelector('.logo-img')?.addEventListener('click', (e)=>{
    e.preventDefault();
    logoClicks++;
    if(logoClicks===5){
      const adminLink = document.getElementById('open-admin');
      if(adminLink) adminLink.style.display='inline-flex';
    }
    clearTimeout(clickTimer);
    clickTimer = setTimeout(()=>{ logoClicks=0; }, 2000);
  });

  if(Store.sheetsReady()){
    await Store.syncFromSheets();
    renderCal();
  }

  document.getElementById('cal-prev').addEventListener('click',()=>{ month--; if(month<0){month=11;year--;} renderCal(); });
  document.getElementById('cal-next').addEventListener('click',()=>{ month++; if(month>11){month=0;year++;} renderCal(); });

  document.getElementById('booking-submit').addEventListener('click',()=>BookingForm.submit());
  document.getElementById('modal-close').addEventListener('click',()=>Modal.close());
  document.getElementById('modal-wa').addEventListener('click',()=>Modal.wa());
  document.getElementById('confirm-modal').addEventListener('click',e=>{ if(e.target===e.currentTarget) Modal.close(); });

  document.getElementById('open-admin')?.addEventListener('click',e=>{ e.preventDefault(); Admin.open(); });
  document.getElementById('admin-close')?.addEventListener('click',()=>Admin.close());
  document.getElementById('admin-modal')?.addEventListener('click',e=>{ if(e.target===e.currentTarget) Admin.close(); });
  document.getElementById('admin-login-btn')?.addEventListener('click',()=>Admin.checkPassword());
  document.getElementById('admin-pass-input')?.addEventListener('keypress',e=>{ if(e.key==='Enter') Admin.checkPassword(); });
  document.getElementById('admin-login-cancel')?.addEventListener('click',()=>Admin.close());

  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; } });
  },{ threshold:.12 });
  document.querySelectorAll('.service-card,.testi-card,.step,.stat-item').forEach(el=>{
    el.style.opacity='0'; el.style.transform='translateY(24px)';
    el.style.transition='opacity .5s ease,transform .5s ease';
    obs.observe(el);
  });
});
