# Manual — Entrega
> Apex Cloud Work · v1.0 · Uso: "Entregamos [cliente]"

## 1. Pre-deploy (bloqueante)
- [ ] Checklist pre-entrega completo (el de siempre: WA correcto, form e2e, footer, mobile, consola limpia)
- [ ] Chequeo de seguridad corrido (MANUAL-CHEQUEO-SEGURIDAD)
- [ ] 50% restante confirmado — **sin pago no hay dominio final ni entrega**
- [ ] Textos aprobados por el cliente por escrito (captura de WA vale)

## 2. Deploy
- Ejecutar MANUAL-DEPLOY (sync → invalidación → verificación en incógnito + móvil)
- Commit final con tag: `git tag entrega-v1`

## 3. Paquete de entrega al cliente (mismo día, por WA)
1. Link final del sitio
2. Video de 2–3 min (OBS): recorrido del sitio + dónde caen los leads en su Sheet + cómo se ve la notificación
3. Mensaje tipo:
   > "Listo [nombre], tu sitio está en línea: [URL]. Te grabé un video corto de cómo funciona todo. Los mensajes de clientes te llegan directo a tu WhatsApp/correo. Tenés 30 días de soporte por cualquier detalle. ¡Gracias por confiar en Apex!"
4. Accesos que le corresponden: su Google Sheet compartido a SU correo (editor), nada de cuentas de Apex
5. Recordar qué incluye soporte y qué no (una línea, sin drama — el detalle está en MANUAL-SOPORTE)

## 4. Cierre interno
- [ ] LOG.md actualizado: entregado + fecha + monto cobrado
- [ ] Lead de prueba borrado del Sheet
- [ ] Post-mortem agendado (MANUAL-POST-MORTEM, 15 min, esta semana)
- [ ] Pedir el testimonio AHORA (día de entrega = pico de satisfacción):
   > "Si quedaste contento, ¿me regalás 2 líneas de reseña? Me ayuda un montón para los próximos clientes."
- [ ] Preguntar por referidos una semana después, no el mismo día

## Regla
La entrega no termina cuando el sitio está online. Termina cuando el cliente vio el video, tiene su Sheet, y el testimonio está pedido.
