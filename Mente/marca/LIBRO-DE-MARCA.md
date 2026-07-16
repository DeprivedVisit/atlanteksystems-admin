# 📕 Libro de Marca — Apex Cloud Work
> v1.0 · 08 julio 2026 · Fuente de verdad de la identidad visual y verbal.
> Regla de oro: **si un valor visual no sale de `assets/css/tokens.css`, está mal.**

---

## 1. Identidad verbal

| Elemento | Valor canónico | Nunca |
|----------|---------------|-------|
| **Nombre** | Apex Cloud Work (3 palabras) | ~~Apex Cloudworks~~ · ~~Apex CloudWorks~~ |
| **Wordmark** | APEX CLOUD WORK (Anton, uppercase) o `Apex <span gold>Cloud Works</span>` | — |
| **Dominio** | `apexcloudworkcompany.com` (SIN "s") | ~~apexcloudworkscompany.com~~ (solo GitHub org y N8N llevan "s" — son cuentas, no la marca) |
| **Email** | apexcloudworkcompany@gmail.com | — |
| **WhatsApp** | +506 6314-4171 · links `wa.me/50663144171` | — |
| **Ubicación** | Cartago, Costa Rica (en corto: "Cartago, CR") | — |
| **Footer estándar** | "Desarrollado por Apex Cloud Work — Cartago, CR" | Cambiarlo o traducirlo |
| **Moneda** | USD siempre | Colones en precios |

**Voz y tono:** serio · técnico · confiable. Voseo costarricense en textos de cliente ("Ingresá", "Escribinos"). Directo, sin relleno, resultado primero. El humor va en los detalles (easter eggs del IDE), nunca en precios, legales ni errores.

---

## 2. Logo

- **Archivo:** `assets/img/logo-mountain.png` (800×800, optimizado) — montaña sobre fondo oscuro.
- Se usa en: nav, favicon, watermark, documentos.
- Siempre sobre fondos oscuros de la paleta (`--bg`/`--surface`). Nunca sobre blanco puro ni sobre oro.
- No estirar, no recolorear, no agregar sombras.

---

## 3. Color — "Industrial Steel + Gold"

Fuente: `assets/css/tokens.css` v3.0. Toda superficie nueva **linkea tokens.css**, no copia valores.

### Fondos (acero frío)
| Token | Hex | Rol |
|-------|-----|-----|
| `--bg` | `#090B0E` | Fondo de página |
| `--surface` | `#101318` | Cards, secciones elevadas |
| `--raised` | `#171B22` | Hover, elementos sobre surface |
| `--raised2` | `#1E242E` | Paneles anidados (admin/portal) |

### Acento (Burnished Gold — ES la marca, no cambia)
| Token | Hex | Rol |
|-------|-----|-----|
| `--gold` | `#C4956A` | CTAs, links, acentos, wordmark |
| `--gold2` | `#DBA878` | Hover del oro |
| `--gold3` | `#F0D4A8` | Highlights puntuales |
| `--gold-dim` / `--gold-glow` | rgba | Fondos sutiles y glows del oro |

**Regla:** el oro es acento — botones, bordes, títulos parciales, íconos. **Nunca fondos grandes dorados.** Proporción visual aproximada: 90% acero / 8% texto / 2% oro.

### Texto (cool whites — acero, no crema)
| Token | Hex | Rol |
|-------|-----|-----|
| `--text` | `#E8ECF0` | Principal |
| `--text2` | `#8A9AAA` | Secundario |
| `--text3` | `#6E7E8E` | Meta/deshabilitado (mínimo AA verificado) |

### Semánticos y funcionales
| Token | Hex | Rol |
|-------|-----|-----|
| `--green` | `#4ADE80` | Éxito, "live" |
| `--blue` / `--blue-lite` | `#60A5FA` / `#93C5FD` | Info |
| `--red-alert` | `#F87171` | Error, alerta |
| `--yellow` | `#FBBF24` | Advertencia |
| `--wa` | `#25D366` | SOLO botones de WhatsApp (verde oficial WA) |

