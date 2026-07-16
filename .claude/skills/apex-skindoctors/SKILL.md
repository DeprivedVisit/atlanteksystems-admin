---
name: apex-skindoctors
description: >
  Contexto completo del proyecto Skindoctors CR en Apex Cloud Work.
  Activar cuando Garett mencione Skindoctors, melasblock, cbd-balance,
  cbd balance, el proyecto de skincare, Andrés (en contexto de cliente),
  N8N de skindoctors, o cualquier trabajo en las landings de Skindoctors.
---

# Skindoctors CR — Contexto del proyecto

## Cliente
- **Nombre:** Skindoctors CR
- **Industria:** Skincare / Dermatología estética
- **Referido por:** Andrés (hablar comisión ANTES del primer cobro)
- **Estado:** ⚠️ Pendiente firma y cobro — $450 USD

## Diseño
- **Primario:** #fafafa
- **Acento:** #c8954a
- **Texto:** #1a1a2e
- **Display:** Cormorant Garamond
- **Cuerpo:** DM Mono
- **Estilo:** Elegante, clean, premium skincare

## Infraestructura AWS
- **S3 bucket:** `skindoctors-cr-landings` — us-east-2
- **CloudFront ID:** `E31U5V9IA0JXSZ`
- **CloudFront URL:** `d3suiaystvdco4.cloudfront.net`
- **GitHub:** github.com/apexcloudworkscompany (rama skindoctors)

## Landings en producción

| Landing | Ruta | Estado |
|---------|------|--------|
| Melasblock | `/melasblock/` | ✅ Live · N8N activo + Google Sheets + Gmail |
| CBD Balance | `/cbd-balance/` | ⚠️ Live · N8N importado — **pendiente activar toggle en n8n.cloud** |
| Presentación cliente | `/presentacion/index.html` | ✅ Lista para reunión |
| Entrega final | `/presentacion/entrega-final.html` | ✅ Lista |

## Archivos locales
```
proyectos/skindoctors/
  melasblock/          → landing 1 (producción)
  cbd-balance/         → landing 2 (pendiente N8N)
    index.html
    apps-script.gs
    google-sheets-setup.html
    n8n-workflow-cbd.json
  presentacion/        → decks para reunión y entrega
```

## Estado actual y pendientes
- [ ] **Activar toggle N8N CBD** en n8n.cloud (workflow importado, solo falta ON)
- [ ] Agendar reunión con Skindoctors → presentar `/presentacion/index.html`
- [ ] Firma contrato + proforma
- [ ] Cobrar $450 USD (3 landings × $150)
- [ ] Cambiar número WA de +506 6314-4171 al número oficial de Skindoctors al firmar

## Reglas del proyecto
- No hacer cambios sin contrato firmado
- Máximo 2 rondas de revisión por landing (incluidas en el precio)
- WhatsApp flotante obligatorio en todas las landings
- Footer: `Desarrollado por Apex Cloud Work — Cartago, CR`
- Moneda: USD siempre
- WA actual en producción: +506 6314-4171 (Garett) — cambiar al firmar
