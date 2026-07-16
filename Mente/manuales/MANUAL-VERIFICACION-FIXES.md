# Manual — Verificación de Fixes ("lo que supuestamente está arreglado")
> Apex Cloud Work · v1.0 · Julio 2026
> Uso: "Verificá los fixes de [proyecto]" → Claude no cree nada marcado con ✅ hasta verlo probado.
> Principio: un fix sin evidencia es una hipótesis, no un fix.

---

## Por qué existe este manual

El patrón que mata: se arregla algo, se marca ✅ en el LOG, y dos semanas después el cliente reporta el mismo bug. Causas típicas en el stack de Apex:

1. **CloudFront sirvió caché vieja** — el fix está en S3 pero nadie invalidó, o la invalidación no cubrió el path
2. Se arregló en local y nunca se subió (`aws s3 sync` no corrió o corrió en la carpeta equivocada)
3. Se arregló en desktop y mobile sigue roto (o al revés)
4. Se arregló el síntoma, no la causa (el form "funciona" pero el webhook sigue devolviendo 500 y nadie lee la respuesta)
5. El fix rompió otra cosa (regresión) y nadie volvió a pasar el checklist completo

---

## Protocolo por cada ítem marcado como ✅

### Paso 1 — Reproducir el bug original
Antes de verificar el fix, intentar reproducir el problema ORIGINAL con los pasos exactos. Si no se puede reproducir ni el bug ni el fix, el estado es DESCONOCIDO, no arreglado.

### Paso 2 — Verificar en producción, no en local
- URL de CloudFront, no `file://` ni el bucket directo
- Ventana de incógnito + hard refresh (la caché del navegador miente igual que CloudFront)
- `aws cloudfront list-invalidations --distribution-id [ID]` → ¿hay una invalidación Completed POSTERIOR al último sync?

### Paso 3 — Verificar en los dos mundos
- [ ] Desktop 1440px
- [ ] iPhone real o 375px — no el responsive mode a medias
- Si el fix era de layout: capturar screenshot de ambos como evidencia

### Paso 4 — Verificar de punta a punta (si toca datos)
Para formularios/leads, el fix no está verificado hasta que:
- [ ] Se envió un lead de prueba REAL desde producción
- [ ] Apareció la fila en el Google Sheet
- [ ] Llegó la notificación (Gmail/N8N)
- [ ] Se borró el lead de prueba del Sheet después

### Paso 5 — Chequeo de regresión mínimo
Después de cualquier fix, repasar los 5 vitales:
- [ ] WhatsApp flotante abre el número correcto
- [ ] Formulario envía
- [ ] Footer Apex presente
- [ ] Hero se ve completo en mobile
- [ ] Sin errores en consola

### Paso 6 — Registrar con evidencia
Formato en LOG.md:
```
- ✅ [fix] — verificado [fecha] en [URL] · [desktop/mobile/e2e] · commit [hash]
```
Un ✅ sin fecha de verificación y sin dónde se probó no vale.

---

## Estados permitidos

| Estado | Significa |
|--------|-----------|
| REPORTADO | El bug existe, sin tocar |
| ARREGLADO (sin verificar) | Código cambiado — todavía no cuenta |
| VERIFICADO | Pasos 1–6 completos con evidencia |
| REGRESIÓN | Volvió — se reabre y se busca la causa raíz, no se re-parcha |

Solo VERIFICADO se comunica al cliente como resuelto. Decirle "ya está listo" y que no lo esté cuesta más confianza que decir "mañana te confirmo".

---

## Sesión de barrido (usar tras varios fixes acumulados)

1. Claude lista TODO lo marcado ✅ en el LOG de las últimas 2 semanas
2. Cada ítem pasa por el protocolo — sin excepciones "porque ese sí estoy seguro"
3. Salida: tabla VERIFICADO / REGRESIÓN / DESCONOCIDO
4. Las regresiones se atacan por causa raíz antes de tocar cualquier cosa nueva

---
*Regla: en Apex nada está arreglado hasta que se probó en producción, en móvil, hoy.*
