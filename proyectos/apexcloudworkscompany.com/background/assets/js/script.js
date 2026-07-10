// Antigravity IDE - Restaurant Voice Call Automation Simulator
// Author: Antigravity for Apex Cloud Works
// 2026-07-05

// Embebido dentro del hero de la página real — el header propio duplica ese nav, se oculta.
if (window.self !== window.top) {
  document.documentElement.classList.add('is-embedded');
}

// Explorador: carpetas colapsables — para que el árbol no se vea cortado por default
(function initFileTreeToggle() {
  document.addEventListener('DOMContentLoaded', () => {
    const tree = document.querySelector('#vscode-explorer-view .file-tree');
    if (!tree) return;

    function nodeLevel(el) {
      const match = el.className.match(/style-nested-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }

    function setCollapsed(folder, collapsed) {
      const level = nodeLevel(folder);
      const arrow = folder.querySelector('.tree-arrow');
      folder.classList.toggle('open', !collapsed);
      if (arrow) arrow.textContent = collapsed ? '▶' : '▼';
      let sib = folder.nextElementSibling;
      while (sib && nodeLevel(sib) > level) {
        sib.style.display = collapsed ? 'none' : '';
        sib = sib.nextElementSibling;
      }
    }

    tree.querySelectorAll('.folder-node').forEach((folder) => {
      folder.style.cursor = 'pointer';
      folder.addEventListener('click', () => {
        setCollapsed(folder, folder.classList.contains('open'));
      });
    });

    // Colapsadas por default: demo (N8N/Obsidian/background) — lo real queda a la vista
    tree.querySelectorAll('.folder-node').forEach((folder) => {
      const label = folder.querySelector('.tree-label');
      const text = label ? label.textContent.trim() : '';
      if (['N8N', 'Obsidian', 'background'].includes(text)) {
        setCollapsed(folder, true);
      }
    });
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM ELEMENTS ---
  const container = document.querySelector('.canvas-area');
  const svgCanvas = document.getElementById('vector-canvas');
  const playhead = document.getElementById('playhead');
  const timeCounter = document.getElementById('time-counter');
  const playBtn = document.getElementById('play-btn');
  const autopilotBtn = document.getElementById('autopilot-btn');
  const tabs = document.querySelectorAll('.tab');
  const fileNodes = document.querySelectorAll('.file-node');
  const codeContainer = document.getElementById('code-content-container');
  const lineNumbersContainer = document.getElementById('line-numbers');
  const chatMessages = document.getElementById('chat-messages');
  const terminalOutput = document.getElementById('terminal-output-container');
  const aiStatusLabel = document.getElementById('ai-status-label');
  const aiStatusDot = document.querySelector('.status-dot');
  const restartChatBtn = document.getElementById('restart-chat-btn');
  
  // Carousel Navigation Elements
  const prevCarouselBtn = document.getElementById('prev-carousel-btn');
  const nextCarouselBtn = document.getElementById('next-carousel-btn');
  const carouselIndicator = document.getElementById('carousel-indicator');
  
  // App views
  const vscodeExplorer = document.getElementById('vscode-explorer-view');
  const obsidianVault = document.getElementById('obsidian-vault-view');
  const actExplorer = document.getElementById('act-explorer');
  const actObsidian = document.getElementById('act-obsidian');
  const appWorkspace = document.getElementById('app-workspace');
  const leftEditorPane = document.getElementById('editor-left-pane');
  const timelinePanel = document.querySelector('.timeline-inside-preview');
  const livePreviewPane = document.querySelector('.live-preview-pane');
  const chatSidebarPane = document.getElementById('ide-chat-sidebar');
  const bottomPanel = document.getElementById('ide-bottom-panel');

  // SVGs Group containers
  const groupN8N = document.getElementById('group-n8n');
  const groupPhone = document.getElementById('group-phone');
  const groupObsidian = document.getElementById('group-obsidian');
  const portadaCarousel = document.getElementById('portada-carousel');
  const carouselNav = document.querySelector('.carousel-navigation');
  const previewControls = document.querySelector('.preview-controls');
  
  // Phone UI elements
  const phoneCallStatus = document.getElementById('phone-call-status');
  const phoneBtnCall = document.getElementById('phone-btn-call');
  const phoneBtnHangup = document.getElementById('phone-btn-hangup');
  const transcriptLine1 = document.getElementById('transcript-line-1');
  const transcriptLine2 = document.getElementById('transcript-line-2');
  const transcriptLine3 = document.getElementById('transcript-line-3');
  
  // UI text labels to toggle
  const previewTitleLabel = document.getElementById('preview-title-label');
  const statusFiletype = document.getElementById('status-filetype');
  const statusLang = document.getElementById('status-lang');

  // Modo Portada — chrome simplificado para visitantes públicos no técnicos
  const goLiveBtn = document.querySelector('.go-live-btn');
  const goLiveBtnOriginalHTML = goLiveBtn ? goLiveBtn.innerHTML : '';
  const PUBLIC_REAL_FILES = ['Portada.md', 'Precios.md', 'Portafolio.md', 'Testimonios.md', 'FAQ.md', 'Sobre-mi.md'];

  // --- APP STATE ---
  let isAutopilot = true;
  let isPlaying = true;
  let time = 0;
  const maxTime = 4000; // 4s timeline loop
  let animationFrameId = null;

  let currentApp = 'vscode'; // 'vscode' | 'obsidian'
  let currentProject = 'n8n'; // 'n8n' | 'phone' | 'obsidian'
  let activeFile = 'README.md';
  
  let typingInterval = null;
  let chatTimeouts = [];
  let carouselInterval = null;
  let currentPhase = 0; // 0: Welcome/N8N, 1: Obsidian, 2: Phone Widget

  let isPhoneCallActive = true;
  let phoneCallTimer = 0.0;
  
  // Simulated Restaurant Call Transcripts
  const phoneTranscripts = [
    {
      t1: '"Quiero reservar una mesa para 4"',
      t2: 'AI: "Claro, ¿para qué hora y qué día?"',
      t3: 'Intent: RESERVATION (Confidence: 0.99)'
    },
    {
      t1: '"¿Tienen pizza libre de gluten?"',
      t2: 'AI: "Sí, tenemos masa de coliflor y de arroz"',
      t3: 'Intent: QA_MENU (Confidence: 0.96)'
    },
    {
      t1: '"Quiero pedir a domicilio una Pepperoni"',
      t2: 'AI: "Anotado. ¿Cuál es su dirección?"',
      t3: 'Intent: ORDER_FOOD (Confidence: 0.98)'
    }
  ];
  let transcriptCycleIdx = 0;

  // Files Content Mockup for Restaurant Voice Automation
  const files = {
    // APEX CLOUD WORKS — ARCHIVOS REALES DEL NEGOCIO
    'Precios.md': `# Precios

Todos los precios en USD. Sin costos ocultos.

## Starter — Setup Landing
**$350** · pago único
* Landing page mobile-first
* AWS S3 + CloudFront + SSL
* Formulario de leads activo + WhatsApp integrado
* 2 rondas de revisión · entrega en 3-5 días

## Trimestral — más popular
**$900** · 3 meses
* Setup inicial incluido
* Landing adicional por $150 c/u
* Cambios mensuales ilimitados + soporte prioritario
* Backups + SSL renovado + reportes mensuales

## Empresa — Sistema Completo
**desde $2,000** · según proyecto
* Sistema web con autenticación + PostgreSQL
* Admin panel personalizado
* Automatizaciones n8n + IA + infraestructura EC2 escalable
* 3 meses de soporte

*¿Dudas de cuál te conviene? Escribime por WhatsApp y lo vemos juntos.*`,

    'Portafolio.md': `# Portafolio — proyectos reales

Sistemas en producción, sin relleno.

## Melasblock — LIVE
**Cliente:** Skindoctors CR · 2026
Landing de conversión para BB Cream SPF 50. Formulario conectado a n8n: cada lead llega a Google Sheets y notifica por Gmail en segundos.
*Stack: AWS S3 · CloudFront · n8n · Google Sheets*

## CBD Oil Balance — LIVE
**Cliente:** Skindoctors CR · 2026
Segunda landing del sistema Skindoctors: gel limpiador facial CBD. Misma infraestructura AWS, identidad visual propia.
*Stack: AWS S3 · CloudFront · n8n · Apps Script*

## EcoPollo — EN DESARROLLO
**Cliente:** Tío Michael · 2026
Cotizador de Pedidos — landing con cotizador en tiempo real. Calcula precio por cantidad y corte, genera mensaje de WhatsApp con el pedido listo para confirmar.
*Stack: AWS S3 · JavaScript · WhatsApp API*`,

    'Testimonios.md': `# Estado real de cada proyecto

Sin estrellas infladas ni logos de stock. Esto es lo que hay, hoy:

## Skindoctors CR — LIVE
Dos landings de conversión en producción (Melasblock + CBD Balance) con sistema de leads automático conectado a Google Sheets y Gmail.

## EcoPollo Cartago — EN DEV
Cotizador de pedidos en tiempo real por WhatsApp, en construcción activa. Meta: atención al cliente en la mitad del tiempo.

## VisionaryFilm — EN PREPARACIÓN
Landing de portafolio audiovisual + panel de administración. Arranca al completar el material del cliente.`,

    'FAQ.md': `# Preguntas frecuentes

## ¿Qué garantías de tiempo tengo con Apex?
Respuesta en menos de 2 horas en horario hábil · Preview de tu proyecto en 7 días · Nunca más de 24 horas sin saber el estado de tu proyecto. Son compromisos reales, no promesas de marketing — si no se cumplen, nos lo decís.

## ¿Cuánto tarda una landing page?
Entre 48 y 72 horas desde que confirmás el proyecto y nos pasás el contenido. Para proyectos más complejos, 5 a 7 días.

## ¿Qué necesito tener listo para empezar?
Una idea básica es suficiente. Si tenés logo, colores y texto, perfecto. Si no tenés nada, igual arrancamos — construimos el brief juntos por WhatsApp.

## ¿Por qué AWS y no un hosting normal?
AWS S3 + CloudFront sirve tu sitio desde servidores en todo el mundo en menos de 100ms. Sin servidor compartido que se cae, sin límites de visitas.

## ¿El sistema de leads funciona solo?
Sí — cuando alguien llena el formulario, el lead llega a tu Google Sheets y te avisa por WhatsApp o Gmail en segundos. Sin intervención manual.

## ¿Cómo es el proceso de pago?
50% al confirmar el proyecto, 50% al entregar. Aceptamos SINPE Móvil, transferencia en colones o dólares.

## ¿Qué pasa si necesito cambios después?
Con el plan trimestral tenés cambios incluidos. Sin plan, cada cambio se cotiza antes de hacerlo — nunca hay sorpresas.`,

    'Sobre-mi.md': `# Garett Barrantes — Fundador, Apex Cloud Works

Desarrollador web y cloud desde Cartago, Costa Rica. Construyo sistemas que operan — no demos, no mockups. Cada proyecto en AWS, cada lead automatizado, cada deploy en producción.

Empecé Apex para resolver un problema real: negocios locales que necesitan presencia digital seria sin depender de agencias lentas y caras. Hoy opero solo, con Claude AI como co-piloto y AWS como infraestructura.

## Stack
* Frontend: HTML · CSS · JavaScript
* Cloud: AWS S3 · CloudFront · Route 53 · EC2
* IA: Claude API · AWS Bedrock
* Automatización: n8n · Google Sheets · Gmail API
* Aprendiendo: React · Node.js · PostgreSQL

## En números
* 6+ proyectos
* 3 automatizaciones n8n activas
* Stack 100% AWS

*whoami → garett@apex-cloudworks*
*cat mision.txt → "Sistemas web que operan. Sin excusas, en producción."*`,

    'Portada.md': `# Apex Cloud Works

Diseñamos, construimos y mantenemos sitios web y automatizaciones en AWS para negocios de Costa Rica.

* **Landing pages desde $350 USD**, en producción en 72 horas
* **Sistema de leads automático**: cada contacto llega solo a tu WhatsApp y Google Sheets
* **Infraestructura AWS**: rápida, segura, sin caídas ni límites de visitas

¿Tenés un proyecto en mente? Tocá **Cotizar** arriba a la derecha y hablamos hoy mismo.

También podés explorar los archivos de la izquierda: Precios.md, Portafolio.md, FAQ.md. Todo lo que ves es información real del negocio.`,

    'Arquitectura.js': `// Arquitectura.js — cómo se diseñó este sitio
// Decisiones tomadas en conjunto entre Gemini (research/copy) y Claude (build)

export const designSystem = {
  paleta: {
    bg: '#090B0E',        // casi negro, dark-native
    gold: '#C4956A',      // acento de marca — fijo, no cambia
    red: '#9C2E2E',       // acento dramático, uso puntual
  },

  tipografia: {
    display: "'Anton', sans-serif",   // headlines, mayúsculas
    body: "'Inter', sans-serif",      // texto de lectura
    mono: "'JetBrains Mono', monospace", // labels, código, precios
  },

  arquitectura: {
    frontend: 'HTML + CSS + JS — sin build step, archivos separados',
    hosting: 'AWS S3 + CloudFront — SSL automático, <100ms global',
    contenido: 'Markdown real (Precios/Portafolio/Testimonios/FAQ) servido dentro del explorador',
    automatizacion: 'n8n → Google Sheets + WhatsApp/Gmail en tiempo real',
  },

  principio: 'Mostrar, no decorar — cada elemento debe generar confianza o se elimina.',
};

export function construirSitio(negocio) {
  return {
    hero: 'Directo al grano, sin relleno',
    prueba: 'Portafolio real, sin inflar resultados',
    conversion: 'WhatsApp siempre a un click',
  };
}`,

    '01-Briefing.md': `# 01 · Briefing

## Todo empieza con una idea

Un WhatsApp es suficiente para arrancar. Sin formularios ni reuniones largas — definimos objetivos, referencias visuales y el enfoque de conversión.

*Tags: WhatsApp · Objetivos · Sin fricción*`,

    '02-Analisis.md': `# 02 · Análisis

## Claude define el plan de diseño

Procesamos el brief con IA para estructurar la paleta, fuentes y arquitectura del sitio. Cada rubro tiene su propia identidad visual.

*Tags: Claude AI · Paleta · Tipografía*`,

    '03-Build.md': `# 03 · Build

## Desarrollo limpio y revisiones

HTML5, CSS3 y JS nativo con archivos completamente separados. Preview en AWS S3 para tus comentarios. Hasta 2 rondas de ajustes incluidas.

*Tags: HTML · CSS · JS · S3 Preview · 2 Revisiones*`,

    '04-Deploy.md': `# 04 · Deploy

## Lanzamiento a producción en AWS

Deploy en AWS con S3, CloudFront CDN global (<100ms de latencia), SSL automático y DNS en Route 53. Velocidad en el top 5%.

*Tags: CloudFront · SSL HTTPS · Route 53*`,

    '05-Live.md': `# 05 · Live

## Automatización de leads activa

Formulario conectado a n8n. Cada contacto se registra en Google Sheets y te llega por WhatsApp o Gmail al instante. El negocio trabaja solo.

*Tags: n8n.cloud · Google Sheets · Notificaciones*`,

    // ROOT FILES
    'README.md': `# Apex Cloud Works

Bienvenido. Esta página **es** un editor de código real — así trabajamos.

## Empezá por acá
En la carpeta **apex-cloud-works** (arriba en el explorador) está toda la info real del negocio:

* 💲 **Precios.md** — planes y tarifas, todo en USD
* 💼 **Portafolio.md** — proyectos reales, con su estado actual
* ⭐ **Testimonios.md** — lo que dicen los clientes
* ❓ **FAQ.md** — preguntas frecuentes
* 👤 **Sobre-mi.md** — quién construye esto

## Caso de estudio — La Rústica Pizzería
Las carpetas **N8N** y **Obsidian** son un caso de estudio real de un sistema que construimos: automatización de llamadas por voz con IA para un restaurante que perdía el 30% de sus llamadas en horas pico. Abrí \`restaurant-workflow.json\` para ver el flujo completo.

*Navegá el explorador de la izquierda para ver cualquiera de los dos.*`,

    // N8N FILES
    'restaurant-workflow.json': `{
  "name": "La Rustica Call Automation Flow",
  "nodes": [
    {
      "parameters": {},
      "id": "node-webhook",
      "name": "Voice Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [60, 210]
    },
    {
      "parameters": {
        "model": "gemini-1.5-flash",
        "prompt": "Evaluate the customer transcript: reservations or food orders."
      },
      "id": "node-ai-agent",
      "name": "Gemini Voice Router",
      "type": "n8n-nodes-base.openAi",
      "position": [190, 210]
    },
    {
      "parameters": {
        "jsCode": "export default async function run(items) { ... }"
      },
      "id": "node-js-transformer",
      "name": "JS Order Form",
      "type": "n8n-nodes-base.code",
      "position": [320, 210]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "bookings"
      },
      "id": "node-database",
      "name": "Postgres Saved",
      "type": "n8n-nodes-base.postgres",
      "position": [450, 210]
    }
  ]
}`,

    'ai-phone-logic.js': `// Analizador de Transcripción de Llamada (Voz a Texto de Gemini)
export default async function run(items) {
  return items.map(item => {
    const transcript = item.json.message || "";
    
    // Clasificación semántica de intención y cálculo de sentimiento
    const intent = analyzeCustomerIntent(transcript);
    const score = (transcript.toLowerCase().includes("gracias")) ? 0.95 : 0.60;
    
    return {
      json: {
        customer_phone: item.json.phone || "unknown",
        raw_text: transcript,
        detected_intent: intent,
        sentiment_score: score,
        timestamp: new Date().toISOString()
      }
    };
  });
}

function analyzeCustomerIntent(text) {
  const t = text.toLowerCase();
  if (t.includes("mesas") || t.includes("reservar") || t.includes("personas")) {
    return "RESERVATION";
  }
  if (t.includes("pedir") || t.includes("pizza") || t.includes("domicilio")) {
    return "ORDER_FOOD";
  }
  return "QA_MENU";
}`,

    'env-config.env': `# Twilio & Vapi Config
VAPI_VOICE_URL=https://api.vapi.ai/webhooks/voice
TWILIO_SID=AC31908b8324fbfb446
GEMINI_VOICE_API=AIzaSyD_RestaurantKey

# Database postgres
PG_HOST=db.apex-cloudworks.com
PG_DATABASE=larustica_bookings
PG_USER=larustica_app
`,

    // OBSIDIAN MARKDOWN VAULT NOTES
    'Restaurant-Welcome.md': `# Caso de Éxito: La Rústica Pizzería

Ahorro acumulado de **35 horas semanales** automatizando llamadas de clientes.

## Métricas Clave:
* **Llamadas Atendidas**: 100% de llamadas contestadas de forma inmediata.
* **Tiempo de Respuesta**: Reducido a 0.0s de espera.
* **Intenciones Comunes**: Reservas de mesas (65%), Pedidos a domicilio (25%), Consultas del menú (10%).

*Observa a la derecha el grafo interactivo de notas vinculadas que documentan este proyecto.*`,

    'Caller-Experience.md': `# Caller Voice Experience Flow

Flujo de la llamada conversacional implementado mediante el modelo de voz de Gemini:

## Guion del Agente Virtual:
1. **Saludo**: *"Hola, bienvenido a La Rústica. ¿Deseas hacer una reserva o pedir a domicilio?"*
2. **Recolección**: Extrae automáticamente la cantidad de personas, fecha, hora y posibles alergias.
3. **Confirmación**: Envía un SMS con el enlace de confirmación tras registrar el webhook.
`,

    'System-Architecture.md': `# Arquitectura del Sistema de Voz

El stack tecnológico de enrutamiento telefónico modular de Apex:

\`\`\`
[Cliente] ➔ (Llamada Telefónica) ➔ [Twilio]
                                     │
                                     ▼
                              [Agente Vapi / Gemini]
                                     │
                                     ▼ (Webhook)
                              [n8n Workflow]
                                     │
                              ┌──────┴──────┐
                              ▼             ▼
                        [Postgres DB]  [WhatsApp API]
\`\`\`
`,

    'index.html': `<!-- Widget Telefónico de Reservaciones con Inteligencia Artificial -->
<div class="smartphone-container">
  <div class="phone-screen">
    <div class="status-bar">
      <span>La Rústica AI Agent</span>
    </div>
    <div class="call-details">
      <div class="pulse-glow-ring"></div>
      <div class="caller-icon">👤</div>
    </div>
  </div>
</div>`,

    'style.css': `/* Neon wave pulse animation */
.wave-pulse {
  stroke: var(--text-accent);
  stroke-width: 3;
  stroke-linecap: round;
  animation: wavePulseTime 2s infinite ease-in-out;
}
@keyframes wavePulseTime {
  0%, 100% { d: path("M 0 20 Q 30 20, 60 20 T 120 20"); }
  50% { d: path("M 0 20 Q 30 5, 60 35 T 120 20"); }
}`,

    'script.js': `// Live simulation of phone audio wave
function updateVoiceWave(active) {
  const wave = document.getElementById('wave-path');
  if (!active) {
    wave.setAttribute('d', 'M 0 20 C 30 20, 60 20, 90 20 C 120 20');
    return;
  }
  const amp = 15;
  const path = \`M 0 20 Q 30 \${20 - amp}, 60 \${20 + amp} T 120 20\`;
  wave.setAttribute('d', path);
}`,

    'walkthrough.md': `# Guía de la Integración

El simulador está estructurado en 4 fases principales:
1. Enviar requerimiento en el formulario de ticket.
2. Procesar flujo en el workflow de n8n.
3. Ejecutar agente conversacional en el widget de Smartphone.
4. Consultar notas en el Obsidian Graph.`
  };

  // --- COORDINATE SYSTEMS ---
  
  // 1. N8N Graph Nodes
  const n8nNodes = {
    'node-webhook': { x: 60, y: 210, width: 100, height: 80, elementId: 'node-webhook', statusId: 'status-webhook', label: 'Webhook' },
    'node-ai-agent': { x: 190, y: 210, width: 100, height: 80, elementId: 'node-ai-agent', statusId: 'status-ai', label: 'AI Agent' },
    'node-js-transformer': { x: 320, y: 210, width: 100, height: 80, elementId: 'node-js-transformer', statusId: 'status-js', label: 'JS Code' },
    'node-database': { x: 450, y: 210, width: 100, height: 80, elementId: 'node-database', statusId: 'status-db', label: 'Database' }
  };

  // 2. Obsidian Knowledge Graph Nodes
  const obsNodes = {
    'Welcome': { x: 300, y: 230, targetX: 300, targetY: 230, vx: 0, vy: 0, elementId: 'obs-node-Welcome' },
    'Architecture': { x: 180, y: 160, targetX: 180, targetY: 160, vx: 0, vy: 0, elementId: 'obs-node-Architecture' },
    'Integrations': { x: 420, y: 160, targetX: 420, targetY: 160, vx: 0, vy: 0, elementId: 'obs-node-Integrations' },
    'workflow': { x: 130, y: 310, targetX: 130, targetY: 310, vx: 0, vy: 0, elementId: 'obs-node-workflow' },
    'transform': { x: 260, y: 370, targetX: 260, targetY: 370, vx: 0, vy: 0, elementId: 'obs-node-transform' },
    'index': { x: 470, y: 310, targetX: 470, targetY: 310, vx: 0, vy: 0, elementId: 'obs-node-index' }
  };
  
  // Home coordinates for physics spring
  const obsNodeHomes = {
    'Welcome': { x: 300, y: 230 },
    'Architecture': { x: 180, y: 160 },
    'Integrations': { x: 420, y: 160 },
    'workflow': { x: 130, y: 310 },
    'transform': { x: 260, y: 370 },
    'index': { x: 470, y: 310 }
  };

  // Interactive drag state
  let isDraggingUser = false;
  let draggedNodeKey = null;
  let dragOffset = { x: 0, y: 0 };

  // Collaborators (placed to the side in N8N)
  const collaborators = {
    garett: {
      name: 'Garett', color: 'var(--color-garett)', class: 'garett',
      x: 100, y: 100, currentX: 100, currentY: 100, targetX: 100, targetY: 100,
      speed: 0.045, state: 'IDLE', stateTimer: 0, targetNode: 'node-webhook', role: 'Lead Dev'
    },
    liz: {
      name: 'Liz', color: 'var(--color-liz)', class: 'liz',
      x: 500, y: 150, currentX: 500, currentY: 150, targetX: 500, targetY: 150,
      speed: 0.04, state: 'IDLE', stateTimer: 0, targetNode: 'node-ai-agent', role: 'UI Designer'
    },
    emma: {
      name: 'Emma', color: 'var(--color-emma)', class: 'emma',
      x: 150, y: 400, currentX: 150, currentY: 400, targetX: 150, targetY: 400,
      speed: 0.055, state: 'IDLE', stateTimer: 0, targetNode: 'node-js-transformer', role: 'Animator'
    },
    leo: {
      name: 'Leo', color: 'var(--color-leo)', class: 'leo',
      x: 450, y: 350, currentX: 450, currentY: 350, targetX: 450, targetY: 350,
      speed: 0.04, state: 'IDLE', stateTimer: 0, targetNode: 'node-database', role: 'Motion QA'
    }
  };

  // --- HELPER FUNCTIONS ---
  function screenToSVGCoords(screenX, screenY) {
    const rect = svgCanvas.getBoundingClientRect();
    const xRatio = rect.width / 600;
    const yRatio = rect.height / 500;
    return {
      x: Math.max(0, Math.min(600, (screenX - rect.left) / xRatio)),
      y: Math.max(0, Math.min(500, (screenY - rect.top) / yRatio))
    };
  }

  function generateRuler() {
    const ruler = document.getElementById('timeline-ruler');
    if (!ruler) return;
    ruler.innerHTML = '';
    const totalTicks = 40;
    for (let i = 0; i <= totalTicks; i++) {
      const tick = document.createElement('div');
      tick.className = i % 10 === 0 ? 'ruler-tick major' : 'ruler-tick';
      if (i % 10 === 0) tick.setAttribute('data-time', `${(i/10).toFixed(0)}s`);
      const percent = (i / totalTicks) * 100;
      tick.style.left = `calc(110px + ${percent}% * (100% - 110px)/100)`;
      ruler.appendChild(tick);
    }
  }

  function updateLineNumbers(text) {
    if (activeFile.endsWith('.md')) {
      lineNumbersContainer.innerHTML = '';
      return;
    }
    const lines = text.split('\n').length;
    let numbersHtml = '';
    for (let i = 1; i <= lines; i++) {
      numbersHtml += `<div>${i}</div>`;
    }
    lineNumbersContainer.innerHTML = numbersHtml;
  }

  // --- EDITOR VIEW CONMUTATOR ---
  function setEditorContent(fileKey, customText = null) {
    activeFile = fileKey;
    const textToShow = customText !== null ? customText : files[fileKey];

    // Reset — cada branch decide si lo necesita distinto
    livePreviewPane.style.display = 'flex';
    leftEditorPane.style.width = '';
    chatSidebarPane.style.display = '';
    bottomPanel.style.display = '';
    carouselNav.style.display = '';
    previewControls.style.display = '';
    portadaCarousel.style.display = 'none';
    stopPortadaCarousel();
    document.querySelectorAll('.virtual-cursor').forEach(c => { c.style.display = ''; });

    // Modo Portada: se activa para Portada.md y el resto de archivos reales
    // del negocio (Precios/Portafolio/Testimonios/FAQ/Sobre-mi). Se reevalúa
    // en cada llamada, así que cualquier otro archivo (demo de restaurante,
    // Arquitectura.js, README.md) restaura el chrome completo del IDE.
    document.documentElement.classList.toggle('mode-portada', PUBLIC_REAL_FILES.includes(fileKey));
    if (goLiveBtn) {
      goLiveBtn.innerHTML = PUBLIC_REAL_FILES.includes(fileKey)
        ? '<span class="status-icon">🚀</span> Ver sitio completo'
        : goLiveBtnOriginalHTML;
    }

    // Switch Project & Preview Graphic Group
    if (fileKey === 'restaurant-workflow-json' || fileKey === 'restaurant-workflow.json') {
      currentProject = 'n8n';
      groupN8N.style.display = 'block';
      groupPhone.style.display = 'none';
      groupObsidian.style.display = 'none';
      
      leftEditorPane.className = 'code-editor-pane';
      previewTitleLabel.textContent = `👁️ Live Workflow Preview — ${fileKey}`;
      timelinePanel.style.display = 'flex';
      
      // Update timeline labels for N8N
      document.getElementById('timeline-track-title').textContent = 'Workflow Cycle Tracker (60 FPS)';
      document.getElementById('t-label-1').textContent = 'Webhook Req';
      document.getElementById('t-label-2').textContent = 'AI Analysis';
      document.getElementById('t-label-3').textContent = 'JS Format';
      document.getElementById('t-label-4').textContent = 'DB Insert';
      
      collaborators.garett.targetNode = 'node-webhook';
      collaborators.liz.targetNode = 'node-ai-agent';
      collaborators.emma.targetNode = 'node-js-transformer';
      collaborators.leo.targetNode = 'node-database';

      statusLang.textContent = 'JSON';
      statusFiletype.textContent = 'UTF-8';
    } 
    else if (fileKey === 'Restaurant-Welcome.md' || fileKey === 'Caller-Experience.md' || fileKey === 'System-Architecture.md') {
      currentProject = 'obsidian';
      groupN8N.style.display = 'none';
      groupPhone.style.display = 'none';
      groupObsidian.style.display = 'block';
      
      leftEditorPane.className = 'code-editor-pane obsidian-editor';
      previewTitleLabel.textContent = `👁️ Obsidian Knowledge Graph View`;
      timelinePanel.style.display = 'none';
      
      statusLang.textContent = 'Markdown';
      statusFiletype.textContent = 'UTF-8';
    }
    else if (fileKey === 'index.html' || fileKey === 'style-css' || fileKey === 'style.css' || fileKey === 'script-js' || fileKey === 'script.js' || fileKey === 'walkthrough.md') {
      // background files show the smartphone mockup widget
      currentProject = 'phone';
      groupN8N.style.display = 'none';
      groupPhone.style.display = 'block';
      groupObsidian.style.display = 'none';
      
      leftEditorPane.className = 'code-editor-pane';
      previewTitleLabel.textContent = `👁️ Live Phone Widget — ${fileKey}`;
      timelinePanel.style.display = 'none';
      
      statusLang.textContent = fileKey.endsWith('.js') ? 'JavaScript' : (fileKey.endsWith('.css') ? 'CSS' : 'HTML');
      statusFiletype.textContent = 'UTF-8';
    }
    else if (fileKey === 'Portada.md') {
      // Vista previa del homepage real — mockup en el panel de preview
      currentProject = 'portada';
      groupN8N.style.display = 'none';
      groupPhone.style.display = 'none';
      groupObsidian.style.display = 'none';
      portadaCarousel.style.display = 'block';
      startPortadaCarousel();
      document.querySelectorAll('.virtual-cursor').forEach(c => { c.style.display = 'none'; });
      chatSidebarPane.style.display = 'none';
      bottomPanel.style.display = 'none';
      carouselNav.style.display = 'none';
      previewControls.style.display = 'none';

      leftEditorPane.className = 'code-editor-pane obsidian-editor';
      previewTitleLabel.textContent = `👁️ Portada — vista previa en vivo`;
      timelinePanel.style.display = 'none';

      statusLang.textContent = 'Markdown';
      statusFiletype.textContent = 'UTF-8';
    }
    else if (fileKey === 'Arquitectura.js') {
      // Conversación real Gemini + Claude sobre el diseño/arquitectura del sitio, con preview del resultado de inicio
      currentProject = 'arquitectura';
      groupN8N.style.display = 'none';
      groupPhone.style.display = 'none';
      groupObsidian.style.display = 'none';
      livePreviewPane.style.display = 'none';
      leftEditorPane.style.width = '';
      bottomPanel.style.display = 'none';

      leftEditorPane.className = 'code-editor-pane';
      timelinePanel.style.display = 'none';

      chatMessages.innerHTML = '';
      addChatBubble('Gemini', '¿Cómo armamos la arquitectura para que un dueño de negocio no técnico confíe en 10 segundos?', true);
      addChatBubble('Claude', 'Separando todo en archivos reales: Precios.md, Portafolio.md, Testimonios.md, FAQ.md. Nada de contenido genérico — solo lo que existe de verdad.', true);
      addChatBubble('Gemini', 'Para la paleta: fondo casi negro, un solo dorado de acento. ¿Tipografía?', true);
      addChatBubble('Claude', 'Anton para headlines (condensada, mayúsculas), Inter para lectura, JetBrains Mono para precios y labels. Dos familias, contraste claro.', true);
      addChatBubble('Gemini', 'Hosting: AWS S3 + CloudFront, ¿verdad? Necesitamos <100ms.', true);
      addChatBubble('Claude', 'Confirmado. SSL automático, Route 53 para el DNS. El "resultado de inicio" ya está armado — mirá el preview →', true);

      statusLang.textContent = 'JavaScript';
      statusFiletype.textContent = 'UTF-8';
    }
    else if (fileKey === 'Precios.md' || fileKey === 'Portafolio.md' || fileKey === 'Testimonios.md' || fileKey === 'FAQ.md' || fileKey === 'Sobre-mi.md'
      || fileKey === '01-Briefing.md' || fileKey === '02-Analisis.md' || fileKey === '03-Build.md' || fileKey === '04-Deploy.md' || fileKey === '05-Live.md') {
      // Archivos reales de Apex Cloud Works — sin la animación de la demo del restaurante
      currentProject = 'apex';
      groupN8N.style.display = 'none';
      groupPhone.style.display = 'none';
      groupObsidian.style.display = 'none';
      livePreviewPane.style.display = 'none';
      chatSidebarPane.style.display = 'none';
      bottomPanel.style.display = 'none';

      leftEditorPane.className = 'code-editor-pane obsidian-editor';
      leftEditorPane.style.width = '100%';
      timelinePanel.style.display = 'none';

      statusLang.textContent = 'Markdown';
      statusFiletype.textContent = 'UTF-8';
    }
    else {
      // README welcome file
      currentProject = 'readme';
      groupN8N.style.display = 'block'; // defaults to N8N flow
      groupPhone.style.display = 'none';
      groupObsidian.style.display = 'none';

      leftEditorPane.className = 'code-editor-pane obsidian-editor';
      previewTitleLabel.textContent = `👁️ Case Study Ingestion Flow`;
      timelinePanel.style.display = 'flex';

      statusLang.textContent = 'Markdown';
      statusFiletype.textContent = 'UTF-8';
    }

    // Format content in editor
    if (fileKey === 'README.md') {
      const markdownHtml = textToShow
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
      codeContainer.innerHTML = markdownHtml + `
        <div class="mock-ticket-form">
          <h3>🎟️ Simular Envío de Ticket de Servicio</h3>
          <p>Llena este formulario para iniciar el flujo de la llamada y la automatización:</p>
          <div class="ticket-form-group">
            <label>Nombre del Cliente</label>
            <input type="text" value="Garett Johan" id="mock-ticket-name" readonly />
          </div>
          <div class="ticket-form-group">
            <label>Idea / Requerimiento del Proyecto</label>
            <textarea id="mock-ticket-desc" readonly>Necesitamos un bot de llamadas por IA para automatizar las reservaciones de La Rústica Pizzería.</textarea>
          </div>
          <button class="btn-send-ticket" id="mock-ticket-submit-btn">Enviar Requerimiento ➔</button>
        </div>
      `;
      
      setTimeout(() => {
        const btn = document.getElementById('mock-ticket-submit-btn');
        if (btn) {
          btn.addEventListener('click', () => {
            btn.textContent = 'Enviando...';
            btn.disabled = true;
            appendTerminalLog('Ingesting service ticket webhook payload...', 'warning');
            
            setTimeout(() => {
              btn.textContent = '¡Enviado!';
              appendTerminalLog('Webhook successfully ingested. Triggering N8N workflow...', 'success');
              setEditorContent('restaurant-workflow.json');
              time = 0; 
            }, 1000);
          });
        }
      }, 50);
    } else if (fileKey.endsWith('.md')) {
      const markdownHtml = textToShow
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      codeContainer.innerHTML = markdownHtml;
    } else {
      const escapedText = textToShow
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      codeContainer.innerHTML = escapedText;
    }
    
    updateLineNumbers(textToShow);
    document.title = `${fileKey} — apex-cloudworks — Antigravity IDE`;

    // En mobile, editor+preview no caben lado a lado — se prioriza uno según el archivo
    leftEditorPane.classList.remove('mobile-hide');
    livePreviewPane.classList.remove('mobile-hide');
    if (window.innerWidth <= 767 && livePreviewPane.style.display !== 'none') {
      if (fileKey === 'Portada.md') {
        leftEditorPane.classList.add('mobile-hide');
      } else {
        livePreviewPane.classList.add('mobile-hide');
      }
    }

    // Sync tabs UI
    let activeTab = null;
    tabs.forEach(t => {
      if (t.dataset.file === fileKey) { t.classList.add('active'); activeTab = t; }
      else t.classList.remove('active');
    });
    if (activeTab) activeTab.scrollIntoView({ inline: 'nearest', block: 'nearest' });

    fileNodes.forEach(f => {
      const name = f.id.replace('file-', '').replace('obs-file-', '');
      const lastDash = name.lastIndexOf('-');
      const parsedKey = lastDash !== -1 ? name.substring(0, lastDash) + '.' + name.substring(lastDash + 1) : name;
      if (parsedKey === fileKey) f.classList.add('active');
      else f.classList.remove('active');
    });
  }

  // --- APP CONMUTATOR (VS CODE / OBSIDIAN) ---
  function setAppMode(appMode) {
    currentApp = appMode;
    if (appMode === 'obsidian') {
      appWorkspace.classList.add('app-mode-obsidian');
      actExplorer.classList.remove('active');
      actObsidian.classList.add('active');
      setEditorContent('Restaurant-Welcome.md');
    } else {
      appWorkspace.classList.remove('app-mode-obsidian');
      actExplorer.classList.add('active');
      actObsidian.classList.remove('active');
      setEditorContent('README.md');
    }
  }
  // Expuestas globalmente para los links del header (Precios/Portafolio/etc.)
  window.setAppMode = setAppMode;
  window.setEditorContent = setEditorContent;

  actExplorer.addEventListener('click', () => setAppMode('vscode'));
  actObsidian.addEventListener('click', () => setAppMode('obsidian'));

  tabs.forEach(t => {
    t.addEventListener('click', () => {
      clearInterval(typingInterval);
      setEditorContent(t.dataset.file);
    });
    const closeBtn = t.querySelector('.tab-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasActive = t.classList.contains('active');
        const neighbor = t.nextElementSibling || t.previousElementSibling;
        t.remove();
        if (wasActive && neighbor) {
          setEditorContent(neighbor.dataset.file);
        }
      });
    }
  });

  fileNodes.forEach(f => {
    f.addEventListener('click', () => {
      clearInterval(typingInterval);
      const name = f.id.replace('file-', '').replace('obs-file-', '');
      const lastDash = name.lastIndexOf('-');
      const fileKey = lastDash !== -1 ? name.substring(0, lastDash) + '.' + name.substring(lastDash + 1) : name;
      setEditorContent(fileKey);
    });
  });

  // Flechas de scroll del editor — reemplazan la barra nativa
  const scrollUpBtn = document.getElementById('editor-scroll-up');
  const scrollDownBtn = document.getElementById('editor-scroll-down');
  if (scrollUpBtn && scrollDownBtn) {
    scrollUpBtn.addEventListener('click', () => {
      leftEditorPane.scrollBy({ top: -260, behavior: 'smooth' });
    });
    scrollDownBtn.addEventListener('click', () => {
      leftEditorPane.scrollBy({ top: 260, behavior: 'smooth' });
    });
  }

  // --- MOCK TERMINAL ---
  function appendTerminalLog(text, type = 'info') {
    const el = document.createElement('div');
    el.className = `log-line log-${type}`;
    el.innerHTML = `[terminal] ${text}`;
    terminalOutput.appendChild(el);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  // --- VIRTUAL COLLABORATORS MOVEMENT ---
  function createCollaboratorCursors() {
    for (const key in collaborators) {
      const col = collaborators[key];
      const cursorEl = document.createElement('div');
      cursorEl.className = `virtual-cursor ${col.class}`;
      cursorEl.innerHTML = `
        <svg class="cursor-pointer-svg" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 2V17.5L7.2 12.8L12.5 18L15 15.5L9.8 10.2L15.5 9.8L2.5 2Z" stroke="#07090e" stroke-width="1.8" fill="currentColor"/>
        </svg>
        <div class="cursor-label">${col.name} <span>${col.role}</span></div>
        <div class="cursor-click-ring"></div>
      `;
      container.appendChild(cursorEl);
      col.element = cursorEl;
      updateCursorDOM(col);
    }
  }

  function updateCursorDOM(col) {
    if (col.element) {
      col.element.style.transform = `translate3d(${col.currentX}px, ${col.currentY}px, 0)`;
    }
  }

  function triggerClickRipple(col) {
    if (!col.element) return;
    const ring = col.element.querySelector('.cursor-click-ring');
    if (ring) {
      ring.classList.remove('click-animation');
      void ring.offsetWidth;
      ring.classList.add('click-animation');
    }
  }

  function getActiveNodeCoords(nodeKey) {
    let node = null;
    let widthOffset = 50;
    let heightOffset = 40;
    
    if (currentProject === 'n8n') {
      node = n8nNodes[nodeKey];
    }
    
    if (!node) return { x: 300, y: 250 };
    
    const rect = svgCanvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const xRatio = rect.width / 600;
    const yRatio = rect.height / 500;
    
    const xLocal = node.x + widthOffset;
    const yLocal = node.y + heightOffset;

    return {
      x: rect.left - containerRect.left + (xLocal * xRatio),
      y: rect.top - containerRect.top + (yLocal * yRatio)
    };
  }

  function updateCollaboratorBrain(col, colKey) {
    if (!isAutopilot || currentProject !== 'n8n') {
      // Park cursors to the sides
      col.targetX = colKey === 'garett' || colKey === 'emma' ? 40 : container.clientWidth - 40;
      col.targetY = container.clientHeight / 2 + (colKey === 'garett' ? -60 : 60);
      col.currentX += (col.targetX - col.currentX) * col.speed;
      col.currentY += (col.targetY - col.currentY) * col.speed;
      updateCursorDOM(col);
      return;
    }

    col.stateTimer--;

    switch (col.state) {
      case 'IDLE':
        if (col.stateTimer <= 0) {
          const rand = Math.random();
          if (rand < 0.45) {
            col.state = 'MOVING_TO_NODE';
            const keys = Object.keys(n8nNodes);
            col.targetNode = keys[Math.floor(Math.random() * keys.length)];
            col.stateTimer = 200;
          } else {
            col.state = 'WANDERING';
            col.targetX = 60 + Math.random() * (container.clientWidth - 120);
            col.targetY = 60 + Math.random() * (container.clientHeight - 120);
            col.stateTimer = 120 + Math.random() * 100;
          }
        }
        break;

      case 'WANDERING':
        col.currentX += (col.targetX - col.currentX) * col.speed;
        col.currentY += (col.targetY - col.currentY) * col.speed;
        if (col.stateTimer <= 0) col.state = 'IDLE';
        break;

      case 'MOVING_TO_NODE':
        const targetCoords = getActiveNodeCoords(col.targetNode);
        col.targetX = targetCoords.x - 3;
        col.targetY = targetCoords.y - 3;
        
        col.currentX += (col.targetX - col.currentX) * col.speed;
        col.currentY += (col.targetY - col.currentY) * col.speed;
        
        if (Math.hypot(col.targetX - col.currentX, col.targetY - col.currentY) < 6) {
          triggerClickRipple(col);
          
          col.state = 'DRAGGING_NODE';
          col.dragStartValX = n8nNodes[col.targetNode].x;
          col.dragStartValY = n8nNodes[col.targetNode].y;
          col.dragTargetLocalX = col.dragStartValX + (Math.random() * 20 - 10);
          col.dragTargetLocalY = col.dragStartValY + (Math.random() * 30 - 15);
          
          col.stateTimer = 100 + Math.random() * 60;
        }
        break;

      case 'DRAGGING_NODE':
        const progress = 1 - (col.stateTimer / 160);
        const nextX = col.dragStartValX + (col.dragTargetLocalX - col.dragStartValX) * Math.sin(progress * Math.PI / 2);
        const nextY = col.dragStartValY + (col.dragTargetLocalY - col.dragStartValY) * Math.sin(progress * Math.PI / 2);
        
        n8nNodes[col.targetNode].x = nextX;
        n8nNodes[col.targetNode].y = nextY;
        
        const currCoords = getActiveNodeCoords(col.targetNode);
        col.targetX = currCoords.x - 3;
        col.targetY = currCoords.y - 3;
        col.currentX += (col.targetX - col.currentX) * 0.25;
        col.currentY += (col.targetY - col.currentY) * 0.25;
        
        if (col.stateTimer <= 0) {
          col.state = 'IDLE';
          col.stateTimer = 40 + Math.random() * 40;
        }
        break;
    }

    if (col.state !== 'DRAGGING_NODE') {
      col.currentX += (col.targetX - col.currentX) * col.speed;
      col.currentY += (col.targetY - col.currentY) * col.speed;
    }
    updateCursorDOM(col);
  }

  // --- RENDERING PROCEDURES ---
  function drawSCurve(pathId, nodeA, nodeB) {
    const el = document.getElementById(pathId);
    if (!el) return;
    
    const x1 = nodeA.x + 100; // Output port
    const y1 = nodeA.y + 40;
    const x2 = nodeB.x;       // Input port
    const y2 = nodeB.y + 40;
    
    const cp1x = x1 + (x2 - x1) / 2;
    const cp1y = y1;
    const cp2x = x1 + (x2 - x1) / 2;
    const cp2y = y2;
    
    const d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
    el.setAttribute('d', d);
  }

  // 1. N8N Rendering
  function drawN8NGraph() {
    for (const key in n8nNodes) {
      const node = n8nNodes[key];
      const el = document.getElementById(node.elementId);
      if (el) el.setAttribute('transform', `translate(${node.x}, ${node.y})`);
    }
    const n = n8nNodes;
    drawSCurve('n8n-path-1', n['node-webhook'], n['node-ai-agent']);
    drawSCurve('n8n-path-2', n['node-ai-agent'], n['node-js-transformer']);
    drawSCurve('n8n-path-3', n['node-js-transformer'], n['node-database']);
  }

  // 2. Phone Call Widget Waves Rendering
  function drawPhoneWaves() {
    const wave1 = document.getElementById('voice-wave-1');
    const wave2 = document.getElementById('voice-wave-2');
    if (!wave1 || !wave2) return;
    
    let amp = 20;
    if (isPhoneCallActive) {
      // Audio waves react with mathematical pulses simulating voices
      amp = 18 + Math.sin(time * 0.02) * 22 + Math.sin(time * 0.05) * 8;
      phoneCallTimer += 0.016;
      phoneCallStatus.textContent = `Call Active: 00:${phoneCallTimer.toFixed(0).padStart(2, '0')}s`;
      
      // Cycle call transcripts on phone screen mockup every 3 seconds
      if (Math.floor(phoneCallTimer) % 4 === 0) {
        const transIdx = Math.floor(phoneCallTimer / 4) % phoneTranscripts.length;
        if (transIdx !== transcriptCycleIdx) {
          transcriptCycleIdx = transIdx;
          transcriptLine1.textContent = phoneTranscripts[transIdx].t1;
          transcriptLine2.textContent = phoneTranscripts[transIdx].t2;
          transcriptLine3.textContent = phoneTranscripts[transIdx].t3;
        }
      }
    } else {
      amp = 2; // Flat line on hangup
      phoneCallStatus.textContent = 'Call Disconnected';
    }
    
    const w1Path = `M 0 0 C 30 ${-amp}, 60 ${amp}, 90 ${-amp/2} C 120 ${amp/4}, 150 ${-amp*1.2}, 180 ${amp*0.8} C 210 ${-amp/3}, 230 ${amp/3}, 230 0`;
    const w2Path = `M 0 0 C 30 ${amp/2}, 60 ${-amp*0.8}, 90 ${amp*0.3} C 120 ${-amp}, 150 ${amp/2}, 180 ${-amp/4} C 210 ${amp*0.6}, 230 ${-amp/2}, 230 0`;
    
    wave1.setAttribute('d', w1Path);
    wave2.setAttribute('d', w2Path);
  }

  // Phone Call Button Listeners
  if (phoneBtnCall) {
    phoneBtnCall.addEventListener('click', () => {
      isPhoneCallActive = true;
      phoneCallTimer = 0.0;
      appendTerminalLog('Connecting incoming client call webhook...', 'warning');
      appendTerminalLog('AI Voice session started: Gemini model connected.', 'success');
    });
  }
  if (phoneBtnHangup) {
    phoneBtnHangup.addEventListener('click', () => {
      isPhoneCallActive = false;
      appendTerminalLog('Voice session disconnected.', 'info');
    });
  }

  // 3. Obsidian Rendering
  function drawObsidianGraph() {
    for (const key in obsNodes) {
      const node = obsNodes[key];
      const el = document.getElementById(node.elementId);
      if (el) el.setAttribute('transform', `translate(${node.x}, ${node.y})`);
    }
    setEdgeCoords('obs-edge-1', obsNodes['Welcome'], obsNodes['Architecture']);
    setEdgeCoords('obs-edge-2', obsNodes['Welcome'], obsNodes['Integrations']);
    setEdgeCoords('obs-edge-3', obsNodes['Architecture'], obsNodes['workflow']);
    setEdgeCoords('obs-edge-4', obsNodes['workflow'], obsNodes['transform']);
    setEdgeCoords('obs-edge-5', obsNodes['Integrations'], obsNodes['index']);
    setEdgeCoords('obs-edge-6', obsNodes['transform'], obsNodes['index']);
  }

  function setEdgeCoords(edgeId, nodeA, nodeB) {
    const el = document.getElementById(edgeId);
    if (el) {
      el.setAttribute('x1', nodeA.x);
      el.setAttribute('y1', nodeA.y);
      el.setAttribute('x2', nodeB.x);
      el.setAttribute('y2', nodeB.y);
    }
  }

  function updateObsidianPhysics() {
    for (const key in obsNodes) {
      const node = obsNodes[key];
      if (isDraggingUser && draggedNodeKey === node.elementId) continue;
      
      const homeX = obsNodeHomes[key].x;
      const homeY = obsNodeHomes[key].y;
      
      node.vx += (homeX - node.x) * 0.04;
      node.vy += (homeY - node.y) * 0.04;
      
      node.vx *= 0.85;
      node.vy *= 0.85;
      
      node.x += node.vx;
      node.y += node.vy;
    }
  }

  // --- WORKFLOW EXECUTION LOOP ---
  function runWorkflowAnimationCycle() {
    if (!isPlaying || currentProject !== 'n8n') return;
    
    time = (time + 16.67) % maxTime;
    const progress = time / maxTime;
    
    const timelineWidth = container.clientWidth - 150;
    playhead.style.left = `${110 + (progress * timelineWidth)}px`;
    timeCounter.textContent = `${(time/1000).toFixed(2)}s`;

    const path1 = document.getElementById('n8n-path-1');
    const path2 = document.getElementById('n8n-path-2');
    const path3 = document.getElementById('n8n-path-3');
    
    const pulse1 = document.getElementById('n8n-pulse-1');
    const pulse2 = document.getElementById('n8n-pulse-2');
    const pulse3 = document.getElementById('n8n-pulse-3');
    
    const nodeWebhook = document.getElementById('node-webhook');
    const nodeAi = document.getElementById('node-ai-agent');
    const nodeJs = document.getElementById('node-js-transformer');
    const nodeDb = document.getElementById('node-database');
    
    const statWebhook = document.getElementById('status-webhook');
    const statAi = document.getElementById('status-ai');
    const statJs = document.getElementById('status-js');
    const statDb = document.getElementById('status-db');

    // Cycle intervals
    if (time >= 400 && time < 1200) {
      const p = (time - 400) / 800;
      movePulseAlongPath(pulse1, path1, p, 'pulsing-webhook');
      
      nodeWebhook.className.baseVal = 'n8n-node-group success';
      statWebhook.textContent = 'Call Input (200)';
      nodeAi.className.baseVal = 'n8n-node-group executing';
      statAi.textContent = 'Voice analyzing...';
      
      path1.className.baseVal = 'n8n-connection-path active-path';
    } 
    else if (time >= 1200 && time < 2200) {
      const p = (time - 1200) / 1000;
      movePulseAlongPath(pulse2, path2, p, 'pulsing-ai');
      hidePulse(pulse1);
      
      nodeWebhook.className.baseVal = 'n8n-node-group success';
      statWebhook.textContent = 'Connected';
      nodeAi.className.baseVal = 'n8n-node-group success';
      statAi.textContent = 'RESERVATION';
      nodeJs.className.baseVal = 'n8n-node-group executing';
      statJs.textContent = 'Forming payload...';
      
      path1.className.baseVal = 'n8n-connection-path success-path';
      path2.className.baseVal = 'n8n-connection-path active-path';
    } 
    else if (time >= 2200 && time < 3000) {
      const p = (time - 2200) / 800;
      movePulseAlongPath(pulse3, path3, p, 'pulsing-js');
      hidePulse(pulse2);
      
      nodeAi.className.baseVal = 'n8n-node-group success';
      statAi.textContent = 'RESERVATION';
      nodeJs.className.baseVal = 'n8n-node-group success';
      statJs.textContent = 'Cleaned';
      nodeDb.className.baseVal = 'n8n-node-group executing';
      statDb.textContent = 'Saving PostgreSQL...';
      
      path2.className.baseVal = 'n8n-connection-path success-path';
      path3.className.baseVal = 'n8n-connection-path active-path';
    } 
    else if (time >= 3000 && time < 3800) {
      hidePulse(pulse3);
      nodeJs.className.baseVal = 'n8n-node-group success';
      nodeDb.className.baseVal = 'n8n-node-group success';
      statDb.textContent = 'Reserved (Mesa 4)';
      
      path3.className.baseVal = 'n8n-connection-path success-path';
    } 
    else {
      hidePulse(pulse1);
      hidePulse(pulse2);
      hidePulse(pulse3);
      
      nodeWebhook.className.baseVal = 'n8n-node-group';
      nodeAi.className.baseVal = 'n8n-node-group';
      nodeJs.className.baseVal = 'n8n-node-group';
      nodeDb.className.baseVal = 'n8n-node-group';
      
      statWebhook.textContent = 'Ready';
      statAi.textContent = 'Ready';
      statJs.textContent = 'Ready';
      statDb.textContent = 'Ready';
      
      path1.className.baseVal = 'n8n-connection-path';
      path2.className.baseVal = 'n8n-connection-path';
      path3.className.baseVal = 'n8n-connection-path';
    }
  }

  function movePulseAlongPath(pulseEl, pathEl, progress, pulseClass) {
    if (!pulseEl || !pathEl) return;
    const length = pathEl.getTotalLength();
    const point = pathEl.getPointAtLength(progress * length);
    pulseEl.setAttribute('cx', point.x);
    pulseEl.setAttribute('cy', point.y);
    pulseEl.style.opacity = '1';
    pulseEl.className.baseVal = `n8n-data-pulse ${pulseClass}`;
  }

  function hidePulse(pulseEl) {
    if (pulseEl) pulseEl.style.opacity = '0';
  }

  // --- CAROUSEL ROTATION LOGIC ---
  const phases = [
    { name: 'N8N Automation Flow', file: 'restaurant-workflow.json', indicator: 'Fase: Integración N8N (1/3)', mode: 'vscode' },
    { name: 'Obsidian Documentation', file: 'Restaurant-Welcome.md', indicator: 'Fase: Documentación (2/3)', mode: 'obsidian' },
    { name: 'Voice Call Widget', file: 'index.html', indicator: 'Fase: Widget Telefónico (3/3)', mode: 'vscode' }
  ];

  function switchPhase(direction) {
    clearInterval(typingInterval);
    if (direction === 'next') {
      currentPhase = (currentPhase + 1) % phases.length;
    } else {
      currentPhase = (currentPhase - 1 + phases.length) % phases.length;
    }
    
    const phase = phases[currentPhase];
    carouselIndicator.textContent = phase.indicator;
    
    if (phase.mode === 'obsidian') {
      setAppMode('obsidian');
    } else {
      setAppMode('vscode');
      setEditorContent(phase.file);
    }
    appendTerminalLog(`Carousel rotated to Phase: ${phase.name}`, 'info');
  }

  if (nextCarouselBtn) {
    nextCarouselBtn.addEventListener('click', () => {
      switchPhase('next');
      resetAutopilotInterval();
    });
  }
  if (prevCarouselBtn) {
    prevCarouselBtn.addEventListener('click', () => {
      switchPhase('prev');
      resetAutopilotInterval();
    });
  }

  function resetAutopilotInterval() {
    clearInterval(carouselInterval);
    if (isAutopilot) {
      carouselInterval = setInterval(() => {
        switchPhase('next');
      }, 15000); // 15 seconds phase rotation
    }
  }

  // --- INTERACTIVE DRAGGING SETUP ---
  function setupInteractiveDraggingAll() {
    // 1. Drag N8N Nodes
    const n8nNodeEls = document.querySelectorAll('.n8n-node-group');
    n8nNodeEls.forEach(el => {
      el.addEventListener('pointerdown', (e) => {
        if (isAutopilot || currentProject !== 'n8n') return;
        isDraggingUser = true;
        el.releasePointerCapture(e.pointerId);
        
        draggedNodeKey = el.id;
        const localSVGCoords = screenToSVGCoords(e.clientX, e.clientY);
        dragOffset.x = localSVGCoords.x - n8nNodes[draggedNodeKey].x;
        dragOffset.y = localSVGCoords.y - n8nNodes[draggedNodeKey].y;
        
        e.stopPropagation();
      });
    });

    // 2. Drag Obsidian Graph Nodes
    const obsNodeEls = document.querySelectorAll('.obs-node-group');
    obsNodeEls.forEach(el => {
      el.addEventListener('pointerdown', (e) => {
        if (currentProject !== 'obsidian') return;
        isDraggingUser = true;
        el.releasePointerCapture(e.pointerId);
        
        draggedNodeKey = el.id.replace('obs-node-', '');
        const localSVGCoords = screenToSVGCoords(e.clientX, e.clientY);
        dragOffset.x = localSVGCoords.x - obsNodes[draggedNodeKey].x;
        dragOffset.y = localSVGCoords.y - obsNodes[draggedNodeKey].y;
        
        e.stopPropagation();
      });
    });

    // Move Handler
    container.addEventListener('pointermove', (e) => {
      if (!isDraggingUser || !draggedNodeKey) return;
      const localCoords = screenToSVGCoords(e.clientX, e.clientY);
      
      if (currentProject === 'n8n') {
        n8nNodes[draggedNodeKey].x = localCoords.x - dragOffset.x;
        n8nNodes[draggedNodeKey].y = localCoords.y - dragOffset.y;
      } 
      else if (currentProject === 'obsidian') {
        obsNodes[draggedNodeKey].x = localCoords.x - dragOffset.x;
        obsNodes[draggedNodeKey].y = localCoords.y - dragOffset.y;
      }
    });

    // Release Handler
    window.addEventListener('pointerup', () => {
      if (isDraggingUser && draggedNodeKey) {
        isDraggingUser = false;
        draggedNodeKey = null;
      }
    });
  }

  // --- SIMULATED AI CHAT & CODE TYPING LOOP ---
  let portadaTimer = null;
  function startPortadaCarousel() {
    stopPortadaCarousel();
    const slides = Array.from(portadaCarousel.querySelectorAll('.pc-slide'));
    const dots = Array.from(portadaCarousel.querySelectorAll('.pc-dot'));
    if (!slides.length) return;
    let current = 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    // La slide 0 es la propuesta de valor — se sostiene más para que se lea completa
    const HOLD_HERO = 8000, HOLD_REST = 4500;
    const advance = () => {
      current = (current + 1) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
      portadaTimer = setTimeout(advance, current === 0 ? HOLD_HERO : HOLD_REST);
    };
    portadaTimer = setTimeout(advance, HOLD_HERO);
  }

  function stopPortadaCarousel() {
    if (portadaTimer) clearTimeout(portadaTimer);
    portadaTimer = null;
  }

  function addChatBubble(sender, text, isAi = false) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isAi ? 'ai' : 'user'}`;
    bubble.innerHTML = `
      <span class="chat-bubble-sender">${sender}</span>
      <div>${text}</div>
    `;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function simulateCodeTyping(fileKey, fullText, callback) {
    clearInterval(typingInterval);
    setEditorContent(fileKey, '');
    let lineIdx = 0;
    const textLines = fullText.split('\n');
    let typedLines = [];
    
    typingInterval = setInterval(() => {
      if (lineIdx < textLines.length) {
        typedLines.push(textLines[lineIdx]);
        setEditorContent(fileKey, typedLines.join('\n'));
        codeContainer.parentElement.scrollTop = codeContainer.parentElement.scrollHeight;
        lineIdx++;
      } else {
        clearInterval(typingInterval);
        setEditorContent(fileKey, fullText);
        if (callback) callback();
      }
    }, 60);
  }

  function runAISimulation() {
    chatMessages.innerHTML = '';
    terminalOutput.innerHTML = '';
    chatTimeouts.forEach(clearTimeout);
    chatTimeouts = [];
    clearInterval(typingInterval);
    
    aiStatusLabel.textContent = 'Active';
    aiStatusDot.className = 'status-dot';
    setAppMode('vscode');
    setEditorContent('README.md');

    appendTerminalLog('Starting Restaurant voice webhook ingestion server...', 'info');
    appendTerminalLog('Connecting to larustica_bookings PostgreSQL cluster...', 'info');

    // Conversation steps
    chatTimeouts.push(setTimeout(() => {
      addChatBubble('garettjohan12@gmail.com', '¿Cómo configuramos la llamada para reservar mesa y procesar el pedido a la base de datos?');
    }, 1000));

    chatTimeouts.push(setTimeout(() => {
      aiStatusLabel.textContent = 'Thinking...';
      aiStatusDot.className = 'status-dot thinking';
    }, 2200));

    chatTimeouts.push(setTimeout(() => {
      aiStatusLabel.textContent = 'Typing...';
      aiStatusDot.className = 'status-dot';
      addChatBubble('Antigravity AI', '¡Claro! Escribiré el analizador semántico en `ai-phone-logic.js` para detectar cuándo un cliente desea reservar mesa o cuándo desea hacer un pedido de pizza a domicilio.', true);
    }, 4000));

    chatTimeouts.push(setTimeout(() => {
      setEditorContent('ai-phone-logic.js', '');
      appendTerminalLog('Compiling node: N8N/ai-phone-logic.js', 'warning');
      simulateCodeTyping('ai-phone-logic.js', files['ai-phone-logic.js'], () => {
        appendTerminalLog('Node Custom logic compiled: intent classification READY.', 'success');
        
        chatTimeouts.push(setTimeout(() => {
          addChatBubble('garettjohan12@gmail.com', 'Excelente. Validemos las llamadas entrantes en el simulador telefónico.', false);
        }, 1500));

        chatTimeouts.push(setTimeout(() => {
          aiStatusLabel.textContent = 'Thinking...';
          aiStatusDot.className = 'status-dot thinking';
        }, 3000));

        chatTimeouts.push(setTimeout(() => {
          aiStatusLabel.textContent = 'Active';
          aiStatusDot.className = 'status-dot';
          addChatBubble('Antigravity AI', 'Llamada conectada en el Widget Telefónico. Puedes pulsar el botón verde 📞 para simular nuevas llamadas de prueba o rotar por las fases del carrusel superior para ver el flujo n8n.', true);
          
          appendTerminalLog('Incoming Call Webhook triggered.', 'info');
          appendTerminalLog('AI Voice classification: Intent RESERVATION detected.', 'success');
          appendTerminalLog('Booking saved successfully in postgres database.', 'success');
        }, 5000));
      });
    }, 6000));
  }

  restartChatBtn.addEventListener('click', runAISimulation);

  // Autopilot toggle
  autopilotBtn.addEventListener('click', () => {
    isAutopilot = !isAutopilot;
    autopilotBtn.textContent = `Autopilot: ${isAutopilot ? 'ON' : 'OFF'}`;
    resetAutopilotInterval();
  });

  // Play / Pause cycle
  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playBtn.innerHTML = isPlaying ? '<span>⏸</span> Pause' : '<span>▶</span> Play';
  });

  // --- MAIN LOOP ---
  function loop() {
    time = (time + 16.67) % maxTime;
    
    if (currentProject === 'n8n') {
      for (const key in collaborators) {
        updateCollaboratorBrain(collaborators[key], key);
      }
      drawN8NGraph();
      runWorkflowAnimationCycle();
    } 
    else if (currentProject === 'phone') {
      drawPhoneWaves();
    }
    else if (currentProject === 'obsidian') {
      updateObsidianPhysics();
      drawObsidianGraph();
    }
    else if (currentProject === 'readme') {
      // README is active; just run N8N background animations
      drawN8NGraph();
      runWorkflowAnimationCycle();
    }
    animationFrameId = requestAnimationFrame(loop);
  }

  createCollaboratorCursors();
  setupInteractiveDraggingAll();
  generateRuler();

  // Deep-link: si la URL trae #Precios, #Portafolio, #Testimonios, #FAQ o #Sobre-mi,
  // abrir ese archivo real directamente en vez de la demo del restaurante.
  const realFiles = { precios: 'Precios.md', portafolio: 'Portafolio.md', testimonios: 'Testimonios.md', faq: 'FAQ.md', 'sobre-mi': 'Sobre-mi.md', sobre: 'Sobre-mi.md', arquitectura: 'Arquitectura.js', portada: 'Portada.md' };
  const hashKey = (window.location.hash || '').replace('#', '').toLowerCase();

  if (realFiles[hashKey]) {
    setAppMode('vscode');
    setEditorContent(realFiles[hashKey]);
  } else {
    // Start simulation on load
    runAISimulation();
    resetAutopilotInterval();
  }
  
  // Start canvas loop
  loop();

  window.addEventListener('resize', generateRuler);
});

