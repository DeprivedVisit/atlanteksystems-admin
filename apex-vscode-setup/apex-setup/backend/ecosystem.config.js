// ══════════════════════════════════════════════════════════════
//  ecosystem.config.js — PM2 process manager
//  Apex Cloud Works.com · Garett Barrantes Benavides
//  Uso: pm2 start ecosystem.config.js --env production
//       pm2 save && pm2 startup
// ══════════════════════════════════════════════════════════════

module.exports = {
  apps: [
    {
      name:         'apex-cloudworks',
      script:       'server.js',
      cwd:          '/home/ec2-user/apex-cloudworks',
      instances:    1,           // 1 para t3.small; 'max' si tenés más cores
      exec_mode:    'fork',      // 'cluster' para múltiples instancias
      autorestart:  true,
      watch:        false,       // nunca en producción
      max_memory_restart: '400M',

      // Variables de entorno producción
      env_production: {
        NODE_ENV:          'production',
        PORT:              3000,
        // DB — usar variables reales en EC2 /etc/environment
        DB_HOST:           'REEMPLAZAR_CON_TU_RDS_ENDPOINT',
        DB_PORT:           3306,
        DB_USER:           'apex_user',
        DB_PASS:           'REEMPLAZAR_CON_TU_PASSWORD',
        DB_NAME:           'apex_cloudworks',
        // Session
        SESSION_SECRET:    'REEMPLAZAR_CON_SECRET_LARGO',
        // Google Sheets
        GOOGLE_CREDENTIALS:'',    // JSON como string o usar keyFile
        // Email
        MAIL_USER:         'garettjohan12@gmail.com',
        MAIL_PASS:         'REEMPLAZAR_CON_APP_PASSWORD',
        // Stripe
        STRIPE_SECRET:     'sk_live_REEMPLAZAR',
        // Telegram
        TELEGRAM_TOKEN:    'REEMPLAZAR',
        TELEGRAM_CHAT_ID:  'REEMPLAZAR',
        // VAPID Push
        VAPID_PUBLIC:      'REEMPLAZAR',
        VAPID_PRIVATE:     'REEMPLAZAR',
        // AWS S3
        AWS_REGION:        'us-east-1',
        AWS_BUCKET:        'apex-cloudworks-uploads',
      },

      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file:  '/var/log/apex-cloudworks/out.log',
      error_file:'/var/log/apex-cloudworks/error.log',
      merge_logs: true,
    }
  ]
};
