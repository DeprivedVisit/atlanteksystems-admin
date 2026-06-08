# Melasblock BB Cream — Landing Page

Landing de alta conversión para **Melasblock BB Cream SPF 50** de Skindoctors CR.

**Live:** https://d3suiaystvdco4.cloudfront.net/melasblock/

---

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Landing principal de venta |
| `tipos.html` | Guía de tonos A4 imprimible |
| `logo.svg` | Logo Skindoctors (fondo oscuro) |
| `logo-dark.svg` | Logo Skindoctors (fondo claro) |

Imágenes: `../img/` (4k.png · melasblock.png · c1a.jpg · m1a.jpg · o3a.jpg · Tipos.png)

---

## Deploy

```bash
# Subir HTML
aws s3 cp index.html s3://skindoctors-cr-landings/melasblock/index.html --region us-east-2 --content-type "text/html; charset=utf-8"
aws s3 cp tipos.html s3://skindoctors-cr-landings/melasblock/tipos.html --region us-east-2 --content-type "text/html; charset=utf-8"

# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id E31U5V9IA0JXSZ --paths "/*"
```

**CloudFront:** `E31U5V9IA0JXSZ` · `d3suiaystvdco4.cloudfront.net`  
**S3:** `skindoctors-cr-landings` · `us-east-2`

---

## Stack

HTML · CSS · JavaScript vanilla · AWS S3 · CloudFront

---

Desarrollado por **Apex Cloud Works** — Cartago, Costa Rica · 2026
