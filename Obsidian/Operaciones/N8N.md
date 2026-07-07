# N8N — Automatización de Leads

---

## Arquitectura estándar

```
Form submit → N8N Webhook → Google Sheets + Gmail notificación
                                        ↓ (futuro)
                                   WhatsApp API
```

---

## Webhooks activos

| Landing | Estado |
|---------|--------|
| Skindoctors / Melasblock | ✅ Activo en producción |
| Skindoctors / CBD Balance | ⚠️ Importado — pendiente activar toggle |

---

## Payload estándar del form

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

## Por hacer

- [ ] Activar toggle CBD Balance
- [ ] Agregar webhook a EcoPollo al hacer deploy
- [ ] Evaluar integración WhatsApp API (Fase 2 Jarvis)
