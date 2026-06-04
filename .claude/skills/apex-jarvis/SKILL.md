---
name: apex-jarvis
description: >
  Skill para planificar y desarrollar Jarvis — el agente interno de Apex Cloud Works.
  Activar cuando Garett hable de Jarvis, automatización, monitoreo de sitios,
  o quiera que algo funcione solo sin intervención humana.
---

# Apex Jarvis — Agente interno

## Visión
Jarvis opera todo por Garett. No es un asistente — es un socio que ejecuta.

## Estado actual
- Stack: Python · AWS Bedrock · Claude API
- Repo: github.com/apexcloudworkscompany/Jarvis
- Estado: Funcional básico

## Roadmap

### Fase 1 — Monitoreo (cuando haya 3+ clientes live)
```python
# Lambda diaria
# GET a cada URL de cliente
# Verifica: status 200, SSL, WhatsApp button
# Reporte por WhatsApp a Garett
```

### Fase 2 — Reportes automáticos
- Estado semanal de cada cliente
- Uptime y última actualización

### Fase 3 — Operación completa
- Revisa correos importantes
- Genera plan semanal los domingos
- Monitorea GitHub
- Avisa cuando hay algo urgente

## Arquitectura