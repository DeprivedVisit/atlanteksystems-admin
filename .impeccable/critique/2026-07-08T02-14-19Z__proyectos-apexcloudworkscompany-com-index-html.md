---
target: apexcloudworkscompany.com live (index.html)
total_score: 22
p0_count: 2
p1_count: 3
timestamp: 2026-07-08T02-14-19Z
slug: proyectos-apexcloudworkscompany-com-index-html
---
# Critique — apexcloudworkscompany.com (live) · 07 jul 2026

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Form feedback y estados del IDE bien; qué es clickeable en el simulador es ambiguo |
| 2 | Match System / Real World | 1 | Audiencia = dueños de negocio NO técnicos; primer fold = IDE completo con file tree, tabs y jerga dev |
| 3 | User Control and Freedom | 1 | Sin nav en la página madre — al pasar el hero no hay forma de saltar a secciones hasta el footer |
| 4 | Consistency and Standards | 2 | Doble IA (secciones vs archivos .md del simulador) · emojis vs SVGs · "48–72h" (FAQ) vs "3–5 días" (card Starter) |
| 5 | Error Prevention | 2 | Campo "WhatsApp o Email" type=text sin validación de formato, sin inputmode |
| 6 | Recognition Rather Than Recall | 2 | Precios/FAQ/Portafolio requieren descubrir la metáfora de archivos; breadcrumb "Precios" NO lleva a la sección de precios |
| 7 | Flexibility and Efficiency | 3 | WhatsApp directo en todos los CTAs = buen acelerador |
| 8 | Aesthetic and Minimalist Design | 2 | Secciones limpias (Precios fuerte), pero: cursor glow + scroll bar + toast + bots caminando + 8 tabs abiertos = acumulación de gadgets |
| 9 | Error Recovery | 3 | Mensajes de error claros + fallback a WhatsApp |
| 10 | Help and Documentation | 3 | FAQ sólido, accesible, con schema |
| **Total** | | **22/40** | **Acceptable — mejoras significativas antes de que convierta** |

## Anti-Patterns Verdict

**LLM assessment:** El simulador IDE es genuinamente distintivo — nadie diría "AI made that" del concepto. Pero los tells están en los detalles: 13 em-dashes en el copy, eyebrows `// KICKER` en las 7 secciones (sistema declarado en PRODUCT.md, pero la cadencia es idéntica en todas), tarjetas de servicio numeradas "01 / 03", emojis como íconos (📋🤖⚙️🚀⚡💬🔐), y una sección de testimonios con 5 estrellas sin testimonio real.

**Deterministic scan:** 5 hallazgos — `em-dash-overuse` (13, real), `numbered-section-markers` (01–05 en proceso = secuencia legítima, "01 / 03" en servicios = scaffold), `single-font` ×2 (falso positivo: Inter y JetBrains Mono cargan vía CSS).

**Browser evidence:** Playwright headless (sin overlay visible al usuario). Hallazgo crítico del render: **desktop-full y mobile-full muestran la página entera en negro** debajo del hero — `.reveal { opacity:0 }` gatea todo el contenido a IntersectionObserver. En headless/crawlers/JS-fail la página es un void de ~7,000–9,800px con solo hero y footer.

## Overall Impression

El concepto (IDE-simulador como identidad) es la parte más valiosa y más arriesgada del sitio. Está ejecutado con un nivel de detalle real — pero está optimizado para impresionar a otro developer, no para convertir a un dueño de pyme de Cartago que "decide en la primera impresión". El primer fold no dice qué vendés, cuánto cuesta, ni por qué confiar. Y la sección de testimonios, tal como está, resta confianza en vez de sumarla.

## What's Working

1. **Precios** — la mejor sección del sitio: 3 tiers claros, USD visible, jerarquía correcta, card destacada con borde dorado. Nivel profesional real.
2. **Sistema de diseño** — tokens.css v3.0 unificado, paleta acero+oro consistente, contraste corregido (--text3 documentado), z-index semántico. Base técnica sólida.
3. **SEO técnico head** — Schema LocalBusiness + FAQ + OfferCatalog, OG completo, canonical, sitemap/robots. Mejor que el 90% de sitios de agencias locales.

## Priority Issues

- **[P0] El primer fold no comunica nada de negocio.** Desktop 1440px: menú File/Edit, file tree, 8 tabs, un panel "Portada.md" con texto meta y un carrusel casi vacío. El único CTA es un chip "▶ Cotizar". Mobile: File/Edit/Selection (muertos) + tab Precios.md + carrusel. **Why:** la audiencia definida no es técnica y decide en la primera impresión; hoy la primera impresión es "esto es una herramienta de programador", no "esta agencia me hace mi página". **Fix:** el simulador se queda como identidad, pero el primer fold necesita una capa de propuesta de valor: headline real (qué + para quién + CTA) sobre/antes del IDE — la vista Portada.md debería SER eso en vez del texto meta actual. `/impeccable shape hero`

