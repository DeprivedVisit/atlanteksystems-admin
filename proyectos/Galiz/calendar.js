/* Galiz CR — calendar.js v2 */

const CONFIG = {
  maxDaysAhead: 60,
  whatsappGaliz: '50663144171',
  sheetsUrl: 'https://script.google.com/macros/s/AKfycbzayD4JdAXic9EPfFwRANXYf2xzgd7i7NCriuH8_UvanYZSomvx8tGFj3BwGfgR_f82/exec',
  adminPassword: 'Galiz2024',
};

const SERVICES = {
  'Uñas': [
    { id:'u1', name:'Semipermanente manos y pies', price:'₡5,000',  priceNum:5000,  duration:90  },
    { id:'u2', name:'Protección uña natural',       price:'₡7,500',  priceNum:7500,  duration:60  },
    { id:'u3', name:'Set uña natural nuevo',         price:'₡9,000',  priceNum:9000,  duration:90  },
    { id:'u4', name:'Uñas gel X set nuevo',          price:'₡12,000', priceNum:12000, duration:90  },
    { id:'u5', name:'Mantenimiento gel X',           price:'₡8,500',  priceNum:8500,  duration:60  },
    { id:'u6', name:'Pedicura',                      price:'₡10,000', priceNum:10000, duration:60  },
  ],
  'Color y Tratamientos': [
    { id:'c1', name:'Base de color',          price:'₡10,000+',    priceNum:10000, duration:120 },
    { id:'c2', name:'Highlights / Mechas',    price:'₡20,000+',    priceNum:20000, duration:180 },
    { id:'c3', name:'Mantenimiento de color', price:'₡15,000+',    priceNum:15000, duration:120 },
    { id:'c4', name:'Color Correction',       price:'A consultar', priceNum:0,     duration:240, special:true },
    { id:'c5', name:'Keratina / Nanoplastia', price:'₡20,000+',    priceNum:20000, duration:180 },
    { id:'c6', name:'Hidratación profunda',   price:'₡12,000+',    priceNum:12000, duration:90  },
    { id:'c7', name:'Lifting y laminado',     price:'₡8,000+',     priceNum:8000,  duration:120 },
  ],
  'Cabello': [
    { id:'ca1', name:'Corte de cabello', price:'₡4,000', priceNum:4000, duration:45 },
    { id:'ca2', name:'Corte + lavado',   price:'₡6,500', priceNum:6500, duration:60 },
    { id:'ca3', name:'Lavada + plancha', price:'₡6,000', priceNum:6000, duration:60 },
  ],
};

// Flat lookup by name → priceNum
const SVC_PRICE = {};
Object.values(SERVICES).flat().forEach(s => { SVC_PRICE[s.name] = s.priceNum; });

const MONTHS    = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Setiembre','Octubre','Noviembre','Diciembre'];
const DAYS_LONG = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

