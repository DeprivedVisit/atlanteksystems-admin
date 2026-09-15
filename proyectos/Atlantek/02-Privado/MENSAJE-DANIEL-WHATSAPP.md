# 📲 Mensaje para Daniel (WhatsApp) — activar dominio

> Copiar y pegar directo. Guión para coordinar los 2 cambios que Daniel debe hacer en Cloudflare.

---

## 📋 CJ — dominio atlanteksystems.com

¡Hola Daniel! Con Garett de Atlantek :) El sitio ya está listo y funcionando, pero me falta un pasito tuyo para activar el dominio **atlanteksystems.com**. Son 5 minutos en Cloudflare:

1) Entrá a **dash.cloudflare.com** → seleccioná **atlanteksystems.com**
2) Andá a **DNS → Records**
3) Borrá el registro viejo de **www** (el que da error 530) y el de la raíz @ si existe
4) Creá un registro:
   - **Type:** CNAME
   - **Name:** @
   - **Target:** apexcloudworkscompany.github.io
   - **Proxy:** OFF (gris, no naranja)
5) Creá otro registro:
   - **Type:** CNAME
   - **Name:** www
   - **Target:** apexcloudworkscompany.github.io
   - **Proxy:** OFF (gris)

Avísame cuando lo tengas y yo activo el dominio desde GitHub + verifico que quede en línea. 🚀

---

## Nota para Garett

Enviar con el enlace de respaldo: `https://apexcloudworkscompany.github.io/atlanteksystems/` (ya está en vivo si Daniel quiere verlo antes de tocar nada).