# Apex RMM — clon interno de Atera

> Estado: 🔧 Fase 1 en curso (telemetría MVP) — 16 jul 2026

## Qué es

Clon propio de un RMM+PSA (tipo Atera): agentes Node.js corriendo en equipos monitoreados reportan CPU/disco/uptime a un backend central, con dashboard web de estado.

Decisión: en vez de usar Atera de terceros, se construye este producto — tanto para uso interno (monitorear el propio equipo) como, a futuro, para venderlo como línea de negocio de Apex Cloud Work.

⚠️ Se le advirtió a Garett directamente que un clon completo (RMM+PSA+acceso remoto+facturación) es un proyecto de 6-12+ meses, fuera de "un proyecto a la vez" del roadmap — decidió seguir igual. Ver plan completo en el historial de planning de la sesión del 16 jul 2026.

## Arquitectura

- **No es un backend aparte** — extiende `backend/` (Express+MySQL) que ya corre para Apex Landing. Reusa su auth de sesión, su pool de conexión, su deploy PM2/EC2/Nginx.
- **Reusa PSA existente**: `backend/schema.sql` ya tenía `tickets`, `ticket_messages`, `pagos`, `users` con roles — no se reconstruye desde cero.
- **Agente**: Node.js (`IT/agent/`), corre como servicio Windows vía `node-windows`, reporta por HTTP a `/api/telemetry` con auth por API key propia del dispositivo.
- **Dashboard**: `IT/dashboard.html` + `IT/assets/`, reusa `tokens.css` (fuente de verdad de diseño) y el patrón de `sparklineSVG()`/`h()` de `assets/js/admin.js`.

## Fases

1. ✅ Telemetría MVP — tablas `devices`/`device_metrics`/`device_alerts`, rutas `/api/devices` y `/api/telemetry`, agente, dashboard básico
2. ⏳ Alertas (umbrales CPU/disco/offline)
3. ⏳ PSA conectado (alertas → tickets, reusando UI de tickets ya existente)
4. ⏳ Multi-tenant (cuando se piense en vender — `devices.owner_user_id` ya existe)
5. ⏳ Acceso remoto — la parte más riesgosa, sin diseñar todavía

## Pendientes inmediatos

- [ ] Correr `schema.sql` actualizado contra MySQL local
- [ ] Probar Fase 1 end-to-end (backend local + agente local + dashboard)
- [ ] Deploy de las rutas nuevas a EC2 cuando el backend se despliegue (sigue pendiente en general, ver `CLAUDE.md`)