### 🚫 Paletas muertas (si aparecen, es bug)
- Warm v2: `#c8954a`, `#0a0908`, `#e8e0d8`, `#1c1208`, `#e0b070` (vivían en legales)
- Junio v1: `#DA7756`, `#F0956E`, `#0C0C14` (vivían en 404 y auditorías)
- Cualquier hex suelto que no esté en tokens.css

---

## 4. Tipografía

| Fuente | Rol | Reglas |
|--------|-----|--------|
| **Anton** | Display: H1/H2, wordmark, números grandes | Siempre uppercase o capitalizada, letter-spacing ligero, nunca en párrafos |
| **Inter** | Body y UI: párrafos, botones, forms, tablas | 300–700 según superficie |
| **JetBrains Mono** | Código, kickers `// SECCIÓN`, metadatos, IDs de documento, cifras técnicas | El "acento técnico" de la marca |

- Escala: usar `--fs-xs` … `--fs-hero` de tokens.css.
- Import estándar: `family=Anton&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500`
- 🚫 **Fuentes muertas:** Noto Serif Display, Quicksand (legales viejos), Space Grotesk (auditorías v1), Playfair/Lora (junio). Las paletas por rubro del CLAUDE.md (Syne, Cormorant…) son para **sitios de clientes**, jamás para superficies Apex.

---

## 5. Forma y ritmo

- **Spacing:** base 4px — solo `--sp-1` … `--sp-24`.
- **Radius:** `--r-sm` 6px (chips) · `--r-md` 10px (botones/inputs) · `--r-lg` 14px (cards) · `--r-xl` 20px (modales) · `--r-full` (pills).
- **Bordes:** `--border` (steel sutil) por defecto; `--border2` (gold tint) para hover/activo.
- **Z-index y transiciones:** solo tokens (`--z-*`, `--transition-*`). Spring (`--transition-spring`) para entradas, `fast` para hovers.

---

## 6. Componentes de marca

- **Kicker:** `// SECCIÓN` en JetBrains Mono, uppercase, `--text3` con acento `--gold`. Firma visual de Apex.
- **Botón primario:** fondo `--gold`, texto oscuro `#0a0704`, radius `--r-md`, hover `--gold2` + glow.
- **Botón WhatsApp:** `--wa`, blanco, pill. Único elemento verde brillante permitido.
- **Card:** `--surface` + `--border`, radius `--r-lg`; hover eleva a `--raised` + `--border2`.
- **Badges de estado:** green=live/pagado · gold=en proceso · red=vencido/error · text3=pendiente.

---

## 7. Superficies — misma marca, densidad distinta

| Superficie | Personalidad | Notas |
|-----------|--------------|-------|
| **Landing** (`index.html`) | Marca a máximo volumen — IDE simulator, Anton grande | |
| **Admin** (`admin.html`) | Densa, técnica, mono-heavy | Solo para Garett |
| **Portal** (`portal/`) | Calma, espaciosa, menos mono | Cara al cliente — claridad > personalidad |
| **Legales** (`Legal/`, `Seguridad/`) | Sobria y formal, cero decoración | Comparten `assets/css/legal.css` + tokens.css. Anton solo en título del doc; cuerpo Inter; IDs/meta en mono |
| **Docs cliente** (`Bienvenida/`) | Cálida en copy, idéntica en visual | |
| **404 / errores** | Mínima, mono + gold | |

**Regla técnica en TODAS:** HTML sin `<style>` embebido ni `style=""` inline; el CSS vive en `assets/css/` y empieza importando tokens.css.

---

## 8. Checklist para cualquier página nueva de Apex

- [ ] Linkea `assets/css/tokens.css` (o lo hereda vía CSS propio)
- [ ] Fuentes: solo Anton + Inter + JetBrains Mono
- [ ] Cero hex suelto — todo `var(--*)`
- [ ] "Apex Cloud Work" bien escrito · dominio sin "s"
- [ ] Footer estándar + WhatsApp `wa.me/50663144171`
- [ ] Precios en USD
- [ ] CSS/JS en archivos separados
- [ ] Mobile-first, tap targets ≥ `--tap` (48px)
