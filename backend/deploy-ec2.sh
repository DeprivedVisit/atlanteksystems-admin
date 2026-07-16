#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  deploy-ec2.sh — Apex Cloud Work
#  Garett Barrantes Benavides · Cartago, Costa Rica
#  Ejecutar UNA SOLA VEZ en EC2 Ubuntu 22.04 LTS
#  Uso: chmod +x deploy-ec2.sh && sudo ./deploy-ec2.sh
# ══════════════════════════════════════════════════════════════
set -e
echo "🚀 Iniciando deploy de Apex Cloud Work en EC2..."

# ── Variables — CAMBIAR ANTES DE EJECUTAR ────────────────────
DOMAIN="api.apexcloudworkcompany.com"
DB_NAME="apex_cloudworks"
DB_USER="apex_user"
DB_PASS="$(openssl rand -base64 32)"  # Genera password seguro
APP_DIR="/home/ubuntu/apex-cloudworks"

echo "📦 Actualizando sistema..."
apt-get update -qq && apt-get upgrade -y -qq

# ── Node.js 20 LTS ───────────────────────────────────────────
echo "📦 Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs -qq
node -v && npm -v

# ── PM2 ──────────────────────────────────────────────────────
echo "📦 Instalando PM2..."
npm install -g pm2 -q

# ── Nginx ────────────────────────────────────────────────────
echo "📦 Instalando Nginx..."
apt-get install -y nginx -qq
systemctl enable nginx

# ── MySQL 8.0 ────────────────────────────────────────────────
echo "📦 Instalando MySQL 8.0..."
apt-get install -y mysql-server -qq
systemctl enable mysql
systemctl start mysql

echo "🔒 Configurando MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo "✅ MySQL configurado. DB_PASS generado: $DB_PASS"
echo "   ⚠️  Guardá este password en tu .env ahora mismo"

# ── Certbot SSL ───────────────────────────────────────────────
echo "📦 Instalando Certbot..."
apt-get install -y certbot python3-certbot-nginx -qq

# ── Directorios ───────────────────────────────────────────────
mkdir -p /var/log/apex-cloudworks
mkdir -p /var/www/certbot

# ── Clonar/subir proyecto ─────────────────────────────────────
echo ""
echo "─────────────────────────────────────────────"
echo "PRÓXIMOS PASOS MANUALES:"
echo "─────────────────────────────────────────────"
echo "1. Subir el proyecto a $APP_DIR (desde tu máquina, dentro de backend/):"
echo "   scp -r ./ ubuntu@TU_IP:$APP_DIR"
echo "   scp tu-google-service-account.json ubuntu@TU_IP:$APP_DIR/"
echo ""
echo "2. Instalar dependencias (ya están todas en package.json):"
echo "   cd $APP_DIR && npm install"
echo ""
echo "3. Crear .env real en el servidor (subilo directo, NUNCA por git):"
echo "   scp .env ubuntu@TU_IP:$APP_DIR/.env"
echo "   DB_PASS generado hoy: $DB_PASS  ← usar este valor en DB_PASS del .env"
echo ""
echo "4. Crear schema MySQL:"
echo "   mysql -u $DB_USER -p$DB_PASS $DB_NAME < schema.sql"
echo ""
echo "5. Configurar Nginx:"
echo "   cp nginx.conf /etc/nginx/sites-available/apex-cloudworks"
echo "   ln -s /etc/nginx/sites-available/apex-cloudworks /etc/nginx/sites-enabled/"
echo "   nginx -t && systemctl reload nginx"
echo ""
echo "6. SSL con Certbot:"
echo "   certbot --nginx -d $DOMAIN"
echo ""
echo "7. Iniciar con PM2:"
echo "   pm2 start ecosystem.config.js --env production"
echo "   pm2 save && pm2 startup"
echo ""
echo "✅ Servidor base listo. Seguí los pasos manuales arriba."
