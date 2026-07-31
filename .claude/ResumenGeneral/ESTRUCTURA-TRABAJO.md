# Estructura de trabajo — Apex Cloud Work
> Cómo está organizada la información del repo, de raíz a detalle

---

## Capas de memoria (de más permanente a más volátil)

```
CLAUDE.md (raíz)          ← memoria permanente del sistema. Se lee ANTES de
                             cualquier sesión. Identidad, motor, reglas, stack,
                             tabla de proyectos, roadmap MRR, rutina v7.0.
                             Cambia poco — cada cambio bump de versión.

memory/ (fuera del repo,   ← auto-memoria de Claude Code entre sesiones.
en ~/.claude/projects/...)   Un archivo .md por hecho/feedback/proyecto,
                             indexado en MEMORY.md. Se actualiza cada sesión
                             que aprende algo nuevo. Más granular que CLAUDE.md.

Obsidian/                  ← sistema de TAREAS VIVAS. Dashboard.md es home.
                             Tareas/Semana Actual.md se reescribe cada semana.
                             Tareas/Backlog.md es todo lo que no cabe en la
                             semana. Proyectos/*.md una ficha por proyecto.
                             Log/2026-MM.md bitácora mensual corta.
                             Esto es lo primero que se congela si no se
                             mantiene — pasó de 26 jun a 7 jul, y de nuevo
                             quedó atrás de 16 jul a 31 jul hasta este sync.

LOG.md (raíz)               ← bitácora técnica LARGA y detallada, por semana,
                             con tablas de archivos/AWS/commits. Check-in
                             dominical. Más verboso que Obsidian/Log/.

Mente/                      ← manuales operativos (customer-support.md,
                             operations.md, brand-voice.md), no estado de
                             proyecto. Cambia poco. INDEX.md es su entrada.

proyectos/                  ← código real. Cada carpeta = un cliente/producto.
                             Fuente de verdad final — si algo en Obsidian o
                             CLAUDE.md contradice el código/git log, gana el
                             código.
```

**Regla de oro al retomar contexto:** CLAUDE.md y `memory/` pueden quedar
desactualizados varias semanas sin que nadie se dé cuenta — antes de asumir
el estado de un proyecto, cruzar con `git log` y `git status` del repo real.
Esta sesión (31 jul) encontró 3 proyectos completos (INTEC, LICORERA, Apex RMM)
que existían en código y en `memory/` pero no en CLAUDE.md ni en Obsidian.

---

## Sistema semanal

- **Domingo noche:** check-in — qué cerró, qué quedó, imprevistos.
- Claude genera: plan de semana + Google Calendar + `LOG.md` actualizado.
- Cada vez que se cierra trabajo o cambia el estado de un proyecto, actualizar
  junto con `LOG.md`: `Obsidian/Tareas/Semana Actual.md`, `Obsidian/Log/2026-MM.md`
  del mes, y la ficha en `Obsidian/Proyectos/` si cambió el estado.

## Rutina v7.0 (oficial desde 8 jul 2026)

5 bloques de PROYECTO con **rol fijo distinto** cada uno (rompe monotonía):
1. **BUILD** (07:00, 120min) — lo más técnico, mente fresca
2. **VENTAS/CIERRE** (11:45, 120min) — WhatsApp, cobros, outreach, cero código
3. **CLIENTE ACTIVO** (14:45, 120min) — proyecto prioritario de la semana
4. **AUTOMATIZACIÓN/SEGURIDAD** (18:00, 120min) — Wilson, n8n, Apex admin
5. **REMATE/SPRINT** (20:00, 75min) — QA/deploy/cerrar pendiente, nada nuevo

Balance del día (22:30) se loguea con números concretos: plata cobrada, leads,
líneas shippeadas — no un checklist genérico.

## Regla de código permanente

Archivos siempre separados: `index.html` / `assets/css/style.css` /
`assets/js/script.js`. Nunca inline. Aplica a TODO proyecto, cliente o interno.

## Estándar de entrega por proyecto (desde el primer cliente)

```
proyectos/[cliente]/[producto]/Auditacion Apex/
  entrega-cliente.html   ← URLs, entregables, planes, garantía (para el cliente)
  audit-log.html         ← timeline de cambios (interno)
  cierre-negocio.html    ← deal $, checklist (interno, fondo oscuro)
  scorecard.html         ← auditoría técnica con score /100
```
Legales de Apex (empresa, no cliente) viven en
`proyectos/apexcloudworkscompany.com/Legal/` — genéricos, no cambian por cliente.

## Deploy AWS — regla no negociable

**Nunca `aws s3 sync` de una carpeta cruda.** Cada archivo se sube con
`aws s3 cp` explícito + invalidación de CloudFront puntual. La razón: al menos
2 fugas de datos reales (CSV de citas de RFLX, PDFs de proforma) salieron de
syncs completos de carpetas de trabajo que tenían basura interna mezclada con
lo que debía ser público.
