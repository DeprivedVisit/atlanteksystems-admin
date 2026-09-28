# Atlantek Systems — Sitio Público + Panel de Gestión

**Dominios en producción:**
- **Sitio público:** https://atlanteksystems.com
- **Panel admin:** https://admin.atlanteksystems.com

---

## 🏗️ Arquitectura General

```
atlanteksystems.com (Web Público)
├── index.html                 # Landing page: Hero, Servicios, Cobertura, Contacto, Chat bot
├── assets/
│   ├── css/style.css          # Sistema de diseño completo (navy palette, Plus Jakarta Sans + JetBrains Mono)
│   ├── js/script.js           # Formulario leads, chat bot, radar animado, FABs, rate limit, sanitización
│   └── img/                   # Logo, fondo hero, iconos servicios
├── _headers                   # Security headers (CSP, HSTS, X-Frame-Options, etc.)
├── robots.txt / sitemap.xml   # SEO técnico
└── CNAME                      # atlanteksystems.com

admin.atlanteksystems.com (Panel Admin Privado)
├── admin.html                 # Panel gestión: Dashboard, Clientes, Servicios, Tickets, Documentos, Catálogo, Leads, Legal
├── dashboard.html             # Resumen negocio (KPIs, charts Chart.js, servicios activos, tickets abiertos)
├── client-portal.html         # Portal cliente: Mis servicios + Tickets soporte (auth separada)
├── api/auth/                  # Vercel Serverless Functions (JWT + HttpOnly cookies)
│   ├── health.js              # Health check
│   ├── login.js               # POST /login → JWT + cookie
│   ├── me.js                  # GET /me → usuario actual (cookie o Bearer)
│   ├── logout.js              # POST /logout → limpia cookie
│   └── refresh.js             # POST /refresh → renueva token
├── assets/
│   ├── css/admin.css          # Dashboard, sidebar, tablas, service-card, ticket badges, modales
│   ├── css/dashboard.css      # Charts, portal cliente, forms, responsive
│   ├── js/auth.js             # Cliente Auth (auto-refresh, roles, permissions, fallback local)
│   ├── js/store.js            # Capa datos (localStorage + sync Google Sheets v2: servicios, tickets, MRR)
│   ├── js/app.js              # Router SPA, vistas, modales, editor proformas/facturas
│   ├── js/dashboard.js        # KPIs, charts, servicios/tickets recientes
│   └── js/client-portal.js    # Portal cliente (tabs, tickets, form nuevo ticket)
├── legal/                     # 5 documentos legales (contrato, proforma, acta, términos, privacidad)
├── vercel.json                # Rewrites SPA + headers + cache
└── package.json               # Deploy config (static site)

Backend de Datos (Google Apps Script)
├── SHEETS_URL: https://script.google.com/macros/s/AKfycbx3yS9Lmx8aL6wyiww_lcKMJLXPO9jRog7kKlSEwCw96wKeWzHowBQZyDM5ITTC5MSp/exec
├── TOKEN_PUBLICO (web):    atlantek-pub-cs0v95l7ae    → solo action=lead / action=user
├── TOKEN_ADMIN (panel):    atlantek-adm-vemsw0y4ugh5r691 → action=load / save / lead-status
└── Hoja Sheets: 1UnKG3yFHBEAkoZbiwM7MIVGlElIKYVCFriV6slnq5n8 (cuenta Apex)
```

---

## ✨ Funcionalidades Principales

