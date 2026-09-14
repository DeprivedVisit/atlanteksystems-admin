# 🎓 Trading Bot — n8n + Telegram + AI Local

Bot de Telegram educativo de trading. Plan de estudios de 8 módulos con AI tutor local (Ollama + Llama 3.1 8B).

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `docker-compose.yml` | Servicios n8n + ngrok |
| `.env` | Tokens (ngrok, Telegram, Ollama) |
| `setup.ps1` | Setup automatizado |
| `telegram-bot-ai.json` | Workflow para importar en n8n |
| `curriculum.json` | Contenido de las 8 lecciones |
| `PLAN_DE_ESTUDIOS.md` | Plan completo de estudios |

## Requisitos

- **Ollama** instalado en Windows — https://ollama.com
- **Modelo**: Llama 3.2 3B (~2.0 GB) — ligero, funciona en CPU
- **RAM**: Mínimo 4 GB libres para el modelo
- **Docker Desktop** corriendo

## Setup

### 1. Instalar Ollama y modelo

```powershell
# Descargar e instalar Ollama desde https://ollama.com
# Luego abrir terminal y correr:
ollama pull llama3.2:3b
```

### 2. Configurar Ollama para CPU only

Crear archivo `%LOCALAPPDATA%\Ollama\.env` con:
```
OLLAMA_NUM_GPU=0
```

### 3. Asegurar que Ollama esté corriendo

```powershell
ollama serve
```

### 3. Editar `.env`

```env
NGROK_AUTHTOKEN=tu_token
TELEGRAM_BOT_TOKEN=tu_bot_token
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

### 4. Ejecutar

```powershell
.\setup.ps1
```

### 5. Configurar n8n

1. Abrí `http://localhost:5678`
2. Credentials → Telegram API → pegá token
3. Credentials → Ollama → pegá URL `http://host.docker.internal:11434`
4. Importá `telegram-bot-ai.json`
5. Reemplazá `REEMPLAZAR` en cada nodo con la credencial correcta
6. Activá el workflow

### 6. Probar

Escribí `/start` a tu bot en Telegram.

## Comandos del Bot

| Comando | Acción |
|---------|--------|
| `/start` | Bienvenida + menú |
| `/next` | Siguiente lección |
| `/progress` | Ver progreso |
| `/modules` | Lista de módulos |
| `/help` | Ayuda |
| *(cualquier texto)* | AI Tutor responde |

## Arquitectura

```
Telegram → Switch Commands → [comandos estáticos]
                           ↓ (fallback)
                       Typing... → AI Agent (Llama 3.2 3B via Ollama) → Respuesta
```

- **Ollama** corre en Windows directamente (no en Docker)
- **n8n** se conecta vía `host.docker.internal:11434`
- Comandos: respuestas predefinidas (sin gastar tokens)
- Preguntas libres: AI con contexto del plan de estudios
- Memoria por chat (el bot recuerda la conversación)

## Cambios vs versión anterior

| Antes | Ahora |
|-------|-------|
| AWS Bedrock Claude ($$$) | Ollama + Llama 3.2 3B ($0) |
| API key requerida | Sin API keys |
| Modelo en la nube | Modelo local en tu PC |
| Límites de uso | Uso ilimitado |

## Comandos Docker

```powershell
docker logs -f n8n_trading    # Ver logs
docker compose down            # Detener
docker compose restart         # Reiniciar
```

## Solución de problemas

**n8n no conecta a Ollama:**
- Verificar que Ollama esté corriendo: `ollama serve`
- Verificar que el modelo esté instalado: `ollama list`
- Probar conexión directa: `curl http://localhost:11434/api/tags`

**Respuestas lentas:**
- Llama 3.1 8B en CPU puede tardar 3-8 segundos por respuesta
- Es normal, el modelo corre localmente sin GPU dedicada

**RAM insuficiente:**
- Cerrar apps pesadas antes de usar el bot
- El modelo usa ~5 GB de RAM cuando está activo
