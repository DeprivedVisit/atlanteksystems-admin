# Manual — Docker Local: N8N + Modelos de IA en tu PC
> Apex Cloud Work · v1.0 · Julio 2026
> Objetivo: correr N8N y modelos de IA en tu propia máquina, sin pagar n8n.cloud ni depender de APIs para todo.

---

## ⚠ ADVERTENCIA PREVIA — Tu caso específico
Docker Desktop en Windows **requiere WSL2**, y WSL2 requiere virtualización por hardware. Tu error pendiente **HRESULT 0x80370102** (SVM Mode que no persiste en el BIOS del B450M) es EXACTAMENTE lo que bloquea esto. Orden correcto:

1. Resolver el BIOS primero (probable batería CMOS → cambiarla, ₡1.500 en cualquier ferretería electrónica, es una CR2032)
2. Verificar: `systeminfo | find "Hyper-V"` → los 4 requisitos en "Sí", o en PowerShell admin: `wsl --install` sin error
3. Recién ahí instalar Docker Desktop

**Mientras tanto**, la sección "Plan B sin Docker" de abajo funciona HOY con tu PC tal como está.

---

## Concepto en 5 líneas
Docker empaqueta una app con todo lo que necesita (su Linux, sus librerías, su versión de Node) en un **contenedor** aislado. En vez de instalar N8N y pelear con dependencias, bajás una **imagen** oficial y la corrés. Se rompe → la borrás y levantás otra en segundos. Los datos viven en **volúmenes** que sobreviven aunque borres el contenedor. `docker-compose.yml` es la receta que describe todo tu stack en un archivo.

## N8N local con Docker
Crear carpeta `~/docker/n8n/` con este `docker-compose.yml`:

```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_SECURE_COOKIE=false
      - GENERIC_TIMEZONE=America/Costa_Rica
      - TZ=America/Costa_Rica
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

```bash
docker compose up -d      # levantar
# → http://localhost:5678
docker compose logs -f    # ver logs
docker compose down       # apagar (los datos quedan en el volumen)
```

**El problema real para tus clientes**: `localhost` no recibe webhooks de internet. Los forms de las landings en producción NO pueden llegar a tu PC apagada a las 3 am. Soluciones:
- **Túnel** (Cloudflare Tunnel gratis, o ngrok) → sirve para desarrollo, no para producción de clientes
- **N8N local = laboratorio**, workflows de clientes = n8n.cloud o un VPS de $5/mes cuando el volumen lo justifique
- Regla práctica: lo que factura, en la nube; lo que experimenta, en local.

## Modelos de IA locales — Ollama
Ollama es el "Docker de los modelos": bajás un modelo y lo corrés con una línea. **Bonus para vos: tiene instalador nativo de Windows que NO necesita Docker ni WSL2** → funciona hoy, con tu BIOS roto y todo.

```bash
# tras instalar desde ollama.com
ollama run llama3.2        # 3B, corre en casi cualquier PC
ollama run qwen2.5:7b      # mejor calidad, necesita ~8GB RAM
ollama run qwen2.5-coder:7b  # para código
```

Realidad de hardware: la calidad depende de tu **VRAM/RAM**. Con una GPU de 8GB corrés modelos 7B–8B cómodo (útiles para borradores, clasificación, resúmenes). No esperes calidad Claude para construir landings — su rol es otro: tareas repetitivas gratis e ilimitadas.

Ollama expone una **API en `http://localhost:11434`** compatible con el formato OpenAI → y acá está la jugada: **N8N local + Ollama local = automatizaciones con IA a costo cero**. Ejemplo: workflow que toma leads del Sheet y los clasifica por urgencia con un modelo local, sin gastar un centavo de API.

## Interfaz tipo ChatGPT para tus modelos (requiere Docker)
```yaml
  # agregar al mismo docker-compose.yml
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    restart: unless-stopped
    ports:
      - "3000:8080"
    environment:
      - OLLAMA_BASE_URL=http://host.docker.internal:11434
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - webui_data:/app/backend/data
```
→ `http://localhost:3000`: chat con historial, sobre tus modelos, 100% local.

## Plan B sin Docker (funciona HOY con tu PC)
| Qué | Cómo | Necesita virtualización |
|-----|------|------------------------|
| N8N local | `npm install -g n8n` → `n8n start` (ya tenés Node) | No |
| Modelos locales | Ollama instalador Windows | No |
| Interfaz de chat | LM Studio (app de escritorio, incluye chat + servidor API) | No |

## Ruta recomendada para vos
1. **Hoy**: Ollama nativo + `npx n8n` → ya podés experimentar N8N+IA local
2. **Esta semana**: batería CMOS nueva → SVM persiste → `wsl --install`
3. **Después**: Docker Desktop + el compose de arriba → stack formal reproducible
4. **Cuando un cliente pague automatización seria**: mover ese workflow a n8n.cloud/VPS — lo local nunca sostiene producción de clientes
