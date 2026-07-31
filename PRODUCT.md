# Product

## Register

brand

## Users

Dueños de negocios pequeños y medianos en Costa Rica que necesitan presencia digital profesional, tiendas online, o automatizaciones de procesos. No son técnicos. Buscan un socio que entienda su negocio y lo resuelva sin complicarlos. Llegan por referido o por la landing. Deciden en la primera impresión.

## Product Purpose

Apex Cloud Work es una agencia de desarrollo web y cloud fundada por Garett Barrantes en Cartago, CR. Diseña, construye y mantiene sitios web, landings de conversión, e integraciones con AWS para negocios locales. La landing existe para generar confianza inmediata, mostrar trabajo real, y convertir visitantes en clientes que paguen USD.

## Brand Personality

Serio · Técnico · Confiable

Voz directa y sin rodeos. No vende sueños — muestra resultados. Confianza que viene de capacidad, no de marketing. El tono es de socio operativo que sabe exactamente lo que hace.

## Anti-references

- **WordPress-feel barato**: Sin templates genéricos, sin stock photos de handshakes, sin colores planos tipo azul corporativo #003399.
- **Agencia creativa hipster**: Sin overdesign, sin tipografías experimentales por moda, sin minimalismo vacío que no dice nada.
- **SaaS americano genérico 2024**: Sin cream/beige como fondo, sin glassmorphism decorativo, sin hero-metric templates (big number + small label + gradient), sin eyebrows en cada sección, sin numbered section markers como scaffold.

## Design Principles

1. **Mostrar, no decorar**: Cada elemento visual debe justificar su existencia. Si no comunica algo sobre el producto o genera confianza, sale.
2. **Confianza por competencia**: El diseño debe verse como trabajo de alguien que domina lo que hace — no como alguien que copió una plantilla. Detalle técnico visible en la ejecución.
3. **Dark-native**: La paleta oscura no es elección estética por moda — es consistente con el stack técnico (AWS, terminal, cloud) y el ambiente donde trabaja Garett. Mantenerla siempre.
4. **Densidad de información justa**: Suficiente contenido para generar confianza, sin abrumar. El cliente potencial no es técnico — simplificar sin infantilizar.
5. **USD siempre visible**: Los precios en USD son señal de mercado premium y seriedad. No esconderlos.

## Identidad visual — v4.0 (vigente desde 21 jul 2026)

Rediseño completo desde la v3 (simulador IDE como hero). Portada real (hero
tipográfico limpio: kicker + titular + sub + CTA) con el simulador Antigravity
retirado a una sección secundaria ("Así trabajamos por dentro") como prueba
técnica, no como primer impacto. Orden de página: Hero → Portafolio (prueba
antes que pitch) → Servicios (ledger técnico conectado, no cards) → Proceso →
Explorá el sistema (simulador) → Precios → Estado real (log técnico) → Sobre
mí → FAQ → Contacto.

- **Acento de marca: coral** (`--gold` #E8654A y derivados `--gold2`/`--gold3`)
  — reemplaza al dorado como color principal en todo el sitio (landing, admin,
  portal). El dorado original (#C4956A) NO desaparece: se conserva como
  `--flagship`, rol secundario reservado solo para el tier "Proyecto Grande /
  SaaS" (servicios y precios), señalizando el contrato grande sin competir con
  el coral en todo lo demás.
- **Full-palette de roles** (no restrained): coral = marca/CTA · `--flagship`
  dorado = proyecto grande/premium · `--blue` = estado "en dev" · `--green` =
  estado "live". Cada color tiene un trabajo específico, no decorativo.
- **Fondo**: casi negro, frío (`--bg` #090B0E / `--surface` #101318) — dark-native.
- **Hero con slot de media real**: `.hero-bg-media` + `<video>` listo para el
  asset (video/imagen) que Garett genera aparte — con fallback en gradiente
  CSS si el archivo no está. Ojo: los primeros intentos de asset generado
  (schematic PNG, video "frosted sphere") salieron con alucinaciones de IA
  (texto de leyenda inventado, dominio falso, UI fabricada) — verificar
  siempre el frame/imagen antes de usarlo, no asumir que un asset generado
  sirve tal cual.
- **Tipografía**: Big Shoulders Display (condensada industrial, mayúsculas)
  para títulos display — reemplaza Anton y el experimento editorial-Inter del
  17 jul. Inter para texto de lectura y subtítulos (`.d3`). JetBrains Mono
  para labels/código/precios.
- **Iconos**: geométricos/angulares (líneas rectas, sin curvas) — chat,
  monitor, cohete, hoja, candado del portal y GitHub/WhatsApp rediseñados sin
  arcos ni círculos donde antes los había. Excepción: chrome decorativo no-icono
  (dots de estado, avatares, botón flotante de WhatsApp) se queda circular —
  es convención de UI, no parte del sistema de iconos.
- **Kickers de sección**: eliminados de todas las secciones (`// Servicios`,
  `// Portafolio`, etc.) — el propio PRODUCT.md ya los prohibía como AI-scaffold
  y el código los tenía igual; queda solo título + párrafo por sección, sin
  repetir el mismo patrón en cada una.
- **Header**: barra de contacto (email + WhatsApp + GitHub) no-fija arriba del
  nav, visible solo en el tope de página (≥700px).
- **Footer**: 4 columnas — marca+contacto, navegación, legal, redes (GitHub/
  WhatsApp/email) — reemplaza el footer de una sola fila.

## Accessibility & Inclusion

WCAG AA mínimo. Contraste ≥4.5:1 en texto body. Reducción de movimiento respetada con `prefers-reduced-motion`. Español como idioma principal del sitio.
