# Flujos Apex — Diagramas Visuales

> Abrí en modo Reading (`Ctrl + E`) para ver los diagramas renderizados.

---

## 1. Flujo completo de un proyecto

```mermaid
flowchart TD
    A([Cliente nuevo]) --> B[Brief por WA]
    B --> C[Paleta + fuentes por rubro]
    C --> D[Definir secciones del sitio]
    D --> E[Cobrar 50% adelantado]
    E --> F[Build HTML/CSS/JS\nMobile-first · WA flotante · Footer Apex]
    F --> G[Preview en S3]
    G --> H{Revisión 1}
    H -->|Cambios| I[Implementar feedback\nmáx 48h]
    I --> J{Revisión 2\nÚLTIMA}
    J -->|Cambios| K[Implementar\ncambios finales]
    K --> L[Cobrar 50% restante]
    J -->|Aprobado| L
    L --> M[Deploy CloudFront\nRoute 53 si hay dominio]
    M --> N[Entregar credenciales]
    N --> O([Onboarding 30 min por WA])

    style A fill:#1b4332,color:#fff
    style O fill:#1b4332,color:#fff
    style E fill:#c8954a,color:#fff
    style L fill:#c8954a,color:#fff
```

---

## 2. Pipeline de proyectos actuales

```mermaid
flowchart LR
    subgraph ACTIVO
        A[🔥 EcoPollo\nCotizador 5 pasos]
    end

    subgraph PENDIENTE
        B[⏳ Skindoctors\n$450 USD · firma + cobro]
        C[⏳ VisionaryFilm\nEsperando datos Fabian]
    end

    subgraph CARTERA
        D[🗂️ RFLX\nAndrés]
        E[🗂️ Arte Verde\nTía Estefany]
    end

    ACTIVO --> PENDIENTE --> CARTERA

    style A fill:#1b4332,color:#fff
    style B fill:#c8954a,color:#fff
    style C fill:#c8954a,color:#fff
```

---

## 3. Flujo de cobro

```mermaid
flowchart TD
    A([Trato cerrado]) --> B[Facturar 50%\nadelantado]
    B --> C{¿Pagó?}
    C -->|No| D[No se arranca\nhasta cobrar]
    C -->|Sí| E[Arrancar build]
    E --> F[Preview aprobado]
    F --> G[Facturar 50%\nrestante]
    G --> H{¿Pagó?}
    H -->|No| I[No se hace deploy\nhasta cobrar]
    H -->|Sí| J([Deploy + entrega])

    style A fill:#1b4332,color:#fff
    style J fill:#1b4332,color:#fff
    style D fill:#e05a5a,color:#fff
    style I fill:#e05a5a,color:#fff
    style B fill:#c8954a,color:#fff
    style G fill:#c8954a,color:#fff
```

---

## 4. Flujo de leads (N8N)

```mermaid
flowchart LR
    A([Visitante llena form]) --> B[N8N Webhook]
    B --> C[Google Sheets\nregistro del lead]
    B --> D[Gmail\nnotificación a Garett]
    D --> E{Garett responde\npor WA}
    E --> F([Lead calificado])

    subgraph FUTURO
        B --> G[WhatsApp API\nautomático]
    end

    style A fill:#1b4332,color:#fff
    style F fill:#1b4332,color:#fff
    style G fill:#333,color:#aaa
```

---

## 5. Rutina diaria — Madrugada v6.0

```mermaid
flowchart TD
    A([23:00 Arrancar sesión]) --> B[🔥 PROYECTO Bloque 1 · 2h]
    B --> C[01:00 ☕ Pausa]
    C --> D[01:30 🔥 PROYECTO Bloque 2 · 2h]
    D --> E[03:30 📚 JS/React video]
    E --> F[04:30 🔥 PROYECTO Bloque 3 · 90min]
    F --> G[06:00 🏋️ Codewars · 1 kata]
    G --> H[06:30 📋 Balance del día]
    H --> I([07:00 😴 Dormir])
    I --> J([15:00 🌅 Despertar · noticias EN])
    J --> K[15:30 ☕ Ritual]
    K --> L[16:00 🌐 Open English]
    L --> M[17:00 📡 Netacad JS]
    M --> N[18:00 🍽️ Comida]
    N --> O[18:30 🚴 Bici · Mar·Jue·Sáb]
    O --> P[19:00 🎓 Viteck · Mar·Mié]
    P --> Q[21:00 🔥 PROYECTO Bloque 4 · 2h]
    Q --> R([23:00 🔁 Repetir])

    style B fill:#1b4332,color:#fff
    style D fill:#1b4332,color:#fff
    style F fill:#1b4332,color:#fff
    style Q fill:#1b4332,color:#fff
    style I fill:#0a0a0f,color:#fff
    style R fill:#0a0a0f,color:#fff
```

---

## 6. Flujo semanal (domingo)

```mermaid
flowchart TD
    A([Domingo 23:30 Balance]) --> B[¿Qué cerré esta semana?]
    B --> C[¿Qué quedó pendiente?]
    C --> D[¿Qué imprevistos hubo?]
    D --> E[Actualizar Semana Actual.md]
    E --> F[Actualizar Log/2026-XX.md]
    F --> G[Plan bloques semana siguiente]
    G --> H([Lunes 08:00 arrancar])

    style A fill:#1b4332,color:#fff
    style H fill:#1b4332,color:#fff
```

---

## 7. Roadmap Apex

```mermaid
timeline
    title Apex Cloud Works — Roadmap
    2026 : Skindoctors cerrado
         : EcoPollo entregado
         : Primeros $$ recurrentes
    2027 : React dominado
         : $800–2000 por proyecto
         : Jarvis Fase 2
    2028 : Primeros colaboradores
    2030 : Empresa automatizada
    2033 : CEO desde Cartago 🇨🇷
```
