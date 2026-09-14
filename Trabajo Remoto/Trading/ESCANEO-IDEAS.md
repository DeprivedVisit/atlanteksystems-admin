# Escaneo de Ideas — Bot de Trading Telegram + n8n
> Investigación: tendencias 2026, modelos de negocio, arquitectura técnica

---

## 1. El Producto: "Apex Trading Bot"

Un bot de Telegram que combina **educación + señales + herramientas** en un solo producto. No es "un bot más" — es un ecosistema completo donde el usuario aprende, opera y mide resultados.

### Comandos del Bot (todos en uno)

| Comando | Función | Tier |
|---------|---------|------|
| `/start` | Bienvenida + menú | Free |
| `/next` | Siguiente lección del plan de estudios | Free |
| `/progress` | Ver progreso en módulos | Free |
| `/modules` | Lista de módulos | Free |
| `/ask [pregunta]` | AI Tutor responde sobre trading | Free |
| `/signal [par]` | Señal de trading con entry/SL/TP | Pro |
| `/analyze [par]` | Análisis técnico completo con IA | Pro |
| `/risk [saldo] [riesgo%] [stop]` | Calculadora de posición | Pro |
| `/log [par] [dir] [entrada] [sl] [tp]` | Registrar trade en bitácora | Pro |
| `/stats` | Estadísticas de la bitácora | Pro |
| `/news` | Resumen de noticias del día | Studio |
| `/calendar` | Alertas de calendario económico | Studio |
| `/backtest [estrategia]` | Simular estrategia histórica | Studio |

---

## 2. Modelo de Negocio: 3 Tiers

### Comparativa con el mercado (2026)

| Servicio | Free | Pro | Studio |
|----------|------|-----|--------|
| **MoneyBotOS** | Dirección + score | $29/mo — entry + SL + TP1 + TP2 | $59/mo — TP3 + inteligencia |
| **CoinCodeCap** | — | $70/mo — señales verificadas | — |
| **Botely** | — | €39/mo — señales + autotrade $5k | €69/mo — autotrade $20k |
| **Maestro** | 1% fee por trade | $200/mo — Premium (indicators) | — |
| **EganForge** | $9/mo — señales con delay | $19/mo — tiempo real + sizing | $149/año — limitado 100 |

### Nuestra propuesta

| Tier | Precio | Qué incluye |
|------|--------|-------------|
| **Free** | $0 | Plan de estudios (8 módulos), AI Tutor, bitácora básica, calculatoria simple |
| **Pro** | $29-39/mo | Señales en tiempo real, análisis técnico IA, calculadora avanzada, bitácora completa + stats, alertas de calendario |
| **Studio** | $59-79/mo | Todo Pro + noticias resumidas por IA, backtesting, paper trading con leaderboard, certificado de finalización, acceso prioritario |

### Revenue potencial

| Escenario | Usuarios Pro | Usuarios Studio | MRR |
|-----------|-------------|-----------------|-----|
| Mes 1-3 | 20 | 5 | $725-935 |
| Mes 6 | 50 | 15 | $2,075-2,635 |
| Mes 12 | 100 | 30 | $4,150-5,335 |

---

## 3. Flujo de Monetización: Stripe + n8n

### Arquitectura del paywall

```
Usuario → /subscribe → Bot genera Stripe Checkout Session
    ↓
Stripe procesa pago → Webhook a n8n
    ↓
n8n actualiza tabla de suscripciones (Google Sheets o Postgres)
    ↓
Bot genera link de invitación único al canal privado (1 uso, 48h expira)
    ↓
Usuario se une al canal → acceso desbloqueado
```

### Eventos de Stripe que n8n debe escuchar

| Evento | Acción en Telegram |
|--------|-------------------|
| `checkout.session.completed` | Generar invite link → enviar al usuario |
| `invoice.payment_succeeded` | Mantener acceso activo |
| `invoice.payment_failed` | Iniciar secuencia de dunning (3 días) |
| `customer.subscription.deleted` | `banChatMember` → `unbanChatMember` (para re-suscribirse) |
| `customer.subscription.updated` | Cambiar de tier si upgrade/downgrade |

### Detalle técnico n8n

```javascript
// Webhook de Stripe → n8n
// 1. Verificar firma del webhook
// 2. Switch por event.type
// 3. Para payment_succeeded:
//    - Buscar usuario por customer_id o chat_id
//    - Generar invite link único via Telegram API
//    - Enviar link al usuario
// 4. Para subscription_deleted:
//    - banChatMember canal_privado
//    - unbanChatMember (para poder re-join)
```

