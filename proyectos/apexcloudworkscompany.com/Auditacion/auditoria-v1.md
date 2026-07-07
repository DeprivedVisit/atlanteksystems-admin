# Auditoría Senior — Apex Cloud Works
> **Proyecto:** `apexcloudworkcompany.com`  
> **Fecha:** 25 junio 2026 · **Versión:** 1.0  
> **Auditor:** Claude Sonnet 4.6 — Rol: Senior Web Auditor  
> **Archivos analizados:** `index.html`, `style.css` (~1870 líneas), `script.js` (~280 líneas), `admin.html`, `portal/`, `Seguridad/`, `Legal/`

---

## 1. Accesibilidad (WCAG 2.1 AA)

| Criterio | Estado | Detalle |
|---|---|---|
| `lang` en `<html>` | ✅ | `lang="es"` correcto |
| `<title>` descriptivo | ✅ | "Apex Cloudworks — Sistemas web en AWS · Cartago, CR" |
| `alt` en imágenes `<img>` | ✅ | Logo `.nav-logo-img` tiene `alt="Apex Cloud Works"` |
| Imágenes de portafolio accesibles | ❌ | `.pf-cover` usa `background-image` CSS → invisibles para screen readers. Usar `<img>` con `alt`. |
| Contraste texto principal `--text` | ✅ | `#E8E8F2` sobre `#0C0C14` → ratio ~14:1 ✅ |
| Contraste texto secundario `--text2` | ❌ | `#7B7B96` sobre `#0C0C14` → ratio ~3.8:1 · falla WCAG AA (mínimo 4.5:1) |
| Contraste texto apagado `--text3` | ❌ | `#42425A` sobre dark → ratio ~2.4:1 · falla gravemente |
| `aria-expanded` en accordions | ✅ | Proceso y FAQ lo implementan correctamente |
| `aria-label` en hamburger | ✅ | `aria-label="Abrir menú"` presente |
| `aria-hidden` en decorativos | ✅ | VS Code bg, SVG decorativos ocultos correctamente |
| Skip-to-content link | ❌ | No existe. Crítico para usuarios de teclado |
| `role` en listas nav | ✅ | `role="list"` en nav-links |
| Indicador de foco visible | ❌ | El nav activo se establece solo con `a.style.color` vía JS, sin borde/outline de foco visible |
| Formularios con `<label>` | ⚠️ | Calculadora usa labels pero sin atributo `for` explícito vinculado a `id` del input |
| `prefers-reduced-motion` | ⚠️ | CSS lo respeta para avatares flotantes, pero el código JS de la animación de typing corre igual |
| Botones con texto accesible | ✅ | Todos los `<button>` tienen texto o `aria-label` |
| Contraste botón primario | ✅ | Texto `#0C0C14` sobre `#DA7756` → ratio ~5.2:1 ✅ |
| `dialog` / ARIA para modal | ❌ | El Claude toast usa `role="dialog"` ✅ pero no trapa el foco dentro |

**Prioridad inmediata:** corregir `--text2` y `--text3` a valores de mayor contraste.

---

## 2. Performance Frontend

| Problema | Impacto | Solución propuesta |
|---|---|---|
| Google Fonts carga 3 familias en un solo request bloqueante | Alto — retrasa First Contentful Paint | Añadir `font-display: optional` o `swap` + preload del subset crítico |
| `style.css` monolítico de ~1870 líneas sin split | Alto — todo el CSS se carga en la primera visita | Separar en `base.css`, `components.css`, `sections.css`; cargar `above-fold` inline |
| Código JS muerto: sistema de partículas (líneas 6–67 de `script.js`) | Medio — ejecuta un IIFE y busca `#particles-bg` que ya no existe | Eliminar el bloque completo (~60 líneas) |
| Código JS muerto: Scroll Gallery (líneas 99–147) | Medio — itera querySelectorAll de elementos inexistentes en cada scroll | Eliminar el bloque o refactorizar |
| Imágenes de portafolio Unsplash a 3840px | Medio — pesa 400–800 KB por imagen · no lazy loading | Usar `srcset` con tamaños 800w/1600w + `loading="lazy"` en `<img>` |
| Sin minificación CSS/JS en producción | Medio — CSS cru son ~55 KB, minificado ~30 KB | Agregar script de build: `esbuild` o `npx lightningcss` |
| `.vsc-code-area` con ~30 `<div>` de texto anidado renderizando siempre | Bajo — DOM innecesariamente pesado en móvil | Ocultar `.vscode-bg` en pantallas < 768px via `display:none` |
| Sin `preload` para logo e imagen crítica | Bajo | Añadir `<link rel="preload" href="assets/img/logo.png" as="image">` |
| `requestAnimationFrame` loop en Claude typing no tiene cleanup | Bajo | Agregar `clearTimeout` al destruir o cuando el elemento sale del viewport |
| `backdrop-filter: blur(2px)` en cada `.section-dark` | Bajo — GPU cost en scroll | Reemplazar por `background: rgba(12,12,20,0.92)` sólido sin blur |

