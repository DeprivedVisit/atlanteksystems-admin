# Apex Cloud Works

Landing pages de alta conversión para negocios costarricenses. Cartago, CR.

**apexcloudworkscompany.com** · apexcloudworkscompany@gmail.com · +506 6314-4171

---

## Proyectos activos

| Cliente | Proyecto | URL live | Estado |
|---------|---------|----------|--------|
| Skindoctors CR | Melasblock BB Cream | [CloudFront](https://d3suiaystvdco4.cloudfront.net/melasblock/) | 🔥 Live — cerrar antes 15 jun |
| Tío Michael | EcoPollo | — | Cotizador en desarrollo |
| Fabian | VisionaryFilm | — | Pendiente Instagram |
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
├── proyectos/
│   ├── skindoctors/
│   │   ├── melasblock/
│   │   │   ├── Mellas/      ← Fuente HTML (index.html · tipos.html · logo.svg)
│   │   │   └── img/         ← Assets (4k.png · melasblock.png · tonos JPG)
│   │   └── cbd-balance/     ← Próxima landing
│   └── apexcloudworkscompany.com/
├── Loop-Company.v1/
├── LOG.md                   ← Check-in semanal
└── CLAUDE.md                ← Contexto y memoria del sistema
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
# Subir HTML
aws s3 cp Mellas/index.html s3://skindoctors-cr-landings/melasblock/index.html \
  --region us-east-2 --content-type "text/html; charset=utf-8"

# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id E31U5V9IA0JXSZ --paths "/*"
```

**CloudFront:** `E31U5V9IA0JXSZ` · `d3suiaystvdco4.cloudfront.net`  
**S3:** `skindoctors-cr-landings` · `us-east-2`

---

Desarrollado por Garett Barrantes — Apex Cloud Works · Cartago, Costa Rica · 2026