### Sitio Público (`atlanteksystems.com`)
| Feature | Detalle |
|---------|---------|
| **Hero** | Fondo real CCTV (`back.jpg` 94KB), HUD animado con coordenadas GPS |
| **Servicios** | 6 cards con iconos SVG reales (CCTV, Cableado, WiFi, Equipos, Asesoría, Soporte) |
| **Cobertura** | Radar SVG animado (requestAnimationFrame): 7 distritos Pococí + 3 extendidas, barrido 5.5s, readouts dinámicos RNG/LOCK |
| **Formulario leads** | 8 campos (nombre, teléfono, distrito, tipo, visualización, ubicación, servicio, mensaje) → Apps Script → Sheets |
| **Validaciones** | Teléfono CR (8 dígitos, inicia 2-8), honeypot, sanitización HTML, rate limit 3/hora (localStorage) |
| **Chat bot** | 6 chips FAQ + respuesta animada "escribiendo…" + botón WhatsApp |
| **FABs flotantes** | 3 botones 48px apilados (Chat, Formulario, WhatsApp) sin solape, safe-area mobile |
| **SEO** | JSON-LD LocalBusiness (7 distritos + Guácimo), FAQPage, WebSite, sitemap.xml, robots.txt, canonical |
| **Accesibilidad** | Labels `for`/`id`, `aria-live`, `:focus-visible`, targets táctiles 44px, `prefers-reduced-motion` |
| **Security Headers** | CSP restrictivo, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Permissions-Policy |

### Panel Admin (`admin.atlanteksystems.com`)
| Módulo | Funcionalidad |
|--------|---------------|
| **Auth** | JWT HS256 8h, cookie HttpOnly Secure SameSite=Lax, auto-refresh 5 min antes expiración, roles admin/vendedor/cliente |
| **Dashboard** | 7 KPIs (Clientes, Servicios, Tickets, MRR, Cobrado, Por cobrar, Leads), 4 charts Chart.js (ventas mensuales, top clientes, estado docs, leads por estado) |
| **Clientes** | CRUD completo, búsqueda, estado activo/inactivo |
| **Servicios Contratados** | Modelo v2: MRR, fecha inicio/vencimiento, items incluidos, auto-cálculo estado (activo/vencido/inactivo) |
| **Tickets Soporte** | Prioridad (crítica/alta/media/baja), estado (abierto/en_proceso/resuelto/cerrado), historial mensajes, asignado |
| **Documentos (Proformas/Facturas)** | Numeración automática PRF-XXX / FAC-XXX, editor con líneas, vista imprimible réplica PDF oficial, status badge, botones Email/WhatsApp/Imprimir/Factura |
| **Catálogo** | 12 items seed, imágenes base64 (500KB), export/import Excel |
| **Leads** | Tabla con filtros, estados (nuevo→perdido), export Excel, badge sidebar con nuevos |
| **Legal** | 5 documentos en panel privado (no en público) |
| **Portal Cliente** | Auth separada (`?client=c1`), tabs: Mis Servicios (cards con MRR, items, fechas) + Tickets (crear con prioridad/servicio relacionado) |

---

## 🔐 Autenticación

**Endpoints Vercel (`/api/auth/*`):**
```
POST   /api/auth/login     { password }          → { ok, user, token } + Set-Cookie
GET    /api/auth/me                            → { ok, user } (cookie o Authorization: Bearer)
POST   /api/auth/logout                        → { ok } + clear cookie
POST   /api/auth/refresh                       → { ok, token } + Set-Cookie
GET    /api/auth/health                        → { ok: true, service: 'atlantek-auth' }
```

**Credenciales:**
- Password: `atlantek2026` (hash SHA-256: `90283688d6ffa15f24f1c8296639040db3afb9c9870907e64e317649eb82b20a`)
- Usuario por defecto: `admin-1` / `Administrador` / `soporte@atlanteksystems.com` / `admin`

**Cliente Auth (`assets/js/auth.js`):**
```js
Auth.init()                    // Inicializa (checkAuth automático)
Auth.login(password)           // Login → guarda user + schedule refresh
Auth.checkAuth()               // Verifica sesión actual
Auth.getUser()                 // Usuario actual
Auth.hasRole('admin', 'vendedor')
Auth.hasPermission('leads:read')
Auth.requireAuth(['admin'])    // Protección de rutas
Auth.logout()                  // Cierra sesión
```

---

## 📊 Modelo de Datos (store.js v2)