function pad(n){ return String(n).padStart(2,'0'); }
function toKey(y,mo,d){ return `${y}-${pad(mo+1)}-${pad(d)}`; }
function dateFromKey(k){ const [y,mo,d]=k.split('-').map(Number); return new Date(y,mo-1,d); }
function dateDisplay(k){ const d=dateFromKey(k); return `${DAYS_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`; }
function fmt(h,m){ const p=h>=12?'PM':'AM', h12=h%12===0?12:h%12; return `${h12}:${pad(m)} ${p}`; }
function durLabel(min){ const h=Math.floor(min/60),r=min%60; return r===0?`${h}h`:(h===0?`${r}min`:`${h}h ${r}min`); }
function initials(name){ return (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }

function getWindow(dateOrKey){
  const d = typeof dateOrKey==='string' ? dateFromKey(dateOrKey) : dateOrKey;
  return (d.getDay()===0||d.getDay()===6)
    ? { start:6*60,  end:21*60  }
    : { start:18*60, end:22*60  };
}
function getSlots(dateOrKey, durationMin){
  const { start, end } = getWindow(dateOrKey);
  const slots=[];
  for(let t=start; t+durationMin<=end; t+=30)
    slots.push({ h:Math.floor(t/60), m:t%60, minutes:t });
  return slots;
}
function overlaps(s1,e1,s2,e2){ return s1<e2 && e1>s2; }

/* ═══ Store ═══ */
const Store = {
  _b:null, _c:null, _bl:null,

  bookings(){ if(!this._b) this._b=JSON.parse(localStorage.getItem('galiz_b')||'[]'); return this._b; },
  clients(){  if(!this._c) this._c=JSON.parse(localStorage.getItem('galiz_c')||'[]'); return this._c; },
  blockedDays(){ if(!this._bl) this._bl=JSON.parse(localStorage.getItem('galiz_bl')||'[]'); return this._bl; },
  blockedSlots(){ return JSON.parse(localStorage.getItem('galiz_bls')||'[]'); },

  availableSlots(dateKey, durationMin){
    const all=getSlots(dateKey,durationMin);
    const day=this.bookings().filter(b=>b.date===dateKey&&b.status!=='cancelada');
    const bls=this.blockedSlots();
    return all.filter(slot=>{
      const end=slot.minutes+durationMin;
      for(const b of day) if(overlaps(slot.minutes,end,b.slotMinutes,b.slotMinutes+(b.durationMinutes||60))) return false;
      if(bls.some(s=>s===dateKey+'|'+pad(slot.h)+':'+pad(slot.m))) return false;
      return true;
    });
  },

  isDayOpen(k,dur){ return !this.blockedDays().includes(k) && this.availableSlots(k,dur).length>0; },

  lookupClient(phone){
    const clean=phone.replace(/\D/g,'');
    return this.clients().find(c=>c.phone.replace(/\D/g,'')===clean)||null;
  },

  sheetsReady(){ return CONFIG.sheetsUrl&&CONFIG.sheetsUrl!=='TU_APPS_SCRIPT_URL_AQUI'; },

  async sheetsGet(action){
    if(!this.sheetsReady()) return null;
    try{ return await (await fetch(`${CONFIG.sheetsUrl}?action=${action}`)).json(); }
    catch(e){ console.warn('GET:',e); return null; }
  },
  async sheetsPost(body){
    if(!this.sheetsReady()) return;
    try{ await fetch(CONFIG.sheetsUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),mode:'no-cors'}); }
    catch(e){ console.warn('POST:',e); }
  },

  async syncFromSheets(){
    if(!this.sheetsReady()) return;
    const [br,cr,blr]=await Promise.all([this.sheetsGet('getBookings'),this.sheetsGet('getClients'),this.sheetsGet('getBlocked')]);
    if(br&&Array.isArray(br))  { this._b=br;  localStorage.setItem('galiz_b', JSON.stringify(br)); }
    if(cr&&Array.isArray(cr))  { this._c=cr;  localStorage.setItem('galiz_c', JSON.stringify(cr)); }
    if(blr?.days)  { this._bl=blr.days; localStorage.setItem('galiz_bl',  JSON.stringify(blr.days));  }
    if(blr?.slots) { localStorage.setItem('galiz_bls', JSON.stringify(blr.slots)); }
  },

  async addBooking(b){
    const arr=this.bookings(); arr.push(b);
    this._b=arr; localStorage.setItem('galiz_b',JSON.stringify(arr));
    await this.sheetsPost({action:'addBooking',booking:b});
    this._upsertClientLocal(b.phone,b.name,b.date,b.service,b.hairLength,b.hasColor,b.address);
    await this.sheetsPost({action:'upsertClient',client:this.lookupClient(b.phone)});
  },

  _upsertClientLocal(phone,name,date,service,hairLength,hasColor,address){
    const arr=this.clients(), idx=arr.findIndex(c=>c.phone.replace(/\D/g,'')===phone.replace(/\D/g,''));
    if(idx>=0){
      const c=arr[idx];
      arr[idx]={...c, name:name||c.name, lastVisit:date, visits:(c.visits||0)+1,
        services:[...(c.services||[]).slice(-29), service],
        hairLength:hairLength||c.hairLength, hasColor:hasColor||c.hasColor,
        address:address||c.address};
    } else {
      arr.push({phone,name,firstVisit:date,lastVisit:date,visits:1,
        services:[service],hairLength:hairLength||'',hasColor:hasColor||'',address:address||'',notes:''});
    }
    this._c=arr; localStorage.setItem('galiz_c',JSON.stringify(arr));
  },

  async addClient(c){
    const arr=this.clients(), idx=arr.findIndex(x=>x.phone.replace(/\D/g,'')===c.phone.replace(/\D/g,''));
    if(idx<0){
      arr.push({...c, firstVisit:'', lastVisit:'', visits:0, services:[]});
      this._c=arr; localStorage.setItem('galiz_c',JSON.stringify(arr));
      await this.sheetsPost({action:'upsertClient',client:arr[arr.length-1]});
    }
    return this.lookupClient(c.phone);
  },

  async cancel(id){
    this._b=this.bookings().map(b=>b.id===id?{...b,status:'cancelada'}:b);
    localStorage.setItem('galiz_b',JSON.stringify(this._b));
    await this.sheetsPost({action:'cancelBooking',id});
  },
  async complete(id){
    this._b=this.bookings().map(b=>b.id===id?{...b,status:'completada'}:b);
    localStorage.setItem('galiz_b',JSON.stringify(this._b));
    await this.sheetsPost({action:'completeBooking',id});
  },
  async updateClientNote(phone,note){
    const arr=this.clients(), idx=arr.findIndex(c=>c.phone.replace(/\D/g,'')===phone.replace(/\D/g,''));
    if(idx>=0){ arr[idx].notes=note; this._c=arr; localStorage.setItem('galiz_c',JSON.stringify(arr)); }
    await this.sheetsPost({action:'updateClientNote',phone,note});
  },

  async blockDay(d){ const a=this.blockedDays(); if(!a.includes(d)){a.push(d);this._bl=a;localStorage.setItem('galiz_bl',JSON.stringify(a));} await this.sheetsPost({action:'blockDate',date:d}); },
  async unblockDay(d){ const a=this.blockedDays().filter(x=>x!==d); this._bl=a; localStorage.setItem('galiz_bl',JSON.stringify(a)); await this.sheetsPost({action:'unblockDate',date:d}); },
  async blockSlot(d,s){ const k=d+'|'+s,a=this.blockedSlots(); if(!a.includes(k)){a.push(k);localStorage.setItem('galiz_bls',JSON.stringify(a));} await this.sheetsPost({action:'blockSlot',date:d,slot:s}); },
  async unblockSlot(d,s){ const a=this.blockedSlots().filter(x=>x!==d+'|'+s); localStorage.setItem('galiz_bls',JSON.stringify(a)); await this.sheetsPost({action:'unblockSlot',date:d,slot:s}); },

  weekRevenue(){
    const sw=new Date(today); sw.setDate(today.getDate()-today.getDay());
    return this.bookings()
      .filter(b=>b.status!=='cancelada'&&new Date(b.date+'T12:00')>=sw)
      .reduce((sum,b)=>sum+(SVC_PRICE[b.service]||0),0);
  },
};

