# Guía Obsidian — De cero a operativo
> Para Garett · Apex Cloud Works · Junio 2026

---

## ¿Qué es Obsidian?

Un editor de notas en Markdown (.md) que vive en tu computadora. Sin nube, sin suscripción, sin dependencia de terceros. Todo son archivos de texto que podés mover, respaldar o abrir con cualquier editor.

**Por qué lo usamos en Apex:** Es tu cerebro externo. Proyectos, clientes, operaciones y tareas en un solo lugar, todo conectado con links.

---

## PARTE 1 — Abrir tu vault de Apex

### Paso 1 — Abrir el vault correcto

1. Abrí Obsidian
2. Abajo a la izquierda verás el nombre del vault actual
3. Clic en ese nombre → **Open another vault**
4. Clic en **Open folder as vault**
5. Navegá a `F:\apex-cloudworks\Obsidian`
6. Clic en **Select Folder**

Ya estás adentro. Deberías ver las carpetas: Proyectos, Clientes, Operaciones, Tareas, Templates, Log.

### Paso 2 — Activar el File Explorer

El panel izquierdo es tu navegador de archivos. Si no lo ves:
- Clic en el ícono de carpeta arriba a la izquierda, o
- `Ctrl + Shift + E`

### Paso 3 — Abrir Dashboard

Doble clic en `Dashboard.md` en el root del vault. Este es tu punto de partida cada día.

---

## PARTE 2 — Navegación básica

### Abrir archivos
- **Clic simple** en el File Explorer → abre la nota
- `Ctrl + O` → búsqueda rápida por nombre (el más útil)
- `Ctrl + P` → paleta de comandos (para todo lo demás)

### Moverse entre notas abiertas
- `Ctrl + Tab` → siguiente nota abierta
- `Ctrl + Shift + Tab` → nota anterior
- `Alt + ←` / `Alt + →` → historial (como un browser)

### Dividir pantalla
- Clic derecho en una nota → **Split right** → trabajás con 2 notas al mismo tiempo
- Útil para ver un proyecto y su cliente a la vez

---

## PARTE 3 — Editar notas

### Modos
Obsidian tiene 2 modos:
- **Editing** — escribís (ves el markdown)
- **Reading** — ves el resultado final
- Alternás con `Ctrl + E` o el ícono de lápiz arriba a la derecha

### Markdown básico que usamos en el vault

```
# Título grande
## Sección
### Subsección

**negrita**
*cursiva*

- Lista con bullet
- [ ] Checkbox vacío (tarea pendiente)
- [x] Checkbox marcado (tarea hecha)

[[Nombre de nota]] → link a otra nota del vault
| Col1 | Col2 |   → tabla
|------|------|
| dato | dato |
```

### Checkboxes — cómo usarlos

En modo Reading:
- Clic directo en el checkbox → lo marca/desmarca
- Así actualizás tus pendientes sin entrar al modo edición

En modo Editing:
- Cambiás `- [ ]` por `- [x]` manualmente

---

## PARTE 4 — El sistema Apex en Obsidian

### Tu flujo diario

```
Mañana (07:45 agenda)     →  Abrís Dashboard.md
                          →  Revisás proyecto activo
                          →  Abrís Semana Actual.md
                          →  Checkeás qué toca hoy

Durante el día            →  Actualizás checkboxes del proyecto
                          →  Añadís notas en la nota del cliente

Domingo noche (check-in)  →  Duplicás TPL - Revisión Semanal
                          →  Llenás qué cerraste / qué falta
                          →  Actualizás Semana Actual para la próxima semana
                          →  Añadís hito al Log/2026-XX.md
```

### Cómo usar los wikilinks

`[[EcoPollo]]` → al hacer clic te lleva a la nota de EcoPollo directamente.

Desde cualquier nota podés linkear a cualquier otra. Obsidian los resuelve por nombre de archivo, sin importar en qué carpeta esté.

Para crear un link mientras escribís:
- Escribís `[[` y Obsidian muestra autocompletado con todas las notas del vault

### Cómo agregar un proyecto nuevo

1. `Ctrl + O` → buscás "TPL - Proyecto Nuevo"
2. `Ctrl + P` → escribís "Copy" → **Copy file** (o clic derecho → Duplicate)
3. Renombrás el archivo con el nombre del cliente
4. Movés a la carpeta `Proyectos/`
5. Llenás los campos del template
6. Actualizás `Dashboard.md` con el nuevo proyecto

