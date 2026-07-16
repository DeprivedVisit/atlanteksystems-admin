// ══════════════════════════════════════════════════════════════
//  ecosystem.config.js — PM2 process manager
//  Apex Cloud Work.com · Garett Barrantes Benavides
//  Uso: pm2 start ecosystem.config.js --env production
//       pm2 save && pm2 startup
// ══════════════════════════════════════════════════════════════

module.exports = {
  apps: [
    {
      name:         'apex-cloudworks',
      script:       'app.js',
      cwd:          '/home/ubuntu/apex-cloudworks',
      instances:    1,           // 1 para t3.micro/t3.small; 'max' si tenés más cores
      exec_mode:    'fork',      // 'cluster' para múltiples instancias
      autorestart:  true,
      watch:        false,       // nunca en producción
      max_memory_restart: '400M',

      // Todas las variables reales viven en .env (dotenv las carga en app.js).
      // No duplicar secretos acá — un valor placeholder en env_production
      // pisaría el valor real de .env porque PM2 los inyecta antes de que
      // dotenv corra, y dotenv no sobreescribe variables ya presentes.
      env_production: {
        NODE_ENV: 'production',
      },

      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file:  '/var/log/apex-cloudworks/out.log',
      error_file:'/var/log/apex-cloudworks/error.log',
      merge_logs: true,
    }
  ]
};
