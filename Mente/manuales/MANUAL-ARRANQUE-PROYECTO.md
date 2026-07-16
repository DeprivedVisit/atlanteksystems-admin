# Manual — Arranque de Proyecto (Project Start)
> Apex Cloud Work · v1.0 · Julio 2026
> Uso: "Arrancamos [cliente]" → Claude ejecuta este manual completo antes de escribir una línea de código.

---

## 0. Pre-condición (no negociable)

- [ ] El proyecto anterior está CERRADO (entregado + cobrado) — regla de un proyecto a la vez
- [ ] Si viene por referido: ¿la comisión del referidor ya está hablada? Si no, se habla ANTES de cobrar (lección Andrés)

## 1. Brief (30 min máx, por WA o llamada)

Preguntas mínimas al cliente:
1. ¿Qué vende exactamente y a quién?
2. ¿Qué quiere que haga el visitante? (una sola acción: WhatsApp, formulario, llamada)
3. ¿Tiene logo, fotos, colores de marca? → pedir TODO el material ahora, no en revisión 1
4. ¿Tiene dominio propio o usamos CloudFront?
5. ¿Quién aprueba? (una sola persona — si aprueban dos, las revisiones se duplican)
6. Precio y alcance confirmados por escrito en WA: paquete, entregables, 2 revisiones, 50/50

**Sin brief completo no se arranca. Material incompleto = fecha de entrega corre desde que llega el material.**

## 2. Setup administrativo

- [ ] Registrar en LOG.md: cliente, paquete, valor, fecha inicio, fecha entrega
- [ ] Proforma enviada (`proforma-apexcloudworks.html` adaptada)
- [ ] Contrato listo para firma (`contrato-apexcloudworks.html`)
- [ ] 50% inicial recibido — **sin adelanto no hay preview**
- [ ] Carpeta creada: `proyectos/[cliente]/` con `brief.md`

## 3. Setup técnico

```
proyectos/[cliente]/
├── brief.md
├── index.html
├── assets/
│   ├── css/style.css
│   ├── js/script.js
│   └── img/
```

- [ ] Repo en github.com/apexcloudworkscompany (privado)
- [ ] Bucket S3: `[cliente]-[proyecto]` en us-east-2
- [ ] Paleta y fuentes asignadas según tabla de rubro (design-claude.md) — confirmadas con cliente
- [ ] Webhook N8N creado (aunque sea placeholder) + Google Sheet de leads
- [ ] Número de WhatsApp del CLIENTE confirmado desde el día 1 (no repetir el error Skindoctors de deployar con el número de Garett)

## 4. Definición de secciones

- [ ] Lista de secciones acordada por escrito antes de construir (Hero, Servicios, Sobre, Testimonios, Contacto, Footer)
- [ ] Todo lo que no esté en esta lista = fuera de alcance = se cobra aparte

## 5. Kickoff con Claude

Al arrancar la sesión de trabajo:
1. Pegar `proyectos/[cliente]/PROMPT.md` (crearlo si no existe con el template de los otros proyectos)
2. Claude confirma: paleta, fuentes, secciones, número de WA, deadline
3. Recién ahí: Bloque 1 de construcción

## 6. Fechas ancla

| Hito | Cuándo |
|------|--------|
| Preview en S3 | Día 3–5 |
| Revisión 1 aplicada | +48h del feedback |
| Revisión 2 aplicada | +48h del feedback |
| Deploy final | Al confirmar el 50% restante |
| Onboarding WA | Mismo día del deploy |

## 7. Criterio de salida del arranque

El proyecto está "arrancado" cuando: brief completo + 50% cobrado + carpeta/repo/bucket creados + secciones acordadas por escrito. Cualquier cosa menos que eso es una conversación, no un proyecto.
