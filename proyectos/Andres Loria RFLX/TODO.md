# TODO — RFLX Detail
> Última actualización: 2026-06-08 · v2.0

## ✅ Completado en v2.0

- [x] SEC-01: Password admin → hash SHA-256 (calendar.js) ⚠️ **Pendiente: reemplazar HASH_AQUI con hash real**
- [x] SEC-02: XSS admin panel — esc() en renderTable, renderHoy, _searchClient, data-attributes
- [x] BUG: Tab "Hoy" — removido `{ once: true }`, delegation pattern con dataset.delegated
- [x] BUG: Texto botón submit restaura "CONFIRMAR CITA — ₡5.000 →" post-envío
- [x] BUG: completeBooking añadido al Apps Script (backend-google-script.gs)
- [x] BUG: Referencias JS muertas (hero-photo-img / hero-photo-placeholder) eliminadas
- [x] SEO: meta description + Open Graph tags (WA preview)
- [x] PERF: preconnect Google Fonts
- [x] UX: Hamburger menu para mobile (≤640px)
- [x] ACC: aria-label en WA flotante, nav IG, hamburger button
- [x] ACC: autocomplete en inputs (name, tel, street-address)
- [x] APEX: Paquete Auditacion Apex/ creado (entrega-cliente, cierre-negocio, scorecard, audit-log)

## ⚠️ Acción requerida (no se puede automatizar)

- [ ] **HASH contraseña admin**: Abrir consola del navegador y correr:
  ```
  crypto.subtle.digest('SHA-256',new TextEncoder().encode('TuContraseña')).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
  ```
  Luego reemplazar `HASH_AQUI` en `calendar.js` → `Admin.checkPassword()`

- [ ] **Apps Script deploy**: Copiar el contenido de `backend-google-script.gs` al Apps Script de Andrés y hacer nuevo deploy como Aplicación Web para que completeBooking funcione en producción

## Mejoras futuras (no bloqueantes)

- [ ] Reemplazar alert() de validaciones por mensajes inline bajo cada campo
- [ ] Schema.org LocalBusiness JSON-LD
- [ ] Lazy loading en slides 2-6 del slideshow
- [ ] H1 semántico explícito en hero
- [ ] URL Google Sheets → considerar CORS proxy o autenticación en backend
