# Manual — Cierre y Cobro
> Apex Cloud Work · v1.0 · Uso: "El cliente no paga / se enfrió [cliente]"

## Estructura de pago (recordatorio)
- 50% para arrancar — sin esto no hay preview
- 50% para publicar en dominio final — el preview vive en URL de CloudFront con marca de agua opcional, nunca en el dominio del cliente

## Cuándo se pide el 50% restante
En el momento en que el cliente aprueba la revisión 2 (o dice "me encanta, publicalo"). No después del deploy. El mensaje:
> "¡Buenísimo! Con el 50% restante ($X) lo dejo publicado hoy mismo en tu dominio. SINPE/transferencia a [datos]."

## Escalera de recordatorios (cliente que se enfría)
| Día | Acción | Tono |
|-----|--------|------|
| 0 | Aprobó y se pidió el pago | Normal |
| +3 | Recordatorio 1: "Hola [nombre], ¿pudiste ver lo del pago? El sitio está listo para salir." | Amable |
| +7 | Recordatorio 2: "Te escribo para coordinar el pago final. El preview queda disponible hasta el [fecha]." | Firme, con fecha |
| +14 | Aviso final: "Si no recibo el pago antes del [fecha], pauso el proyecto y el preview se da de baja. Retomarlo después tiene costo de reactivación de $50." | Serio, sin enojo |
| +21 | Se baja el preview del bucket. Se archiva el proyecto. | Silencio |

## Reglas
1. **Nunca** se publica en el dominio del cliente antes del pago total. El preview en CloudFront es la palanca.
2. Nunca rogar ni mandar más de un mensaje por escalón. Cada mensaje extra baja tu precio percibido.
3. El trabajo hecho no se borra: se archiva. Si vuelve a los 3 meses, paga reactivación + diferencia si subieron los precios.
4. Cliente que pagó tarde una vez → el próximo proyecto con él es 100% adelantado.
5. Referidos: la comisión del referidor se calcula sobre lo COBRADO, no lo cotizado, y se paga cuando entra el pago final.

## Si el cliente pide rebaja al final
> "El precio fue el acordado al inicio y el trabajo está entregado como se definió. Lo que sí puedo es [plan de pago en 2 partes / quitar una sección]."
Rebajar al final entrena al cliente a regatear siempre. No se hace.