- **[P0] Testimonios con 5 estrellas fabricadas.** "Qué dicen nuestros clientes" → ★★★★★ → una cita que no es de un cliente ("El cotizador está en construcción activa — la meta es...") de un proyecto EN DEV. **Why:** es el patrón exacto de review falsa; un visitante escéptico lo detecta en 2 segundos y contamina la credibilidad de TODO lo demás (incluye el "sin relleno" del subtítulo). **Fix:** eliminar las estrellas y la sección hasta tener 1 quote real (Skindoctors/EcoPollo), o renombrar honestamente a "En construcción ahora" como status board, sin formato de testimonio. `/impeccable clarify testimonios`

- **[P1] Todo el contenido gateado por `.reveal`** (style.css:472). Página negra bajo el hero en headless render, crawlers que no ejecuten IO, y si script.js falla. **Fix:** contenido visible por defecto; animar solo con `html.js` + IO disponible, respetando reduced-motion. `/impeccable harden`

- **[P1] Sin navegación + dos arquitecturas de información compitiendo.** La página madre no tiene nav (el JS de `.nav-links` apunta a un nav que no existe en el HTML). El breadcrumb del iframe mezcla modelos: "Proceso/Servicios" scrollean la página madre, "Portafolio/Precios/FAQ/Nosotros" abren archivos DENTRO del simulador — mismo contenido, dos lugares, comportamiento impredecible. **Fix:** nav fija real que aparezca al salir del hero; breadcrumb navega SIEMPRE a secciones de la página; los .md del simulador quedan como easter egg, no como ruta principal. `/impeccable shape navegacion`

- **[P1] Portafolio dice "proyectos reales, resultados medibles" y muestra 1 card EN DEV sin imagen** (un SVG de llama). Mientras tanto Skindoctors tiene 2 landings LIVE en producción con sistema de leads funcionando que no aparecen. La card "Sobre mí" dice "6+ Proyectos" — el portafolio muestra 1. **Fix:** agregar Melasblock y CBD Balance con screenshots reales; es el quick win de credibilidad más barato del sitio. (Contenido, no comando.)

## Persona Red Flags

**Jordan (dueño de pyme, primera vez — LA audiencia según PRODUCT.md):** Aterriza y ve un editor de código. No sabe qué es Apex, qué vende, ni dónde clickear — "Explorer: APEX-C...", "README.md", "restaurant-workflow..." es ruido total. El chip "Cotizar" es el elemento más pequeño de la barra. Si scrollea, encuentra contenido (bueno), pero nada en el primer fold lo invita a scrollear. Abandono probable antes de los 10 segundos.

**Casey (mobile, una mano, apurado):** Barra de menú File/Edit/Selection que no hace nada ocupa el top del viewport. El breadcrumb de navegación no está visible. El botón flotante verde de WhatsApp parece widget de chat genérico (emoji 💬). El formulario está al fondo de ~9,800px de página. Salvación: el chip Cotizar arriba a la izquierda sí va a WhatsApp.

**Riley (stress tester):** Click en "Precios" del breadcrumb → NO va a precios de la página, abre un archivo en el IDE con la misma info en otro formato. "Crear cuenta gratis" del toast → portal de login sin registro visible = promesa rota. Status "ANTHROPIC · ONLINE" = fabricado. Card Starter "3–5 días" vs FAQ "48–72h" en la misma página. HTML inválido: `.claude-toast` div nunca se cierra (los walking-avatars quedan dentro del toast).

## Minor Observations

- Sin `<h1>` en toda la página madre (todas las secciones usan h2) — SEO básico.
- Emojis como íconos por todos lados — inconsistente con los SVGs finos del IDE, renderiza distinto por OS, y choca con "Serio · Técnico · Confiable".
- Inline styles en index.html (`style="margin-top:12px..."`) — viola la regla propia de archivos separados.
- Los bots caminantes Claude/Gemini: encanto real, pero ¿por qué Gemini con branding azul de Google en el sitio de Apex? Ruido de marca.
- Tabs de relleno en el IDE ("restaurant-workflow...", "ai-phon...") suman carga cognitiva sin payoff.
- Foto real de Garett sigue pendiente ("GB" placeholder) — para venta local personal, la cara es conversión.
- iframe hero sin `loading` hint ni fallback `<noscript>`; el skip-link lleva al main cuyo primer contenido ES el iframe.

## Questions to Consider

- ¿Qué pasaría si "Portada.md" fuera la landing entera en miniatura — headline, precio desde $350, 2 CTAs — y el IDE solo el marco?
- ¿El visitante que llega por referido de WhatsApp necesita el simulador... o necesita ver la landing de Skindoctors funcionando y el precio?
- ¿Qué versión de esta página cierra al Tío Michael en 30 segundos?
