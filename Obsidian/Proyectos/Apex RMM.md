# Apex RMM

**Cliente:** Interno (posible línea de negocio futura)
**Valor:** Línea de negocio futura opcional — no es prioridad de cobro
**Estado:** 🆕 Fase 1 (telemetría) construida y verificada 16 jul 2026
**Prioridad:** Baja — decisión consciente de meterle tiempo pese al roadmap "un proyecto a la vez"

---

## Qué es

Clon propio de Atera (RMM+PSA) para monitorear el propio equipo de Garett. Se decidió construirlo en vez de pagar Atera — advertido de que un clon completo (RMM+PSA+acceso remoto+facturación) son 6-12+ meses.

**No es un producto aparte** — extiende `backend/` de Apex Landing (mismo Express+MySQL), reusa auth de sesión, pool de conexión y el PSA ya existente (`tickets`, `ticket_messages`, `pagos`, `users`).

---

## Infraestructura

| Recurso | Valor |
|---------|-------|
| Backend | `backend/schema.sql` (tablas `devices`, `device_metrics`, `device_alerts`) + `middleware/auth.js` (`requireDeviceKey`) + `routes/devices.js`/`routes/telemetry.js` |
| Agente | `proyectos/apexcloudworkscompany.com/IT/agent/` — Node.js (`systeminformation` + `node-windows`) |
| Dashboard | `proyectos/apexcloudworkscompany.com/IT/dashboard.html` — reusa `tokens.css` y patrón `sparklineSVG()`/`h()` de `admin.js` |
| DB de prueba | `backend/.env.local` (MySQL local, root sin password) — **⚠️ `.env` real apunta al RDS de producción, nunca se tocó su schema** |

---

## Roadmap de fases

1. [x] Telemetría MVP — verificada 16 jul 2026, dispositivo de prueba reportando CPU/disco/uptime real
2. [ ] Alertas (umbrales CPU/disco/offline)
3. [ ] PSA conectado (alertas→tickets, reusa UI existente)
4. [ ] Multi-tenant (`devices.owner_user_id` ya existe en schema)
5. [ ] Acceso remoto — la parte más riesgosa, sin diseñar, evaluar herramienta existente antes de construir algo propio

---

## Pendientes

- [ ] Decidir si el schema nuevo se aplica al RDS de producción o se mantiene separado
- [ ] Antes de retomar: confirmar en qué fase quedó (documentado también en `IT/PROMPT.md`)

---

## Notas

- Detalle completo de fases en `proyectos/apexcloudworkscompany.com/IT/PROMPT.md` — no repetir exploración de patrones del backend.