---

## 3. Seguridad

| Vulnerabilidad | Riesgo | Detalle y solución |
|---|---|---|
| Sin Content Security Policy (CSP) | 🔴 Alto | No hay header CSP. Cualquier XSS puede exfiltrar datos. Configurar en CloudFront con `default-src 'self'; script-src 'self' fonts.googleapis.com` |
| `el.innerHTML = ''` en Claude typing | 🔴 Alto | Patrón de riesgo aunque el contenido es hardcoded hoy. Si en el futuro viene de API/usuario → XSS directo. Usar `el.textContent` y crear elementos con `createElement` |
| `admin.html` sin autenticación real | 🟠 Medio | Actualmente es mock data pero está públicamente accesible. Si se conecta a Sheets debe protegerse con Cognito o password gate real |
| `onclick` inline en HTML (`onclick="toggleStep(this)"`) | 🟠 Medio | Impide CSP `strict-dynamic`. Migrar a `addEventListener` en `script.js` |
| Sin header `X-Frame-Options` | 🟠 Medio | Expuesto a clickjacking. Configurar `X-Frame-Options: SAMEORIGIN` en CloudFront response headers |
| Sin header `X-Content-Type-Options` | 🟠 Medio | Añadir `X-Content-Type-Options: nosniff` en CloudFront |
| Sin `Referrer-Policy` | 🟡 Bajo | Añadir `Referrer-Policy: strict-origin-when-cross-origin` |
| Sin `Permissions-Policy` | 🟡 Bajo | Añadir para desactivar APIs no usadas: `camera=(), microphone=(), geolocation=()` |
| Links a WhatsApp con parámetros `text=` en URL | 🟡 Bajo | El texto está hardcoded — sin riesgo actual. Validar si en el futuro se parametriza con input de usuario |
| Sin Subresource Integrity (SRI) en Google Fonts | 🟡 Bajo | Google Fonts CSS no puede llevar SRI por el CDN dinámico, pero sí el JS de Tailwind CDN si se usa: `integrity="sha384-..."` |
| `portal/index.html` sin autenticación real | 🟠 Medio | El portal de clientes debe implementar autenticación antes de mostrar datos reales |

---

## 4. Arquitectura — Árbol actual y recomendaciones

### Estado actual
```
apexcloudworkcompany.com/
├── index.html                    ← Landing principal
├── admin.html                    ← Panel interno (sin auth)
├── PRODUCT.md                    ← Contexto del skill (no debería deployarse)
├── contact-apps-script.gs        ← Apps Script suelto
├── portal-apps-script.gs         ← Apps Script suelto
├── assets/
│   ├── css/
│   │   ├── style.css             ← 1870 líneas monolíticas ⚠️
│   │   ├── admin.css
│   │   └── portal.css
│   ├── js/
│   │   ├── script.js             ← Código muerto incluido ⚠️
│   │   ├── admin.js
│   │   └── portal.js
│   └── img/
│       └── logo.png
├── Auditacion/                   ← Carpeta en español
├── Bienvenida/                   ← Carpeta en español
├── Legal/                        ← Carpeta en español
├── Seguridad/                    ← Carpeta en español
└── portal/                       ← Carpeta en inglés ⚠️ inconsistente
```

