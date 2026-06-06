# TODO — RFLX Detail

## Objetivo
Revisar y mejorar el proyecto en este orden: **corrección funcional → seguridad → performance**.

## Checklist
- [ ] 1) Funcionalidad: verificar booking + sincronización (localStorage ↔ Google Sheets)
- [ ] 2) Funcionalidad: corregir bloqueos de hora/slot end-to-end (UI → calendar.js → backend .gs → getBlocked → render)
- [ ] 3) Funcionalidad: panel admin (cancelar/completar/WA/notas) y que refleje estado real
- [ ] 4) Seguridad: prevenir XSS en admin (sanitizar/render seguro de fields)
- [ ] 5) Seguridad: sacar password hardcodeado del admin (auth en backend)
- [ ] 6) Funcionalidad: confirmar que `completeBooking` existe en el backend y corregir si falta
- [ ] 7) Performance: separar JS inline de `index.html` a archivos dedicados
- [ ] 8) Performance: reducir render con `innerHTML` riesgoso y costos de render en tablas
- [ ] 9) Robustez: geolocalización (timeout/throttle) y degradación segura
- [ ] 10) Validación final: abrir `index.html`, test manual de flows principales

## Próximos pasos sugeridos
- [ ] 1.1 Implementar primero: **(A+B+C)** seguridad + XSS + completeBooking/corrección


