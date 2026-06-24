# 🎧 Customer Support — Protocolo de Atención al Cliente
> Apex Cloud Works · Wilson debe aplicar esto · Versión 1.0 · Junio 2026

---

## Filosofía de soporte

**No somos un call center. Somos un socio.**  
Respondemos rápido, resolvemos de verdad, y sabemos cuándo decir no.

Regla: **el cliente nunca debe preguntarse qué está pasando con su proyecto.**  
Si hay silencio de nuestra parte por más de 24h en horario laboral, algo está mal.

---

## Canales y tiempos de respuesta

| Canal | Tiempo máximo | Horario |
|-------|--------------|---------|
| WhatsApp (principal) | 2 horas | 8:00–22:00 |
| Email | 24 horas | Días hábiles |
| Llamada | Solo si el cliente la pide | — |

**WhatsApp es el canal primario.** Email solo para propuestas formales o documentos.

---

## Ciclo de vida del cliente

```
PROSPECTO → PRIMER CONTACTO → PROPUESTA → CIERRE → DESARROLLO → ENTREGA → MANTENIMIENTO
```

### Estados y acciones

| Estado | Qué hacer |
|--------|-----------|
| Prospecto nuevo | Responder en < 1h, dar info rápida, agendar llamada |
| En propuesta | Seguimiento a los 3 días si no responde |
| Pagó 50% | Confirmar recibo, dar fecha de preview |
| En revisión | Responder feedback en < 48h |
| Live | Check-in al mes para ver cómo van |
| Sin respuesta 10+ días | Descalificar amablemente |

---

## Templates de mensajes WA

### Primer contacto (referido)
```
Hola [Nombre]! Soy Garett de Apex Cloud Works, [Referido] me comentó que andás buscando presencia en línea para [negocio].

Te cuento en dos líneas: hacemos sitios web para pequeñas empresas en 7–10 días, con formulario de contacto y WhatsApp integrado, todo en la nube (muy rápido).

El setup inicial es $350 USD único.

¿Tenés unos minutos para contarme más de tu negocio?
```

### Envío de preview
```
Hola [Nombre]! Ya tenés tu preview lista:

🔗 [URL del preview en S3]

Revisalo bien en celular y desktop. Cualquier cambio me avisás y lo aplico. Recordá que tenemos 2 rondas de revisión incluidas.

¿Qué te parece?
```

### Solicitud de feedback pendiente
```
Hola [Nombre], un follow-up rápido — ¿tuviste chance de ver el preview?

Quiero que quedés 100% feliz antes de publicarlo. Dame tu feedback cuando puedas y cerramos esto esta semana.
```

### Confirmación de deploy
```
✅ [Nombre del negocio] ya está live!

🌐 [URL final]

Revisá que todo funcione: el formulario, el botón de WhatsApp, que cargue rápido en tu celular.

Cualquier cosita me avisás. Fue un placer trabajar con vos.

*Desarrollado por Apex Cloud Works — Cartago, CR*
```

### Cobro de revisión adicional
```
Hola [Nombre], ya completamos las 2 revisiones incluidas en el paquete.

Esta ronda adicional tiene un costo de $50 USD.

¿Cómo preferís pagar — SINPE o transferencia?
```

### Follow-up post-entrega (1 mes)
```
Hola [Nombre]! Un mes desde que publicamos tu sitio 🎉

¿Cómo te ha ido? ¿Estás recibiendo consultas por el formulario o WhatsApp?

Si necesitás alguna actualización o querés agregar algo, aquí estamos.
```

---

## Política de revisiones

| Revisiones incluidas | 2 (en todo setup) |
|---------------------|------------------|
| Qué cuenta como revisión | Ronda de feedback del cliente |
| Qué NO cuenta | Errores nuestros — esos se corrigen sin costo |
| Costo revisión extra | $50 USD por ronda |
| Límite máximo | Sin límite — pero cada una se cobra |

**Definición de "error nuestro":**  
- El sitio no carga
- El formulario no envía
- Algo que acordamos en el brief y no quedó
- Bug visible en un dispositivo normal

**Definición de "revisión del cliente":**  
- Cambio de texto o contenido
- Cambio de colores que no estaban en el brief
- Agregar secciones nuevas
- "En realidad quiero que sea diferente"

---

## Manejo de situaciones difíciles

### Cliente insatisfecho
```
Entiendo tu frustración, [Nombre]. Vamos a revisarlo juntos.

Contame exactamente qué no está funcionando como esperabas y lo resolvemos.
```
→ Nunca defenderse primero. Escuchar, identificar si es error nuestro o fuera de alcance.

### Cliente que pide más de lo pactado
```
Claro, podemos agregar eso. Ese cambio está fuera del alcance original, así que tendría un costo adicional de $[X].

¿Lo incluimos?
```
→ Nunca trabajar fuera de alcance sin dejar registro escrito.

### Cliente que desaparece (no paga el 50% restante)
```
Hola [Nombre], quería recordarte que el sitio está listo para publicar.

El saldo pendiente es $[X]. Una vez confirmado el pago, lo publicamos el mismo día.

¿Todo bien por tu lado?
```
→ Esperar 7 días. Si no responde → no publicar hasta recibir pago.

### Cliente que quiere dominio propio
```
Perfecto, si ya tenés el dominio registrado, me compartís los accesos a donde está el DNS y yo lo configuro.

Si necesitás comprarlo, te recomiendo hacerlo en [Namecheap/GoDaddy] y me avisás.
```

---

## Documentación de clientes

Cada cliente debe tener en su carpeta:
```
proyectos/[cliente]/
├── brief.md          → Resumen del proyecto
├── index.html        → Landing principal
├── [otras páginas]
└── assets/           → Imágenes y recursos
```

Datos mínimos a guardar de cada cliente:
- Nombre completo y empresa
- WhatsApp
- Email
- Servicio contratado y precio
- Fecha de inicio y entrega
- Estado del pago (50% inicial + 50% final)
- URL live del sitio

---

## Onboarding del cliente (post-entrega)

Después de publicar, hacer un WA corto con:
1. URL del sitio live
2. Cómo revisar los leads que llegan (Google Sheets link)
3. Qué hacer si algo no funciona (WA directo a Garett)
4. Recordatorio del plan de mantenimiento si aplica

Duración: 15–20 minutos por WA o video corto de Loom si es necesario.