### Arquitectura recomendada
```
apexcloudworkcompany.com/
├── index.html
├── admin.html
├── 404.html                      ← FALTA · necesario para CloudFront
├── robots.txt                    ← FALTA
├── sitemap.xml                   ← FALTA
├── assets/
│   ├── css/
│   │   ├── base.css              ← Reset, tokens, tipografía
│   │   ├── components.css        ← Botones, chips, pills, cards
│   │   ├── layout.css            ← Nav, hero, sections, footer
│   │   ├── admin.css
│   │   └── portal.css
│   ├── js/
│   │   ├── main.js               ← Solo lo necesario para index
│   │   ├── admin.js
│   │   └── portal.js
│   └── img/
│       ├── logo.png
│       └── og-image.jpg          ← FALTA · para Open Graph
├── legal/                        ← Normalizar a minúscula
│   ├── terminos.html
│   └── privacidad.html
└── portal/
    └── index.html
```

**Regla de nombrado:** usar todo en minúscula y snake_case o kebab-case para carpetas. Eliminar carpetas con mayúscula inicial.

---

## 5. CSS/JS — Antes / Después

### 5.1 Contraste insuficiente

**Antes:**
```css
--text2: #7B7B96;   /* ratio 3.8:1 — falla AA */
--text3: #42425A;   /* ratio 2.4:1 — falla AA */
```

**Después:**
```css
--text2: #9494B0;   /* ratio 4.6:1 — aprueba AA */
--text3: #68688A;   /* ratio 3.2:1 — aprueba AA para texto grande */
```

### 5.2 Código muerto — partículas

**Antes:** 62 líneas de IIFE que buscan `#particles-bg` eliminado.

**Después:** Eliminar líneas 6–67 de `script.js`. Ahorro: ~2 KB de JS procesado en cada carga.

### 5.3 `onclick` inline → `addEventListener`

**Antes (HTML):**
```html
<button class="proc-btn" onclick="toggleStep(this)" aria-expanded="true">
```

**Después (HTML):**
```html
<button class="proc-btn" aria-expanded="true">
```

**Después (script.js):**
```js
document.querySelectorAll('.proc-btn').forEach(btn => {
  btn.addEventListener('click', () => toggleStep(btn));
});
```

### 5.4 CSS `section-light` overrides — código muerto

Las reglas `.section-light .srv-card { background: #ffffff; }` y similares (líneas ~1202–1232, ~1393–1443) ya no aplican porque `section-light` fue convertida a dark. Son ~150 líneas eliminables.

### 5.5 Imágenes de portafolio inaccesibles

**Antes:**
```html
<div class="pf-cover" style="background-image:url('https://images.unsplash.com/...')">
```

**Después:**
```html
<div class="pf-cover">
  <img src="https://images.unsplash.com/..." 
       alt="Pantalla de skincare con formulario de leads activo — Skindoctors CR"
       loading="lazy" width="800" height="200">
</div>
```

### 5.6 Variable de nombre engañoso

**Antes:** `--gold: #DA7756` (naranja, no dorado)

**Después:** `--accent: #DA7756` · `--accent2: #F0956E` — nombre semántico correcto. Actualizar todas las referencias.

---

## 6. UX/UI

| Aspecto evaluado | Estado actual | Recomendación |
|---|---|---|
| Hero visual | ✅ VS Code bg + avatar Claude + métricas | Agregar foto real de Garett en alguna sección para humanizar |
| CTA principal | ⚠️ "Iniciar proyecto →" lleva a WhatsApp | Considerar un formulario inline de contacto rápido para capturar leads sin depender de WhatsApp |
| Sección de contacto final | ❌ Es el "Portal Welcome" — confuso para visitante nuevo | Crear un CTA de conversión final claro: "¿Hablamos?" con WhatsApp + email visible |
| Calculadora de precios | ✅ Diferenciador clave | Hacer la calculadora accesible sin cuenta (el incentivo debería ser guardar el resultado, no ver la calculadora) |
| Navegación mega-dropdown | ⚠️ Los emojis (🎨⚡🔐) se ven genéricos | Reemplazar emojis por iconos SVG consistentes con el sistema de diseño |
| Mobile nav | ✅ Existe y es funcional | Agregar animación de cierre más suave (actualmente es abrupto) |
| FAQ | ✅ Accordion bien implementado | Considerar añadir schema.org FAQPage para SEO |
| Portafolio | ⚠️ 3 proyectos — suficiente para ahora | Añadir caso de estudio con métricas: "Melasblock: 47 leads en primer mes" |
| Sección Resultados | ❌ Los números son estimados/bajos (2 N8N, 71+ leads) | Si son reales, documentarlos con fuente; si son proyecciones, etiquetarlos |
| Precios | ✅ Claros y en USD | Agregar comparación visual: "¿Por qué no un hosting normal?" al lado del precio de AWS |
| Proceso (accordion) | ✅ Visual y funcional | Los mocks de WhatsApp/terminal dentro son el punto más fuerte — destacarlos más |
| Scroll experience | ✅ VS Code cambia por sección | En móvil el VS Code no es visible — la experiencia cae significativamente |