/* ═══ Calendar state ═══ */
const today=new Date(); today.setHours(0,0,0,0);
const maxDate=new Date(today); maxDate.setDate(today.getDate()+CONFIG.maxDaysAhead);
let calYear=today.getFullYear(), calMonth=today.getMonth();
let selService=null, selDate=null, selSlot=null;

/* ═══ Step helpers ═══ */
function stepShow(id){ const e=document.getElementById(id); if(e){e.style.display=''; e.classList.add('show');} }
function stepHide(id){ const e=document.getElementById(id); if(e){e.style.display='none'; e.classList.remove('show');} }
function setDot(active){
  for(let i=1;i<=4;i++){
    const d=document.getElementById('dot-'+i);
    if(!d) continue;
    d.classList.toggle('active', i===active);
    d.classList.toggle('done',   i<active);
  }
}

/* ═══ Services section picker ═══ */
const Picker = {
  init(){
    const tabs=document.getElementById('svc-tabs');
    if(!tabs) return;
    let cat=Object.keys(SERVICES)[0];
    Object.keys(SERVICES).forEach((c,i)=>{
      const b=document.createElement('button'); b.className='svc-tab'+(i===0?' active':''); b.textContent=c;
      b.addEventListener('click',()=>{ cat=c; this._render(tabs,document.getElementById('svc-list'),c); });
      tabs.appendChild(b);
    });
    this._render(tabs,document.getElementById('svc-list'),cat);
  },
  _render(tabs,list,cat){
    if(!list) return;
    tabs.querySelectorAll('.svc-tab').forEach(b=>b.classList.toggle('active',b.textContent===cat));
    list.innerHTML='';
    SERVICES[cat].forEach(svc=>{
      const card=document.createElement('div'); card.className='svc-card';
      card.innerHTML=`<div class="svc-name">${svc.name}</div>
        <div class="svc-row"><span class="svc-price">${svc.price}</span><span class="svc-dur">${durLabel(svc.duration)}</span></div>
        ${svc.special?'<div class="svc-note">Requiere confirmación previa</div>':''}`;
      card.addEventListener('click',()=>{
        selService={...svc,category:cat}; selDate=null; selSlot=null;
        document.querySelectorAll('#svc-list .svc-card,#svc-list-b .svc-card').forEach(c=>c.classList.remove('active'));
        card.classList.add('active');
        const bar=document.getElementById('sel-bar');
        bar.innerHTML=`<span>✓ ${svc.name}</span><span>${svc.price} · ${durLabel(svc.duration)}</span>`;
        bar.style.display='flex';
        stepShow('step-2'); stepHide('step-3'); stepHide('step-4'); setDot(2);
        renderCal();
        document.getElementById('step-2').scrollIntoView({behavior:'smooth',block:'start'});
        updateBtn();
      });
      list.appendChild(card);
    });
  },
};

/* ═══ Calendar ═══ */
function renderCal(){
  const grid=document.getElementById('days-grid');
  document.getElementById('cal-month-title').textContent=MONTHS[calMonth]+' '+calYear;
  grid.innerHTML='';
  const dur=selService?.duration||60;
  const first=new Date(calYear,calMonth,1).getDay();
  const total=new Date(calYear,calMonth+1,0).getDate();

  for(let i=0;i<first;i++){ const e=document.createElement('div'); e.className='dc empty'; grid.appendChild(e); }

  for(let d=1;d<=total;d++){
    const date=new Date(calYear,calMonth,d);
    const key=toKey(calYear,calMonth,d);
    const el=document.createElement('div'); el.className='dc';
    const num=document.createElement('span'); num.textContent=d; el.appendChild(num);
    if(date.getTime()===today.getTime()) el.classList.add('today');

    if(date<today||date>maxDate){ el.classList.add('past'); }
    else if(Store.blockedDays().includes(key)){ el.classList.add('past'); el.title='Bloqueado'; }
    else {
      const avail=Store.availableSlots(key,dur);
      if(!avail.length){ el.classList.add('busy'); }
      else {
        el.classList.add('open');
        const dot=document.createElement('div');
        dot.className='dot '+(avail.length<=2?'dot-y':'dot-g');
        el.appendChild(dot);
        el.addEventListener('click',()=>selectDate(key));
      }
    }
    if(selDate===key){ el.className='dc sel'; el.innerHTML=''; const s=document.createElement('span'); s.textContent=d; el.appendChild(s); }
    grid.appendChild(el);
  }
  const prev=document.getElementById('cal-prev');
  if(prev) prev.disabled=new Date(calYear,calMonth,1)<=new Date(today.getFullYear(),today.getMonth(),1);
}

function selectDate(key){
  selDate=key; selSlot=null;
  renderCal(); renderSlots(key);
  stepShow('step-3'); stepHide('step-4'); setDot(3);
  document.getElementById('step-3').scrollIntoView({behavior:'smooth',block:'start'});
  updateBtn();
}

