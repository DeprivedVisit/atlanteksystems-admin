# Tracking Pixels — Addon para apex-landing

> Agregar a `.claude/skills/apex-landing/` como `reference/tracking.md`
> Referenciar desde el SKILL.md principal de apex-landing: "Ver reference/tracking.md para pixels"

## Por qué

Cada landing sale lista para que el cliente corra sus propios ads (Meta/Google) y vea conversiones reales desde el día 1. Esto es un diferenciador vendible: "tu landing viene con tracking instalado de fábrica".

## Snippets — pegar antes de `</head>`

### Meta Pixel (Facebook/Instagram Ads)
```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'PIXEL_ID_AQUI');
fbq('track', 'PageView');
</script>
<!-- End Meta Pixel Code -->
```

### Google tag (GA4 + Google Ads)
```html
<!-- Google tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>
```

## Eventos de conversión — en cada CTA (botón WhatsApp)

```html
<a href="https://wa.me/506XXXXXXXX" onclick="
  fbq('track', 'Lead');
  gtag('event', 'conversion', {'send_to': 'AW-XXXXXXX/XXXXXXXX'});
">
  Escribinos por WhatsApp
</a>
```

## Checklist por landing

```
[ ] Pixel ID del cliente (pedirlo en el brief — apex-client-brief)
[ ] GA4 Measurement ID
[ ] Evento 'Lead' en click de WhatsApp
[ ] Evento 'PageView' automático
[ ] Probar con Meta Pixel Helper (extensión Chrome) antes de entregar
```

## Dónde conseguir los IDs

- **Meta Pixel**: business.facebook.com → Events Manager → Pixels → crear/copiar ID
- **GA4**: analytics.google.com → Admin → Data Streams → Measurement ID (G-XXXXXXX)

## Upsell — conectar con ad-creative

Una vez el pixel está instalado, el cliente (o Apex como servicio adicional) puede correr campañas. El skill `ad-creative` genera headlines/copy para esas campañas — útil para el upsell de mantenimiento mensual.

## Nota legal/privacidad

Si el cliente usa pixels, agregar mención en el footer o sección de privacidad: "Este sitio usa cookies de análisis y publicidad de Meta y Google." — cumplimiento básico, no es asesoría legal.
