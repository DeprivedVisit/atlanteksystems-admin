# INTEC

**Cliente:** INTEC (CCTV/seguridad/redes, Guápiles) — Daniel Pérez Jiménez, soporteintec.cr@gmail.com
**Valor:** $350 + $50/mes (o precio "de conocido" en ₡ — ver propuesta 2 abajo)
**Estado:** ⚠️ Simulador de venta completo — pendiente redeploy Apps Script antes de demo
**Prioridad:** Alta — listo para cerrar, bloqueado por un deploy técnico

---

## Diseño

**Rubro:** Seguridad / CCTV
**Estilo v2 "Control Room" (12 jul 2026):** dark enterprise `#0B1014`, rojo marca `#CE1212`/`#FF4B4B`, Sora + IBM Plex Mono, iconos SVG (sin emojis), radar de cobertura animado con 7 distritos de Pococí.

---

## ⚠️ Decisión pendiente — 2 propuestas comerciales distintas

1. `propuesta/index.html` (live, 13 jul): Setup $350 + $50/mes — tarifa Apex estándar.
2. `Presentacion/index.html` + `INTEC-propuesta.pdf` (13 jul, posterior, local): Fase 1 ₡50.000+$15 · Fase 2 ₡25.000 · Fase 3 ₡20.000 · Fase 4 ₡15.000 · paquete F2-4 ₡50.000 · mantenimiento ₡12.000/mes.

**Si rige la 2, bajar/actualizar la 1 antes de que Daniel la vea.**

---

## Infraestructura

| Recurso | Valor |
|---------|-------|
| Bucket S3 (preview) | `intec-preview` |
| CloudFront ID | `E3EO108WCQM9DW` |
| CloudFront URL | `d20az2y50g157c.cloudfront.net` |
| Apps Script token | `intec-2026` (demo, visible en JS) |

---

## Progreso

- [x] Landing v2 "Control Room" con gate de usuario
- [x] Fase 2 admin: vista Leads (nuevo→contactado→cotizado→ganado/perdido) + cuentas por cobrar
- [x] `dashboard.html` (KPIs, sin auth todavía)
- [x] Backend `Code.gs` funcionando end-to-end (13 jul) — notificaciones a Daniel por email
- [ ] **Redeploy Apps Script con `lead-status`** (bloqueante — sin esto, cambio de estado de leads da error de sync)
- [ ] Decidir cuál de las 2 propuestas rige
- [ ] Fotos y testimonios reales
- [ ] Dominio propio + ACM + CloudFront prod
- [ ] Gate de contraseña en admin/dashboard
- [ ] Quitar links Admin/Dashboard del footer público
- [ ] Cambiar NOTIFY.EMAIL de `soporteintec.cr@gmail.com` al correo real de Daniel

---

## Notas

- Es un SIMULADOR para cerrar al cliente — ruta demo→producción completa en `proyectos/INTEC/PLAN_MIGRACION.md`.
- Gate de entrada (modal usuario obligatorio) es fricción alta para conversión — se recomendó variante suave.
- Deploy AWS: nunca `s3 sync` de carpeta cruda (contiene PDF de proforma real + token). Usar `aws s3 cp` explícito.
