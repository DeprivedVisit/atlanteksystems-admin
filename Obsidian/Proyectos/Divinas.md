# Divinas

**Cliente:** bydivinas.me — suplementos
**Valor:** TBD
**Estado:** ✅ Complete — preview AWS live, `Code.gs` en git pero sin subir a Apps Script real
**Prioridad:** —

---

## Diseño

**Rubro:** Suplementos / e-commerce
**Sistema:** Landing + admin + dashboard + brand

---

## Infraestructura

| Recurso | Valor |
|---------|-------|
| Bucket S3 | `divinas-preview` — us-east-1 |
| CloudFront ID | `E1ZTNQRP7PKGG3` |
| CloudFront URL | `d1pp337j2t1x0h.cloudfront.net` |
| Deploy | 09 jul 2026 — 13 archivos, `aws s3 cp` explícito (nunca sync de carpeta cruda) |

---

## Progreso

- [x] Landing + admin + dashboard + brand construidos
- [x] Preview AWS live (09 jul)
- [x] `apps-script/Code.gs` commiteado en git (16 jul)
- [ ] `Code.gs` subido a Apps Script real (sigue pendiente)
- [ ] Auth real — hoy es demo hardcodeada (`admin@divinas.com` / `admin123` en `auth.js`)

---

## Pendientes

- [ ] Reemplazar auth demo antes de producción
- [ ] Subir Code.gs a Apps Script real y conectar

---

## Notas

- Update flow: `aws s3 cp` por archivo + invalidación CloudFront `E1ZTNQRP7PKGG3` — nunca `s3 sync` de carpeta cruda.
