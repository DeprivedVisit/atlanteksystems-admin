# RFLX Detail — Sitio web oficial

Desarrollado por **Apex Cloud Work** · Cartago, Costa Rica  
Cliente: **Andrés Loria** · Auto detail premium a domicilio · CR

---

## 🔗 URLs

| Ambiente | URL |
|----------|-----|
| Preview S3 | http://rflx-detail-preview.s3-website-us-east-1.amazonaws.com |
| CDN HTTPS | https://d20wayf40p2ppz.cloudfront.net |
| Repo | https://github.com/apexcloudworkscompany/RFLX-Detail |

---

## 🔐 Panel Admin

El panel admin está accesible desde el footer del sitio (enlace oculto `#admin`).

**Contraseña actual:** `rflx2026`

### Configurar contraseña

La contraseña **nunca se guarda en texto plano** — solo su hash SHA-256.

**Paso 1:** Abrí la consola del navegador en el sitio (`F12 → Console`) y ejecutá:

```js
crypto.subtle.digest('SHA-256', new TextEncoder().encode('TU_CONTRASEÑA'))
  .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join('')))
```

**Paso 2:** Copiá el hash que aparece en consola (64 caracteres hexadecimales).

**Paso 3:** En `calendar.js` buscá `HASH_AQUI` y reemplazalo con el hash copiado:

```js
// Antes:
if(hex === 'HASH_AQUI'){

// Después (ejemplo con hash real):
if(hex === 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'){
```

**Paso 4:** Subir `calendar.js` actualizado a S3:

```bash
aws s3 cp calendar.js s3://rflx-detail-preview/calendar.js --content-type "application/javascript; charset=utf-8"
aws cloudfront create-invalidation --distribution-id E2HJ7GTO88Y5GQ --paths "/calendar.js"
```

---

## 🚀 Deploy y actualización

### Subir cambios al sitio
```bash
aws s3 sync . s3://rflx-detail-preview/ \
  --exclude "*.md" \
  --exclude "*.gs" \
  --exclude ".claude/*" \
  --exclude "Auditacion Apex/*" \
  --content-type-mappings '{"html":"text/html","css":"text/css","js":"application/javascript"}'
```

### Invalidar caché CloudFront (obligatorio después de cada update)
```bash
aws cloudfront create-invalidation --distribution-id E2HJ7GTO88Y5GQ --paths "/*"
```

---

## 📋 Apps Script (backend citas)

El archivo `backend-google-script.gs` contiene el código del servidor de citas.

Para activarlo en producción:
1. Abrí [script.google.com](https://script.google.com) con la cuenta de Google de Andrés
2. Pegá el contenido de `backend-google-script.gs`
3. Deploy → New deployment → Web app
4. Execute as: **Me** · Who has access: **Anyone**
5. Copiá la URL del deploy y actualizá `sheetsUrl` en `calendar.js`

---

## 📁 Estructura

```
/
├── index.html          # Sitio principal
├── styles.css          # Estilos globales
├── calendar.js         # Lógica de citas + panel admin
├── backend-google-script.gs  # Apps Script (no va a S3)
├── Auditacion Apex/    # Documentos internos Apex (no van a S3)
│   ├── entrega-cliente.html
│   ├── cierre-negocio.html
│   ├── scorecard.html
│   └── audit-log.html
└── [imágenes]          # logo-rflx.png, hero-bg.png, perfil.jpg, etc.
```

---

## 📞 Soporte

**Apex Cloud Work**  
apexcloudworkcompany@gmail.com  
WhatsApp: +506 6314-4171
