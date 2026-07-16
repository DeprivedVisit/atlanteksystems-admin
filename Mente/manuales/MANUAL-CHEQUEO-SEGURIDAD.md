# Manual — Chequeo de Seguridad
> Apex Cloud Work · v1.0 · Julio 2026
> Correr ANTES de cada deploy a producción y una vez al mes sobre todo lo que está live.
> Uso: "Corré el chequeo de seguridad sobre [proyecto]"

---

## 1. Secretos y credenciales

- [ ] `git log -p | grep -iE "key|secret|token|password"` — nada de keys en el historial
- [ ] Ningún archivo `.env`, `credentials`, `.pem` en el repo → verificar `.gitignore`
- [ ] Apps Script URL y webhooks N8N: están en el código por diseño, pero verificar que NO aceptan métodos distintos a POST y que el workflow valida el payload
- [ ] AWS CLI: perfil `apex-admin` sin keys hardcodeadas en scripts — solo `~/.aws/credentials`
- [ ] Access keys IAM: rotar si tienen más de 90 días → `aws iam list-access-keys`
- [ ] Ninguna key con permisos `AdministratorAccess` usada en scripts de deploy — crear policy mínima (S3 sync + CloudFront invalidation)

## 2. S3 y CloudFront

- [ ] Bucket NO público directo — acceso solo vía CloudFront (OAC/OAI)
- [ ] `aws s3api get-bucket-policy --bucket [bucket]` — revisar que no haya `"Principal": "*"` con `s3:*`
- [ ] Block Public Access activado en el bucket
- [ ] CloudFront: HTTPS only — Viewer Protocol Policy = `redirect-to-https`
- [ ] Certificado ACM válido y no próximo a vencer
- [ ] No hay archivos basura en el bucket: `.git/`, backups, `test.html`, `admin` sin auth

## 3. Formularios y leads

- [ ] Validación JS presente pero NUNCA como única defensa — el Apps Script / N8N valida del lado servidor
- [ ] Honeypot anti-spam en cada formulario (campo oculto que si viene lleno, se descarta)
- [ ] Rate limit o al menos deduplicación en N8N (mismo email/teléfono en <1 min = descartar)
- [ ] El webhook N8N no expone datos: respuesta genérica `{"ok": true}`, nunca el contenido del Sheet
- [ ] Google Sheet de leads: compartido SOLO con las cuentas necesarias, nunca "cualquiera con el link puede editar"
- [ ] Datos de clientes finales (nombre, teléfono, email) = datos personales → no subirlos a repos ni pegarlos en chats

## 4. Frontend

- [ ] Sin `console.log` con datos sensibles
- [ ] Sin comentarios HTML con URLs internas, TODOs con credenciales o notas del cliente
- [ ] Links externos con `rel="noopener noreferrer"` si usan `target="_blank"`
- [ ] `admin.html` o paneles: si no tienen auth real (Cognito), NO deben estar en producción — mock data incluida. Un `/admin.html` accesible con datos aunque sean falsos da mala imagen y es puerta de entrada
- [ ] Meta tags no filtran info interna (staging URLs, nombres de archivos de trabajo)

## 5. Dominios y DNS

- [ ] Route 53: sin registros huérfanos apuntando a buckets/distribuciones borradas (riesgo de subdomain takeover)
- [ ] Dominio del cliente: si el DNS lo maneja Apex, dejar registro escrito de qué accesos se tienen
- [ ] WHOIS/renovación del dominio con fecha anotada — un dominio vencido tumba todo

## 6. Cuentas

- [ ] MFA activo en: AWS root, AWS IAM users, Gmail empresa, GitHub, n8n.cloud, Notion
- [ ] AWS root: sin access keys. Solo se usa para billing
- [ ] GitHub: repos de clientes en privado. Solo portfolio explícito en público
- [ ] Revisión de facturación AWS: alertas de billing configuradas (los sustos de AWS ya están flaggeados como riesgo)

## 7. Criterio de salida

El chequeo pasa solo si **todos** los puntos críticos (secciones 1, 2 y 3) están en verde.
Si algo falla: se arregla antes del deploy. Sin excepciones, sin "después lo veo".

---
*Regla: un sitio de $350 con un leak de leads cuesta más que $350 en reputación.*
