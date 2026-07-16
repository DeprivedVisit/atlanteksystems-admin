# Jiménez Licores — Project Prompt
> Paste this at the start of any AI conversation about this project.

---

## Project
**Client:** Jiménez Licores — Licorera
**Industry:** Licores
**Status:** 🔨 Built v1 — landing desde catálogo PDF (60 págs, solo fotos)
**Priority:** Active

## Contact
- WhatsApp: +506 6314-4171 (placeholder Garett — cambiar al número del cliente)
- Ubicación: pendiente confirmar con cliente
- Horario: pendiente confirmar (placeholder L-S 10am-10pm)

## Design — v8 "Cantina Tica" (16 jul 2026) ← ACTUAL
> El tema náutico oscuro (v7 "Bitácora de a bordo") fue descartado por Garett tras varias vueltas. Nuevo rumbo confirmado con preguntas directas: **rústico/cantina tica, cálido y amigable**.
- **Concepto:** pulpería / cantina de barrio tica — luminoso, acogedor, sin pretensión
- **Paleta:** madera clara tostada — fondo `#E8D9C0`, cards crema `#F7EFDF`, texto café `#2B1D12`, acento ámbar `#C8843C`, acento rojo/ladrillo `#A23B2E`
- **Fuentes:** Fraunces (display cálido, NO grabado) + DM Sans (cuerpo limpio). Se botó Cinzel/EB Garamond/JetBrains
- **Hero split:** texto grande a la izquierda (titular Fraunces con "a un mensaje" en itálica ámbar, eyebrow pill 🍷, 2 botones redondeados ámbar+rojo, checks de confianza) + **carrusel de 5 botellas dentro de card redondeada** a la derecha (JW Black, Chivas 12, JD Honey, Jägermeister, Buchanan's 12) con borde crema + sombra + tag "Destacados". El marco de la card resuelve el recorte de botellas
- **Sin adornos náuticos:** cero anclas/brújula/sellos/coordenadas/"Nº". Emojis simples y cálidos (🥃⚡🤝, 📱🕐📍). Botones y pills redondeados (999px), esquinas suaves (radius 12px)
- Aplicado a landing + admin + dashboard. Verificado en navegador (hero, por qué, catálogo, contacto, footer, admin gate) — Chrome DevTools
- Nota: si el fondo claro se siente muy blanco, bajar `--bg` un paso es cambio de una variable

## Source
- `JIMENEZ LICORES_20260603_202547_0000.pdf` — catálogo Canva de 60 páginas, imágenes puras (sin texto extraíble, sin precios)
- `assets/img/logo.png` (original `1.png`) — logo real del cliente, recibido 15 jul 2026. ⚠️ El logo dice **"RB LICORES"** (pirata náutico, navy + dorado cuerda), no "Jiménez" — confirmar nombre comercial con el cliente antes de deploy
- 59 productos identificados visualmente (pág 57 = duplicado de Centenario 7)
- Imágenes web generadas en `assets/img/products/*.jpg` (640px, ~57KB c/u)

## What's Built
- [x] Landing page: hero + por qué + catálogo filtrable + CTA + contacto
- [x] Age gate 18+ (localStorage, Ley 9047)
- [x] Catálogo: 59 productos en 7 categorías (Tequila 7 · Ron 14 · Whisky 17 · Vodka 2 · Gin 2 · Licores/Cremas 14 · Aguardiente 3)
- [x] Filtros por categoría + búsqueda por nombre/categoría/detalle
- [x] Paleta v6 (15 jul 2026): **madera oscura** (espresso `#17100a` / caoba `#241a10`) + dorado, con **textura de veta de madera** (`--wood-grain`, CSS puro) en secciones "Por qué"/"Pedido", nav y CTA band. Reemplazó al navy porque chocaba con la foto cálida del hero. Aplicado a landing + admin + dashboard
- [x] Hero v6 (15 jul 2026): **foto cinematográfica full-bleed** — usa `assets/img/products/jw-black.jpg` (botella JW Black sobre madera + luces bokeh de bar) como fondo, botella a la derecha, degradado **espresso cálido** que oscurece la izquierda para el texto (antes navy — ahora funde con la foto). Badges de confianza + 2 CTAs. Elegido por Garett tras descartar v2 flotante, v3 centrada, v4 sobrio, v5 vitrina en abanico. Cero costo/deps: reusa asset existente
- [x] Fixes técnicos: fallback no-JS para .reveal, OG tags + favicon (logo), aria-expanded/dialog, prefers-reduced-motion
- [x] Sistema completo metodología Apex/Divinas (15 jul 2026):
  - Formulario de pedidos en landing (#pedido): producto+cantidad+total auto → localStorage + POST Apps Script + WhatsApp
  - `admin.html` + `assets/js/admin.js` + `assets/css/admin.css`: gate login (auth.js SHA-256, sesión 7 días), dashboard (totales/pendientes/ingresos/producto top), tabla filtrable, estados editables (pendiente/confirmado/entregado/cancelado), WA por fila
  - `dashboard.html`: cliente consulta sus pedidos por teléfono
  - `apps-script/Code.gs`: Web App → Google Sheet "Pedidos"
  - Credenciales demo: admin@jimenezlicores.com / admin123 — ⚠️ cambiar hash en producción
- [x] Botón "Consultar precio" por producto → WhatsApp con nombre precargado
- [x] WhatsApp flotante

## Pending
- [ ] Confirmar WhatsApp real del cliente
- [ ] Confirmar ubicación y horario reales
- [x] Precios: 34/59 productos con precio real (₡) desde fotos del cliente (`precios/`, 15 jul 2026) — cards muestran precio + "Pedir por WhatsApp"; los 25 sin precio mantienen "Consultar precio". Volúmenes corregidos según tarjetas
- [ ] Pedir al cliente los precios de los 25 productos restantes (Patrón, Old Parr, Buchanan's, Baileys, 1800 Silver/Añejo, etc.)
- [ ] Verificar presentaciones/volúmenes con el cliente (leídos de las etiquetas, algunos estimados)
- [x] Logo real del cliente — recibido, integrado en hero + favicon + og:image
- [ ] ⚠️ Confirmar nombre: ¿"RB Licores" (logo) o "Jiménez Licores" (PDF)? El sitio entero dice Jiménez
- [ ] Implementar Code.gs en Google Sheets y pegar URL del Web App en `orders.js` (APPS_SCRIPT_URL)
- [ ] Cambiar credenciales admin demo antes de producción
- [ ] Deploy S3 preview → 2 revisiones → producción

## Rules
- Footer: "Desarrollado por Apex Cloud Work — Cartago, CR"
- WhatsApp flotante obligatorio
- Mobile-first · archivos siempre separados (HTML/CSS/JS)
- Venta de alcohol: mantener age gate y leyenda Ley 9047
