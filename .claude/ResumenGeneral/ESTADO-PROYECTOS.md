# Estado detallado de proyectos — 31 jul 2026

---

## Clientes

### 1 · Skindoctors CR ($450 USD) — ⚠️ cobro vencido 6+ semanas
- Cliente: Andrés · deadline original 15 jun, sin cerrar
- Landings: Melasblock (live, Apps Script, rediseño inmersivo full-bleed 21 jul) ·
  CBD Balance (live, Apps Script) · Presentación (live)
- Infra: bucket `skindoctors-cr-landings` (us-east-2) · CloudFront `E31U5V9IA0JXSZ`
- N8N retirado por completo (16-18 jul) → todo corre en Apps Script + Sheets + Gmail
- Pendiente real: agendar reunión → firmar → cobrar → hablar comisión con Andrés
  ANTES del cobro → cambiar WA flotante al número del cliente

### 2 · EcoPollo (Tío Michael) — 🔥 activo
- Cotizador en desarrollo, sin más detalle reciente en memoria/vault

### 3 · VisionaryFilm (Fabian) — expandido, bloqueado por datos
- Expandido a multi-página 18 jul: nosotros, servicios, portafolio, contacto
- Bloqueante: falta WA de Fabian, fotos de portafolio, ID de YouTube

### 4 · RFLX (Andrés) — preview live, 2 bloqueantes desde 8 jun
- Preview: `d20wayf40p2ppz.cloudfront.net` · bucket `rflx-detail-preview` ·
  CloudFront `E2HJ7GTO88Y5GQ`
- Video hero full-bleed (`assets/video/hero.mp4`, 576×1024 — pixelado en pantallas
  grandes si Andrés pide más nitidez)
- Admin: 5 clics al logo del nav → login con token validado por Apps Script
- Bloqueantes: hash admin en `calendar.js` sin reemplazar · Apps Script
  `completeBooking` sin redeployar en cuenta de Andrés
- Fuga de datos (CSV de citas) ya limpiada del bucket (14 jul)

### 5 · Arte Verde (Tía Estefany) — en cartera, sin brief

### 6 · Galiz CR — ✅ live, salón de belleza con citas + admin panel

### 7 · Megan Tattoo — ✅ built, falta contacto real (WA/redes)

### 8 · TPezQue (El Guarco) — ✅ live, restaurante mariscos caribeños

### 9 · Divinas (bydivinas.me) — ✅ complete, preview AWS
- Bucket `divinas-preview` (us-east-1) · CloudFront `E1ZTNQRP7PKGG3`
- `Code.gs` commiteado en git pero sin subir a Apps Script real
- Auth demo hardcodeada (`admin@divinas.com`/`admin123`) — resolver antes de prod

### 13 · INTEC (Guápiles, CCTV/seguridad) — ⚠️ bloqueado por deploy técnico
- Cliente: Daniel Pérez Jiménez (soporteintec.cr@gmail.com)
- Es un SIMULADOR de venta — landing v2 "Control Room" + gate de usuario +
  Fase 2 admin (Leads + cuentas por cobrar) + dashboard
- Preview: bucket `intec-preview` · CloudFront `E3EO108WCQM9DW`
- **Bloqueante #1:** redeploy de Apps Script con acción `lead-status` — sin esto
  el cambio de estado de leads da error de sync
- **Decisión pendiente:** 2 propuestas comerciales distintas activas
  ($350+$50/mes vs. precios en ₡ "de conocido") — resolver antes de mostrar a Daniel
- Ruta completa demo→producción en `proyectos/INTEC/PLAN_MIGRACION.md`

### 14 · LICORERA (Jimenez Licores) — 📦 sin confirmar estado real
- Landing+admin+dashboard+catálogo completos, commiteados 16 jul
- No hay confirmación de si ya se habló con el cliente ni brief formal
- No estaba en CLAUDE.md hasta esta sesión (v13.6)

---

## Internos

### 0 · Apex Landing (apexcloudworkscompany.com)
- Live, v4.0 en curso: reposicionamiento a "trabajos grandes" (SaaS/IA/cloud/IT),
  acento coral, footer 4 columnas — **documentado en PRODUCT.md pero sin
  commitear desde el 21 jul** (10 días de WIP en riesgo)
- 3 críticos de seguridad resueltos en código (`backend/`) el 16 jul — **sin
  deploy a EC2**, el sitio live sigue sirviendo el flujo viejo
- Admin/portal/legal completos

### 11 · Wilson — ✅ funcional, pendiente conectar n8n→WhatsApp Business

### 12 · AutoCAD/Arquitectura — 🆕 Fase 1 en diseño (con Derek), visualizador APS Viewer

### 15 · Apex RMM — 🆕 Fase 1 (telemetría) verificada 16 jul
- Clon propio de Atera (RMM+PSA) — decisión consciente de invertir tiempo pese
  a no encajar con "un proyecto a la vez" del roadmap
- Extiende `backend/` de Apex Landing (mismo Express+MySQL)
- Probado solo contra MySQL local — nunca tocó el RDS de producción
- Roadmap: 1) telemetría ✅ 2) alertas 3) PSA conectado 4) multi-tenant
  5) acceso remoto (más riesgosa, sin diseñar)
