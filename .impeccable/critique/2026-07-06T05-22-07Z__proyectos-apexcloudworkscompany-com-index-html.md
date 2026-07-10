---
target: proyectos/apexcloudworkscompany.com/index.html
total_score: 15
p0_count: 3
p1_count: 1
timestamp: 2026-07-06T05-22-07Z
slug: proyectos-apexcloudworkscompany-com-index-html
---
## Design Health Score: 15/40 — Poor (bajó desde 23/40)

| # | Heurística | Score | Problema |
|---|---|---|---|
| 1 | Visibilidad del estado | 2 | El status del IDE es teatro de un proyecto ficticio, no del contenido real |
| 2 | Coincidencia con el mundo real | 1 | Cero overlap entre "explorador de archivos de código" y el modelo mental de un dueño de PYME no técnico |
| 3 | Control del usuario | 2 | En mobile no hay forma de navegar entre archivos — sidebar y header nav desaparecen |
| 4 | Consistencia | 1 | "Soluciones rápidas" y "Portafolio" apuntan a la misma URL; footer tiene 4 links muertos (#proceso, #servicios, #trabajo, #precios ya no existen) |
| 5 | Prevención de errores | 1 | Ningún aviso antes de mandar al visitante a una pestaña nueva con una app pesada y ajena |
| 6 | Reconocer vs recordar | 1 | "Precios.md" se mezcla sin diferenciación visual con archivos ficticios (env-config.env, ai-phone-logic.js) |
| 7 | Flexibilidad | 2 | El deep-link por hash funciona (5/5 confirmado) pero es el único camino viable |
| 8 | Estética minimalista | 2 | El hero es limpio; el simulador es lo opuesto — tabs+sidebar+chat+terminal+canvas+carrusel compitiendo a la vez |
| 9 | Recuperación de errores | 1 | Sin red de seguridad si alguien no encuentra los precios |
| 10 | Ayuda/documentación | 1 | Nada en el hero avisa que un click va a abrir una IDE completa en pestaña nueva |

## Veredicto — y el hallazgo que cambia todo

**El fondo fijo NO es clickeable desde la página real, nunca.** Confirmado con `elementFromPoint` en todo el viewport, en cualquier scroll: `.hero` (transparente pero sin `pointer-events:none`) cubre el 100% del alto de página (844px de 900px totales) y bloquea cualquier click antes de que llegue al iframe. El `pointer-events:auto` que le puse al iframe nunca se activa. Esto significa que **la idea de "toda la página es interactiva a través del simulador" nunca funcionó técnicamente** — los únicos accesos reales son los links explícitos del nav que abren `background/index.html` en pestaña nueva (esos sí funcionan, 5/5 confirmado).

Además, cada archivo real (Precios.md, etc.) cae en la rama por defecto de `setEditorContent()` y se muestra junto a la animación del flujo n8n falso con cursores ficticios "Garett/Liz/Emma/Leo" arrastrando nodos de un proyecto que no existe — literalmente al lado de la frase "Construyo sistemas que operan — no demos, no mockups."

## Lo que funciona
1. El hero aislado es sólido — headline clara, trust row, dos CTAs, on-brand.
2. Los 5 archivos de contenido real están bien escritos (Testimonios.md ya arregla la contradicción que había encontrado la auditoría anterior).
3. El simulador en sí es una pieza de ingeniería genuinamente buena — solo que no debería ser la interfaz principal del negocio real.

## Problemas prioritarios

- **[P0] El fondo fijo nunca fue clickeable** — la interacción prometida no existe técnicamente. Confirmado con evidencia de navegador.
- **[P0] Mobile completamente roto** — sidebar oculto bajo 1200px, panel de chat de 330px fijo no cabe en un teléfono, menú superior se desborda. La auditoría anterior ya advertía esto del bounce en mobile; ahora es peor porque no hay ningún fallback.
- **[P0] Contenido real contaminado por la demo ficticia** — cada archivo real muestra la animación del proyecto falso al lado.
- **[P1] +1000 líneas de CSS/JS huérfano** — todo el código de servicios/portafolio/testimonios/precios/calculadora/FAQ que se borró de `index.html` sigue vivo en los archivos, apuntando a nada.
- **[P2] Links rotos en footer** (#proceso, #servicios, #trabajo, #precios ya no existen) + nav duplicado (Soluciones rápidas = Portafolio, mismo destino).
- **[P2] `prefers-reduced-motion` no existe dentro de `background/`** — animaciones y loops corren siempre, sin importar la preferencia del sistema, ahora que es fondo permanente de toda la visita.
- **[P2] Contradicción de accesibilidad** — el iframe es `aria-hidden` + `tabindex="-1"` (decorativo) pero tiene `pointer-events:auto` y estados hover (interactivo) — ninguna de las dos cosas es cierta del todo, y lectores de pantalla no tienen acceso a su contenido.

## Personas
**Jordan** (dueño de PYME real) — no ve precios/portafolio/prueba social en ningún lado visible; tiene que notar un link de nav chiquito, tolerar una pestaña nueva pesada, y confiar en que "Precios.md" en un editor de código falso es real.
**Riley** — si alguna vez pierde el hash de la URL (bookmark, tab restaurado), no hay forma visible de volver a los archivos reales — no ve el explorador de archivos.
**Casey (mobile)** — confirmado roto estructuralmente: la barra de chat de 330px + la barra de actividad no caben en un teléfono de 375-414px.
