# 📋 Apex Cloud Works — Log General

> Check-in dominical con Claude · Actualizar cada domingo

---

## Semana 4 · 22 – 28 Junio 2026

### 2026-06-24 (martes) — Apex Landing + Mente + base del sistema

#### Apex Landing — apexcloudworkscompany.com
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
- ✅ Duplicados en `proyectos/jarvis/` eliminados

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