function renderSlots(dateKey){
  const grid=document.getElementById('slots-grid');
  const lbl=document.getElementById('slots-label');
  if(lbl) lbl.textContent=dateDisplay(dateKey);
  grid.innerHTML='';
  const avail=Store.availableSlots(dateKey,selService?.duration||60);
  if(!avail.length){ grid.innerHTML='<p class="no-slots">Sin horarios disponibles para este servicio.</p>'; return; }
  avail.forEach(slot=>{
    const btn=document.createElement('button');
    btn.className='slot-btn'+(selSlot?.minutes===slot.minutes?' active':'');
    btn.textContent=fmt(slot.h,slot.m);
    btn.addEventListener('click',()=>{
      selSlot=slot;
      document.querySelectorAll('.slot-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      stepShow('step-4'); setDot(4);
      document.getElementById('step-4').scrollIntoView({behavior:'smooth',block:'start'});
      updateBtn();
    });
    grid.appendChild(btn);
  });
}

/* ═══ Client lookup & registration ═══ */
const Client = {
  found: null,

  init(){
    document.getElementById('lookup-btn')?.addEventListener('click',()=>this.lookup());
    document.getElementById('f-phone')?.addEventListener('keypress',e=>{ if(e.key==='Enter') this.lookup(); });
    document.getElementById('change-data')?.addEventListener('click',()=>this.reset());
    document.getElementById('f-domicilio')?.addEventListener('change',e=>{
      document.getElementById('dom-row').style.display=e.target.checked?'block':'none';
    });
    document.getElementById('view-profile-btn')?.addEventListener('click',()=>{
      if(this.found) ProfileModal.show(this.found);
    });
  },

  lookup(){
    const phone=document.getElementById('f-phone').value.trim();
    if(!phone){ shake('f-phone'); return; }
    this.found=Store.lookupClient(phone);

    if(this.found){
      const c=this.found;
      document.getElementById('f-name').value=c.name;
      document.getElementById('return-name').textContent=c.name;

      const vb=document.getElementById('return-visits-badge');
      vb.textContent=`${c.visits} cita${c.visits!==1?'s':''} ✓`;

      const sb=document.getElementById('return-svc-badge');
      const fav=this._favoriteService(c);
      if(fav){ sb.textContent=fav; sb.style.display='inline'; }

      const nx=document.getElementById('return-next');
      const nextBook=Store.bookings().filter(b=>b.phone.replace(/\D/g,'')===phone.replace(/\D/g,'')&&b.status==='confirmada'&&b.date>=toKey(today.getFullYear(),today.getMonth(),today.getDate())).sort((a,b)=>a.date.localeCompare(b.date))[0];
      nx.textContent=nextBook?`Próxima cita: ${dateDisplay(nextBook.date)} a las ${nextBook.time}`:'Sin citas próximas';

      document.getElementById('client-return').style.display='block';
      document.getElementById('client-new').style.display='none';
      document.getElementById('shared-fields').style.display='block';
    } else {
      this.found=null;
      document.getElementById('f-name').value='';
      document.getElementById('client-return').style.display='none';
      document.getElementById('client-new').style.display='block';
      document.getElementById('shared-fields').style.display='block';
      document.getElementById('f-name').focus();
    }
  },

  _favoriteService(c){
    if(!c.services?.length) return null;
    const cnt={};
    c.services.forEach(s=>{ cnt[s]=(cnt[s]||0)+1; });
    return Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
  },

  reset(){
    this.found=null;
    document.getElementById('client-return').style.display='none';
    document.getElementById('client-new').style.display='block';
    document.getElementById('shared-fields').style.display='block';
    document.getElementById('f-phone').value='';
    document.getElementById('f-name').value='';
    document.getElementById('f-phone').focus();
  },

  vals(){
    const dom=document.getElementById('f-domicilio')?.checked;
    const hairLen=document.querySelector('input[name="hair-len"]:checked')?.value||this.found?.hairLength||'';
    const hasColor=document.querySelector('input[name="has-color"]:checked')?.value||this.found?.hasColor||'';
    return {
      phone:    document.getElementById('f-phone').value.trim(),
      name:     document.getElementById('f-name').value.trim(),
      notes:    document.getElementById('f-notes').value.trim(),
      domicilio: dom,
      address:  dom ? document.getElementById('f-address').value.trim() : '',
      hairLength: hairLen,
      hasColor: hasColor,
    };
  },

  validate(d){
    if(!d.phone)              { shake('f-phone');   return 'Ingresá tu número de WhatsApp.'; }
    if(!d.name)               { shake('f-name');    return 'Ingresá tu nombre.'; }
    if(d.domicilio&&!d.address){ shake('f-address'); return 'Ingresá la dirección para el servicio a domicilio.'; }
    if(!selService) return 'Seleccioná un servicio.';
    if(!selDate)    return 'Seleccioná una fecha.';
    if(!selSlot)    return 'Seleccioná un horario.';
    return null;
  },
};

function updateBtn(){
  const btn=document.getElementById('booking-submit');
  const bar=document.getElementById('booking-bar');
  const ready=selService&&selDate&&selSlot;
  if(btn) btn.disabled=!ready;
  if(bar&&ready){
    bar.innerHTML=`✓ <b>${selService.name}</b> · ${dateDisplay(selDate)} · ${fmt(selSlot.h,selSlot.m)}`;
    bar.style.display='block';
  } else if(bar) bar.style.display='none';
}

/* ═══ Submit ═══ */
async function submitBooking(){
  const fd=Client.vals();
  const err=Client.validate(fd);
  if(err){ alert(err); return; }
  const btn=document.getElementById('booking-submit');
  btn.disabled=true; btn.textContent='Guardando...';
  const booking={
    id:'GZ-'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,4).toUpperCase(),
    date:selDate, slot:pad(selSlot.h)+':'+pad(selSlot.m), slotMinutes:selSlot.minutes,
    time:fmt(selSlot.h,selSlot.m), durationMinutes:selService.duration,
    service:selService.name, category:selService.category, price:selService.price, priceNum:selService.priceNum,
    name:fd.name, phone:fd.phone, domicilio:fd.domicilio, address:fd.address,
    hairLength:fd.hairLength, hasColor:fd.hasColor, notes:fd.notes,
    status:'confirmada', createdAt:new Date().toISOString(),
  };
  await Store.addBooking(booking);
  ConfirmModal.show(booking);
  btn.disabled=false; btn.textContent='Confirmar cita';
  renderCal();
}

