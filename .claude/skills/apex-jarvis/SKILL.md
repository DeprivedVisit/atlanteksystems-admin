---
name: apex-jarvis
description: >
  Contexto completo del proyecto Jarvis (asistente interno) de Apex Cloud Work.
  Activar cuando Garett mencione Jarvis, el brief matutino, /lead, /deploy, /revisar,
  /refactor, la automatización interna, o quiera trabajar en el sistema de IA local.
---

# Jarvis — Asistente interno de Apex Cloud Work

## Visión
Jarvis opera todo por Garett. No es un asistente — es un socio que ejecuta.

## Comandos implementados

| Comando | Función |
|---------|---------|
| Brief matutino | Se ejecuta a las 7:50 AM con agenda del día |
| `/lead` | Registra un nuevo lead (cliente potencial) |
| `/deploy` | Asiste en el proceso de deploy a AWS S3 + CloudFront |
| `/revisar` | Auto-review de código antes de deploy |
| `/refactor` | Sugerencias de refactor del código actual |

## Estado actual
- ✅ Funcional en producción local
- ⏳ Pendiente: Conectar n8n → WhatsApp Business (leads auto-registrados)
- ⏳ Pendiente: Configurar .env para proyectos apexweb y ecopollo
- Stack: Python · AWS Bedrock · Claude API
- Repo: github.com/apexcloudworkscompany/Jarvis

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