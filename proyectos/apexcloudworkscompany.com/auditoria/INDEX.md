# Auditoría — apexcloudworkscompany.com
> Inicio: 23 Jun 2026 | Estado: En progreso

## Áreas a auditar

| # | Área | Archivo | Estado |
|---|------|---------|--------|
| 1 | Mobile / Responsive | `01-mobile.md` | ✅ Completado |
| 2 | Rendimiento | `02-performance.md` | ⏳ Pendiente |
| 3 | SEO On-Page | `03-seo.md` | ⏳ Pendiente |
| 4 | Conversión (CRO) | `04-cro.md` | ⏳ Pendiente |
| 5 | Contenido & Copy | `05-contenido.md` | ⏳ Pendiente |
| 6 | Seguridad | `06-seguridad.md` | ⏳ Pendiente |
| 7 | Accesibilidad | `07-accesibilidad.md` | ⏳ Pendiente |

## Deploy
- **Bucket S3:** `apexcloudworkscompany.com` (us-east-1)
- **CloudFront:** `ET4LXKTRYGW7N` → `d3qo2igs81lk3y.cloudfront.net`
- **Comando sync:**
```bash
aws s3 sync "F:/apex-cloudworks/proyectos/apexcloudworkscompany.com/" s3://apexcloudworkscompany.com/ \
  --exclude "Loop-Company.v1/*" \
  --exclude "Mente/*" \
  --exclude "auditoria/*" \
  --exclude "HTML/*" \
  --exclude "*.rar" \
  --exclude "*.md" \
  --exclude "UI.png" \
  --delete \
  --cache-control "max-age=86400"

aws cloudfront create-invalidation --distribution-id ET4LXKTRYGW7N --paths "/*"
```
