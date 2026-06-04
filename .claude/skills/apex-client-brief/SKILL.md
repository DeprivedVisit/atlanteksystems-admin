---
name: apex-client-brief
description: >
  Skill para recopilar y organizar el brief de un cliente nuevo de Apex Cloud Works.
  Activar cuando Garett mencione un cliente nuevo, quiera arrancar un proyecto,
  o diga "vamos a arrancar con [cliente]". Genera las preguntas correctas y organiza
  la información en el formato estándar de Apex.
---

# Apex Client Brief

## Información requerida

### Básico (obligatorio)
- Nombre del negocio
- Rubro / industria
- Tagline (5–8 palabras)
- Descripción (2–3 oraciones)
- Ubicación · Horario

### Contacto (obligatorio)
- WhatsApp (+506 XXXX-XXXX)
- Email · Instagram · Facebook

### Visual
- ¿Tienen logo? → PNG fondo transparente
- ¿Tienen colores? → hex codes
- Referencias visuales (sitios que les gusten)

### Productos o servicios
- Top 3 con precio
- Foto de cada uno
- ¿Qué los diferencia?

### CTA
- ¿Qué querés que haga el usuario? (WhatsApp, llamar, ver catálogo)
- Mensaje predefinido para WhatsApp

### Técnico
- ¿Tienen dominio? → cuál
- ¿Quieren dominio nuevo?

---

## Output — objeto cliente

```javascript
const CLIENT_DATA = {
  nombre: "",
  tagline: "",
  descripcion: "",
  ubicacion: "",
  horario: "",
  whatsapp: "+506XXXXXXXXX",
  whatsappMsg: "",
  instagram: "",
  facebook: "",
  email: "",
  dominio: "",
  colores: { primario: "", secundario: "", fondo: "", texto: "" },
  fuentes: { display: "", cuerpo: "" },
  productos: [{ nombre: "", precio: "", descripcion: "" }],
  secciones: []
}
```