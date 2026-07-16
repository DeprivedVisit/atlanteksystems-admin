# 📋 Apex Cloud Work — Log General

> Check-in dominical con Claude · Actualizar cada domingo

---

## Semana 7 · 13 – 19 Julio 2026

### 2026-07-16 (jueves) — Unificación de nombre/URL/email en todo el repo

- ✅ Footer faltante agregado en `proyectos/Megan/index.html` (único `index.html` de cliente sin crédito "Desarrollado por Apex Cloud Work")
- ✅ `proyectos/wilson/security_monitor.py` monitoreaba `https://apexcloudworkscompany.com` (con s, dominio inexistente) — corregido a `apexcloudworkcompany.com` (sin s, el real)
- ✅ Decisión revertida respecto a la entrada del 07 jul: se unificó `apexcloudworkscompany@gmail.com` → `apexcloudworkcompany@gmail.com` **incluyendo contratos/proformas ya entregados** (Skindoctors, EcoPollo, VisionaryFilm, RFLX) y workflows N8N/Apps Script de producción (Skindoctors CBD/Melas, Galiz) — 22 archivos. Decisión explícita de Garett, no accidental.
- ⚠️ Pendiente: los sitios ya deployados en S3 (Skindoctors melasblock/cbd-balance, Galiz, EcoPollo) siguen sirviendo la versión vieja hasta el próximo redeploy — el fix local no se refleja en producción solo.
- ⚠️ Pendiente: confirmar que `apexcloudworkcompany@gmail.com` (sin s) es la casilla que se está monitoreando activamente — si los leads reales de Skindoctors/Galiz llegaban a la de "con s", dejan de llegar ahí tras el redeploy.
- 🔍 Único resto de "Apex Cloud Works" (con s, nombre incorrecto) en todo el repo: metadata del PDF `Mente/tareas-manuales/tareas-manuales-2026-07-07.pdf` (artefacto generado, no se encontró el script fuente que lo produjo — no se tocó el binario)

---

## Semana 6 · 6 – 12 Julio 2026

### 2026-07-07 (martes) — Dominio + certificado apexcloudworkcompany.com resueltos

#### Diagnóstico
- 🔍 Captura de ACM mostró certificado `PENDING_VALIDATION` para `apexcloudworkcompany.com` (sin "s") — nunca se agregó el CNAME de validación
- 🔍 Confirmado por CLI: el dominio registrado en Route 53 (04-jul-2026) es realmente `apexcloudworkcompany.com` (sin s) — no es un typo, es el dominio real de la empresa
- 🔍 Bucket S3 con contenido real (`apexcloudworkscompany.com`, con s) y CloudFront `ET4LXKTRYGW7N` no tenían alias de dominio ni certificado conectado
- 🔍 Bloqueante nuevo encontrado: la zona hospedada de Route 53 no existía (0 zonas), pese a que el dominio sí estaba registrado

#### Migración de infraestructura AWS
- ✅ Zona hospedada pública creada para `apexcloudworkcompany.com`
- ✅ Name servers del dominio actualizados (por Garett) para apuntar a la zona nueva
- ✅ Bucket S3 nuevo `apexcloudworkcompany.com` (sin s) creado — hosting estático + policy pública igual al bucket viejo
- ✅ Contenido migrado con `aws s3 sync` — 47 objetos, 2.4 MB, desde `apexcloudworkscompany.com` (con s)
- ✅ CNAME de validación agregados por Garett → certificado ACM `b3c4f00d-...` pasó a `ISSUED`
- ✅ CloudFront `ET4LXKTRYGW7N` actualizado: alias `apexcloudworkcompany.com` + `www.apexcloudworkcompany.com`, certificado ACM adjunto
- ✅ Registros ALIAS (A) agregados por Garett — root y `www` apuntando a `d3qo2igs81lk3y.cloudfront.net`

