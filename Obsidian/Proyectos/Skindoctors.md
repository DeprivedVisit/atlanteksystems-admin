# Skindoctors CR

**Cliente:** [[Andrés]]
**Valor:** $450 USD (3 landings × $150)
**Estado:** ⚠️ Cobro vencido — deadline era 15 jun 2026, reactivar ya
**Prioridad:** #1 absoluta — es plata ya ganada

---

## Infraestructura

| Recurso | Valor |
|---------|-------|
| Bucket S3 | `skindoctors-cr-landings` — us-east-2 |
| CloudFront ID | `E31U5V9IA0JXSZ` |
| CloudFront URL | `d3suiaystvdco4.cloudfront.net` |
| WA actual | +506 6314-4171 (cambiar al firmar) |

## Landings

| Landing | Ruta | Estado |
|---------|------|--------|
| Melasblock | `/melasblock/` | ✅ Live — Apps Script (rediseño inmersivo full-bleed 30-31 jul, hero video 3D) |
| CBD Balance | `/cbd-balance/` | ✅ Apps Script + `robots.txt`/`sitemap.xml`/checklist pre-producción agregados |
| Presentación | `/presentacion/` | ✅ Live |

---

## Pendientes

- [ ] Reunión de presentación con cliente
- [ ] Firma de contrato
- [ ] Cobrar $450 USD (50% adelantado al cerrar · 50% al aprobar preview)
- [ ] Activar toggle CBD Balance
- [ ] Cambiar WA flotante a número de Skindoctors
- [ ] Hablar comisión con Andrés antes del primer cobro

---

## Backend (Apps Script — N8N retirado 16 jul 2026)

```
Form submit → Apps Script → Google Sheets + Gmail notificación
```
Melasblock: activo en producción
CBD Balance: activo en producción
N8N ya no se usa — migración completa a Apps Script en contratos, políticas de seguridad y copy de todos los clientes (commit `6b286b7`).

---

## Notas

- Andrés abrió la puerta — definir comisión antes del cobro
- Infraestructura ya está live, el dinero es el paso que falta