### Cómo agregar un cliente nuevo

Mismo proceso con `TPL - Cliente Nuevo` → guardás en `Clientes/`

---

## PARTE 5 — Features clave de Obsidian

### Graph View
`Ctrl + G` → abre el grafo visual de todas las notas y sus conexiones.

Vas a ver cómo EcoPollo conecta con Tío Michael, cómo Skindoctors conecta con Andrés, etc. Útil para ver el mapa completo de Apex de un vistazo.

### Búsqueda global
`Ctrl + Shift + F` → buscás texto en TODAS las notas del vault.

Ejemplo: buscás "toggle" y te aparece en qué notas mencionás el toggle de CBD Balance.

### Command Palette
`Ctrl + P` → el comando más importante. Desde acá accedés a todo:
- Cambiar tema
- Crear nota
- Abrir Graph View
- Instalar plugins
- Cualquier acción de Obsidian

### Atajos que más vas a usar

| Atajo | Acción |
|-------|--------|
| `Ctrl + O` | Buscar y abrir nota |
| `Ctrl + P` | Paleta de comandos |
| `Ctrl + E` | Alternar edición/lectura |
| `Ctrl + G` | Graph View |
| `Ctrl + Shift + F` | Búsqueda global |
| `Ctrl + N` | Nueva nota |
| `Ctrl + W` | Cerrar nota activa |
| `Ctrl + Z` | Deshacer |
| `Alt + ←` | Nota anterior |

---

## PARTE 6 — Plugins recomendados para Apex

Obsidian tiene plugins de la comunidad que amplían todo. Para instalarlos:
**Settings** (`Ctrl + ,`) → **Community plugins** → **Browse**

### Plugins que te convienen

**Templater** — templates más potentes que los nativos
- Podés insertar fecha automática al duplicar un template
- Más adelante: `{{date}}` en TPL - Revisión Semanal se llena solo

**Calendar** — vista de calendario en el panel lateral
- Clic en cualquier día → crea o abre la nota de ese día
- Ideal para tu log semanal

**Dataview** — consultas tipo base de datos sobre tus notas
- Ejemplo: mostrar todos los proyectos con estado "🔥 Activo" automáticamente en Dashboard
- Más avanzado, para después

### Cómo instalar un plugin
1. `Ctrl + ,` → Settings
2. **Community plugins** → desactivar Safe Mode si te lo pide
3. **Browse** → buscás el nombre
4. **Install** → **Enable**

---

## PARTE 7 — Personalización rápida

### Cambiar tema (modo oscuro/claro)
`Ctrl + ,` → **Appearance** → **Themes** → Browse → instalás el que quieras

El que está activo en tu screenshot es **Sodalite** (oscuro, se ve bien).

### Tamaño de fuente
`Ctrl + ,` → **Appearance** → **Font size**

### Panel izquierdo / derecho
- Arrastrás los íconos de la barra lateral para reorganizar
- Podés ocultar paneles con clic en el borde

---

## PARTE 8 — Flujo de domingo (check-in semanal)

Esto es lo que hacés cada domingo a las 23:30 según tu rutina:

1. Abrís `Templates/TPL - Revisión Semanal.md`
2. Clic derecho → **Make a copy** (o Duplicate)
3. Renombrás: `Revisión 2026-06-29.md` (fecha del domingo)
4. Movés a `Log/`
5. Llenás las 3 preguntas: qué cerraste, qué quedó, qué imprevistos
6. Completás la tabla de estado de proyectos
7. Llenás el plan de la semana siguiente
8. Abrís `Tareas/Semana Actual.md` → actualizás con las tareas nuevas
9. Abrís `Log/2026-06.md` → agregás el hito de la semana

---

## Resumen — Lo que abrís cada día

| Momento | Nota |
|---------|------|
| Mañana (07:45) | `Dashboard.md` → `Semana Actual.md` |
| Bloque de trabajo | Nota del proyecto activo (ej: `EcoPollo.md`) |
| Cuando hablás con un cliente | Nota del cliente (ej: `Tío Michael.md`) |
| Domingo noche | Nueva revisión semanal desde template |

---

*Apex Cloud Works · Cartago, CR*
*"Lo que no se escribe no existe."*
