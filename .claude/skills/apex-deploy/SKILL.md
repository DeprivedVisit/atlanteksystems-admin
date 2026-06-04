---
name: apex-deploy
description: >
  Skill de Apex Cloud Works para el proceso completo de deploy en AWS.
  Activar cuando Garett mencione subir un sitio a producción, configurar
  un dominio, SSL, S3, Route 53, CloudFront o cualquier paso del deploy.
---

# Apex Deploy — AWS S3 + Route 53 + HTTPS

## Stack
- Hosting: AWS S3 (static website)
- Dominio: Route 53
- SSL: ACM (gratis)
- CDN: CloudFront (paquetes Pro)

---

## Paso 1 — S3
```bash
aws s3 mb s3://[dominio-cliente] --region us-east-1
aws s3 website s3://[dominio-cliente]/ --index-document index.html
aws s3 cp index.html s3://[dominio-cliente]/ --content-type "text/html"
```

## Paso 2 — SSL con ACM
1. Certificate Manager → Request certificate
2. Dominio: cliente.com y www.cliente.com
3. Validación DNS → agregar CNAME en Route 53
4. Esperar ~5 min → Issued

## Paso 3 — Route 53
1. Create hosted zone → dominio del cliente
2. Record A → Alias to S3 website endpoint
3. Record CNAME → www → dominio raíz

## Paso 4 — Actualizar sitio
```bash
aws s3 cp index.html s3://[dominio-cliente]/
# Con CloudFront:
aws cloudfront create-invalidation --distribution-id [ID] --paths "/*"
```

## Tiempos
| Paso | Tiempo |
|------|--------|
| S3 + hosting | 5 min |
| ACM SSL | 5–10 min |
| Route 53 | 2 min + propagación 24–48h |