---
name: apex-landing
description: >
  Skill personalizada de Apex Cloud Work para construir landing pages de alta conversión
  para clientes en Costa Rica. Usar SIEMPRE que Garett pida construir, editar o auditar
  una landing page para un cliente. Incluye el proceso de 8 pasos, paleta por rubro,
  reglas de diseño, estructura de deploy en AWS S3 + Route 53, y las reglas de negocio
  de Apex Cloud Work. Activar también cuando se mencionen clientes como Skindoctors,
  EcoPollo, VisionaryFilm, RFLX, Arte Verde, Barbería o Salón de Belleza.
---

# Apex Landing — Skill de Garett Barrantes · Apex Cloud Work

## Identidad del desarrollador
- **Empresa:** Apex Cloud Work · apexcloudworkscompany@gmail.com
- **WhatsApp:** +506 6314-4171
- **Deploy:** AWS S3 + Route 53 + HTTPS (ACM)
- **Stack:** HTML/CSS/JS puro — un solo archivo por landing

---

## Proceso estándar — 8 pasos

1. **Brief** — datos del cliente, colores, fuentes, productos, contacto
2. **Paleta + tipografía** — elegir según rubro (ver tabla abajo)
3. **Definir secciones** — Hero siempre, el resto según el cliente
4. **Construir** — HTML/CSS/JS puro, un solo archivo
5. **Preview** — subir a S3 público, enviar link al cliente
6. **Revisiones** — máximo 2 rondas incluidas
7. **Deploy final** — S3 + Route 53 + HTTPS
8. **Entrega** — footer con créditos, instrucciones al cliente

---

## Reglas de diseño — NUNCA ignorar

- ✅ Footer siempre: `Desarrollado por Apex Cloud Work — Cartago, CR`
- ✅ Botón WhatsApp flotante en todas las páginas
- ✅ Responsive mobile-first — diseñar para celular primero
- ✅ CTA principal visible above the fold
- ✅ Fuentes de Google Fonts — gratuitas
- ❌ Sin Inter, Roboto, Arial — fuentes genéricas prohibidas
- ❌ Sin gradientes morados — estética AI genérica prohibida
- ❌ Sin layouts centered uniformes y aburridos

---

## Paleta por rubro

| Rubro | Primario | Acento | Display | Cuerpo |
|-------|---------|--------|---------|--------|
| Alimentos / Avícola | #1b4332 | #f4a261 | Syne | DM Sans |
| Naturaleza / Vivero | #2d6a4f | #b5838d | Playfair Display | Lato |
| Salud / Skincare | #fafafa | #c8954a | Cormorant Garamond | DM Mono |
| Licores / Noche | #0a0a0f | #f0c040 | Syne | JetBrains Mono |
| Autos / Servicios | #1a1a2e | #e05a5a | Syne | DM Mono |
| Arquitectura | #0f0e0c | #b85c38 | Cormorant Garamond | DM Mono |
| Belleza / Estética | #f9f5ef | #c8954a | Playfair Display | Lato |
| Tecnología / Digital | #060402 | #c4956a | Unbounded | JetBrains Mono |
| Deportes / Fitness | #0d1117 | #f0c040 | Syne | DM Sans |

---

## Secciones disponibles

| Sección | Cuándo incluirla |
|---------|-----------------|
| 🔝 Hero + CTA | SIEMPRE |
| ✅ Propuesta de valor | Si tiene diferenciadores claros |
| 🛍️ Productos / Servicios | Si tiene catálogo |
| ⭐ Testimonios | Solo reales — nunca inventar |
| 📸 Galería | Si tiene fotos del producto/local |
| 📍 Mapa + ubicación | Si tiene local físico |
| 💰 Precios | Si el cliente quiere mostrarlos |
| ❓ FAQ | Si hay preguntas frecuentes reales |
| 📞 Contacto + WhatsApp | SIEMPRE — última sección |

---

## Variables CSS base

```css
:root {
  --bg: [color fondo];
  --surface: [color cards];
  --border: [color bordes];
  --accent: [color primario];
  --accent2: [color secundario];
  --text: [color texto];
  --muted: [color texto secundario];
}
```

---

## Botón WhatsApp flotante

```css
.whatsapp-float {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: #25d366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(37,211,102,0.4);
  z-index: 999;
  transition: transform 0.2s;
}
.whatsapp-float:hover { transform: scale(1.1); }
```

---

## Modelo de negocio

- Skindoctors: 3 × $150 = $450 USD · pago único
- General: Setup $350 USD + trimestral $900 USD
- Moneda: USD siempre
- Revisiones: 2 incluidas · adicionales $25/hora