---

## 7. SEO Técnico

| Elemento SEO | Estado actual | Acción recomendada |
|---|---|---|
| `<title>` | ✅ Descriptivo con keyword principal | Agregar ciudad: "Apex Cloud Works — Landing Pages en AWS · Cartago Costa Rica" |
| `meta description` | ✅ Presente | Mejorar con CTA: "…Cotización en 24h. Hablá por WhatsApp." |
| `og:title` | ✅ Presente | — |
| `og:description` | ✅ Presente | — |
| `og:image` | ❌ FALTA | Crear `assets/img/og-image.jpg` 1200x630px con logo + tagline. **Crítico para compartir en redes.** |
| `og:url` | ❌ FALTA | Añadir `<meta property="og:url" content="https://apexcloudworkcompany.com/">` |
| `og:type` | ❌ FALTA | Añadir `<meta property="og:type" content="website">` |
| Twitter Card | ❌ FALTA | Añadir `twitter:card`, `twitter:title`, `twitter:image` |
| `canonical` URL | ❌ FALTA | `<link rel="canonical" href="https://apexcloudworkcompany.com/">` |
| `robots.txt` | ❌ FALTA | Crear con: `User-agent: * / Allow: / / Disallow: /admin.html / Disallow: /portal/` |
| `sitemap.xml` | ❌ FALTA | Crear con las páginas principales. Subir a S3 y registrar en Google Search Console |
| Schema.org `LocalBusiness` | ❌ FALTA | Agregar JSON-LD con nombre, dirección (Cartago CR), teléfono, servicios |
| Schema.org `FAQPage` | ❌ FALTA | La sección FAQ es candidata ideal. Mejora presencia en Google con rich snippets |
| Estructura H1→H2→H3 | ⚠️ | `<h1>` existe pero visual vía clase `.d1`. Los `h2` en secciones son correctos. Verificar que no haya secciones sin heading visible |
| Imágenes indexables | ❌ | Las imágenes de portafolio son CSS `background-image` — Google no las indexa. Migrar a `<img>` |
| `loading="lazy"` | ❌ | Ninguna imagen `<img>` lo implementa aún |
| Core Web Vitals — LCP | ⚠️ | El hero pesa por las fuentes + VS Code DOM. Riesgo de LCP > 2.5s |
| Core Web Vitals — CLS | ⚠️ | Las fuentes sin `font-display:swap` pueden causar layout shift al cargar |

---

## 8. Responsividad Mobile-First

### Móvil (< 480px)
- ❌ `.vscode-bg` se renderiza igual en móvil consumiendo memoria/CPU sin beneficio visual (el usuario no lo ve)
- ❌ El mega-dropdown del nav no aplica en móvil pero el botón "Explorar" no se oculta correctamente en todos los breakpoints
- ❌ La calculadora: los botones `.calc-type-btn` tienen contenido (icono + texto + precio) que puede quedar muy apretado en pantallas < 360px
- ⚠️ `.hero-metrics` grid de 3 columnas puede quedar estrecho en < 360px
- ✅ Mobile nav funcional y con CTA visible

