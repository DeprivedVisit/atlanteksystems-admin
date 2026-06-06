# Fixes rápidos — Performance y Accesibilidad

## PERF-01: Google Fonts preconnect

En `index.html:7`, antes de la línea de Google Fonts, agregar:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;1,300&display=swap" rel="stylesheet">
```

---

## PERF-02: `loading="lazy"` en imágenes

En `index.html:182`, imagen de perfil (cargar eager porque está en el hero visible):
```html
<img src="perfil.jpg" alt="Andrés Loría · RFLX Detail" width="90" height="90" loading="eager">
```

Los thumbnails de reels están debajo del fold — cambiar a lazy:
```html
<!-- Reel 1 (puede ser eager si aparece en el viewport inicial) -->
<div class="reel-thumb" style="background-image:url('thumb-reel1.jpg')..."></div>
```
> Nota: Los thumbnails usan `background-image` CSS, no `<img>`, así que `loading="lazy"` no aplica directamente. Para lazy load real de estas, usar `IntersectionObserver` para asignar el `background-image` solo cuando el card entra en vista.

---

## ACC-01: Botón flotante WhatsApp

En `index.html:147`:
```html
<!-- ANTES -->
<a class="wa-float" href="https://wa.me/50670352618?text=..." target="_blank">💬</a>

<!-- DESPUÉS -->
<a class="wa-float" href="https://wa.me/50670352618?text=..." target="_blank" 
   aria-label="Contactar por WhatsApp" rel="noopener noreferrer">💬</a>
```

---

## ACC-02: Botones de navegación del calendario

En `index.html:538–540`:
```html
<!-- ANTES -->
<button class="cal-nav" id="cal-prev">&#8249;</button>
<button class="cal-nav" id="cal-next">&#8250;</button>

<!-- DESPUÉS -->
<button class="cal-nav" id="cal-prev" aria-label="Mes anterior">&#8249;</button>
<button class="cal-nav" id="cal-next" aria-label="Mes siguiente">&#8250;</button>
```

---

## ACC-03: Autocomplete en inputs del formulario

En `index.html:591–611`:
```html
<input id="f-name"    type="text" placeholder="Ej: Juan Pérez" autocomplete="name">
<input id="f-phone"   type="tel"  placeholder="+506 7035-2618"  autocomplete="tel">
<input id="f-address" type="text" placeholder="Ingresá dirección..." autocomplete="street-address">
```

---

## BUG-01: Eliminar código muerto (IDs inexistentes)

En `index.html`, eliminar las líneas 840–845 completas:
```js
// ELIMINAR ESTAS 6 LÍNEAS
const img = document.getElementById('hero-photo-img');
const ph  = document.getElementById('hero-photo-placeholder');
if(img && ph){
  img.addEventListener('load',()=>{ ph.style.display='none'; });
  img.addEventListener('error',()=>{ img.style.display='none'; ph.style.display='flex'; });
  if(img.complete && img.naturalWidth>0) ph.style.display='none';
}
```

---

## BUG-05: Texto del botón submit

En `calendar.js:334`:
```js
// ANTES
btn.textContent='CONFIRMAR CITA →';

// DESPUÉS
btn.textContent='CONFIRMAR CITA — ₡5.000 →';
```