```js
{
  nextNumber: 28,                    // Contador documentos
  leads: [],                         // Leads del sitio web
  catalogo: [...],                   // 12 productos/servicios seed
  clients: [{ id, nombre, contacto, telefono, email, direccion, pais, notas, productos[], estado }],
  docs: [{                           // Proformas / Facturas
    id, tipo: 'proforma'|'factura',
    numero, cotizacion: 'PRF-001'|'FAC-001',
    clientId, fechaEmision, fechaEntrega,
    estado: 'borrador'|'enviada'|'pagada',
    notas, items: [{ desc, qty, precio }]
  }],
  services: [{                       // Servicios contratados (MRR)
    id, clientId, nombre, descripcion,
    tipo: 'cctv'|'mantenimiento'|'redes'|'acceso'|'otro',
    estado: 'activo'|'inactivo'|'vencido',
    fechaInicio, fechaVencimiento, valorMensual,
    itemsIncluidos[], notas
  }],
  tickets: [{                        // Tickets soporte
    id, clientId, serviceId, titulo, descripcion,
    prioridad: 'baja'|'media'|'alta'|'critica',
    estado: 'abierto'|'en_proceso'|'resuelto'|'cerrado',
    fechaCreacion, fechaActualizacion, asignadoA,
    historial: [{ autor, mensaje, fecha }]
  }]
}
```

**Helpers MRR:**
- `Store.serviceTotalMensual()` → suma `valorMensual` de servicios activos
- `Store.computeServiceStatus(s)` → calcula estado según `fechaVencimiento`
- `Store.ticketsAbiertos()` / `Store.ticketsCriticos()`

---

## 🚀 Deploy

### Sitio Público (GitHub Pages)
```bash
cd 01-Cliente/web
# Push a repo apexcloudworkscompany/atlanteksystems → GitHub Pages auto-deploy
# Custom domain: CNAME atlanteksystems.com + DNS A @ 185.199.108-111.153
```

### Panel Admin (Vercel)
```bash
cd 02-Privado/panel-admin
vercel --prod
# Variables de entorno en Vercel Dashboard:
# JWT_SECRET=atlantek-jwt-secret-2026-production-change-me
# ADMIN_PASSWORD_HASH=90283688d6ffa15f24f1c8296639040db3afb9c9870907e64e317649eb82b20a
# Custom domain: admin.atlanteksystems.com → CNAME 79d881270da31ba8.vercel-dns-017.com
```

### Backend Apps Script (Manual)
```bash
# En Google Apps Script (cuenta apexcloudworkscompany@gmail.com):
# 1. Abrir proyecto 1h0-AAoVxIaKChq6ouGsyfjIUnAuQR7n-BqMUvCBybjokWcseEdZ40xL6
# 2. Reemplazar Code.gs con 02-Privado/apps-script/Code.gs
# 3. Deploy → Manage deployments → Edit @4 (atlantek) → New version → Deploy
```

---

## 🔧 Configuración Local

```bash
# Panel admin
cd 02-Privado/panel-admin
npx vercel dev          # Local dev con Vercel CLI (puerto 3000)

# Sitio público
cd 01-Cliente/web
npx serve .             # Puerto 3000, probar index.html
```

**Variables de entorno locales (`.env.local` en panel-admin):**
```env
JWT_SECRET=dev-secret-change-me
ADMIN_PASSWORD_HASH=90283688d6ffa15f24f1c8296639040db3afb9c9870907e64e317649eb82b20a
```

---

## 📁 Estructura del Repo (Monorepo Apex)

```
F:\apex-cloudworks\proyectos\Atlantek\
├── 01-Cliente\                    # Entregables cliente
│   ├── web\                       # Document root sitio público (GitHub Pages)
│   │   ├── index.html
│   │   ├── assets\ (css/js/img)
│   │   ├── _headers, robots.txt, sitemap.xml, CNAME
│   │   └── proforma-test.html     # Demo proforma pública
│   ├── Presentacion\              # Presentación ejecutiva
│   ├── propuesta\                 # Propuesta comercial
│   └── Auditoria\                 # Auditoría integral + index.html
│
├── 02-Privado\                    # Interno Apex/Atlantek
│   ├── panel-admin\               # Panel admin (Vercel)
│   │   ├── admin.html, dashboard.html, client-portal.html
│   │   ├── api\auth\*.js          # Vercel Serverless Functions
│   │   ├── assets\ (css/js)
│   │   ├── legal\*.html           # 5 documentos legales
│   │   ├── vercel.json, package.json
│   │   └── worker\                # Cloudflare Worker (legacy, no usado en Vercel)
│   ├── apps-script\               # Backend Sheets (Code.gs)
│   ├── BITACORA.md                # Este archivo (bitácora técnica)
│   ├── PLAN_MIGRACION.md          # Plan migración AWS → Vercel
│   ├── ACTIVAR-DOMINIO-OFICIAL.md # Checklist dominio
│   └── Machotes\                  # Plantillas documentos
│
└── CEO\                           # Contexto estratégico
    └── PLAN-SEO-LOCAL.md          # Plan SEO para Daniel
```

