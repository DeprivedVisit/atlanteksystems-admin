# 🎨 Design Claude — Guía de Diseño para Wilson
> Cómo Claude ejecuta diseño en Apex Cloud Work · Versión 1.0 · Junio 2026

---

## Rol de Claude en diseño

Claude no es un diseñador gráfico — es el ejecutor técnico del sistema de diseño de Apex.  
Garett da el brief, Claude produce el HTML/CSS/JS. El resultado debe ser **production-ready**, no un borrador.

**Regla de oro:** Mobile-first siempre. Si no se ve bien en iPhone SE, no está listo.

---

## Sistema de Paletas por Rubro

| Rubro | Primario | Acento | Fondo | Fuentes |
|-------|---------|--------|-------|---------|
| Alimentos | `#1b4332` | `#f4a261` | `#fefcf9` | Syne 700 + DM Sans 400 |
| Naturaleza | `#2d6a4f` | `#b5838d` | `#f8f5f0` | Playfair Display + Lato |
| Skincare | `#1a1a1a` | `#c8954a` | `#fafafa` | Cormorant Garamond + DM Mono |
| Licores | `#0a0a0f` | `#f0c040` | `#050508` | Syne + JetBrains Mono |
| Autos | `#1a1a2e` | `#e05a5a` | `#0d0d1a` | Syne + DM Mono |
| Arquitectura | `#0f0e0c` | `#b85c38` | `#080705` | Cormorant Garamond + DM Mono |
| Apex (interno) | `#060402` | `#C4956A` | `#060402` | Playfair Display + Lora + JetBrains Mono |

---

## Sistema de Tipografía

### Jerarquía base
```css
/* Heading principal */
font-size: clamp(2.5rem, 6vw, 5rem);
font-weight: 700;
line-height: 1.1;

/* Subheading */
font-size: clamp(1.2rem, 3vw, 1.8rem);
font-weight: 400;
line-height: 1.4;

/* Body */
font-size: clamp(1rem, 2vw, 1.125rem);
line-height: 1.7;

/* Caption / UI */
font-size: 0.875rem;
letter-spacing: 0.05em;
text-transform: uppercase;
```

### Carga de fuentes (Google Fonts CDN)
```html
<!-- Ejemplo Skincare -->
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Mono:wght@400&display=swap" rel="stylesheet">

<!-- Ejemplo Licores/Tech -->
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

---

## Proceso de 8 Pasos

```
1. BRIEF        → Nombre, rubro, paleta asignada, secciones requeridas
2. PALETA       → Confirmar colores + fuentes según tabla
3. SECCIONES    → Hero, Servicios, Sobre nosotros, Testimonios, Contacto, Footer
4. HTML/CSS/JS  → Producción completa, mobile-first
5. S3 PREVIEW   → Subir para revisión del cliente
6. REVISIÓN 1   → Cambios de cliente (máximo 2 rondas)
7. REVISIÓN 2   → Ajustes finales
8. DEPLOY       → CloudFront live + entrega
```

---

## Componentes obligatorios en todo sitio

### 1. WhatsApp flotante
```html
<a href="https://wa.me/50663144171?text=Hola%2C%20vi%20su%20sitio%20web..."
   class="whatsapp-float" target="_blank" aria-label="Contactar por WhatsApp">
  <svg><!-- WhatsApp icon SVG --></svg>
</a>
```

```css
.whatsapp-float {
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  width: 56px;
  height: 56px;
  background: #25D366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
  z-index: 1000;
  transition: transform 0.2s ease;
}
.whatsapp-float:hover { transform: scale(1.1); }
```

### 2. Footer obligatorio
```html
<footer>
  <!-- contenido del cliente -->
  <p class="apex-credit">Desarrollado por Apex Cloud Work — Cartago, CR</p>
</footer>
```

### 3. Meta tags SEO mínimos
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="[Descripción del negocio]">
<meta property="og:title" content="[Nombre del negocio]">
<meta property="og:description" content="[Descripción corta]">
<meta property="og:image" content="[URL imagen OG]">
```

---

## Secciones estándar y su propósito

| Sección | Propósito | Variantes |
|---------|-----------|-----------|
| **Hero** | Primera impresión — problema/solución | Full-screen, dos columnas, centrado |
| **Servicios** | Qué ofrece el negocio | Cards, lista, iconos |
| **Sobre Nosotros** | Confianza, humanización | Foto + texto, timeline |
| **Testimonios** | Prueba social | Carrusel, grid de tarjetas |
| **Galería / Portafolio** | Visual proof (restaurantes, estética) | Masonry, grid, lightbox |
| **Precios** | Claridad de oferta | Cards con CTA |
| **FAQ** | Objeciones pre-resueltas | Acordeón |
| **Contacto** | Captura de leads | Form + WA + mapa |
| **Footer** | Créditos, links, legal | Simple con logo y datos |

---

## Skills de Claude disponibles para diseño

| Skill | Cuándo activar |
|-------|---------------|
| `frontend-design` | Landing completa, componente de UI |
| `canvas-design` | Poster, arte estático, imagen para redes |
| `banner-design` | Banner publicitario |
| `brand` | Identidad de marca, logo guidance |
| `design-system` | Sistema de componentes reutilizable |
| `mockup-device-3d` | Presentación del sitio en dispositivo |
| `image` | Generar imagen de hero o placeholder |
| `redesign-skill` | Cuando hay un sitio existente que mejorar |

---

## Reglas de código

- **No frameworks** — HTML/CSS/JS puro (React solo cuando Garett lo domine)
- **Sin dependencias externas** salvo Google Fonts y Font Awesome ocasional
- **Variables CSS** para colores y tipografía desde `:root`
- **Animaciones** — solo con `transform` y `opacity`, nunca `top/left` (performance)
- **Imágenes** — siempre con `loading="lazy"` y `alt` descriptivo
- **Formularios** — siempre con validación JS básica + N8N webhook
- **Mobile breakpoint principal:** 768px

---

## Checklist antes de entregar un sitio

```
[ ] Carga en menos de 3 segundos (test en móvil)
[ ] WhatsApp flotante funciona y abre número correcto
[ ] Footer dice "Apex Cloud Work — Cartago, CR"
[ ] Formulario envía a N8N webhook
[ ] Se ve bien en iPhone SE (375px)
[ ] Se ve bien en desktop 1440px
[ ] Meta tags completos
[ ] Sin console.log ni código de debug
[ ] Sin links rotos
[ ] Imágenes optimizadas (WebP si es posible)
```
