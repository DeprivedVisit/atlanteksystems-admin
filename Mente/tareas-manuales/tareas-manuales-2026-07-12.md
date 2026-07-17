# TAREAS MANUALES — 12 julio 2026

> Generadas por auditoría CEO. Lo automático ya está aplicado en el repo.
> Estas tareas requieren acción manual tuya (consolas, cobro, deploy).

---

## 🔴 URGENTES — Mañana (13 jul)

### 1. Rotar password del RDS MySQL
- **Riesgo:** Password `Cajeta25091998` en texto plano en `backend/.env`
- **Acción:** AWS Console → RDS → Databases → apexcloudworks → Modify → Master password → nueva contraseña
- **Después:** Actualizar `DB_PASS` en `backend/.env` con la nueva contraseña
- **Tiempo:** 15 min

### 2. Eliminar `apex-backend-key.pem` del disco
- **Riesgo:** Si alguien accede a tu laptop, tiene SSH directo al EC2
- **Acción:** `del F:\apex-cloudworks\backend\apex-backend-key.pem`
- **Si la necesitas para deploy:** copiarla a `~\.ssh\` primero
- **Después:** Ir a EC2 → Key Pairs → Create new key pair → usar la nueva para deploy
- **Tiempo:** 10 min

### 3. Regenerar N8N API Key
- **Riesgo:** JWT completo en `.env` raíz da acceso total a workflows N8N
- **Acción:** n8n.cloud → Settings → API → Regenerate
- **Después:** Actualizar `.env` raíz con el nuevo key (o mejor: usar variable de entorno del sistema)
- **Tiempo:** 5 min

### 4. Configurar Admin Token en Apps Script (Portal Apex)
- **Contexto:** Ya moví el token a `PropertiesService` en `portal-apps-script.gs`
- **Acción:** Abrir script.google.com → Apex Portal Backend → Project Settings → Script Properties → Agregar propiedad:
  - Key: `ADMIN_TOKEN`
  - Value: generar uno nuevo con `Utilities.getUuid().replace(/-/g,'')`
- **Después:** Actualizar `APPS_SCRIPT_ADMIN_TOKEN` en `backend/.env` con el mismo valor
- **Tiempo:** 10 min

### 5. Cambiar password admin de Divinas
- **Contexto:** Ahora usa SHA-256 (mejor que antes), pero el password sigue siendo `admin123`
- **Acción:** Abrir `divinas/admin.html` → login → cambiar contraseña desde el panel (si hay opción)
- **Si no hay opción:** Crear un script temporal o cambiar el hash en `auth.js` con el nuevo SHA-256 del password que elijas
- **Tiempo:** 10 min

---

## 🟡 ESTA SEMANA (14-19 jul)

### 6. Deploy backend a EC2
- **Contexto:** El backend está listo (Express + MySQL + helmet + rate limiting). Falta ponerlo en producción.
- **Acción:**
  1. Generar nuevo key pair en EC2
  2. Copiar `backend/` al EC2 via SCP
  3. Ejecutar `deploy-ec2.sh` en el servidor
  4. Verificar: `curl https://api.apexcloudworkscompany.com/api/admin/me`
- **Dependencias:** Tareas 1 y 2 completadas primero
- **Tiempo:** 1-2 horas

### 7. Cobrar Skindoctors $450 USD
- **Estado:** 27 días vencido (desde 15 jun)
- **Acción:** WhatsApp a Andrés → presentar `skindoctors/presentacion/index.html` → cobrar
- **Regla:** Sin cobro = sin más work. El dinero financia el deploy del backend.
- **Tiempo:** 30 min (conversación)

### 8. Actualizar CORS para producción
- **Archivo:** `backend/.env` línea 29
- **Acción:** Cambiar `FRONTEND_ORIGIN` de `localhost:5500` a `https://apexcloudworkscompany.com`
- **Acción 2:** Cambiar `COOKIE_SECURE=false` a `COOKIE_SECURE=true`
- **Dependencia:** Deploy del backend completado (tarea 6)
- **Tiempo:** 5 min

---

## 🟢 PRÓXIMAS SEMANAS

### 9. Migrar proyectos a backend (quitar Apps Script directo)
- **Proyectos afectados:** EcoPollo, Galiz, RFLX, INTEC, Skindoctors
- **Patrón actual:** JS público → Apps Script URL → Google Sheets (sin auth real)
- **Patrón objetivo:** JS público → Backend Apex (`/api/admin/gs`) → Apps Script (con session auth)
- **Beneficio:** Token nunca expuesto en JS público, rate limiting, logging
- **Tiempo:** 2-3 horas por proyecto

### 10. Health check diario automático
- **Opción A:** Agregar a Wilson un cron/check que verifique uptime de todos los dominios
- **Opción B:** Usar UptimeRobot (gratis) para monitorear apexcloudworkscompany.com, skindoctors, ecopollo, etc.
- **Alertas:** WhatsApp si alguno cae
- **Tiempo:** 1 hora para configurar

---

## ✅ LO QUE YA SE ARREGLÓ AUTOMÁTICAMENTE (12 jul)

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `.gitignore` | Blindaje: `**/.env`, `**/__pycache__/`, `**/*.pem`, wilson state files |
| 2 | `backend/app.js` | Agregado `helmet` + rate limiting global (200/15min) + rate limiting login (5/15min) |
| 3 | `backend/package.json` | Agregadas dependencias `helmet` y `express-rate-limit` |
| 4 | `admin.js:14` | Eliminado `_t = 'legacy'` placeholder |
| 5 | `firebase-mock.js` | Credenciales hardcoded reemplazadas con prompt interactivo |
| 6 | `portal-apps-script.gs:13` | Token migrado a `PropertiesService.getScriptProperties()` |
| 7 | `INTEC/config.js` | Warning de seguridad ampliado con instrucción de migración |
| 8 | `EcoPollo/index.html` | Inline `onclick` movido a `addEventListener` en script.js |
| 9 | `divinas/auth.js` | Hash djb2 trivial → SHA-256 via Web Crypto API (async) |
| 10 | `divinas/admin.html` + `index.html` | Call sites actualizados con async/await |
| 11 | `backend/.env` | Header comment corregido (Loop-Landing → Apex Cloud Work) |
| 12 | `backend/.env` | Comentario de COOKIE_SECURE para producción |

---

*Generado por Claude Code · 12 julio 2026*