---

## 4. Funcionalidades Detalladas

### 4.1 Señales de Trading (Pro)

**Fuentes de datos:**
- TwelveData API (800 calls gratis/mes) — velas + indicadores
- TradingView webhook (para alertas propias)
- API de exchange directa (Binance, Bybit)

**Flujo de una señal:**
1. Usuario escribe `/signal BTCUSDT` o webhook de TradingView llega
2. n8n obtiene velas (1h, 15m, 5m) + calcula RSI, MACD, Bollinger
3. AI Agent analiza + genera señal estructurada
4. Señal formateada se envía al canal privado

**Formato de señal (estilo profesional):**
```
📊 BTCUSDT — LONG 3x
━━━━━━━━━━━━━━━━━━━
🎯 Entry: $98,200 - $98,420
🛑 Stop Loss: $96,800 (-1.6%)
✅ TP1: $100,500 (+2.3%) R:R 1:1.4
✅ TP2: $102,000 (+3.8%) R:R 1:2.4
✅ TP3: $104,500 (+6.3%) R:R 1:3.9
━━━━━━━━━━━━━━━━━━━
📈 RSI(14): 42 — Zona de compra
📊 Volumen: +35% vs promedio 20
🎯 Confluencia: Retroceso 61.8% Fib + Soporte mayor

⏰ 2026-09-05 14:30 UTC
⚠️ Risk: 1% de tu cuenta
```

### 4.2 AI Tutor (Free)

- System prompt entrenado con el `curriculum.json` completo
- Memoria por chat (Window Buffer Memory con session key = chat_id)
- Responde preguntas sobre cualquier módulo
- No da consejos de inversión — solo educación
- Puede explicar conceptos con ejemplos

### 4.3 Calculadora de Riesgo (Pro)

```
/risk 10000 1 500

Resultado:
📐 Cálculo de Posición
━━━━━━━━━━━━━━━━━━━
💰 Saldo: $10,000
🎯 Riesgo: 1% = $100
📏 Distancia SL: 500 pips
📊 Tamaño: 0.20 lotes
💵 Riesgo real: $100
✅ R:R 1:3 → Ganancia potencial: $300
```

### 4.4 Bitácora Automatizada (Pro)

- `/log BTCUSDT LONG 98300 96800 102000` → guarda en Google Sheets
- `/stats` → muestra:
  - Win Rate: 62%
  - Profit Factor: 1.8
  - Racha max de pérdidas: 3
  - Drawdown actual: 8.5%
  - Mejor par: BTCUSDT (68% WR)
  - Peor horario: 22:00-02:00 UTC

### 4.5 Gamificación (todas las lecciones del plan)

- **Racha diaria**: usuario completa 7 días seguidos → badge "🔥 7-Day Streak"
- **Módulos completados**: badge por módulo
- **Nivel**: 1-8 (un nivel por módulo)
- **Leaderboard**: ranking semanal de progreso
- Todo guardado en Google Sheets, sin app nueva

---

## 5. Arquitectura de Workflows en n8n

### Workflow 1: Bot Principal (Telegram Trigger)

```
Telegram Trigger → Switch Commands
├── /start → Send Welcome
├── /next → Send Lesson (lee curriculum.json)
├── /progress → Send Progress (lee Sheets)
├── /modules → Send Modules List
├── /help → Send Help
├── /signal → AI Agent (señal) → Send Signal
├── /analyze → AI Agent (análisis) → Send Analysis
├── /risk → Calculate Risk → Send Result
├── /log → Save to Sheets → Confirm
├── /stats → Read Sheets → Calculate → Send Stats
├── /news → HTTP Request (RSS) → AI Summary → Send
└── Default → AI Tutor → Send Reply
```

### Workflow 2: Goteo Automatizado (Schedule Trigger)

```
Schedule Trigger (diario 08:00 CR)
→ Read Sheets (usuarios activos)
→ Loop por usuario
→ Check: ¿ya recibió lección hoy?
→ Si NO: enviar siguiente lección
→ Update Sheets (fecha última lección)
```

### Workflow 3: Monitoreo de Mercado (Schedule Trigger)

```
Schedule Trigger (cada 5 min)
→ Watchlist de pares (Sheets)
→ Loop por par
→ HTTP Request (TwelveData API)
→ Code (calcular RSI, detectar señales)
→ IF (señal detectada)
→ AI Agent (analizar contexto)
→ Send Signal (canal privado)
```

