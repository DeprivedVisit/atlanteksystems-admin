// ═══════════════════════════════════════════
//  CONFIGURACIÓN — cambiá solo esta sección
// ═══════════════════════════════════════════
const WA_NUMBER = '50663144171'; // Cambiar al número de Skindoctors al firmar

// Google Apps Script — mismo backend que el resto de Melasblock (guarda en Sheets + notifica por email)
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyjKVJ0AFpV5L-zOsCFFbVD0GHbzT3DPxppuaSGyW58FhYsemXcL0x8JE3KSVftogcJdw/exec';
// ═══════════════════════════════════════════

// ── Navbar scroll ──
window.addEventListener('scroll',()=>{
  document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>40);
},{passive:true});

// ── Mobile menu ──
const menu=document.getElementById('mobileMenu');
const hamburger=document.getElementById('hamburger');
function openMenu(){menu.classList.add('open');hamburger.setAttribute('aria-expanded','true')}
function closeMenu(){menu.classList.remove('open');hamburger.setAttribute('aria-expanded','false')}
hamburger.addEventListener('click',openMenu);
document.getElementById('mobileClose').addEventListener('click',closeMenu);
document.getElementById('nav-logo-link').addEventListener('click',closeMenu);
menu.querySelectorAll('a, button').forEach(el=>el.addEventListener('click',closeMenu));
menu.addEventListener('click',e=>{if(e.target===menu)closeMenu()});

// ── FAQ accordion ──
document.querySelectorAll('.faq-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const isOpen=btn.getAttribute('aria-expanded')==='true';
    document.querySelectorAll('.faq-btn').forEach(b=>{
      b.setAttribute('aria-expanded','false');
      const body=document.getElementById(b.getAttribute('aria-controls'));
      if(body)body.classList.remove('open');
    });
    if(!isOpen){
      btn.setAttribute('aria-expanded','true');
      const body=document.getElementById(btn.getAttribute('aria-controls'));
      if(body)body.classList.add('open');
    }
  });
});

// ── Tono selector — pre-llena el tono en el modal ──
const tonoTip=document.getElementById('tonoActiveTip');
let tonoSeleccionado='';
document.querySelectorAll('.tono-card,.tono-b1n').forEach(card=>{
  function selectTono(){
    document.querySelectorAll('.tono-card,.tono-b1n').forEach(c=>c.classList.remove('active'));
    card.classList.add('active');
    const code=card.dataset.code;
    tonoSeleccionado=code;
    const desc=card.dataset.desc;
    tonoTip.innerHTML='<strong>Tono '+code+'</strong> — '+desc+' · <a onclick="abrirModal(\'tono-\'+\''+code+'\')" style="color:var(--earth);font-weight:700;cursor:pointer">Pedir este tono →</a>';
  }
  card.addEventListener('click',selectTono);
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectTono()}});
});

// ── LEAD MODAL ──
const overlay=document.getElementById('leadOverlay');

function abrirModal(contexto, tono=''){
  document.getElementById('leadContexto').value=contexto;
  // Pre-seleccionar tono si viene de la guía
  const t = tono||tonoSeleccionado;
  if(t){
    const sel=document.getElementById('leadTono');
    for(let i=0;i<sel.options.length;i++){
      if(sel.options[i].value===t){sel.selectedIndex=i;break;}
    }
  }
  overlay.classList.add('open');
  document.body.style.overflow='hidden';
  setTimeout(()=>document.getElementById('leadNombre').focus(),350);
}

function cerrarModal(){
  overlay.classList.remove('open');
  document.body.style.overflow='';
}

// Cerrar con Escape o clic en overlay
document.addEventListener('keydown',e=>{if(e.key==='Escape')cerrarModal()});
overlay.addEventListener('click',e=>{if(e.target===overlay)cerrarModal()});

// Ir directo a WA sin formulario
function irDirectoWA(){
  cerrarModal();
  window.open('https://wa.me/'+WA_NUMBER+'?text=Hola!%20Vi%20el%20Melasblock%20y%20quiero%20consultar%20🌿','_blank','noopener');
}

// ── Envío del formulario → Sheets + WhatsApp ──
async function enviarLead(e){
  e.preventDefault();
  const btn=document.getElementById('leadSubmitBtn');
  btn.disabled=true;
  btn.textContent='Enviando…';

  const datos={
    nombre:   document.getElementById('leadNombre').value.trim(),
    telefono: document.getElementById('leadTel').value.trim(),
    email:    document.getElementById('leadEmail').value.trim(),
    tono:     document.getElementById('leadTono').value,
    zona:     document.getElementById('leadZona').value,
    contexto: document.getElementById('leadContexto').value,
    fecha:    new Date().toLocaleString('es-CR')
  };

  // Enviar a Google Sheets (no-cors, fire and forget)
  // Content-Type debe ser text/plain — application/json dispara preflight que no-cors bloquea
  if(SHEETS_URL){
    try{
      fetch(SHEETS_URL,{
        method:'POST',
        mode:'no-cors',
        headers:{'Content-Type':'text/plain'},
        body:JSON.stringify(datos)
      });
    }catch(_){}
  }

  // Armar mensaje de WhatsApp
  const tono  = datos.tono     ? '\nTono: '+datos.tono        : '\nTono: no sé aún';
  const zona  = datos.zona     ? '\nProvincia: '+datos.zona   : '';
  const email = datos.email    ? '\nCorreo: '+datos.email     : '';
  const msg   = encodeURIComponent(
    'Hola! Soy '+datos.nombre+'. Me interesa el Melasblock BB Cream 🌿'
    +tono+zona+email
  );

  cerrarModal();
  window.open('https://wa.me/'+WA_NUMBER+'?text='+msg,'_blank','noopener');

  // Reset form
  document.getElementById('leadForm').reset();
  btn.disabled=false;
  btn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg> Continuar a WhatsApp';
}

// ── Intersection Observer — reveal anim ──
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')});
  },{threshold:0.1});
  document.querySelectorAll('.anim').forEach(el=>observer.observe(el));
}else{
  document.querySelectorAll('.anim').forEach(el=>el.classList.add('visible'));
}
