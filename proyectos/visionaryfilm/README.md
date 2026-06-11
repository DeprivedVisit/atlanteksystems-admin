# VisionaryFilm CR — Sistema Web Completo

Plataforma web para estudio de producción audiovisual en Costa Rica.
Incluye landing pública + panel de gestión privado con Firebase.

---

## Estructura de archivos

```
visionaryfilm/
├── index.html          # Landing pública
├── style.css           # Estilos de la landing
├── script.js           # Lógica de la landing (nav, formulario, animaciones)
├── admin.html          # Panel de administración privado
├── admin.css           # Estilos del dashboard
├── admin.js            # Lógica completa del admin (Firebase)
└── firebase-config.js  # Configuración Firebase (completar antes de usar)
```

---

## Configuración inicial (requerida)

### 1. Crear proyecto Firebase

1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. **Add project** → nombre: `visionaryfilm-cr`
3. Deshabilitar Google Analytics (opcional) → **Create project**

### 2. Registrar la app web

1. En el dashboard del proyecto → ícono `</>` (Web)
2. Nombre de la app: `VisionaryFilm Web` → **Register app**
3. Copiar el objeto `firebaseConfig` que aparece
4. Pegar los valores en `firebase-config.js`:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### 3. Activar Authentication

1. Firebase Console → **Authentication** → **Get started**
2. **Sign-in method** → **Email/Password** → activar → **Save**
3. Pestaña **Users** → **Add user** → correo y contraseña de Fabian

### 4. Crear Firestore Database

1. Firebase Console → **Firestore Database** → **Create database**
2. Elegir región: `us-central1` (o la más cercana)
3. Empezar en **production mode**
4. Ir a la pestaña **Rules** → reemplazar con:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. **Publish**

### 5. Personalizar la landing

En `script.js`, línea 2, cambiar el número de WhatsApp:

```js
const WA_NUMBER = '50612345678'; // Número real sin + ni espacios
```

En `index.html`, ajustar según el cliente:
- Precios de los 3 paquetes (sección `#precios`)
- Datos de contacto en el footer
- Link de Instagram en el footer
- Reel de YouTube: descomentar el `<iframe>` y reemplazar `VIDEO_ID`

---

## Funcionalidades

### Landing pública (`index.html`)

| Sección | Descripción |
|---------|-------------|
| **Nav** | Logo + links + botón Admin. Responsive con menú hamburguesa. |
| **Hero** | Tagline, descripción, CTA "Hablemos", placeholder para reel YouTube. |
| **Servicios** | 4 cards: Video Corporativo, Fotografía, Eventos, Post-producción. |
| **Portafolio** | Grid 6 trabajos con overlay hover. Reemplazar con fotos/videos reales. |
| **Proceso** | 4 pasos: Brief → Pre-producción → Producción → Entrega. |
| **Precios** | 3 paquetes USD: Básico $350 · Estándar $750 · Premium $1,400. |
| **Contacto** | Formulario → genera mensaje y abre WhatsApp directo. |
| **Footer** | Redes sociales + crédito Apex Cloud Works. |
| **WhatsApp flotante** | Botón fijo esquina inferior derecha. |

### Panel Admin (`admin.html`)

Acceso con login Firebase. 5 secciones:

#### Dashboard
- 4 stat cards: Ingresos totales · Gastos totales · Balance neto · Fondo de equipo
- Tabla de últimas 10 transacciones (tiempo real)
- Chips de proyectos activos

#### Clientes
- Tabla con nombre, empresa, email, teléfono, cantidad de proyectos
- Crear / editar / eliminar clientes
- Búsqueda en tiempo real
- Modal de detalle: historial de proyectos por cliente

#### Proyectos & Pagos
- Tabla con estado (activo / completado / cancelado), valor y monto pagado
- Crear / editar proyectos vinculados a un cliente
- **Registrar pago**: suma al campo `pagado` y crea transacción de ingreso
- **Botón WhatsApp**: genera mensaje con resumen del proyecto y datos BAC para transferencia
- Filtros por estado y búsqueda por nombre

#### Gastos
- Registro de salidas de dinero con categoría, monto y fecha
- Categorías: Equipo · Software · Transporte · Marketing · Producción · Otro
- Totales: gastos del mes actual y total histórico
- Filtro por categoría

#### Fondo de Equipo
- Meta con nombre y monto objetivo (ej. "Cámara Sony A7 IV — $3,200")
- Barra de progreso visual con % completado y monto restante
- Depósito manual con nota
- Cambio de meta sin perder el saldo acumulado
- Historial de depósitos con columna acumulado

#### Configuración
- Datos BAC para transferencia (nombre, número de cuenta, IBAN)
- Número de WhatsApp del negocio
- Se guardan en `localStorage`, se usan en el botón WhatsApp de cada proyecto

---

## Schema Firestore

```
/clients/{id}
  nombre        string
  empresa       string
  email         string
  telefono      string
  notas         string
  fechaCreacion timestamp

/projects/{id}
  clienteId     string
  clienteNombre string
  titulo        string
  descripcion   string
  valorTotal    number (USD)
  pagado        number (USD)
  estado        "activo" | "completado" | "cancelado"
  fechaInicio   timestamp
  fechaEntrega  string (YYYY-MM-DD)

/transactions/{id}
  tipo          "ingreso" | "gasto"
  monto         number (USD)
  descripcion   string
  categoria     string
  proyectoId    string (opcional)
  clienteId     string (opcional)
  metodo        "BAC-transferencia" | "efectivo" | "otro"
  fecha         timestamp

/equipmentFund/main  (documento único)
  nombre        string
  meta          number (USD)
  saldo         number (USD)
  historial     [{monto, nota, fecha}]
```

---

## Paleta visual

| Variable | Color | Uso |
|----------|-------|-----|
| `--bg` | `#080810` | Fondo principal landing |
| `--gold` | `#e8c87a` | Acento dorado, CTAs |
| `--white` | `#f5f0e8` | Texto principal |
| `--muted` | `#8888a0` | Texto secundario |
| Admin `--bg` | `#0d0d14` | Fondo dashboard |
| Admin `--card` | `#141420` | Cards y tablas |

**Fuentes:** `Syne` (headings, 800) · `DM Sans` (body, 300–500)

---

## Deploy

El proyecto es HTML/CSS/JS puro (módulos ES). Necesita servirse desde un servidor HTTP (no funciona abriendo el archivo directo por los módulos ES de Firebase).

**Opciones recomendadas:**
- **AWS S3 + CloudFront** (Apex estándar) — ver proceso de deploy interno
- **Firebase Hosting** (alternativa simple si ya tiene el proyecto Firebase):
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase init hosting
  firebase deploy
  ```

**IMPORTANTE:** En producción, restringir la API Key de Firebase a solo el dominio del cliente desde la Google Cloud Console.

---

## Checklist de entrega

- [ ] `firebase-config.js` con config real del proyecto
- [ ] Usuario creado en Firebase Auth
- [ ] Reglas Firestore configuradas
- [ ] `WA_NUMBER` en `script.js` con número real
- [ ] Precios actualizados en `index.html`
- [ ] Fotos de portafolio reales subidas
- [ ] Reel de YouTube conectado (descommentar iframe)
- [ ] Link de Instagram actualizado en footer
- [ ] Datos BAC configurados en ⚙️ Configuración del admin
- [ ] Probado en móvil
- [ ] Deploy en producción con dominio

---

## Desarrollado por

**Apex Cloud Works** — Cartago, Costa Rica  
apexcloudworkscompany@gmail.com · +506 6314-4171
