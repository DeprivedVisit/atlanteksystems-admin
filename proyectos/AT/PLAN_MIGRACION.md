# 🎯 INTEC — Plan de Migración: del Simulador al Cliente Cerrado
> Apex Cloud Work · 12 julio 2026
> Estado: **SIMULADOR ACTIVO** en `d20az2y50g157c.cloudfront.net` — nada de esto es producción todavía.

---

## 📌 Qué es hoy (simulador)

| Pieza | Estado demo | Qué falta para producción |
|-------|------------|---------------------------|
| Landing dark "Control Room" | ✅ Live en CloudFront preview | Fotos reales, testimonios reales, dominio propio |
| Zona de cobertura (radar Pococí) | ✅ 7 distritos + tiempos | Validar tiempos de respuesta con INTEC |
| Gate usuario / invitado | ✅ Funcional (localStorage) | Decidir si se mantiene o pasa a modo suave |
| Cotización rápida → hoja Leads | ⚠️ Fallback WhatsApp | Redeploy Apps Script "Cualquier persona" |
| Dashboard (KPIs, leads, facturación) | ✅ Con proforma 027 real | Gate de contraseña antes de entregar |
| Admin (clientes + proformas/facturas) | ✅ Funcional | Token nuevo, Sheet en cuenta de INTEC |
| Fotos | ❌ picsum placeholders | Fotos de instalaciones reales |
| Testimonios | ❌ De referencia | Reales con permiso del cliente |
| Token/seguridad | ❌ `intec-2026` visible en JS | Token nuevo + gate en admin/dashboard |

**El argumento de venta es exactamente este:** *"Ya está construido y funcionando con su proforma real adentro. Al firmar, se activa — no se empieza de cero."*

---

## FASE 0 — Demo (esta semana)

**Objetivo:** que el dueño de INTEC vea SU negocio funcionando, no un mockup.

Guión de la reunión (15 min, por WhatsApp o presencial):
1. Abrir la landing en **su celular** — mobile primero, es como la verán sus clientes.
2. Mostrar el radar de cobertura: "sus clientes de Cariari ven que usted llega".
3. Llenar la cotización rápida en vivo → mostrar cómo cae el lead.
4. Rematar con el **dashboard**: su proforma 027 de Eco Clinic ya cargada, KPIs de cobrado/por cobrar. *"Esto ordena su facturación desde el día uno."*
5. Cerrar: "esto queda suyo con dominio propio en 5 días hábiles desde la firma".

Preparación previa:
- [ ] Redeploy del Apps Script (acceso "Cualquier persona") para que el formulario funcione en vivo en la demo
- [ ] Meter 2-3 leads de prueba realistas para que el dashboard no se vea vacío
- [ ] Ensayar el flujo completo en el celular

---

## FASE 1 — Cierre comercial

Modelo Apex aplicado a INTEC:

| Concepto | Precio | Nota |
|----------|--------|------|
| Setup inicial (landing + admin + dashboard) | **$350 USD único** | Ya construido = margen alto |
| Mantenimiento mensual | **$50 USD/mes** | Hosting AWS + cambios menores + reporte de leads |
| Dominio (primer año incluido en setup) | — | `.com` ~$14/año vía Route 53 |

Reglas de cierre (no negociables):
- [ ] Contrato + proforma con el marco legal de Apex (contrato-servicio, T&C v2.0)
- [ ] **50% adelanto** antes de tocar una línea de migración
- [ ] Máximo 2 rondas de revisiones (ya está en el proceso estándar)
- [ ] Todo cliente nuevo entra **con mantenimiento por defecto** (regla Q3 2026), no solo setup

---

## FASE 2 — Migración técnica (al firmar, 3-5 días hábiles)

### Día 1 — Contenido real
- [ ] Fotos reales de instalaciones (mínimo 6 para Trabajos + 1 hero) — pedirlas EN la firma
- [ ] Testimonios reales (2-3, con permiso) o quitar la sección
- [ ] Validar tiempos de cobertura por distrito con INTEC
- [ ] Confirmar correo y datos de contacto finales

