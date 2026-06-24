# Apex Cloud Works

Landing pages y sistemas web para negocios costarricenses. Cartago, CR.

**apexcloudworkscompany.com** · apexcloudworkscompany@gmail.com · +506 6314-4171

---

## Proyectos activos

| Cliente | Proyecto | URL live | Estado |
|---------|---------|----------|--------|
| Skindoctors CR | Melasblock + CBD Balance | [CloudFront](https://d3suiaystvdco4.cloudfront.net/melasblock/) | ⚠️ Live — pendiente firma + cobro $450 |
| Tío Michael | EcoPollo | [CloudFront](https://d1qphat23nmosd.cloudfront.net) | 🔥 Cotizador en desarrollo |
| Fabian | VisionaryFilm | — | 🔵 Pendiente datos Fabian |
| Andrés | RFLX | — | En cartera |
| Tía Estefany | Arte Verde | — | En cartera |

---

## Stack

**Frontend:** HTML · CSS · JavaScript → React
**Cloud:** AWS S3 · CloudFront · Route 53 · EC2 · Bedrock · IAM
**Herramientas:** VS Code · GitHub · Claude Code · AWS CLI

---

## Estructura del repo

```
apex-cloudworks/
├── Mente/                       ← Cerebro de Jarvis (fuente de verdad)
├── proyectos/
│   ├── skindoctors/
│   │   ├── melasblock/          ← Landing 1 · N8N + Sheets activo
│   │   ├── cbd-balance/         ← Landing 2 · N8N importado
│   │   └── presentacion/        ← Showcase para reunión con cliente
│   ├── ecopollo/                ← Cotizador 5 pasos en desarrollo
│   ├── visionaryfilm/           ← Pendiente datos Fabian
│   ├── apexcloudworkscompany.com/ ← Apex Landing · live
│   └── jarvis/                  ← Agente interno Python
├── CLAUDE.md                    ← Contexto y memoria del sistema (v11.0)
├── SYSTEM.md                    ← System prompt portable (multi-AI)
└── LOG.md                       ← Check-in semanal
```

---

## Regla de código

**Siempre archivos separados — nunca inline:**
```
index.html          → estructura
assets/css/style.css → diseño
assets/js/script.js  → lógica
```

---

## Proceso — 8 pasos

`Brief → Paleta/Fuentes → Secciones → HTML/CSS/JS → S3 Preview → 2 revisiones → Deploy → Entrega`

---

## Precios

| Servicio | Precio |
|---------|--------|
| Setup inicial | $350 USD único |
| Plan trimestral | $900 USD / 3 meses |
| Landing extra | $150 USD |
| Mantenimiento | $50–100 USD / mes |

---

## Deploy rápido — referencia

```bash
# Subir proyecto completo
aws s3 sync ./[carpeta] s3://[bucket] --delete

# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id [ID] --paths "/*"
```

**Skindoctors:** CloudFront `E31U5V9IA0JXSZ` · S3 `skindoctors-cr-landings` · us-east-2
**EcoPollo:** CloudFront `d1qphat23nmosd.cloudfront.net`

---

Desarrollado por Garett Barrantes — Apex Cloud Works · Cartago, Costa Rica · 2026