---

## 🔒 Seguridad

| Capa | Implementación |
|------|----------------|
| **Auth** | JWT HS256 8h, HttpOnly Secure SameSite=Lax cookie, auto-refresh, revocación vía KV (pendiente Vercel KV) |
| **Rate Limit** | Cliente: 3 req/hora (localStorage) · Servidor: Apps Script quota |
| **Sanitización** | `sanitize()` escapa `< > " ' &` en todos los inputs antes de POST |
| **Validación Tel** | Pattern `[2-8][0-9]{3}-?[0-9]{4}` + JS `validatePhoneCR()` |
| **Headers** | CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy |
| **Tokens** | Separados: `TOKEN_PUBLICO` (solo leads) vs `TOKEN_ADMIN` (load/save/lead-status) |
| **Panel** | No servido en repo público → 404 en `atlanteksystems.com/admin.html` |

---

## 📋 Pendientes / Próximos Pasos

| Prioridad | Tarea | Estado |
|-----------|-------|--------|
| 🔴 | **Redeploy Apps Script** con `Code.gs` nuevo (tokens separados) | Pendiente manual |
| 🔴 | **Vercel KV** para revocación de sesiones real (ahora stateless) | Pendiente |
| 🟡 | **Cloudflare Access** en `atlantek-admin.pages.dev` (política email/PIN) | UI bug en save |
| 🟡 | Search Console propiedad `https://atlanteksystems.com/` + GBP | Con Daniel |
| 🟡 | Borrar filas `TEST-no-enviar / 0000` en hoja Leads | Manual |
| 🟢 | Demo a Daniel → Firma + 50% adelanto ($350 setup + $50/mes) | Coordinar |

---

## 💰 Modelo Comercial (Atlantek)

| Concepto | Precio |
|----------|--------|
| Setup inicial | $350 USD único |
| Plan trimestral | $900 USD / 3 meses |
| Mantenimiento | $50 USD/mes |
| Dominio .com | $15 USD/año |
| Landing extra | $150 USD |

**Moneda:** USD siempre. **Facturación:** CRC al tipo de cambio BCCR venta del día.

---

## 👥 Contactos

| Rol | Contacto |
|-----|----------|
| **Desarrollo (Apex)** | Garett Barrantes · `apexcloudworkscompany@gmail.com` · +506 6314-4171 |
| **Cliente (Atlantek)** | Daniel Pérez · `soporte@atlanteksystems.com` · +506 7231-2225 |
| **Dominio DNS** | Cloudflare (cuenta Daniel: `Dperez.co.cr@gmail.com`) |
| **Hosting Web** | GitHub Pages (`apexcloudworkscompany/atlanteksystems`) |
| **Hosting Panel** | Vercel (`deprivedvisit27s-projects/panel-admin`) |
| **Backend Data** | Google Apps Script (cuenta Apex) → Google Sheets |

---

## 📝 Bitácora Técnica

Ver `02-Privado/BITACORA.md` para historial completo de cambios (2026-09-15 a 2026-09-27).

**Últimos hitos:**
- 2026-09-25: Panel admin completo (Servicios + Tickets + Portal Cliente) → Cloudflare Pages
- 2026-09-26: Migración panel admin a Vercel + auth JWT Serverless Functions
- 2026-09-27: Dominios oficiales LIVE en Vercel (atlanteksystems.com + admin.atlanteksystems.com)

---

## 📄 Licencia

Proyecto privado — Apex Cloud Work / Atlantek Systems. Uso interno y cliente únicamente.