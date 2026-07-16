# Apex Cloud Work — Backend

> Node.js 20 + MySQL 8.0 + EC2 + Nginx + PM2 + SSL

## Stack

**Instalado (ver `package.json`):**
- Runtime: Node.js 20 LTS
- Framework: Express.js 4.22
- DB: MySQL 8.0 (mysql2)
- Auth: bcryptjs + express-session (express-mysql-session)
- CORS: cors
- Config: dotenv
- Proxy: Nginx
- Process: PM2
- SSL: Let's Encrypt

**Planeado, NO instalado todavía** (no confundir con capacidad real — agregar la dependencia antes de asumir que existe):
- Real-time: Socket.io
- Pagos: Stripe Checkout
- Email: Nodemailer
- PDF: PDFKit
- Notif: Telegram Bot
- Files: AWS S3 (usar IAM Role cuando se agregue, no keys)

## Deploy en EC2
```bash
chmod +x deploy-ec2.sh
sudo ./deploy-ec2.sh
```

## Schema MySQL
```bash
mysql -u apex_user -p apex_cloudworks < schema.sql
```

## Variables de entorno
```bash
cp .env.example .env
# Editar con tus valores reales
```

## Tablas principales
- users, leads, tickets, pagos, contratos
- horas, testimonios, blog_posts
- newsletter_subs, chat_messages, sessions