#### Verificación final
- ✅ `https://apexcloudworkcompany.com` — 200 OK, SSL válido
- ✅ `https://www.apexcloudworkcompany.com` — 200 OK, SSL válido
- ✅ `/admin.html` y título de página cargan correctamente desde el bucket nuevo

#### Fuera de alcance (decisión explícita)
- ⛔ GitHub org `apexcloudworkscompany` (con s) — cuenta real, no se toca
- ⛔ Workflows N8N `apexcloudworkscompany.app.n8n.cloud` (con s) — webhooks reales en producción de clientes
- ⛔ Emails con s en contratos ya entregados (Skindoctors/EcoPollo/VisionaryFilm/RFLX/Galiz)
- ⛔ Bucket viejo `apexcloudworkscompany.com` (con s) — se deja como respaldo, no se borra

#### CLAUDE.md
- ✅ Corregida línea GitHub: `apexcloudworkcompany` → `apexcloudworkscompany` (con s, el org real)

#### Estado proyecto Apex Landing
- ✅ Dominio y certificado resueltos — sitio live en `apexcloudworkcompany.com`
- ⏳ Pendiente: decidir si se borra el bucket viejo (con s) más adelante, resolver los 3 críticos de seguridad ya documentados

---

## Semana 4 · 22 – 28 Junio 2026

### 2026-06-26 (jueves) — Apex Landing v2 · full completa · EC2 plan

#### Escaneo general apexcloudworkcompany.com
- ✅ Auditoría completa del directorio — 31 archivos, 8,448 líneas totales
- ✅ Eliminado `templates/` — prototipo muerto (teal/Barlow, nunca deployado, sin referencias)
- 📋 Problemas detectados: contact form fantasma · scroll-gallery CSS muerta · "Jarvis" en deploy · og-image faltante · foto Garett placeholder · sin testimonios

#### Arquitectura decidida — Apex v2 full
- Decisión: S3+CloudFront (frontend) + EC2 t3.small (backend) + PostgreSQL
- Stack backend: Node.js + Express + JWT + PostgreSQL
- Costo estimado: ~$18/mes (básico) · ~$33/mes (con RDS)
- Pendiente: EC2 setup cuando termine el frontend

#### Apex Landing — mejoras en proceso (sesión actual)
- 🔥 Fix "Jarvis" → "Wilson" en paso 4 del proceso
- 🔥 Agregar sección de testimonios (entre Stack y Precios)
- 🔥 Activar contact form real (JS ya existía, HTML faltaba)
- 🔥 Limpiar CSS muerto: bloque `.scroll-gallery` (190 líneas sin HTML correspondiente)

#### Checkpoint — estado de archivos antes de modificar
- `index.html` — 1,258 líneas · hash conceptual: NAV+HERO+PROCESO+SERVICIOS+PORTAFOLIO+RESULTADOS+STACK+PRECIOS+CALCULADORA+FAQ+CONTACTO(portal-welcome)+SOBRE+FOOTER+TOAST
- `style.css` — 2,455 líneas · paleta gold DA7756 · fonts Space Grotesk+Inter+JetBrains Mono
- `script.js` — 421 líneas · accordion+FAQ+reveal+nav+toast+vscode+dropdown+counters+calc+contactForm

---

### 2026-06-24 (martes) — Apex Landing + Mente + base del sistema

#### Apex Landing — apexcloudworkcompany.com
- ✅ Separación limpia HTML/CSS/JS — eliminados 100+ líneas de `style=""` inline del `cc-root`
- ✅ `backgrounds.js` genera los 5 fondos animados dinámicamente
- ✅ `backgrounds.css` recibe todas las clases + keyframes
- ✅ `script.js` — restaurado bloque scroll-gallery perdido
- ✅ Limpieza de carpeta: borrados `Loop-Company.v1/`, `auditoria/`, `HTML` (legacy), `UI.png`, `fondo-noche.jpg`
- ✅ `Mente/` movida a raíz del repo (era parte de la carpeta web)

