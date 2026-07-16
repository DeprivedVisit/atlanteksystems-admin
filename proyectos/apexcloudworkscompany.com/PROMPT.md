# Apex Landing — Project Prompt
> Paste this at the start of any AI conversation about this project.

---

## Project
**Client:** Interno — Apex Cloud Work
**Site:** apexcloudworkcompany.com
**Status:** ✅ Live — rediseño premium retro completado
**Priority:** Mejoras continuas (foto real, auth, dashboard cliente)

## Contact
- **Email:** apexcloudworkcompany@gmail.com
- **WhatsApp:** +506 6314-4171
- **GitHub:** github.com/apexcloudworkcompany

## Design
- **Fondo:** casi negro (tokens.css `--bg:#090B0E`)
- **Oro primario:** #C4956A (marca, fijo)
- **Oro acento:** #DBA878 / #F0D4A8
- **Rojo (nuevo, jul 2026):** #7A1F1F / #9C2E2E — cintas, sellos, CTA destacado
- **Pergamino (nuevo, jul 2026):** #E9DDC0 / tinta #2A2013 — panel de precio destacado
- **Display:** Anton (mayúsculas, condensada)
- **Body:** Inter
- **Mono:** JetBrains Mono
- **Estilo:** "Apex / propaganda soviética" — montaña low-poly dorada flotando sobre ciudad de circuitos, cintas rojas tipo condecoración, sellos circulares, panel de precios estilo pergamino. Ver detalle en `/PRODUCT.md` → "Identidad visual — Apex / propaganda soviética".

## Estructura del sitio
- **Hero:** montaña Apex + ciudad de circuitos (SVG hecho a mano, sin mockup de IDE), headline gigante, CTAs
- **Portafolio:** proyectos de clientes
- **FAQ:** preguntas frecuentes de clientes
- **Sobre mí:** sección personal de Garett
- **Admin:** `/admin.html` — mock data, pendiente conectar Google Sheets

## Infraestructura
- **Dominio:** apexcloudworkcompany.com (Route 53)
- **Hosting:** AWS S3 + CloudFront
- **SSL:** ACM (HTTPS activo)

## Pendientes
- [ ] Foto real de Garett para sección "Sobre mí"
- [ ] Conectar `/admin.html` a Google Sheets real
- [ ] Autenticación (Cognito) para dashboard cliente
- [ ] Dashboard real por cliente (ver su landing, estado, tráfico)

## Rules
- Footer: `Desarrollado por Apex Cloud Work — Cartago, CR`
- Paleta warm gold — no cambiar a azules/morados
- Mobile-first siempre