/* ═══ Confirm Modal ═══ */
const ConfirmModal = {
  cur:null,
  show(b){
    this.cur=b;
    document.getElementById('m-id').textContent=b.id;
    document.getElementById('m-name').textContent=b.name;
    document.getElementById('m-date').textContent=dateDisplay(b.date);
    document.getElementById('m-time').textContent=b.time;
    document.getElementById('m-service').textContent=b.service;
    document.getElementById('m-dom').textContent=b.domicilio?'🏠 A domicilio: '+b.address:'';
    document.getElementById('confirm-modal').classList.add('open');
    // Reset
    selService=null; selDate=null; selSlot=null;
    ['step-2','step-3','step-4'].forEach(id=>stepHide(id));
    document.getElementById('sel-bar').style.display='none';
    document.getElementById('booking-bar').style.display='none';
    document.getElementById('client-return').style.display='none';
    document.getElementById('client-new').style.display='none';
    document.getElementById('shared-fields').style.display='none';
    document.getElementById('f-phone').value='';
    document.getElementById('f-name').value='';
    Client.found=null;
    setDot(1); updateBtn();
  },
  close(){ document.getElementById('confirm-modal').classList.remove('open'); this.cur=null; },
  wa(){
    if(!this.cur) return;
    const b=this.cur;
    const clean=b.phone.replace(/\D/g,''), num=clean.startsWith('506')?clean:'506'+clean;
    const txt=`💛 *Galiz — Cita confirmada*\n\nHola ${b.name}! 🌟\n\n📅 ${dateDisplay(b.date)}\n🕐 ${b.time}\n✂️ ${b.service}${b.domicilio?'\n🏠 A domicilio: '+b.address:''}\n\n🆔 Ref: ${b.id}\n\n¡Nos vemos pronto! 💛`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(txt)}`,'_blank');
    this.close();
  },
};

/* ═══ Profile Modal ═══ */
const ProfileModal = {
  show(c){
    document.getElementById('prof-avatar').textContent=initials(c.name);
    document.getElementById('prof-name').textContent=c.name;
    document.getElementById('prof-since').textContent=c.firstVisit?`Clienta desde ${dateDisplay(c.firstVisit)}`:'Nueva clienta';
    document.getElementById('prof-visits').textContent=c.visits||0;

    const fav=this._fav(c);
    const favEl=document.getElementById('prof-fav');
    if(fav){ favEl.textContent=fav.substring(0,12)+(fav.length>12?'…':''); favEl.title=fav; }
    else favEl.textContent='—';

    const hist=document.getElementById('prof-hist');
    const recentBooks=Store.bookings()
      .filter(b=>b.phone.replace(/\D/g,'')===c.phone.replace(/\D/g,''))
      .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);

    if(recentBooks.length){
      hist.innerHTML=`<p class="prof-hist-title">Últimas citas</p>`+
        recentBooks.map(b=>`<div class="prof-hist-item">
          <span>${b.service}</span>
          <span class="phdate">${dateDisplay(b.date)}</span>
        </div>`).join('');
    } else { hist.innerHTML='<p style="font-size:.8rem;color:#aaa">Sin historial aún.</p>'; }

    document.getElementById('profile-modal').classList.add('open');
  },
  _fav(c){
    if(!c.services?.length) return null;
    const cnt={}; c.services.forEach(s=>{ cnt[s]=(cnt[s]||0)+1; });
    return Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
  },
  close(){ document.getElementById('profile-modal').classList.remove('open'); },
};

/* ═══ Admin ═══ */
const Admin = {
  _tab:'citas', _poll:null,

  open(){
    document.getElementById('admin-modal').classList.add('open');
    document.getElementById('admin-login').style.display='flex';
    document.getElementById('admin-dash').style.display='none';
    setTimeout(()=>document.getElementById('admin-pw').focus(),80);
  },

  checkPw(){
    if(document.getElementById('admin-pw').value===CONFIG.adminPassword){
      document.getElementById('admin-login').style.display='none';
      document.getElementById('admin-dash').style.display='block';
      this.startDash();
    } else alert('Contraseña incorrecta');
  },

  async startDash(){
    await Store.syncFromSheets();
    this.renderAll();
    this._poll=setInterval(async()=>{ await Store.syncFromSheets(); this.renderAll(); },30000);
    document.querySelectorAll('.adm-tab').forEach(b=>b.addEventListener('click',()=>this.switchTab(b.dataset.tab)));
    document.getElementById('adm-export')?.addEventListener('click',()=>this.csv());
    document.getElementById('adm-add-client')?.addEventListener('click',()=>AddClientModal.open());
  },

  close(){
    document.getElementById('admin-modal').classList.remove('open');
    if(this._poll) clearInterval(this._poll);
  },

  switchTab(tab){
    this._tab=tab;
    document.querySelectorAll('.adm-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    document.querySelectorAll('.adm-panel').forEach(p=>p.style.display='none');
    const el=document.getElementById('panel-'+tab); if(el) el.style.display='block';
    if(tab==='citas')     this.renderCitas();
    else if(tab==='hoy')  this.renderHoy();
    else if(tab==='clientas')  this.renderClientas();
    else if(tab==='servicios') this.renderServicios();
    else if(tab==='bloqueos')  this.renderBloqueos();
  },

  renderAll(){
    this.renderStats();
    if(this._tab==='citas')     this.renderCitas();
    else if(this._tab==='hoy')  this.renderHoy();
    else if(this._tab==='clientas')  this.renderClientas();
    else if(this._tab==='servicios') this.renderServicios();
  },

  renderStats(){
    const all=Store.bookings();
    const tk=toKey(today.getFullYear(),today.getMonth(),today.getDate());
    const sw=new Date(today); sw.setDate(today.getDate()-today.getDay());
    this._sc('as-hoy',  all.filter(b=>b.date===tk&&b.status!=='cancelada').length,'Hoy');
    this._sc('as-sem',  all.filter(b=>b.status!=='cancelada'&&new Date(b.date+'T12:00')>=sw).length,'Semana');
    this._sc('as-pend', all.filter(b=>b.status==='confirmada').length,'Pendientes');
    this._sc('as-comp', all.filter(b=>b.status==='completada').length,'Completadas');
    this._sc('as-cli',  Store.clients().length,'Clientas');
    const rev=Store.weekRevenue();
    this._sc('as-rev', rev?'₡'+rev.toLocaleString():'₡0','Ingresos sem.');
  },
  _sc(id,v,l){ const e=document.getElementById(id); if(e) e.innerHTML=`<b>${v}</b><small>${l}</small>`; },

  renderCitas(){
    const bs=Store.bookings().slice().sort((a,b)=>a.date.localeCompare(b.date)||a.slot.localeCompare(b.slot));
    const tb=document.getElementById('adm-tbody');
    if(!tb) return;
    if(!bs.length){ tb.innerHTML='<tr><td colspan="6" class="mono" style="text-align:center;padding:2rem;color:#aaa">Sin citas aún</td></tr>'; return; }
    tb.innerHTML=bs.map(b=>`<tr style="opacity:${b.status==='cancelada'?.4:1}">
      <td class="mono">${b.id}</td>
      <td><b>${b.name}</b><br><small style="color:#aaa">${b.phone}</small></td>
      <td style="white-space:nowrap"><small style="color:#888">${dateDisplay(b.date)}</small><br><b>${b.time}</b></td>
      <td><small>${b.service}</small>${b.domicilio?'<br><span class="tag-dom">🏠 dom</span>':''}</td>
      <td><span class="pill s-${b.status}">${b.status}</span></td>
      <td><div class="acts">
        <button class="ab" data-action="wa"     data-phone="${b.phone}" data-name="${b.name}" data-date="${b.date}" data-time="${b.time}" data-service="${b.service}" title="WA">💬</button>
        <button class="ab" data-action="remind" data-phone="${b.phone}" data-name="${b.name}" data-date="${b.date}" data-time="${b.time}" data-service="${b.service}" title="Recordatorio">🔔</button>
        ${b.status==='confirmada'?`<button class="ab" data-action="complete" data-id="${b.id}" title="Completada">✅</button><button class="ab" data-action="cancel" data-id="${b.id}" title="Cancelar">❌</button>`:''}
      </div></td>
    </tr>`).join('');
  },

  renderHoy(){
    const tk=toKey(today.getFullYear(),today.getMonth(),today.getDate());
    const bs=Store.bookings().filter(b=>b.date===tk).sort((a,b)=>a.slot.localeCompare(b.slot));
    const el=document.getElementById('panel-hoy');
    if(!el) return;
    if(!bs.length){ el.innerHTML='<p style="color:#aaa;padding:2rem;text-align:center">No hay citas para hoy.</p>'; return; }
    el.innerHTML=`<table class="adm-table"><thead><tr><th>Hora</th><th>Clienta</th><th>Servicio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    ${bs.map(b=>`<tr style="opacity:${b.status==='cancelada'?.4:1}">
      <td><b style="color:var(--gold-d)">${b.time}</b></td>
      <td>${b.name}<br><small style="color:#aaa">${b.phone}</small></td>
      <td><small>${b.service}</small>${b.domicilio?`<br><span class="tag-dom">🏠 ${b.address}</span>`:''}</td>
      <td><span class="pill s-${b.status}">${b.status}</span></td>
      <td><div class="acts">
        <button class="ab" data-action="wa"     data-phone="${b.phone}" data-name="${b.name}" data-date="${b.date}" data-time="${b.time}" data-service="${b.service}">💬</button>
        <button class="ab" data-action="remind" data-phone="${b.phone}" data-name="${b.name}" data-date="${b.date}" data-time="${b.time}" data-service="${b.service}">🔔</button>
        ${b.status==='confirmada'?`<button class="ab" data-action="complete" data-id="${b.id}">✅</button><button class="ab" data-action="cancel" data-id="${b.id}">❌</button>`:''}
      </div></td>
    </tr>`).join('')}</tbody></table>`;
  },

  renderClientas(){
    const el=document.getElementById('panel-clientas');
    if(!el) return;
    el.innerHTML=`<input class="cli-search" id="cli-search" type="text" placeholder="🔍 Buscar por nombre o número">
      <div id="cli-list"></div>`;
    const renderList=(q='')=>{
      const cs=Store.clients().slice()
        .filter(c=>!q||c.name?.toLowerCase().includes(q.toLowerCase())||c.phone?.includes(q))
        .sort((a,b)=>(b.visits||0)-(a.visits||0));
      const list=document.getElementById('cli-list');
      if(!list) return;
      list.innerHTML=cs.map(c=>`
        <div class="cli-card">
          <div class="cli-avatar">${initials(c.name)}</div>
          <div class="cli-info">
            <div class="cli-name">${c.name}
              ${(c.visits||0)>=5?'<span class="cli-tag cli-t-g">⭐ Fiel</span>':
                (c.visits||0)>=2?'<span class="cli-tag cli-t-y">Recurrente</span>':''}
            </div>
            <div class="cli-meta">
              ${c.phone} · ${c.visits||0} cita${c.visits!==1?'s':''} ·
              ${c.lastVisit?`Últ: ${c.lastVisit}`:'Sin citas'}
              ${c.hairLength?` · ${c.hairLength}`:''}
            </div>
            ${c.notes?`<div class="cli-meta" style="color:var(--gold-d)">📝 ${c.notes}</div>`:''}
          </div>
          <div class="cli-acts">
            <button class="ab" data-action="wa-c"   data-phone="${c.phone}" data-name="${c.name}" title="WhatsApp">💬</button>
            <button class="ab" data-action="note-c" data-phone="${c.phone}" title="Nota">✏️</button>
            <button class="ab" data-action="view-c" data-phone="${c.phone}" title="Perfil">👁️</button>
          </div>
        </div>`).join('');
    };
    renderList();
    document.getElementById('cli-search')?.addEventListener('input',e=>renderList(e.target.value));
  },

  renderServicios(){
    const el=document.getElementById('panel-servicios');
    if(!el) return;
    const all=Store.bookings().filter(b=>b.status!=='cancelada');
    const cnt={}, rev={};
    all.forEach(b=>{
      cnt[b.service]=(cnt[b.service]||0)+1;
      rev[b.service]=(rev[b.service]||0)+(b.priceNum||SVC_PRICE[b.service]||0);
    });
    const sorted=Object.entries(cnt).sort((a,b)=>b[1]-a[1]);
    const max=sorted[0]?.[1]||1;
    if(!sorted.length){ el.innerHTML='<p style="color:#aaa;padding:2rem;text-align:center">Sin datos aún.</p>'; return; }
    el.innerHTML=`<p style="font-size:.75rem;color:#aaa;margin-bottom:1rem;text-transform:uppercase;letter-spacing:.04em">Servicios más populares</p>`+
      sorted.map(([name,count])=>`
        <div class="rev-bar">
          <span style="min-width:140px;font-size:.78rem;color:var(--ink)">${name}</span>
          <div class="rev-bar-inner" style="width:${Math.round(count/max*140)+20}px"></div>
          <span>${count} cita${count!==1?'s':''}</span>
          ${rev[name]?`<span style="color:var(--gold-d);font-weight:500">₡${rev[name].toLocaleString()}</span>`:''}
        </div>`).join('');
  },

  renderBloqueos(){
    const blocked=Store.blockedDays(), slots=Store.blockedSlots();
    const el=document.getElementById('panel-bloqueos');
    if(!el) return;
    el.innerHTML=`
      <div class="blk-section">
        <b>Bloquear día completo</b>
        <div class="blk-row">
          <input type="date" id="blk-date" class="adm-input">
          <button class="adm-btn pri" id="blk-add" style="padding:.4rem .9rem;font-size:.78rem">🔒 Bloquear</button>
          <button class="adm-btn sec" id="blk-rm" style="padding:.4rem .9rem;font-size:.78rem">🔓 Desbloquear</button>
        </div>
      </div>
      <p style="margin:.8rem 0 .3rem"><b>Días bloqueados (${blocked.length})</b></p>
      <div class="tag-list">${blocked.length?blocked.map(d=>`<span class="tag-r">${d}</span>`).join(''):'<span class="muted">Ninguno</span>'}</div>
      <p style="margin:.8rem 0 .3rem"><b>Horarios bloqueados (${slots.length})</b></p>
      <div class="tag-list">${slots.length?slots.map(s=>`<span class="tag-r">${s.replace('|',' · ')}</span>`).join(''):'<span class="muted">Ninguno</span>'}</div>`;
    document.getElementById('blk-add').onclick=async()=>{ const v=document.getElementById('blk-date').value; if(!v) return; await Store.blockDay(v); renderCal(); this.renderBloqueos(); };
    document.getElementById('blk-rm').onclick=async()=>{ const v=document.getElementById('blk-date').value; if(!v) return; await Store.unblockDay(v); renderCal(); this.renderBloqueos(); };
  },

  sendWA(phone,name,date,time,service){
    if(!phone) return;
    const n=phone.replace(/\D/g,''), num=n.startsWith('506')?n:'506'+n;
    const txt=date
      ? `Hola ${name}! 💛 Te escribe *Galiz*.\n\nTu cita:\n📅 ${dateDisplay(date)}\n🕐 ${time}\n✂️ ${service}`
      : `Hola ${name}! 💛 Te escribe *Galiz*. ¿En qué te puedo ayudar?`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(txt)}`,'_blank');
  },

  sendReminder(phone,name,date,time,service){
    const n=phone.replace(/\D/g,''), num=n.startsWith('506')?n:'506'+n;
    const txt=`Hola ${name}! 🔔 Te recuerda *Galiz*.\n\n📅 ${dateDisplay(date)}\n🕐 ${time}\n✂️ ${service}\n\n¡Nos vemos pronto! 💛`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(txt)}`,'_blank');
  },

  async editNote(phone){
    const c=Store.clients().find(x=>x.phone.replace(/\D/g,'')===phone.replace(/\D/g,''));
    const nota=prompt('Nota interna (solo visible en admin):',c?.notes||'');
    if(nota===null) return;
    await Store.updateClientNote(phone,nota.trim());
    this.renderClientas();
  },

  viewClient(phone){
    const c=Store.clients().find(x=>x.phone.replace(/\D/g,'')===phone.replace(/\D/g,''));
    if(c) ProfileModal.show(c);
  },

  csv(){
    const all=Store.bookings(); if(!all.length){alert('Sin citas.');return;}
    const h=['ID','Nombre','WhatsApp','Fecha','Hora','Servicio','Categoría','Duración(min)','Precio','Domicilio','Dirección','Notas','Estado','Creado'];
    const rows=all.map(b=>[b.id,b.name,b.phone,b.date,b.time,b.service,b.category,b.durationMinutes,b.price,b.domicilio?'Sí':'No',b.address||'',b.notes||'',b.status,b.createdAt]
      .map(v=>`"${(v||'').toString().replace(/"/g,'""')}"`).join(','));
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob(['﻿'+[h.join(','),...rows].join('\n')],{type:'text/csv;charset=utf-8;'}));
    a.download=`galiz-citas-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  },
};

/* ═══ Add Client Modal (admin) ═══ */
const AddClientModal = {
  open(){
    document.getElementById('add-client-modal').classList.add('open');
    setTimeout(()=>document.getElementById('ac-phone').focus(),80);
  },
  close(){ document.getElementById('add-client-modal').classList.remove('open'); },
  async save(){
    const phone=document.getElementById('ac-phone').value.trim();
    const name=document.getElementById('ac-name').value.trim();
    const hairLen=document.querySelector('input[name="ac-hair"]:checked')?.value||'';
    const notes=document.getElementById('ac-notes').value.trim();
    if(!phone||!name){ alert('Teléfono y nombre son requeridos.'); return; }
    await Store.addClient({phone,name,hairLength:hairLen,notes});
    Admin.renderClientas(); Admin.renderStats();
    this.close();
    document.getElementById('ac-phone').value='';
    document.getElementById('ac-name').value='';
    document.getElementById('ac-notes').value='';
  },
};

/* ═══ Helpers ═══ */
function shake(id){ const e=document.getElementById(id); if(!e) return; e.style.outline='2px solid #e03'; setTimeout(()=>e.style.outline='',2000); }

/* ═══ Init ═══ */
document.addEventListener('DOMContentLoaded', async ()=>{
  Picker.init();
  Client.init();
  renderCal();

  // 5 clicks logo → admin
  let clicks=0, timer;
  document.getElementById('nav-logo-link')?.addEventListener('click',e=>{
    e.preventDefault(); clicks++;
    if(clicks===5) document.getElementById('admin-link')?.removeAttribute('hidden');
    clearTimeout(timer); timer=setTimeout(()=>clicks=0,2000);
  });

  // Calendar nav
  document.getElementById('cal-prev')?.addEventListener('click',()=>{ calMonth--; if(calMonth<0){calMonth=11;calYear--;} renderCal(); });
  document.getElementById('cal-next')?.addEventListener('click',()=>{ calMonth++; if(calMonth>11){calMonth=0;calYear++;} renderCal(); });

  // Booking
  document.getElementById('booking-submit')?.addEventListener('click',submitBooking);

  // Confirm modal
  document.getElementById('modal-close')?.addEventListener('click',()=>ConfirmModal.close());
  document.getElementById('modal-wa')?.addEventListener('click',()=>ConfirmModal.wa());
  document.getElementById('confirm-modal')?.addEventListener('click',e=>{ if(e.target===e.currentTarget) ConfirmModal.close(); });

  // Profile modal
  document.getElementById('prof-close')?.addEventListener('click',()=>ProfileModal.close());
  document.getElementById('profile-modal')?.addEventListener('click',e=>{ if(e.target===e.currentTarget) ProfileModal.close(); });

  // Admin
  document.getElementById('admin-link')?.addEventListener('click',e=>{ e.preventDefault(); Admin.open(); });
  document.getElementById('adm-close')?.addEventListener('click',()=>Admin.close());
  document.getElementById('admin-modal')?.addEventListener('click',e=>{ if(e.target===e.currentTarget) Admin.close(); });
  document.getElementById('admin-login-btn')?.addEventListener('click',()=>Admin.checkPw());
  document.getElementById('admin-pw')?.addEventListener('keypress',e=>{ if(e.key==='Enter') Admin.checkPw(); });
  document.getElementById('admin-login-cancel')?.addEventListener('click',()=>Admin.close());

  // Add client modal
  document.getElementById('ac-save')?.addEventListener('click',()=>AddClientModal.save());
  document.getElementById('ac-cancel')?.addEventListener('click',()=>AddClientModal.close());
  document.getElementById('add-client-modal')?.addEventListener('click',e=>{ if(e.target===e.currentTarget) AddClientModal.close(); });

  // Admin event delegation (citas + hoy + clientas)
  document.getElementById('admin-modal')?.addEventListener('click', async e=>{
    const btn=e.target.closest('[data-action]'); if(!btn) return;
    const {action,id,phone,name,date,time,service}=btn.dataset;
    if(action==='cancel'   &&confirm('¿Cancelar esta cita?'))     { await Store.cancel(id);   Admin.renderAll(); renderCal(); }
    if(action==='complete' &&confirm('¿Marcar como completada?')) { await Store.complete(id); Admin.renderAll(); renderCal(); }
    if(action==='wa'||action==='wa-c')  Admin.sendWA(phone,name,date,time,service);
    if(action==='remind')               Admin.sendReminder(phone,name,date,time,service);
    if(action==='note-c')               Admin.editNote(phone);
    if(action==='view-c')               Admin.viewClient(phone);
  });

  if(Store.sheetsReady()){ await Store.syncFromSheets(); renderCal(); }
});
