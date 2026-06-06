#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# PASO 3 — Setup frontend + deploy a Vercel
# Ejecutar: bash 03_deploy_frontend.sh
# ─────────────────────────────────────────────────────────────────

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GARETT RPG SYNC — Frontend + Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd ../frontend

# 1. Crear estructura del proyecto
echo ""
echo "▶ Creando estructura del proyecto..."
mkdir -p src public

# index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
  <meta name="theme-color" content="#030712"/>
  <meta name="apple-mobile-web-app-capable" content="yes"/>
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
  <meta name="apple-mobile-web-app-title" content="GarRPG"/>
  <link rel="apple-touch-icon" href="/icon-192.png"/>
  <title>Garett RPG</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
EOF

# main.jsx
cat > src/main.jsx << 'EOF'
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
createRoot(document.getElementById("root")).render(<App/>);
EOF

# Copy app files
cp garett-rpg.jsx src/App.jsx 2>/dev/null || echo "⚠️  Copia garett-rpg.jsx a src/App.jsx manualmente"
cp api.js src/api.js 2>/dev/null

echo "✅ Estructura creada"

# 2. Instalar dependencias
echo ""
echo "▶ Instalando dependencias..."
npm install --silent
echo "✅ Dependencias instaladas"

# 3. Build
echo ""
echo "▶ Construyendo proyecto..."
npm run build
echo "✅ Build listo en /dist"

# 4. Instalar Vercel CLI si no está
if ! command -v vercel &> /dev/null; then
  echo ""
  echo "▶ Instalando Vercel CLI..."
  npm install -g vercel --silent
fi

# 5. Deploy a Vercel
echo ""
echo "▶ Deployando a Vercel..."
echo "   (Se abrirá el login de Vercel si es la primera vez)"
vercel --prod --yes

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ PASO 3 COMPLETADO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Tu app está live en Vercel 🚀"
echo "  Copia la URL y agrégala en:"
echo "  → jarvis/jarvis_v2.py: API_URL = 'tu-url'"
echo "  → iPhone Atajos: abre la URL al desactivar alarma"
echo ""
echo "  ▶ Siguiente: bash 04_connect_jarvis.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
