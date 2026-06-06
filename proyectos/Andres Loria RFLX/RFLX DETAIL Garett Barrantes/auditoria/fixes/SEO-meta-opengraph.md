# Fix: SEO-01 y SEO-02 — Meta Description y Open Graph

## Agregar en `index.html` dentro del `<head>`, después del `<title>`:

```html
<!-- SEO básico -->
<meta name="description" content="Auto detail premium a domicilio en Costa Rica. Andrés Loría · RFLX Detail. Lavado, detallado interior y exterior, corrección de vidrios, restauración de focos y más. Agendá tu cita en línea.">
<meta name="keywords" content="auto detail, car detailing, Costa Rica, a domicilio, lavado de carros, detallado interior, cerámico, RFLX">
<meta name="author" content="Andrés Loría · RFLX Detail">

<!-- Open Graph (WhatsApp, Facebook, Instagram) -->
<meta property="og:type" content="website">
<meta property="og:locale" content="es_CR">
<meta property="og:title" content="RFLX Detail · Auto Detail Premium a Domicilio · Costa Rica">
<meta property="og:description" content="Detail que refleja excelencia. Lavado, detallado, corrección de vidrios y más. A domicilio en Costa Rica. Agendá tu cita en línea.">
<meta property="og:image" content="https://tudominio.com/og-rflx.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://tudominio.com">
<meta property="og:site_name" content="RFLX Detail">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="RFLX Detail · Auto Detail Premium CR">
<meta name="twitter:description" content="Auto detail a domicilio en Costa Rica. Agendá tu cita en línea.">
<meta name="twitter:image" content="https://tudominio.com/og-rflx.jpg">
```

> **Nota:** Reemplazá `https://tudominio.com` con el dominio real.  
> Para `og:image` se recomienda una imagen de **1200×630px** que muestre un resultado de detail de un carro con el logo RFLX.

---

## Fix: SEO-03 — Cambiar `<p>` a `<h1>` en el hero

En `index.html:191`, cambiar:
```html
<!-- ANTES -->
<p class="hero-tagline">"Detail that reflects excellence"</p>

<!-- DESPUÉS -->
<h1 class="hero-tagline">"Detail that reflects excellence"</h1>
```

No requiere cambios en CSS (la clase ya tiene los estilos correctos).

---

## Fix: SEO-04 — Schema.org LocalBusiness

Agregar antes de `</body>` en `index.html`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "RFLX Detail",
  "description": "Auto detail premium a domicilio en Costa Rica. Técnico certificado.",
  "url": "https://tudominio.com",
  "telephone": "+50670352618",
  "email": "reflexdetail323@gmail.com",
  "priceRange": "₡8.000 – ₡35.000",
  "currenciesAccepted": "CRC",
  "paymentAccepted": "Cash, SINPE Móvil",
  "areaServed": {
    "@type": "Country",
    "name": "Costa Rica"
  },
  "sameAs": [
    "https://www.instagram.com/rflxdetail/"
  ],
  "founder": {
    "@type": "Person",
    "name": "Andrés Loría"
  }
}
</script>
```