### Workflow 4: Pagos Stripe (Webhook Trigger)

```
Stripe Webhook → Switch Event Type
├── checkout.session.completed → Grant Access
├── invoice.payment_succeeded → Maintain Access
├── invoice.payment_failed → Dunning Sequence
├── subscription.deleted → Revoke Access
└── subscription.updated → Change Tier
```

---

## 6. Stack Técnico

| Componente | Tecnología | Costo |
|-----------|-----------|-------|
| Bot Engine | n8n (Docker) | $7/mo (VPS) o gratis local |
| Túnel HTTPS | ngrok (dev) / Cloudflare Tunnel (prod) | $0 |
| Base de datos | Google Sheets (gratis) → Postgres (escalar) | $0-15/mo |
| AI | OpenAI GPT-4o-mini / DeepSeek | ~$0.001-0.05/señal |
| Datos mercado | TwelveData (800 gratis) → API directa exchange | $0-30/mo |
| Pagos | Stripe | 2.9% + $0.30 por transacción |
| Canal privado | Telegram Channel (gratis) | $0 |
| Landing page | S3 + CloudFront (ya lo tenés) | ~$1/mo |

**Costo total estimado: $7-50/mo** (dependiendo de volumen de usuarios y API calls)

---

## 7. Roadmap de Implementación

### Fase 1: MVP (1-2 semanas)
- [x] docker-compose.yml + n8n + ngrok
- [x] Bot con comandos básicos (/start, /next, /help)
- [x] AI Tutor con contexto del plan de estudios
- [ ] Google Sheets como base de datos
- [ ] Sistema de goteo automático

### Fase 2: Señales (2-3 semanas)
- [ ] Conectar TwelveData API
- [ ] Workflow de análisis técnico
- [ ] Canal privado de señales
- [ ] Formato de señal profesional

### Fase 3: Monetización (1-2 semanas)
- [ ] Integrar Stripe
- [ ] Paywall por tiers
- [ ] Sistema de invite links únicos
- [ ] Dunning automático

### Fase 4: Bitácora + Stats (1 semana)
- [ ] Comando /log para registrar trades
- [ ] Comando /stats con métricas
- [ ] Dashboard en Google Sheets

### Fase 5: Gamificación + Polish (1-2 semanas)
- [ ] Sistema de badges y niveles
- [ ] Leaderboard semanal
- [ ] Landing page de venta
- [ ] Onboarding de usuarios

---

## 8. Diferenciadores vs "un bot más"

1. **Educación primero**: el bot enseña ANTES de vender señales — genera confianza
2. **Track record público**: como MoneyBotOS y CoinCodeCap, publicar cada señal y resultado
3. **AI Tutor 24/7**: responde preguntas cuando vos dormís
4. **Todo integrado**: no necesitás 3 apps distintas para aprender, operar y medir
5. **Stack propio**: n8n = cero fees de plataforma (vs InviteMember 5%, Subly 4%)
6. **White-label listo**: el mismo backend sirve para revender a otros traders/influencers

---

## 9. Monetización Adicional

| Línea | Descripción | Precio |
|-------|-------------|--------|
| **White-label** | Revender el bot configurado con marca de otro trader | $500-1,500 setup + $100/mo |
| **Templates n8n** | Vender los workflows en Gumroad | $29-79 por template |
| **Curso premium** | Contenido exclusivo más allá de los 8 módulos | $99-199 |
| **Consultoría** | Setup personalizado para traders/influencers | $300-500 por hora |

---

## 10. Nota Legal

Las señales de trading pueden caer bajo regulación de valores según el país. Incluir disclaimer en cada señal:
> "⚠️ Esto no es asesoría financiera. Las señales son solo análisis técnico educativo. El trading involucra riesgo de pérdida. Invierte solo lo que puedas permitirte perder."

---

## Referencias

- [MoneyBotOS — modelo Free/Pro/Studio](https://moneybotos.com/pricing)
- [CoinCodeCap — track record verificado](https://signals.coincodecap.com/)
- [Botely — autotrade con Hyperliquid](https://botely.trade/)
- [n8n + Stripe paywall](https://community.n8n.io/t/299111)
- [ShipWorkflow — Stripe + Telegram guide](https://shipworkflow.com/blog/stripe-telegram-bot)
- [AI Trading Agent template n8n](https://n8n.io/workflows/10440)
- [Multi-agent trading analysis](https://n8n.io/workflows/8569)
- [Telegram signal extraction con Apify](https://community.n8n.io/t/307939)
