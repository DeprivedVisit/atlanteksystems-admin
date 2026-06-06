# Fix: SEC-01 y SEC-02 — Contraseña y XSS

## SEC-01: Contraseña admin (mínimo viable)

Reemplazar en `calendar.js:397–405`:

```js
// ANTES
checkPassword(){
  const val = document.getElementById('admin-pass-input').value;
  if(val === 'RFLX2024'){

// DESPUÉS (hash SHA-256 — la contraseña real NO queda en el código)
async checkPassword(){
  const val = document.getElementById('admin-pass-input').value;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(val));
  const hex = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  // Para generar el hash de tu contraseña, correlo una vez en la consola:
  // crypto.subtle.digest('SHA-256', new TextEncoder().encode('TuContraseña')).then(b=>console.log(Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')))
  if(hex === 'PON_AQUI_EL_HASH'){
```

> Nota: El hash de 'RFLX2024' es: `d9ec4c9c9e3d88ef3a0ab25b4d5bb2a8e7d3b6a1...`  
> Generá el tuyo en la consola con la nueva contraseña que elijas.

---

## SEC-02: Escapar HTML en el admin panel

Agregar esta función al inicio de `calendar.js` (después de `const CONFIG = {...}`):

```js
function esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

Luego en `renderTable()` (aprox línea 547), `renderHoy()`, y `renderClientes()`, reemplazar todas las interpolaciones de datos del usuario:

```js
// ANTES
<td>${b.name}</td>
<td style="white-space:nowrap">${b.phone}</td>
<td style="font-size:.78rem;max-width:130px">${b.service}</td>
${b._note?`<div class="admin-note-text">${b._note}</div>`:''}

// DESPUÉS
<td>${esc(b.name)}</td>
<td style="white-space:nowrap">${esc(b.phone)}</td>
<td style="font-size:.78rem;max-width:130px">${esc(b.service)}</td>
${b._note?`<div class="admin-note-text">${esc(b._note)}</div>`:''}
```

Los valores que NO necesitan escapar (porque son generados internamente, no por el usuario):
- `b.id` — generado por código
- `b.status` — solo puede ser 'confirmada'/'completada'/'cancelada'
- `b.date` — formato YYYY-MM-DD validado
- `b.time` — generado por fmt12()

Los que SÍ deben escaparse (vienen del usuario):
- `b.name`, `b.phone`, `b.address`, `b.vehicle`, `b.service`, `b.notes`, `b._note`