#### Mente — fuente de verdad única
- ✅ `INDEX.md` v2.0 — Wilson renombrado a Jarvis, proyectos actualizados, reglas de stack
- ✅ `operations.md` — fechas vencidas corregidas, Jarvis renombrado
- ✅ `rutina.json` v5.0 — alineado con CLAUDE.md v11.0 (wake 07:00, 5 bloques, clases, bici)
- ✅ `CLAUDE.md` de Mente borrado — el root `CLAUDE.md` es la única fuente
- ✅ Duplicados en `proyectos/wilson/` eliminados

#### Archivos raíz actualizados
- ✅ `SYSTEM.md` v2.0 — separación de archivos, stack completo, sin deadline vencido
- ✅ `README.md` — estructura real del repo, estados actuales, regla de código
- ✅ `LOG.md` — entrada de esta semana

#### Regla establecida (permanente)
- ✅ Stack oficial: HTML · CSS · JS → React · AWS
- ✅ Siempre archivos separados — sin inline styles/scripts en ningún proyecto

#### Estado proyecto Skindoctors
- ✅ 2 landings live + sistema N8N + Sheets activo
- ⏳ Reunión con cliente — pendiente agendar
- ⏳ Firma contrato + cobro $450 USD
- ⏳ Hablar comisión con Andrés — ANTES del cobro
- ⚠️ WA actual = Garett (+506 6314-4171) — cambiar al de Skindoctors al firmar

#### Estado proyecto EcoPollo
- 🔥 Cotizador en desarrollo activo

---

## Semana 1 · 2 – 8 Junio 2026

### 2026-06-04 (jueves) — Skindoctors · Melasblock Landing v2

**Sesión de trabajo: Hero + Deploy completo**

#### Hero — Cambios aplicados
| Qué | Antes | Después |
|-----|-------|---------|
| Fondo hero | `4k-desktop.jpg` / `4k.jpg` (no existían) | `4k.png` ✅ fotografía oficial |
| Posición imagen | `center center` | `70% center` — frasco visible a la derecha |
| Layout card | columna centrada | fila, card izquierda · frasco derecha |
| Card fondo | `rgba(255,255,255,.08)` glass transparente | `rgba(251,245,239,.93)` crema opaco |
| Eyebrow | "Corrector facial con color · SPF 50 · 7 tonos" | "BB Cream · SPF 50 · Radiance & Protection" |
| Gap card | `1.75rem` | `1.1rem` (precio + CTAs en viewport) |
| Padding container | `6rem 7rem` | `3.5rem` |

#### Mobile — Fixes
- `min-height: auto` — hero ya no fuerza 100svh
- `background-position: center 20%` — frasco centrado
- `gap: 1rem` compacto — precio y CTAs visibles sin scroll
- `chip-row` y `hero-trust` ocultos en mobile
- Título `2.2rem` fijo

#### WhatsApp — Número actualizado
- `+506 7063-6051` → **`+506 6314-4171`** (Garett)
- Cambiado en: top bar · footer · `WA_NUMBER` JS · todos los `wa.me` links

#### AWS Deploy
| Recurso | Detalle |
|---------|---------|
| S3 bucket | `skindoctors-cr-landings/melasblock/` · us-east-2 |
| CloudFront | `E31U5V9IA0JXSZ` · `d3suiaystvdco4.cloudfront.net` |
| Invalidaciones | 3 × `/*` — todas Completed |
| Archivos subidos | `index.html` · `4k.png` · `melasblock.png` · `Tipos.png` · tonos JPG · `img/` |

#### GitHub
- Commit: `b42c095` — `feat: melasblock landing v2 — hero foto original + mobile fix`
- Branch: `main` — pusheado a `apexcloudworkscompany/apex-cloudworks`

