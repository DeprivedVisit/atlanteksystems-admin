# Migración futura a CoreUI Free Bootstrap Admin Template

> Documento de referencia — Creado jun 2026
> Repo: https://github.com/coreui/coreui-free-bootstrap-admin-template

---

## Por qué no se migró ahora

El panel actual (admin.html + admin.js + admin.css) es un stack sin dependencias: HTML/CSS/JS puro conectado a Google Sheets via Apps Script. CoreUI requiere:
- Node.js + npm build process
- Bootstrap + CoreUI CSS/JS bundle
- Pug como template engine
- Chart.js + @coreui/chartjs para gráficos

El costo de migración supera el beneficio en este momento. Se migra cuando el panel escale a más de 10 secciones o requiera un equipo.

---

## Qué ya implementamos inspirado en CoreUI

| Patrón CoreUI                  | Implementado en Apex Admin                          |
|-------------------------------|-----------------------------------------------------|
| Sidebar navigation            | `aside.sidebar` — colapsable, badges, localStorage |
| Metric cards con mini chart   | `.mc-sparkline` — SVG polyline por card            |
| Progress groups dobles        | `#dash-progress-groups` — barras apiladas por mes  |
| Dropdown menus                | Tab Más ▾ (deprecado con sidebar actual)           |

---

## Mapa de componentes: Apex → CoreUI

### Layout
| Apex Admin                    | CoreUI equivalente                          |
|------------------------------|----------------------------------------------|
| `aside.sidebar`              | `.sidebar` con `c-sidebar`, `c-nav`          |
| `header.topbar`              | `.header` con `c-header`                     |
| `main.admin-main`            | `main.c-main`                                |
| `.tab-section`               | Rutas separadas (cada tab = una página HTML) |

### Componentes
| Apex Admin                   | CoreUI equivalente                           |
|-----------------------------|----------------------------------------------|
| `.metric-card`              | `.card` con `.c-chart-wrapper`               |
| `.sparkline-svg`            | `canvas` + `Chart.js` tipo `CChartLine`      |
| `.pg-group` + `.pg-bar`     | `.progress` + `.progress-bar` Bootstrap      |
| `.kanban-board`             | Implementar con `@dnd-kit` o similar         |
| `.panel` + `.data-table`    | `.card` + `table.table.border`               |
| `.ring-svg`                 | `canvas` + `Chart.js` tipo `CChartDoughnut`  |
| `.funnel-wrap`              | Componente custom (CoreUI no incluye funnel) |
| `.modal-overlay`            | Bootstrap Modal (`data-bs-toggle="modal"`)   |
| `.badge.badge-live`         | `.badge.bg-success`                          |

### Navegación
| Apex Admin                   | CoreUI equivalente                           |
|-----------------------------|----------------------------------------------|
| `data-tab` + `switchTab()`  | `<a href="./dashboard.html">` (páginas reales)|
| `toggleSidebar()`           | `coreui.Sidebar.getOrCreateInstance(el)`     |
| `.sb-badge`                 | `.badge.bg-danger` en nav item               |

---

## Pasos de migración (cuando sea el momento)

### 1. Setup
```bash
git clone https://github.com/coreui/coreui-free-bootstrap-admin-template.git apex-admin-v2
cd apex-admin-v2
npm install
npm run dev
```

### 2. Adaptar paleta de Apex
En `src/scss/_custom.scss`:
```scss
$primary:    #C4956A;  // --gold
$secondary:  #E2B97A;  // --gold2
$body-bg:    #0d1117;  // --bg
$body-color: #f0f4f8;  // --text
$card-bg:    #161b22;  // --surface
```

### 3. Migrar datos
Reemplazar mock data de CoreUI con los fetch actuales de Apps Script:
- `apiFetch({ accion: 'adminProyectos' })` → poblar tabla de proyectos
- `apiFetch({ accion: 'adminLeads' })` → poblar tabla de leads
- `apiFetch({ accion: 'adminFinanzas' })` → poblar gráficos de ingresos
- El Apps Script no cambia — solo cambia el frontend

### 4. Separar tabs en páginas reales
CoreUI usa páginas HTML separadas, no tabs en un solo HTML:
- `dashboard.html`
- `proyectos.html`
- `leads.html`
- `finanzas.html`
- `tickets.html`
- `clientes.html`

Ventaja: cada página carga solo lo que necesita.

### 5. Reemplazar gráficos SVG por Chart.js
El gráfico de ingresos actual (progress groups + sparklines SVG) → Chart.js:
```js
// Sparkline en metric card
new Chart(canvas, {
  type: 'line',
  data: { datasets: [{ data: finanzas6Months(), borderColor: '#34d399' }] },
  options: { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
});

// Doughnut para revenue ring
new Chart(canvas, {
  type: 'doughnut',
  data: { datasets: [{ data: [cobrado, metaMensual - cobrado], backgroundColor: ['#34d399', 'rgba(255,255,255,0.06)'] }] }
});
```

### 6. Autenticación
Reemplazar el password gate local (`localStorage + SHA-256`) con:
- AWS Cognito (ya en plan según CLAUDE.md)
- O Basic Auth en CloudFront

---

## Lo que Apex Admin tiene y CoreUI no
- Conexión directa a Google Sheets via Apps Script
- Revenue ring con meta mensual configurable
- Lead funnel visual
- Kanban con drag & drop
- Password gate local sin backend
- Tema dorado Apex

---

## Cuándo migrar
- Cuando el panel tenga más de 3 usuarios concurrentes
- Cuando necesites reportes más complejos (necesitarías Chart.js de todas formas)
- Cuando Liz o alguien más use el panel regularmente y necesite UX más pulida
- Cuando pases a React (considera React CoreUI en vez del template HTML)