### Día 2 — Backend en cuenta del cliente
- [ ] Crear Google Sheet **en la cuenta de INTEC** (soporteintec.cr@gmail.com) y compartir con Apex
- [ ] Pegar `Code.gs` actualizado (Clientes/Documentos/Leads/Usuarios) → deploy "Cualquier persona"
- [ ] **Token nuevo** (no `intec-2026`) en `Code.gs` + `config.js`
- [ ] Migrar datos demo: cliente Eco Clinic + proforma 027

### Día 3 — Infraestructura de producción
- [ ] Dominio: proponer `inteccr.com` o `intecguapiles.com` (verificar disponibilidad) — Route 53
- [ ] Certificado ACM en us-east-1 (dominio + www)
- [ ] Bucket S3 de producción (ej. `inteccr-com`) — **subir solo archivos específicos, NUNCA sync de carpeta cruda** (regla post-fuga 07 jul)
- [ ] CloudFront producción con OAC + alias + redirect www→raíz
- [ ] Route 53: A/AAAA alias a CloudFront

### Día 4 — Seguridad y SEO
- [ ] Gate de contraseña en `admin.html` y `dashboard.html` (mismo patrón del admin de Apex)
- [ ] `noindex` ya está en dashboard — verificar admin
- [ ] Quitar links Admin/Dashboard del footer público (pasar links directos a INTEC)
- [ ] `sitemap.xml` + `robots.txt` + meta OG con foto real
- [ ] Google Business Profile de INTEC (Guápiles) + Search Console — SEO local es el canal #1 para CCTV

### Día 5 — QA y switch
- [ ] Formulario end-to-end: lead del sitio → hoja Leads → visible en dashboard
- [ ] Gate usuario: crear/salir/invitado bloqueado
- [ ] Mobile completo (iPhone + Android)
- [ ] Lighthouse rápido (performance + accesibilidad)
- [ ] Invalidación final + apagar/reciclar `intec-preview` (o dejarlo como staging)

---

## FASE 3 — Entrega

- [ ] Sesión de 30 min por WhatsApp/video: cómo ve leads, cómo hace proformas, cómo cobra
- [ ] Kit de bienvenida (patrón `Bienvenida/` de Apex)
- [ ] Entregar: URL producción, credenciales admin/dashboard, acceso al Sheet
- [ ] Footer: "Desarrollado por Apex Cloud Work" queda como canal de referidos
- [ ] Garantía: 90 días de soporte de errores incluido en setup

---

## FASE 4 — Recurrente (el negocio real)

| Mes | Acción |
|-----|--------|
| Mes 1 | Reporte de leads + ajustes post-lanzamiento (incluido) |
| Mes 2+ | Mantenimiento $50/mes: hosting, cambios menores, reporte mensual de leads/usuarios |
| Mes 3 | Propuesta de upsell: Google Ads local ($150 setup) o fotos profesionales de trabajos |

**Costo AWS real estimado:** $1-3/mes (S3+CloudFront+Route 53) → margen del mantenimiento ≈ 95%.

---

## ⚠️ Riesgos y decisiones abiertas

1. **Gate de entrada obligatorio** — captura contactos pero agrega fricción. Propuesta: en producción arrancar con la variante suave (gate solo al usar la cotización) y medir. Decidirlo con datos, no con opinión.
2. **Apps Script sin redeploy** = formulario en fallback WhatsApp. Es EL bloqueante de la demo — resolver antes de la reunión.
3. **Sheet en cuenta de quién:** si queda en cuenta Apex, INTEC depende de Apex (retención pero riesgo de conflicto). Recomendado: cuenta del cliente, compartido con Apex — más profesional y es argumento de venta ("los datos son suyos").
4. **Fotos:** si INTEC no tiene fotos de trabajos, ofrecer visita para tomarlas (medio día, incluida en setup) — sin fotos reales el sitio pierde credibilidad.
