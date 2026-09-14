# API Base (FastAPI + Docker)

Backend base listo para correr en Docker.

## Uso

```powershell
docker compose up -d --build   # construir y levantar
docker compose down            # detener
docker compose logs -f         # ver logs
```

## Endpoints

- `GET http://localhost:8000/` → `{"status":"ok","service":"API Base"}`
- `GET http://localhost:8000/health` → `{"status":"healthy"}`
- `GET http://localhost:8000/docs` → Documentacion interactiva (Swagger)

## Estructura

```
proyecto-api/
├── docker-compose.yml   # definicion del servicio (puerto 8000)
├── Dockerfile           # imagen Python 3.12 + FastAPI + Uvicorn
├── .dockerignore
└── app/
    └── main.py          # la API
```
