# ⚙️ Operations — Manual Operativo de Apex Cloud Work
> Cómo opera Apex · Wilson debe conocer esto de memoria · Versión 1.0 · Junio 2026

---

## Infraestructura AWS

| Servicio | Uso | Detalles |
|----------|-----|----------|
| **S3** | Hosting estático | Buckets por cliente |
| **CloudFront** | CDN + HTTPS | Distribución global |
| **Route 53** | DNS | Dominios de clientes |
| **IAM** | Permisos CLI | Perfil `apex-admin` |
| **Bedrock** | IA (futuro Wilson) | Claude API en AWS |
| **Cognito** | Auth (futuro) | Admin panels |

### Convención de nombres S3
```
[cliente]-[proyecto]          → skindoctors-cr-landings
apex-[proyecto]               → apex-landing-main
```

### Proceso de deploy a S3
```bash
# Subir archivos
aws s3 sync ./[carpeta] s3://[bucket] --delete

# Invalidar caché CloudFront
aws cloudfront create-invalidation \
  --distribution-id [ID] \
  --paths "/*"
```

---

## Infraestructura por cliente activo

### Skindoctors CR
| Recurso | Valor |
|---------|-------|
| Bucket | `skindoctors-cr-landings` — us-east-2 |
| CloudFront | `E31U5V9IA0JXSZ` · `d3suiaystvdco4.cloudfront.net` |
| Landing 1 | `/melasblock/` — N8N activo |
| Landing 2 | `/cbd-balance/` — toggle pendiente |
| Presentación | `/presentacion/` |
| WA activo | +506 6314-4171 (Garett) — cambiar al firmar |

### Apex Landing
| Recurso | Valor |
|---------|-------|
| Dominio | apexcloudworkscompany.com |
| Paleta | Gold/cream sobre `#060402` |
| Admin | `/admin.html` — mock data |
| Pendiente | Foto Garett + auth Cognito + Google Sheets |

---

## Flujo de proyecto (8 pasos)

```
PASO 1: BRIEF
  → Reunión/WA con cliente
  → Llenar formulario de brief (nombre, rubro, colores, referencias)
  → Confirmar paleta y fuentes según rubro

PASO 2: PALETA Y FUENTES
  → Seleccionar de la tabla oficial de paletas
  → Confirmar con cliente si tiene marca existente

PASO 3: SECCIONES
  → Definir arquitectura del sitio (qué secciones lleva)
  → Confirmar con cliente antes de construir

PASO 4: HTML/CSS/JS
  → Construir mobile-first
  → Incluir: WA flotante, form con webhook, footer Apex
  → Test en móvil antes de mandar preview

PASO 5: S3 PREVIEW
  → Subir a bucket S3 del cliente
  → Compartir URL de preview por WA

PASO 6: REVISIÓN 1
  → Cliente da feedback
  → Máximo 48h para implementar cambios

PASO 7: REVISIÓN 2 (ÚLTIMA)
  → Segunda ronda de ajustes
  → Si el cliente pide más → cobrar adicional ($50 USD/revisión extra)

PASO 8: DEPLOY Y ENTREGA
  → Deploy con CloudFront
  → Configurar Route 53 si hay dominio propio
  → Entregar credenciales de acceso
  → Onboarding de 30 min por WA
```

---

## Precios y Modelo de Negocio

| Servicio | Precio USD | Notas |
|---------|-----------|-------|
| Setup inicial | $350 | Único, incluye 1 landing |
| Plan trimestral | $900 / 3 meses | Soporte + hasta 2 actualizaciones |
| Landing adicional | $150 | Sobre setup existente |
| Mantenimiento | $50–100/mes | Según necesidad |
| Revisión extra | $50 | Más allá de las 2 incluidas |
| **Moneda** | **USD siempre** | Sin excepción |

### Política de pago
- **50% adelantado** al cerrar
- **50%** al aprobar el preview (antes del deploy)
- Transferencia SINPE Móvil o USD directo

---

## Gestión de proyectos

### Regla de oro: UN proyecto a la vez
El orden de prioridad es estricto:
1. **Skindoctors** — infraestructura live, pendiente reunión de presentación + firma + cobro $450
2. **EcoPollo** — cotizador en desarrollo activo
3. **VisionaryFilm** — pendiente datos de Fabian (WA, fotos, YouTube ID)
4. **RFLX** — en cartera
5. **Arte Verde** — en cartera

### Tracking semanal (domingos)
- ¿Qué cerré esta semana?
- ¿Qué quedó pendiente?
- ¿Qué imprevistos hubo?
- Plan para la próxima semana

---

## N8N — Automatización de leads

### Arquitectura estándar
```
Form submit → N8N webhook → Google Sheets + Gmail notificación + (futuro) WhatsApp
```

### Webhook por landing
| Landing | Webhook URL |
|---------|------------|
| Skindoctors Melasblock | Activo en producción |
| Skindoctors CBD Balance | Importado — pendiente activar toggle |

### Variables del formulario estándar
```json
{
  "nombre": "string",
  "telefono": "string",
  "email": "string",
  "mensaje": "string",
  "fuente": "landing_name",
  "timestamp": "ISO 8601"
}
```

---

## GitHub

| Repo | URL | Descripción |
|------|-----|-------------|
| Apex main | github.com/apexcloudworkscompany | Organización principal |
| Jarvis/Wilson | github.com/apexcloudworkscompany/Jarvis | Agente interno |

### Convención de commits
```
feat: nueva funcionalidad
fix: corrección de bug
deploy: subida a producción
update: actualización de contenido
refactor: limpieza de código
```

---

## Jarvis — Agente Interno

### Estado actual (24 jun 2026)
- Python local · `proyectos/wilson/jarvis.pyw`
- Brief matutino 07:00 AM
- Comandos: `/lead`, `/deploy`, `/revisar`, `/refactor`

### Roadmap Jarvis
```
Fase 1 (actual):   Brief + comandos básicos
Fase 2 (3+ clientes): Monitoreo automático de uptime
Fase 3 (futuro):   Reportes semanales por WA, revisión de Gmail, plan domingo
```

### Cerebro de Jarvis
Los archivos en `Mente/` (raíz del repo) son la fuente de verdad:
- `brand-voice.md` → Cómo habla Apex
- `small-business.md` → A quién le habla
- `design-claude.md` → Cómo diseña
- `operations.md` → Cómo opera (este archivo)
- `customer-support.md` → Cómo atiende clientes

---

## Comunicación interna

| Canal | Uso |
|-------|-----|
| Claude Code | Desarrollo, diseño, estrategia |
| Wilson/Jarvis | Automatización, monitoreo, briefs |
| VS Code | Código |
| GitHub | Versionado |
| Google Calendar | Agenda y compromisos |
| WhatsApp | Todo con clientes |
