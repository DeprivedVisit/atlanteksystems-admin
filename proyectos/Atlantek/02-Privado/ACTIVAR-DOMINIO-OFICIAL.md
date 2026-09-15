# 🌐 Activar dominio oficial — atlanteksystems.com → GitHub Pages

> Preparado 2026-09-15 · Para cuando Daniel esté disponible.
> El sitio ya está LIVE en `https://apexcloudworkscompany.github.io/atlanteksystems/`.
> Estos pasos conectan el dominio oficial sin AWS.

---

## Contexto

- El DNS de `atlanteksystems.com` está en **Cloudflare, cuenta de Daniel** (nameservers `alla/mario.ns.cloudflare.com`).
- Hoy el apex no resuelve y `www` da **error 530** (origin CloudFront caído).
- El sitio se sirve desde **GitHub Pages** (repo `apexcloudworkscompany/atlanteksystems`).

---

## PASO 1 — Daniel: registros DNS en Cloudflare

1. Entrar a **dash.cloudflare.com** → dominio **`atlanteksystems.com`**
2. Menú **DNS → Records**
3. **Borrar** el registro viejo de `www` (el que da error 530, apuntaba al CloudFront caído). Si hay un registro `@`/apex, borrarlo también.
4. Crear registro **CNAME** del apex:
   | Campo | Valor |
   |-------|-------|
   | Type | `CNAME` |
   | Name | `@` |
   | Target | `apexcloudworkscompany.github.io` |
   | Proxy | **OFF (gris, DNS only)** |

5. Crear registro **CNAME** del `www`:
   | Campo | Valor |
   |-------|-------|
   | Type | `CNAME` |
   | Name | `www` |
   | Target | `apexcloudworkscompany.github.io` |
   | Proxy | **OFF (gris, DNS only)** |

> ⚠️ Crítico: proxy en **gris (DNS only)**. Si queda naranja, el SSL se rompe con GitHub Pages.

---

## PASO 2 — Garett: conectar el dominio al repo

1. Repo **`apexcloudworkscompany/atlanteksystems`** → **Settings** → **Pages**
2. Sección **Custom domain**: escribir `atlanteksystems.com` → **Save**
3. Esperar a que GitHub verifique el DNS (1-2 min) → debe decir **"DNS record successfully configured"**
4. Tildar **"Enforce HTTPS"**

---

## PASO 3 — Verificar

```
https://atlanteksystems.com
https://www.atlanteksystems.com
```

Ambos deben cargar la landing de Atlantek (sin error 530).
La propagación DNS puede tardar hasta ~24 h (normalmente 10-30 min).

---

## Troubleshooting

| Problema | Fix |
|----------|-----|
| "No DNS record" en GitHub Settings | CNAME `@` aún no propaga — esperar y reintentar |
| Error SSL / certificado no emitido | Registro quedó con proxy naranja → pasarlo a **gris** |
| Carga rara / mezcla de contenido | Hard refresh (Ctrl+Shift+R) — caché local |
| Solo carga `www` pero no el apex | Revisar que el CNAME `@` exista (Cloudflare "flattening" edge cases) |

---

## Recordatorio (admin/dashboard)

- Admin: `https://<dominio>/admin.html` (protegido por clave)
- Dashboard: `https://<dominio>/dashboard.html`
- Leads → Apps Script → Google Sheets (independiente de AWS, sin cambios)

---

## Hecho ✅

- [ ] PASO 1 completado por Daniel
- [ ] PASO 2 completado en Settings del repo
- [ ] PASO 3 verificado
- [ ] `https://atlanteksystems.com` y `www` cargando