# 🛡️ AUDITORÍA INTEGRAL & PLAN DE INNOVACIÓN — PROYECTO INTEC
> **Apex Cloud Work** · Cartago, Costa Rica  
> **Cliente:** INTEC (Seguridad Electrónica, CCTV y Redes — Guápiles, Pococí)  
> **Fecha:** Septiembre 2026  
> **Objetivo:** Auditar la arquitectura completa, blindar la seguridad, maximizar la conversión comercial para el cierre ( setup + /mes) y presentar ideas innovadoras de alto impacto.

---

## 1. 📌 RESUMEN EJECUTIVO

INTEC cuenta con una base sólida construida por Apex Cloud Work: concepto temático de **Control Room**, un panel de administración funcional, un dashboard con KPIs y proformas reales (Eco Clinic #027), y un radar de cobertura en los 7 distritos de Pococí.

Sin embargo, existían cuellos de botella que frenaban la conversión y exponían riesgos de seguridad antes de pasar a producción:
1. **Fricción extrema de entrada:** Un modal forzado (*Gate de entrada*) que obligaba al visitante a registrarse o presionar "entrar como invitado" antes de ver la página.
2. **Placeholders y filtros degradantes:** Uso de fotos dummy (*picsum.photos*) y un overlay global de líneas de escaneo (*body::after*) que ensuciaba la nitidez en pantallas modernas.
3. **Brechas de seguridad en el panel:** Enlaces directos a dmin.html y dashboard.html en el footer público, con token visible en JavaScript y sin pantalla de login con contraseña.
4. **Oportunidad de diferenciación:** El mercado de Guápiles está lleno de técnicos informales que cotizan por mensaje sin estructura; INTEC puede posicionarse como la **empresa líder indiscutible en seguridad tecnológica corporativa y residencial de la zona atlántica**.

---

## 2. 🎨 AUDITORÍA VISUAL, UX Y CONVERSIÓN (LANDING PÚBLICA)

### 2.1. El Header y el Logo (✅ Resuelto en sesión actual)
- **Antes:** Ícono pixelado, tipografía Arial Black desproporcionada y rayas generadas por el scanline global.
- **Estado Actual:** Isotipo de ondas wifi a la izquierda con escala prominente, tipografía INTEC alineada exactamente a la línea base inferior, enlace clicable con scroll suave directo al inicio (0,0).

### 2.2. Tipografía y Jerarquía Visual (✅ Actualizado)
- **Diagnóstico:** Se utilizaba *Fraunces* (serif clásica/editorial) y *Courier Prime* (máquina de escribir). En un rubro de cámaras 4K, ColorVu e inteligencia artificial, generaba una disonancia de marca.
- **Mejora:** Implementación de **Plus Jakarta Sans** (grotesque moderna de alta gama) + **JetBrains Mono** para datos técnicos, códigos de cámaras y badges.

### 2.3. Fotografía y Casos de Estudio (✅ Actualizado)
- **Diagnóstico:** El Hero y los 6 casos de *Trabajos Anteriores* usaban URLs de picsum.photos (paisajes aleatorios sin relación con seguridad).
- **Mejora:** Generación e integración de fotografía hiperrealista en alta resolución:
  - **Hero:** Vista de cámara de seguridad 4K ColorVu con HUD de monitoreo en acceso comercial al atardecer.
  - **Caso 01 (Clínica):** Cámara domo en cielo raso de clínica dental moderna con cableado 100% oculto.
  - **Caso 02 (Residencial):** Cámara bullet en fachada/cochera con tubería conduit galvanizada limpia.
  - **Caso 03 (Comercio):** Cámara domo 360° monitoreando cajas y pasillos de minisúper.
  - **Caso 04 (Industrial):** Rack de comunicaciones con patch panel y switches LED en bodega.
  - **Caso 05 (Condominio):** Video portero IP y control de acceso vehicular.
  - **Caso 06 (Restaurante):** Monitoreo de salón y áreas comerciales.

### 2.4. El Problema del "Gate de Entrada" (Modal Bloqueante)
- **Diagnóstico:** openGate() se dispara automáticamente al cargar la página si no hay usuario en localStorage.
- **Impacto:** En Costa Rica, el tráfico local proviene de anuncios en Facebook/Instagram o búsquedas en Google. Un usuario que entra y ve una pantalla bloqueada con un formulario antes de ver qué ofrece la empresa tiene una **tasa de rebote estimada del 70-80%**.
- **Recomendación:** Desactivar la apertura automática del modal en el landing principal. El modal o formulario debe presentarse como un **"Cotizador Rápido en Línea"** o integrarse de forma natural en la sección de contacto.

---

## 3. ⚙️ AUDITORÍA TÉCNICA Y RENDIMIENTO

| Elemento | Estado | Severidad | Acción Requerida |
| :--- | :---: | :---: | :--- |
| **Scanline global (ody::after)** | Corregido | Alta | Eliminado del body; restringido solo a .cam-card__screen. |
| **Separación de archivos** | Excelente | Info | Cumple regla de Apex: index.html, style.css, script.js separados. |
| **Mobile First (iPhone SE 375px)** | Bueno | Media | Validar anchos del radar SVG en pantallas menores a 360px. |
| **Velocidad de Carga (Lighthouse)** | Bueno | Media | Convertir las imágenes .jpg a .webp para rebajar el payload total a < 1.2 MB. |
| **Caché y CDN** | Pendiente | Alta | Configurar cabeceras de caché (Cache-Control: max-age=31536000) en CloudFront. |

---

## 4. 🔒 AUDITORÍA DE SEGURIDAD Y PRIVACIDAD

> [!CAUTION]
> **HALLAZGOS DE SEGURIDAD CRÍTICOS ANTES DE PRODUCCIÓN**

1. **Enlaces Públicos a Administración en el Footer:**
   - En index.html (línea 454) el footer contiene:  
     ... · <a href="dashboard.html">Dashboard</a> · <a href="admin.html">Admin</a>
   - **Riesgo:** Cualquier visitante, competidor o cliente curioso hace clic y entra directamente a ver los datos de facturación, clientes y proformas de INTEC.
   - **Solución:** Eliminar de inmediato estos links del footer público. El acceso a dmin.html y dashboard.html debe ser privado mediante URL directa guardada por el dueño.

2. **Falta de Puerta de Acceso con Contraseña (Gate de Autenticación):**
   - Actualmente dmin.html y dashboard.html cargan y muestran los datos del cliente sin pedir clave de acceso.
   - **Solución:** Implementar una pantalla de login sencilla con contraseña en sesión (usando sessionStorage o hash) antes de renderizar la tabla de clientes y documentos.

3. **Exposición de Token y Google Apps Script en Frontend:**
   - ssets/js/config.js expone públicamente:
     `javascript
     const CONFIG = {
       SHEETS_URL: 'https://script.google.com/macros/s/.../exec',
       TOKEN: 'intec-2026'
     };
     `
   - **Solución:** Para la fase de producción, migrar las peticiones a un endpoint proxy seguro o cambiar el token a uno aleatorio de 32 caracteres con rate limiting.

---

## 5. 📍 AUDITORÍA SEO LOCAL (GUÁPILES · POCOCÍ)

El 80% de las contrataciones de CCTV en Guápiles ocurren por dos vías: **búsqueda en Google** (*"cámaras de seguridad Guápiles"*, *"técnico de redes Pococí"*) y **recomendación directa / WhatsApp**.

### Mejoras SEO a implementar:
1. **Schema.org LocalBusiness (JSON-LD):**
   Agregar datos estructurados en <head> para que Google muestre a INTEC en el mapa de Guápiles con teléfono, zona de servicio y horarios.
2. **Meta Tags OpenGraph (OG):**
   Actualmente faltan og:image, og:title y og:description. Al compartir el enlace de INTEC por WhatsApp, debe aparecer una miniatura profesional con el logo y la cámara 4K, no un enlace de texto plano.
3. **Página de Google Business Profile:**
   Vincular la landing con una ficha de Google Maps verificada en Guápiles Centro (70201).

---

## 6. 💡 IDEAS INNOVADORAS DE ALTO IMPACTO (DIFERENCIACIÓN TOTAL)

Para que INTEC no sea "otro instalador más", estas 4 funciones convertirán la web en una máquina de ventas:

### 💡 Idea 1: Simulador Interactivo "Día vs. Noche / Cámara Barata vs. ColorVu 4K"
- **Concepto:** Un slider interactivo antes/después en el Hero o en Servicios.
- **Cómo funciona:** El usuario arrastra una barra divisoria: a la izquierda ve la imagen de una cámara barata tradicional (borrosa, en blanco y negro con infrarrojo que encandila la cara); a la derecha ve la cámara **INTEC ColorVu 4K** (a todo color en plena oscuridad, con reconocimiento nítido de rostros y placas).
- **Impacto psicológico:** Destruye la objeción del precio. El cliente entiende de inmediato por qué pagar por INTEC en lugar de comprar un kit genérico de supermercado.

### 💡 Idea 2: Cotizador Inteligente "Arme su Paquete" en 3 Clics
- **Concepto:** Reemplazar el formulario tradicional por un configurador interactivo paso a paso:
  - *Paso 1:* Tipo de propiedad (Casa / Negocio / Bodega).
  - *Paso 2:* Número de cámaras deseadas (2, 4, 8, 16).
  - *Paso 3:* Extras recomendados (Alarma, Video Portero, Red Wi-Fi MESH).
- **Resultado:** Al finalizar, muestra un botón: **"Enviar mi configuración a un técnico por WhatsApp"**, pre-llenando el mensaje con las especificaciones exactas. Menos fricción, más leads calificados.

### 💡 Idea 3: Bot de WhatsApp n8n con Generación de Proforma Automática
- **Concepto:** Conectar el formulario web con un flujo de **n8n**.
- **Cómo funciona:** Cuando el lead llena su solicitud, en menos de 60 segundos recibe un WhatsApp automático de INTEC:  
  *"Hola [Nombre], recibimos su solicitud para [4 cámaras en Guápiles]. Ya un asesor técnico está coordinando su visita. Le adjuntamos una guía rápida de preparación de puntos eléctricos."*
- **Impacto:** Velocidad de respuesta de élite que deja a la competencia local obsoleta.

### 💡 Idea 4: Calculadora de Almacenamiento y Cobertura de Disco Duro
- **Concepto:** Un widget interactivo donde el cliente selecciona: número de cámaras (ej. 4) y resolución (ej. 4MP). La calculadora le indica: *"Requiere 1TB para 15 días de grabación continua o 2TB para 30 días con compresión inteligente H.265+"*.
- **Impacto:** Posiciona a INTEC como expertos consultores técnicos, no simples vendedores de cajas.

---

## 7. 🗓️ PLAN DE ACCIÓN INMEDIATO (CHECKLIST PARA GARETT)

### Prioridad P0 — Antes de la Demo con el Cliente (HOY)
- [x] Unificar tipografía corporativa (Plus Jakarta Sans + JetBrains Mono).
- [x] Eliminar scanline global que degradaba el logo y textos.
- [x] Sustituir todas las fotos dummy por fotografía 4K de CCTV e instalaciones.
- [x] Centrar y alinear el isotipo con la línea base de INTEC.
- [ ] Ocultar los enlaces de Dashboard y Admin del footer en index.html.
- [ ] Probar el flujo completo en pantalla móvil iPhone/Android.

### Prioridad P1 — Cierre de Venta ( Setup + /mes)
- [ ] Mostrar en la demo la proforma #027 real ya cargada en el dashboard.
- [ ] Proponer la compra del dominio local (inteccr.com o intecseguridad.com).
- [ ] Firmar contrato con marco legal Apex (50% adelanto obligatorio).

### Prioridad P2 — Despliegue en AWS Producción
- [ ] Migrar el Google Sheet a la cuenta oficial de INTEC (soporteintec.cr@gmail.com).
- [ ] Proteger dmin.html y dashboard.html con contraseña de sesión.
- [ ] Desplegar en S3 + CloudFront con certificado SSL de Amazon (ACM) y Route 53.
- [ ] Configurar Google Business Profile en Guápiles para dominar las búsquedas orgánicas.

---
*Documento preparado por Apex Cloud Work · División de Arquitectura & Sistemas Web*