### Tablet (768px — 1024px)
- ⚠️ `proc-content` cambia a 2 columnas en 768px — en tablet puede quedar muy justo el visual mock de la derecha
- ✅ `.pf-grid` cambia a 2 columnas correctamente
- ❌ `.claude-card` solo aparece desde 1024px — en tablet el hero queda con mucho espacio vacío a la derecha

### Desktop (> 1024px)
- ✅ Layout en 2 columnas del hero funciona bien
- ✅ El VS Code background es visible y efectivo
- ⚠️ En pantallas muy anchas (> 1440px) el `.wrap` (max 1120px) deja mucho VS Code visible en los bordes, lo que puede verse bien o confuso según el zoom

**Fix inmediato para móvil:**
```css
@media (max-width: 767px) {
  .vscode-bg { display: none; }
  .claude-floats { display: none; }
}
```

---

## 9. AWS

| Servicio | Problema detectado | Optimización sugerida |
|---|---|---|
| **S3** | Sin versioning habilitado | Activar S3 Versioning para rollback de deployments. Costo mínimo. |
| **S3** | Sin access logging configurado | Habilitar server access logging hacia un bucket separado `apex-logs/` |
| **S3** | `PRODUCT.md` y archivos `.gs` podrían estar en el bucket | Agregar `.s3ignore` o regla en deploy para excluir archivos internos |
| **CloudFront** | Sin custom error pages | Configurar `404 → /404.html` y `403 → /index.html` en CloudFront Error Pages |
| **CloudFront** | Sin security response headers | Añadir CloudFront Response Headers Policy con: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| **CloudFront** | Cache behavior no diferencia assets de HTML | Configurar: `*.html` → cache 1h · `assets/*` → cache 365d + invalidación en deploy |
| **CloudFront** | Sin WAF asociado | Para stage de producción con clientes reales, asociar AWS WAF básico (Rate limiting + SQL injection rules) |
| **Route 53** | Health check no configurado | Agregar Route 53 Health Check al endpoint CloudFront para alertas de downtime |
| **ACM** | Sin monitoreo de renovación | Configurar CloudWatch alarm en `DaysToExpiry < 30` para el certificado SSL |
| **IAM** | Permisos del usuario de deploy | Verificar que el usuario CLI use política least-privilege: solo `s3:PutObject`, `s3:DeleteObject`, `cloudfront:CreateInvalidation` en los recursos específicos |

---

## 10. Mantenibilidad

### 🔴 Alta prioridad
1. **Eliminar código JS muerto** (partículas + scroll-gallery): ~120 líneas que se ejecutan en cada carga sin efecto
2. **Remover `onclick` inline** del HTML y migrar a `addEventListener`: bloquea CSP y dificulta testing
3. **Crear `404.html`**: CloudFront devuelve XML de S3 en rutas inválidas — muy mala UX
4. **Crear `robots.txt` y `sitemap.xml`**: el sitio no es rastreable eficientemente por Google

