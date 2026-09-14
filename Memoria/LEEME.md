# Memoria de sesión — Apex Cloud Work

Sistema de recuerdo automático para opencode (terminal y VS Code).

## Cómo funciona

1. **`sesion-activa.md`** — buffer en vivo. opencode lo actualiza al cerrar cada bloque de trabajo.
2. **Watchdog** (`afk-watchdog.ps1`) — corre en background al iniciar sesión de Windows.
   Tras 15 min de inactividad (con trabajo reciente) lanza `opencode run` → la skill
   `apex-memoria` congela el buffer en `sesiones/`.
3. **`ULTIMA-SESION.md`** — puntero al último log, para que la próxima sesión arranque sabiendo dónde quedó.
4. **`index.md`** — índice cronológico de todos los logs.

## Manual

- Generar log ya: decile a opencode "escribí la memoria" o "voy AFK".
- El watchdog lo hace solo tras 15 min de AFK (configurable en el script).
- Resetea el buffer manualmente si quedó `<!-- SIN-TRABAJO -->`.

## Instalación

- Watchdog registrado como tarea programada `ApexAFKWatchdog` (al logon).
- Reiniciar manual: `powershell -File F:\apex-cloudworks\Memoria\afk-watchdog.ps1`
- Log de ejecución del watchdog: `F:\apex-cloudworks\Memoria\afk-watchdog.log`
