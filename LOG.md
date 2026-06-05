# 📋 Apex Cloud Works — Log General

> Check-in dominical con Claude · Actualizar cada domingo

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