### 🟠 Media prioridad
5. **Separar `style.css` en módulos**: `base.css` + `components.css` + `sections.css` + `vscode-theme.css`
6. **Eliminar overrides `.section-light`**: ~150 líneas de CSS que ya no aplican (sección convertida a dark)
7. **Renombrar `--gold` → `--accent`**: la variable se llama "gold" pero es naranja (#DA7756) — confusión futura
8. **Añadir `og:image`**: impide compartir en redes con preview visual — crítico para marketing
9. **Corregir contraste `--text2` y `--text3`**: WCAG AA mínimo para accesibilidad real

### 🟡 Baja prioridad
10. **Agregar un script de build simple**: `package.json` con `"build": "npx lightningcss style.css -o style.min.css && npx uglify-js script.js -o script.min.js"` — reduce 30–40% de tamaño
11. **Normalizar nombrado de carpetas**: todo en minúscula (`legal/`, `portal/`, `auditacion/`)
12. **Documentar el proceso de deploy**: agregar `DEPLOY.md` con los comandos exactos de S3 + CloudFront invalidation
13. **Crear `CONTRIBUTING.md` o `README.md`**: para cuando Garett tenga colaboradores
14. **Mover `.gs` files fuera del bucket**: los Apps Script no deben estar en S3

---

## 11. Design System

| Elemento | Estado actual | Corrección sugerida |
|---|---|---|
| Nombre del token de acento | `--gold: #DA7756` — nombre incorrecto | Renombrar a `--accent` y `--accent2` para claridad semántica |
| Fuentes cargadas | Space Grotesk, Inter, JetBrains Mono — Inter apenas se usa activamente | Eliminar Inter del load si no se usa; usa Space Grotesk como fallback |
| Variantes de botones | `btn-gold`, `btn-ghost`, `btn-full`, `btn-sm` — bien definidas | Renombrar `btn-gold` → `btn-primary` para consistencia |
| `.section-light` | Convertida a dark pero mantiene 150 líneas de overrides para blanco | Eliminar todo el bloque `.section-light .srv-card` y similares |
| Proceso `.proc-num` | `-webkit-text-stroke: 1px var(--gold)` — solo prefijo webkit | Añadir `text-stroke: 1px var(--gold)` estándar |
| Claude card vs VS Code bg | `#1A1A2E` hardcoded en card, `#0C0C14` en token — inconsistente | Añadir token `--claude-bg: #1A1A2E` al `:root` |
| Fuentes del VS Code bg | `#1E1E2E`, `#0E0E16`, `#16161f` hardcoded | Crear tokens `--vsc-bg`, `--vsc-surface`, `--vsc-titlebar` |
| Spacing scale | No existe — todo usa valores ad-hoc (24px, 28px, 32px, 36px) | Definir escala: `--sp-1: 4px` hasta `--sp-16: 64px` |
| Bordes redondeados | Mezcla de 4px, 6px, 8px, 10px, 12px, 14px, 16px sin sistema | Definir 3 radios: `--r-sm: 6px`, `--r-md: 10px`, `--r-lg: 14px` |
| z-index | Valores sueltos (990, 997, 998, 999) sin escala semántica | Crear `--z-toast: 90`, `--z-overlay: 97`, `--z-dropdown: 98`, `--z-nav: 99` |
| Animaciones | Mix de `0.2s ease`, `0.3s`, `0.4s cubic-bezier(...)` inconsistente | Centralizar: `--transition-fast: 0.15s ease`, `--transition-base: 0.25s ease`, `--transition-spring: 0.4s cubic-bezier(0.16,1,0.3,1)` |

---

## Resumen ejecutivo

| Área | Score | Estado |
|---|---|---|
| Accesibilidad | 6/10 | Contraste de textos secundarios falla WCAG AA |
| Performance | 5/10 | Código muerto, sin minificación, sin lazy loading |
| Seguridad | 5/10 | Sin CSP, `innerHTML` de riesgo, admin sin auth |
| Arquitectura | 7/10 | Bien separado pero sin 404, robots, sitemap |
| CSS/JS | 6/10 | 1870 líneas monolíticas, 150 líneas muertas, código muerto en JS |
| UX/UI | 8/10 | Visualmente fuerte, héroe impactante, flujo de conversión mejorable |
| SEO Técnico | 4/10 | Sin og:image, sitemap, robots, structured data |
| Responsividad | 7/10 | Mobile-first sólido; VS Code bg consume recursos innecesariamente en móvil |
| AWS | 7/10 | Stack sólido; falta WAF, error pages, security headers en CloudFront |
| Mantenibilidad | 6/10 | Código muerto acumulado, inline handlers, sin build process |
| Design System | 6/10 | Tokens bien definidos pero naming inconsistente, sin escala de spacing |

**Score global: 6.5/10**

### Top 5 acciones con mayor ROI

1. 🔴 **Crear `og:image` + SEO meta tags** — impacto directo en conversión desde redes sociales
2. 🔴 **CSP headers en CloudFront** — solventa el riesgo de seguridad más crítico
3. 🔴 **Eliminar código JS muerto** — 15 min de trabajo, mejora performance real
4. 🔴 **Corregir contraste `--text2` y `--text3`** — WCAG compliance + mejor legibilidad
5. 🟠 **Crear `404.html` y `robots.txt`** — SEO y UX básicos que no pueden faltar

---

*Generado por Claude Sonnet 4.6 · Apex Cloud Works · Cartago, CR · junio 2026*
