# Skindoctors — Proyecto Sistema Completo

## Estado actual
- ✅ Landing **cbd-balance** completa (Espuma Limpiadora CBD Oil Balance)
- ✅ Landing **melasblock** completa (Melasblock BB Cream SPF 50)
- ✅ Apps Script backend para ambas (Google Sheets + Gmail)
- ✅ Desplegadas en S3 + CloudFront
- 🔴 **Pendiente: Cobro $450 USD** (vencido 6+ semanas)
- 🔴 **Pendiente: Cambiar WhatsApp a número del cliente** al firmar

## Configuración WhatsApp

**Número actual (Garett personal):** `+506 6314-4171` / `50663144171`

**Al firmar el contrato y cobrar $450:**
1. Pedir al cliente su número de WhatsApp Business
2. Ejecutar: `node update-wa.js <nuevo-numero>`
   - Ejemplo: `node update-wa.js 50688887777`
3. Commit + push
4. Deploy a S3 + invalidar CloudFront

## Archivos a actualizar automáticamente con `update-wa.js`:
- `cbd-balance/index.html` — múltiples referencias
- `cbd-balance/assets/js/script.js` — si hay referencias
- `melasblock/Melasblock bb/index.html` — múltiples referencias
- `melasblock/Melasblock bb/assets/js/script.js` — si hay referencias
- Apps Script files (`.gs`) — notificaciones por email

## Deploy

### cbd-balance
- S3 bucket: `skindoctors-cr-landings` (us-east-2)
- CloudFront: `E31U5V9IA0JXSZ` → `d3suiaystvdco4.cloudfront.net`
- Path: `/cbd-balance/`

### melasblock
- S3 bucket: `skindoctors-cr-landings` (us-east-2)
- CloudFront: mismo distribution
- Path: `/melasblock/`

### Deploy manual (aws s3 cp explícito - NO sync):
```bash
# cbd-balance
aws s3 cp cbd-balance/index.html s3://skindoctors-cr-landings/cbd-balance/index.html
aws s3 cp cbd-balance/assets/ s3://skindoctors-cr-landings/cbd-balance/assets/ --recursive
aws s3 cp cbd-balance/Espuma-Facial-CBD.png s3://skindoctors-cr-landings/cbd-balance/Espuma-Facial-CBD.png
aws s3 cp cbd-balance/robots.txt s3://skindoctors-cr-landings/cbd-balance/robots.txt
aws s3 cp cbd-balance/sitemap.xml s3://skindoctors-cr-landings/cbd-balance/sitemap.xml
aws s3 cp cbd-balance/apps-script.gs s3://skindoctors-cr-landings/cbd-balance/apps-script.gs
aws s3 cp cbd-balance/Legal/ s3://skindoctors-cr-landings/cbd-balance/Legal/ --recursive
aws s3 cp cbd-balance/brand-book.html s3://skindoctors-cr-landings/cbd-balance/brand-book.html
aws s3 cp cbd-balance/google-sheets-setup.html s3://skindoctors-cr-landings/cbd-balance/google-sheets-setup.html

# melasblock
aws s3 cp melasblock/Melasblock\ bb/index.html s3://skindoctors-cr-landings/melasblock/index.html
aws s3 cp melasblock/Melasblock\ bb/assets/ s3://skindoctors-cr-landings/melasblock/assets/ --recursive
aws s3 cp melasblock/Melasblock\ bb/melasblock.png s3://skindoctors-cr-landings/melasblock/melasblock.png
aws s3 cp melasblock/Melasblock\ bb/logo.svg s3://skindoctors-cr-landings/melasblock/logo.svg
aws s3 cp melasblock/Melasblock\ bb/logo-dark.svg s3://skindoctors-cr-landings/melasblock/logo-dark.svg
aws s3 cp melasblock/Melasblock\ bb/apps-script.gs s3://skindoctors-cr-landings/melasblock/apps-script.gs
aws s3 cp melasblock/Melasblock\ bb/brand-book.html s3://skindoctors-cr-landings/melasblock/brand-book.html
aws s3 cp melasblock/Melasblock\ bb/google-sheets-setup.html s3://skindoctors-cr-landings/melasblock/google-sheets-setup.html
aws s3 cp melasblock/Melasblock\ bb/tipos.html s3://skindoctors-cr-landings/melasblock/tipos.html
aws s3 cp melasblock/Melasblock\ bb/Legal/ s3://skindoctors-cr-landings/melasblock/Legal/ --recursive

# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id E31U5V9IA0JXSZ --paths "/cbd-balance/*" "/melasblock/*"
```

## Apps Script URLs (configurar en script.js de cada landing)
- cbd-balance: `https://script.google.com/macros/s/AKfycbx1qqd3Z4-zmPxfCIAeRla493IrROxV_soAqMTyHOj139mewQ1d17QM2zdgRNesqu2n/exec`
- melasblock: Requiere configurar `SHEET_ID` en `apps-script.gs` y redeploy

## Contactos
- Cliente: Skindoctors CR (Andrés abrió la cuenta)
- Andrés: definir comisión ANTES del primer cobro
- WhatsApp actual: +506 6314-4171 (Garett) → cambiar al firmar

## Próximos pasos
1. [ ] Agendar reunión con Skindoctors → presentar `entrega-cliente/presentacion/index.html`
2. [ ] Hablar comisión con Andrés **antes** del cobro
3. [ ] Firma + cobro $450 USD
4. [ ] Cambiar WA al número oficial del cliente
5. [ ] Deploy con nuevo WA