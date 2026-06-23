# Auditoría Completa — apexcloudworkscompany.com
> Fecha: 23 Jun 2026 | Viewport desktop: 1440×900 | Mobile: 390×844

---

## 🔴 BUGS CRÍTICOS

### 1. Error de canvas — `createRadialGradient non-finite`
- **Dónde:** Process background canvas (JS)
- **Qué pasa:** Cuando el canvas tiene tamaño 0 en init, `stagePos()` retorna NaN y falla `createRadialGradient`
- **Fix:** Agregar guard `if(!W || !H) return` al inicio de `draw()`

### 2. Gradient en títulos de sección — se ve roto
- **Dónde:** `.sec-h2` — "Servicios", "Portafolio", "Precios"
- **Qué pasa:** El gradient `cream → amber → purple` hace que la última sílaba se vea morada. En "Servi**cios**" parece un bug de renderizado, no un efecto intencional.
- **Fix:** Reducir el purple en el gradient o acortarlo para que no llegue al final del texto en títulos cortos.

### 3. Journey rail CLIENTE siempre visible arriba
- **Dónde:** `.sj` fixed a la izquierda
- **Qué pasa:** El nodo CLIENTE (py: 0.14 del viewport) siempre aparece en el top-left incluso antes de que el rail esté "visible". El label "CLIENTE / WhatsApp · Email" aparece en la misma zona que el label de sección "SIMPLE Y DIRECTO" → colisión visual.
- **Fix:** Ocultar completamente el rail cuando `scrollY < 200`, o mover CLIENTE fuera del viewport inicial.

---

## 🟡 PROBLEMAS VISUALES

### 4. Demasiado espacio vacío entre secciones
- **Entre Servicios y Portafolio:** ~400px de negro vacío. El pipeline del proceso background llena ese espacio pero visualmente se siente hueco.
- **Fix:** Reducir `padding: 96px 0` a `72px 0` en `.sec` para desktop.

### 5. Labels del process background colisionan con contenido
- **Qué pasa:** "DISEÑO · Paleta · Tipografía" aparece encima del texto del hero sub y del eyebrow. Los labels del canvas (z-index 0) están detrás del contenido pero en ciertas zonas son tan brillantes que compiten visualmente.
- **Fix:** Reducir opacidad de los labels del canvas a 0.55 (actualmente muy brillantes con `opacity: labelA`).

### 6. Espacio muerto debajo del hero (HP bars)
- Las barras de HP quedan cortadas en el viewport inicial — el usuario no sabe que hay más abajo.
- El "VER PORTAFOLIO" button no tiene suficiente contraste con el fondo oscuro.

### 7. Sección "Servicios" — icons muy grandes para el espacio
- Los iconos emoji (🌐 ⚡ 🤖) en `srv-icon` tienen 48×48px y el `srv-top` tiene 130px de altura — demasiado aire para muy poco contenido.

---

## 🔵 PROBLEMAS DE CONTENIDO

### 8. Copy todavía orientado a venta, no a identidad personal
Esto es el proyecto personal de Apex — no una landing de conversión pura.

| Sección actual | Problema | Propuesta |
|---|---|---|
| "Cómo empezamos" | Suena a proceso de ventas | Renombrar a algo que refleje la filosofía de trabajo |
| "Servicios" | Lista de precios de catálogo | Mostrar lo que hacés, no lo que vendés |
| "SELECT YOUR CHARACTER" | Meme de precios | OK si se replantea como identidad personal |
| Hero sub: "De tu idea a producción" | Pitch de vendedor | Algo más honesto / personal |
| "INICIAR PROYECTO →" | CTA de landing | Reemplazar por algo con más carácter |

### 9. Foto real ausente
- El avatar es un emoji 👨‍💻
- Bloqueante para credibilidad cuando esto escale
- **Pendiente:** foto real de Garett para `about-card-img`

