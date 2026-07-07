# Flujo de Proyecto — 8 Pasos

> Proceso estándar Apex Cloud Works. No saltarse pasos.

---

## Paso 1 — BRIEF

- Reunión o WA con cliente
- Llenar formulario de brief: nombre, rubro, colores, referencias
- Confirmar paleta y fuentes según rubro

## Paso 2 — PALETA Y FUENTES

| Rubro | Primario | Acento | Fuentes |
|-------|---------|--------|---------|
| Alimentos | `#1b4332` | `#f4a261` | Syne + DM Sans |
| Naturaleza | `#2d6a4f` | `#b5838d` | Playfair + Lato |
| Skincare | `#fafafa` | `#c8954a` | Cormorant + DM Mono |
| Licores | `#0a0a0f` | `#f0c040` | Syne + JetBrains |
| Autos | `#1a1a2e` | `#e05a5a` | Syne + DM Mono |
| Arquitectura | `#0f0e0c` | `#b85c38` | Cormorant + DM Mono |

## Paso 3 — SECCIONES

- Definir arquitectura del sitio (qué secciones lleva)
- Confirmar con cliente antes de construir

## Paso 4 — HTML/CSS/JS

- Mobile-first siempre
- Incluir: WA flotante + form con webhook + footer Apex
- Test en móvil antes de mandar preview

**Footer obligatorio:**
```
Desarrollado por Apex Cloud Works — Cartago, CR
```

## Paso 5 — S3 PREVIEW

```bash
aws s3 sync ./[carpeta] s3://[bucket] --delete
```
- Compartir URL de preview por WA al cliente

## Paso 6 — REVISIÓN 1

- Cliente da feedback
- Máx 48h para implementar cambios

## Paso 7 — REVISIÓN 2 (ÚLTIMA)

- Segunda ronda de ajustes
- Si pide más → cobrar $50 USD/revisión extra

## Paso 8 — DEPLOY Y ENTREGA

```bash
# CloudFront invalidation
aws cloudfront create-invalidation \
  --distribution-id [ID] \
  --paths "/*"
```

- Configurar Route 53 si hay dominio propio
- Entregar credenciales
- Onboarding 30 min por WA

---

## Reglas no negociables

- Max 2 revisiones incluidas
- WA flotante en toda landing
- Mobile-first — si no pasa en iPhone SE, no está listo
- Fuentes: solo Google Fonts (free)
- Sin Inter/Roboto/Arial — fuentes genéricas prohibidas
