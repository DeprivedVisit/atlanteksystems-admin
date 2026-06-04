# Apex Cloud Works — Backend

> Node.js 20 + MySQL 8.0 + EC2 + Nginx + PM2 + SSL
> Migrado desde Loop-Landing.com

## Stack
- Runtime: Node.js 20 LTS
- Framework: Express.js 4.22
- DB: MySQL 8.0 (mysql2)
- Auth: bcryptjs + sessions
- Real-time: Socket.io
- Pagos: Stripe Checkout
- Email: Nodemailer
- PDF: PDFKit
- Notif: Telegram Bot
- Files: AWS S3
- Proxy: Nginx
- Process: PM2
- SSL: Let's Encrypt

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