### 10. Portafolio muy genérico
- Los cards muestran el proyecto pero no el proceso, los aprendizajes, ni los problemas resueltos
- Si esto es el cuartel general personal, el portafolio debería ser más narrativo: qué rompí, qué aprendí, qué orgullosamente resolví

### 11. Falta sección de filosofía / forma de pensar
- ¿Qué hace diferente a Garett de una agencia? No está articulado.
- El "Una persona. Resultados de agencia." es un claim sin soporte narrativo detrás.

---

## 🟢 LO QUE FUNCIONA BIEN

| Elemento | Estado |
|---|---|
| 3D dodecahedron + torus detrás de las cards | ✅ Impactante, único |
| Process background canvas CLIENTE→LIVE | ✅ Narrativo, diferenciador |
| Glassmorphism en cards | ✅ Consistente, con profundidad |
| Colores gold + cyan + purple glow | ✅ Identidad clara |
| Tipografía Chakra Petch en labels | ✅ Techy, diferenciado |
| Hero h1 ARQUI/TECTO/DIGITAL | ✅ Memorable |
| Mobile responsive | ✅ Funciona bien |
| Journey rail lateral | ✅ Buen concepto, necesita ajuste de posición |
| Footer | ✅ Limpio y completo |
| Scroll reveal + contadores | ✅ Sutiles, no distraen |
| CTA "Hablemos de tu proyecto" | ✅ Directo |

---

## 📋 PRIORIDADES DE FIX

### Prioridad 1 — Bugs (hacer ahora)
- [ ] Fix `createRadialGradient` guard en process canvas
- [ ] Fix gradient de sec-h2 (reducir purple)
- [ ] Fix journey rail CLIENTE visible antes del scroll

### Prioridad 2 — Visual (esta semana)
- [ ] Reducir padding entre secciones
- [ ] Bajar opacidad labels del canvas
- [ ] Ajustar srv-top — menos altura

### Prioridad 3 — Identidad personal (próxima sesión)
- [ ] Repensar copy del hero desde "proyecto personal" no "landing"
- [ ] Sección nueva: filosofía / forma de trabajar
- [ ] Portafolio más narrativo — historia de cada proyecto
- [ ] Foto real de Garett

### Prioridad 4 — Contenido futuro
- [ ] Blog / bitácora de aprendizajes (JS, AWS, proyectos)
- [ ] Modo "cuartel general" vs modo "cliente" (toggle)
- [ ] Stats reales conectados a Google Sheets / admin

---

## 📐 MÉTRICAS TÉCNICAS

| Métrica | Valor | Estado |
|---|---|---|
| Peso HTML | ~110 KB | ⚠️ Alto (CSS inline + JS inline) |
| Canvases activos | 3 (process + particles + 3D Three.js) | ⚠️ Puede pesar en mobile |
| Errores de consola | 1 (createRadialGradient) | 🔴 Fix urgente |
| Warnings de consola | 0 | ✅ |
| Mobile responsive | ✅ Funciona | ✅ |
| Three.js CDN | r134 (no SRI hash) | ⚠️ Agregar integrity hash |
| Fonts cargadas | 5 familias (Unbounded, Chakra Petch, Share Tech Mono, Press Start 2P, DM Sans) | ⚠️ Muchas — consolidar |

---

## 🎯 VISIÓN: DE LANDING A CUARTEL GENERAL

Dado que este es el proyecto personal de Apex, las próximas versiones deberían moverse hacia:

1. **Identidad, no conversión** — Menos "contactame", más "esto soy"
2. **Proceso visible** — El canvas del background ya lo dice — llevarlo al contenido también
3. **Bitácora real** — Los proyectos como historia, no como catálogo
4. **Interactividad genuina** — El 3D y el scroll journey son el comienzo; el contenido tiene que estar al nivel
5. **Una sección que solo podría existir en este sitio** — Algo que ninguna agencia haría pero Garett sí
