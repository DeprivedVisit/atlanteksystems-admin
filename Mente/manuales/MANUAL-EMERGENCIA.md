# Manual — Emergencia (sitio caído o leads que no llegan)
> Apex Cloud Work · v1.0 · Uso: mensaje del cliente tipo "mi página no sirve" / "no me llegan mensajes"

## Paso 0 — Responder al cliente en <15 min (antes de diagnosticar)
> "Ya lo estoy revisando, [nombre]. Te confirmo en un rato qué pasó y cuándo queda. Gracias por avisarme."
Nunca diagnosticar en frío por WA ni prometer horas exactas antes de mirar.

## Ruta A — "El sitio no carga"
Revisar EN ESTE ORDEN:
1. **¿Carga para vos?** Incógnito + datos móviles (no tu WiFi). Si carga → es del lado del cliente (su red/caché): guiarlo a refrescar.
2. **CloudFront**: estado de la distribución en consola. ¿Deshabilitada? ¿Error de certificado (candado roto)?
3. **S3**: ¿el bucket existe y tiene los archivos? ¿Alguien corrió un sync con `--delete` desde carpeta equivocada?
4. **DNS/dominio**: `nslookup [dominio]` — ¿el dominio venció? ¿Route 53 apunta bien?
5. **AWS caído**: status.aws.amazon.com — si es us-east-2 en general, no es culpa de Apex. Al cliente: "Es una caída regional de Amazon, afecta a miles de sitios, se restablece solo. Te aviso apenas vuelva."

## Ruta B — "No me llegan los leads"
1. Enviar un lead de prueba desde el sitio en producción.
2. ¿Llegó al **Sheet**? → Sí: el problema es la NOTIFICACIÓN (revisar nodo de Gmail/WA en N8N). No: seguir.
3. **N8N**: ¿el workflow está Activo? ¿Ejecuciones fallidas en el historial? (workflow desactivado tras error es el caso más común)
4. **Webhook URL**: ¿cambió y el HTML quedó con la vieja?
5. **Apps Script** (si aplica): ¿pide re-autorización? ¿Cuota diaria agotada?
6. Mientras se arregla: activar respaldo — el form apunta temporalmente a WhatsApp directo (`wa.me`) para no perder leads.

## Comunicación de cierre
> "Listo [nombre], era [causa en una línea, sin tecnicismos]. Ya está funcionando — probé yo mismo y te llegó el mensaje de prueba. [Si fue culpa de Apex: 'Fue un detalle mío, disculpá la molestia.']"
Reconocer el error propio en una línea genera más confianza que taparlo.

## Después
- Registrar en LOG.md: causa raíz, no síntoma
- Si la causa fue un proceso saltado → actualizar el manual correspondiente
- Caída por culpa de Apex durante los 30 días de soporte = gratis. Después: gratis igual si es infraestructura que Apex administra (es tu hosting cobrado), cotizable si el cliente tocó algo.