#### Estado proyecto Skindoctors
- 🔥 Landing live · desktop ✅ · mobile ✅
- ⏳ Deadline cierre: **15 junio** ($450 USD)
- ⏳ Contrato pendiente
- ⏳ Hablar comisión con Andrés — sábado 7 junio
- ⚠️ Número WA actual es el de Garett — cambiar al de Skindoctors cuando se cierre contrato

---

### 2026-06-10 (martes) — Skindoctors · Sprint cierre + CBD conectado

**Sesión: Presentación general + CBD completado**

#### Archivos creados
| Archivo | Descripción |
|---------|-------------|
| `presentacion/index.html` | Página showcase para reunión con cliente — deploy CloudFront |
| `presentacion/entrega-final.html` | Acta de entrega con instrucciones técnicas |
| `cbd-balance/google-sheets-setup.html` | Guía visual de setup — estilo Melasblock |
| `cbd-balance/apps-script.gs` | Backend Google Sheets CBD — mismo patrón que Galiz |
| `cbd-balance/n8n-workflow-cbd.json` | Workflow N8N CBD — listo para importar |

#### CBD Oil Balance — Sistema de leads conectado
| Componente | Estado |
|-----------|--------|
| Google Sheet | ✅ `1mNEzqy17t41N3SvRlNqvQOKqilOH_8PUzXFi0fUeaAI` |
| Apps Script | ✅ `AKfycbzQl-LEVjcFdaTzIp6eMCL1ADqe-wCcZ1K0pOxYSDNlfeVnEn5Ul0jmgA7hubpP1VIg` |
| `SHEETS_URL` en index.html | ✅ Conectado y deployado |
| N8N webhook | ✅ `https://apexcloudworkscompany.app.n8n.cloud/webhook/a9c2e4f1-b3d7-4820-cdef-222222222201` — workflow importado |

#### AWS Deploy
| Recurso | Detalle |
|---------|---------|
| Invalidaciones | `/presentacion/*` + `/cbd-balance/index.html` |
| URLs nuevas | `d3suiaystvdco4.cloudfront.net/presentacion/index.html` |

#### Estado proyecto Skindoctors
- ✅ Landing Melasblock — live + N8N + Sheets activo
- ✅ Landing CBD Oil Balance — live + Sheets activo
- ✅ Página de presentación para reunión — live
- ✅ Acta de entrega generada
- ✅ N8N CBD — webhook conectado + deployado
- ⏳ Reunión con Skindoctors — antes del 15 junio
- ⏳ Firma contrato + cobro $450 USD
- ⏳ Hablar comisión con Andrés — ANTES del cobro
- ⚠️ WA actual = Garett (+506 6314-4171) — cambiar al de Skindoctors al firmar

---

### 2026-06-03 (miércoles) — Mudanza
- ✅ Mudanza a Cartago completada
- ✅ Apartamento: Barrio Ánimas · ₡250,000/mes · 2 cuartos · cochera
- ✅ Internet: 515mb · ping 5ms (Claro)
- ✅ Rutina v5.0 diseñada — arranca jueves 4 junio
- ✅ SYSTEM.md + CLAUDE.md v10.0 + LOG.md generados
- ✅ Skills Apex: apex-landing · apex-deploy · apex-client-brief · apex-docs · apex-jarvis
- ✅ Google Calendar limpio — 19 recordatorios activos
- ⏳ Contrato Skindoctors pendiente
- ⏳ Hablar comisión con Andrés — sábado 7 junio
- ⏳ Instalar skills en Claude Code — jueves 4 junio

### Objetivos semana
- [ ] Agendar reunión Skindoctors antes del 10 junio
- [ ] Cerrar Skindoctors antes del 15 junio ($450 USD)
- [ ] Semana 2 JS completada
- [ ] Open English todos los días

---

## Template domingo

### 20XX-XX-XX — Check-in
**Cerré:**
- 

**Quedó pendiente:**
- 

**Imprevistos:**
- 

**Proyectos:**
| Proyecto | Estado | Próximo paso |
|---------|--------|-------------|
| Skindoctors | | |
| EcoPollo | | |