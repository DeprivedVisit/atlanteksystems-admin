# Walkthrough: Integración de Simulación en la Página Principal

Hemos implementado con éxito el simulador interactivo en la **sección Hero de la página principal (`index.html`)** estructurado en columnas side-by-side en pantallas grandes, permitiendo a los visitantes iniciar el flujo desde un **Ticket de Servicio** simulado.

---

## ⚙️ Flujo Interactivo de Comunicación

1. **Paso 1: Contacto / Ticket de Servicio (`README.md`)**:
   - El visitante entra a la página y ve a la izquierda (panel de código) un **formulario interactivo de ticket de servicio** ("La Rústica Pizzería").
   - Al hacer clic en **Enviar Requerimiento ➔**:
     - El botón cambia de estado e inicia el enrutamiento.
     - Imprime inmediatamente logs de recepción de webhook en la consola inferior:
       `[terminal] Ingesting service ticket webhook payload...`
       `[terminal] Webhook successfully ingested. Triggering N8N workflow...`

2. **Paso 2: Enrutamiento en N8N (`restaurant-workflow.json`)**:
   - El simulador redirige automáticamente al archivo `restaurant-workflow.json` en el explorador de la izquierda.
   - El lienzo de la derecha muestra cómo fluye el pulso neón de datos desde el **Webhook Trigger** hacia el enrutador de IA conversacional **Gemini Voice** y luego se inserta en **PostgreSQL**.

3. **Paso 3: Conversación por Voz (Smartphone Widget)**:
   - El simulador rota hacia la fase 3, abriendo el widget de **Smartphone Mockup**.
   - Se activan las ondas sonoras neón palpitantes simulando la llamada conversacional con la IA y mostrando en la pantalla del celular la transcripción en vivo del cliente ordenando su pizza o reservando su mesa.

4. **Paso 4: Grafo de Enlaces en Obsidian**:
   - Muestra las notas técnicas del proyecto en Obsidian y permite mover los nodos del grafo interactivo elásticamente.

---

## 🛠️ Archivos Modificados en el Workspace

* **[index.html](file:///f:/apex-cloudworks/proyectos/apexcloudworkscompany.com/index.html)**: Hero modificado a diseño split con el iframe del simulador incrustado.
* **[assets/css/style.css](file:///f:/apex-cloudworks/proyectos/apexcloudworkscompany.com/assets/css/style.css)**: Añadidas reglas de layout adaptativas (`.hero-wrap-split`, `.simulator-window-border`, etc.) para pantallas de escritorio y móviles.
* **[background/index.html](file:///f:/apex-cloudworks/proyectos/apexcloudworkscompany.com/background/index.html)**: Creados contenedores para el Smartphone mockup, ondas de voz y carrusel de fases.
* **[background/assets/css/style.css](file:///f:/apex-cloudworks/proyectos/apexcloudworkscompany.com/background/assets/css/style.css)**: Estilos para el formulario del ticket, smartphone y animaciones neón de ondas de voz.
* **[background/assets/js/script.js](file:///f:/apex-cloudworks/proyectos/apexcloudworkscompany.com/background/assets/js/script.js)**: Lógica interactiva que conecta el submit del ticket form con la simulación del workflow.
