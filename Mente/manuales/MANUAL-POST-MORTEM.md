# Manual — Post-Mortem (15 minutos por proyecto)
> Apex Cloud Work · v1.0 · Uso: "Post-mortem de [cliente]" — se corre la misma semana de la entrega.

## Formato
Claude hace estas preguntas UNA por una, Garett contesta corto, Claude escribe el resumen en `proyectos/[cliente]/postmortem.md` y actualiza LOG.md.

## Las 8 preguntas
1. **Horas reales vs. estimadas** — ¿cuántas horas llevó de verdad? ¿Cuánto quedó la hora efectiva? (precio ÷ horas)
2. **¿Qué se regaló?** — revisiones extra, secciones fuera de alcance, soporte no cobrado. Ponerle precio: "regalé ~$X".
3. **¿Dónde se trabó el proyecto?** — ¿esperando material del cliente, decisión técnica, bug, o procrastinación propia? Ser honesto en cuál de las cuatro.
4. **¿Qué pieza se puede reutilizar?** — componente, sección, workflow N8N, prompt. Moverla a la carpeta de plantillas AHORA, no "después".
5. **¿Qué señal temprana del cliente se ignoró?** — regateo, respuestas lentas, "una cosita más". Anotarla para la tabla de banderas rojas del MANUAL-COTIZACION.
6. **¿El precio fue correcto?** — Si la hora efectiva quedó bajo $15, el próximo proyecto igual sube de precio o baja de alcance.
7. **¿Qué proceso falló?** — ¿algún manual no se siguió o le falta un paso? Actualizar el manual en el momento.
8. **¿Se pidió testimonio y referido?** — Si no, hacerlo ahora mismo, antes de cerrar la sesión.

## Salida obligatoria
```
POST-MORTEM [cliente] — [fecha]
Hora efectiva: $X/h · Regalado: $X
Cambio para el próximo proyecto: [UNA sola cosa concreta]
Pieza reutilizable guardada: [sí/no, cuál]
```

## Regla
Un solo cambio por post-mortem. Diez aprendizajes anotados = cero aplicados. Uno anotado = uno aplicado.
