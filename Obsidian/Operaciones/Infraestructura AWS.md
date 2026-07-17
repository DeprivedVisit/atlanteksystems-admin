# Infraestructura AWS

**Perfil CLI:** `apex-admin`

---

## Servicios activos

| Servicio | Uso |
|----------|-----|
| S3 | Hosting estático — buckets por cliente |
| CloudFront | CDN + HTTPS |
| Route 53 | DNS — dominios de clientes |
| IAM | Permisos CLI |
| Bedrock | IA — Claude API (futuro Jarvis) |
| Cognito | Auth (futuro admin panels) |
| EC2 | Servidor (disponible) |

---

## Convención de nombres S3

```
[cliente]-[proyecto]     → skindoctors-cr-landings
apex-[proyecto]          → apex-landing-main
```

---

## Clientes activos

### Skindoctors CR
| Recurso | Valor |
|---------|-------|
| Bucket | `skindoctors-cr-landings` — us-east-2 |
| CloudFront ID | `E31U5V9IA0JXSZ` |
| CloudFront URL | `d3suiaystvdco4.cloudfront.net` |

### Apex Landing
| Recurso | Valor |
|---------|-------|
| Bucket | `apexcloudworkscompany.com` — us-east-1 |
| CloudFront ID | `[PENDIENTE — correr list-distributions]` |
| Dominio | apexcloudworkscompany.com |
| Admin | `/admin.html` — mock data |

---

## Comandos frecuentes

```bash
# Deploy a S3
aws s3 sync ./[carpeta] s3://[bucket] --delete

# Invalidar caché CloudFront
aws cloudfront create-invalidation \
  --distribution-id [ID] \
  --paths "/*"
```

---

## Convención de commits GitHub

```
feat:     nueva funcionalidad
fix:      corrección de bug
deploy:   subida a producción
update:   actualización de contenido
refactor: limpieza de código
```
