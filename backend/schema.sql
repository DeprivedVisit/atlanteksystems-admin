-- ══════════════════════════════════════════════════════════════
--  schema.sql — Apex Cloud Work MySQL Schema
--  Garett Barrantes Benavides · Cartago, Costa Rica
--  Migración desde: JSON files → MySQL 8.0
--  Ejecutar: mysql -u root -p apex_cloudworks < schema.sql
-- ══════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS apex_cloudworks
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE apex_cloudworks;

-- ── 1. USUARIOS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','client','viewer') NOT NULL DEFAULT 'client',
  company       VARCHAR(120),
  project_type  VARCHAR(80),
  phone         VARCHAR(30),
  avatar_url    VARCHAR(500),
  active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. LEADS / COTIZACIONES ──────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ext_id      VARCHAR(30) UNIQUE,           -- ej: LEAD-1718000000000
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(180) NOT NULL,
  whatsapp    VARCHAR(30),
  service     VARCHAR(80),
  budget      VARCHAR(50),
  deadline    VARCHAR(100),
  description TEXT,
  status      ENUM('Nuevo','Contactado','Propuesta enviada','En negociación','Ganado','Perdido')
              NOT NULL DEFAULT 'Nuevo',
  admin_notes TEXT,
  user_id     INT UNSIGNED NULL,            -- vinculado si se registra
  sheets_row  INT UNSIGNED NULL,            -- fila en Google Sheets (referencia)
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status     (status),
  INDEX idx_email      (email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 3. HISTORIAL DE ESTADOS DE LEAD ──────────────────────────
CREATE TABLE IF NOT EXISTS lead_estados (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id    INT UNSIGNED NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(180),
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  INDEX idx_lead_id (lead_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 4. TICKETS DE SOPORTE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ext_id     VARCHAR(30) UNIQUE,
  user_id    INT UNSIGNED NOT NULL,
  subject    VARCHAR(200) NOT NULL,
  status     ENUM('Abierto','En proceso','Cerrado') NOT NULL DEFAULT 'Abierto',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status  (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 5. MENSAJES DE TICKETS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_messages (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id     INT UNSIGNED NOT NULL,
  from_admin    TINYINT(1) NOT NULL DEFAULT 0,
  text          TEXT NOT NULL,
  seen_by_user  TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  INDEX idx_ticket_id (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 6. PAGOS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pagos (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ext_id         VARCHAR(30) UNIQUE,
  user_id        INT UNSIGNED NULL,
  lead_id        INT UNSIGNED NULL,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(180) NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  service        VARCHAR(120),
  method         ENUM('Stripe','Transferencia','Efectivo','SINPE','Otro') DEFAULT 'Otro',
  stripe_session VARCHAR(200),
  notes          TEXT,
  status         ENUM('Registrado','Confirmado','Reembolsado') DEFAULT 'Registrado',
  paid_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_paid_at (paid_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 7. CONTRATOS DIGITALES ───────────────────────────────────
CREATE TABLE IF NOT EXISTS contratos (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ext_id     VARCHAR(30) UNIQUE,
  lead_id    INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  ip         VARCHAR(60),
  signed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_lead_user (lead_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 8. SEGUIMIENTO DE HORAS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS horas (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ext_id      VARCHAR(30) UNIQUE,
  user_id     INT UNSIGNED NOT NULL,
  hours       DECIMAL(6,2) NOT NULL,
  description VARCHAR(500),
  work_date   DATE NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id  (user_id),
  INDEX idx_work_date(work_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 9. TESTIMONIOS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonios (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ext_id     VARCHAR(30) UNIQUE,
  user_id    INT UNSIGNED NOT NULL,
  rating     TINYINT(1) NOT NULL DEFAULT 5,
  text       TEXT NOT NULL,
  company    VARCHAR(120),
  approved   TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_approved (approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 10. BLOG POSTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ext_id     VARCHAR(30) UNIQUE,
  slug       VARCHAR(200) NOT NULL UNIQUE,
  title      VARCHAR(300) NOT NULL,
  excerpt    TEXT,
  content    LONGTEXT,
  tags_json  JSON,
  published  TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug      (slug),
  INDEX idx_published (published),
  INDEX idx_created_at(created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 11. NEWSLETTER SUSCRIPTORES ───────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subs (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(180) NOT NULL UNIQUE,
  name       VARCHAR(120),
  active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email  (email),
  INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 12. CHAT MESSAGES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_email    VARCHAR(180) NOT NULL,
  from_admin    TINYINT(1) NOT NULL DEFAULT 0,
  text          TEXT NOT NULL,
  read_by_admin TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_room_email (room_email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 13. PROPUESTA TEMPLATES ──────────────────────────────────
CREATE TABLE IF NOT EXISTS propuesta_templates (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ext_id     VARCHAR(30) UNIQUE,
  name       VARCHAR(120) NOT NULL,
  service    VARCHAR(80),
  budget     VARCHAR(80),
  deadline   VARCHAR(80),
  scope      TEXT,
  terms      TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 14. SESIONES (reemplaza session-file-store) ───────────────
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) NOT NULL PRIMARY KEY,
  expires    INT UNSIGNED NOT NULL,
  data       MEDIUMTEXT,
  INDEX idx_expires (expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 15. ESTADÍSTICAS GLOBALES ────────────────────────────────
CREATE TABLE IF NOT EXISTS stats (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  metric     VARCHAR(80) NOT NULL UNIQUE,
  value      BIGINT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO stats (metric, value) VALUES ('visits', 0);

-- ── 16. DISPOSITIVOS (Apex RMM — Fase 1) ─────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ext_id        VARCHAR(30) UNIQUE,
  name          VARCHAR(120) NOT NULL,
  hostname      VARCHAR(180),
  api_key       VARCHAR(64) NOT NULL UNIQUE,
  owner_user_id INT UNSIGNED NULL,
  status        ENUM('online','offline') NOT NULL DEFAULT 'offline',
  last_seen_at  DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_api_key (api_key),
  INDEX idx_status  (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 17. MÉTRICAS DE DISPOSITIVOS ──────────────────────────────
CREATE TABLE IF NOT EXISTS device_metrics (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  device_id    INT UNSIGNED NOT NULL,
  cpu_pct      DECIMAL(5,2) NOT NULL,
  disk_pct     DECIMAL(5,2) NOT NULL,
  uptime_s     BIGINT UNSIGNED NOT NULL,
  recorded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_device_recorded (device_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 18. ALERTAS DE DISPOSITIVOS ───────────────────────────────
CREATE TABLE IF NOT EXISTS device_alerts (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  device_id    INT UNSIGNED NOT NULL,
  type         ENUM('cpu','disk','offline') NOT NULL,
  threshold    DECIMAL(5,2),
  triggered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at  DATETIME NULL,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_device_id (device_id),
  INDEX idx_resolved  (resolved_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── VISTAS ÚTILES PARA ADMIN ─────────────────────────────────
CREATE OR REPLACE VIEW v_leads_resumen AS
SELECT
  l.id, l.ext_id, l.name, l.email, l.whatsapp,
  l.service, l.budget, l.status, l.created_at,
  u.name AS user_name,
  (SELECT COUNT(*) FROM contratos c WHERE c.lead_id = l.id) AS tiene_contrato,
  (SELECT SUM(p.amount) FROM pagos p WHERE p.lead_id = l.id) AS total_pagado
FROM leads l
LEFT JOIN users u ON u.id = l.user_id;

CREATE OR REPLACE VIEW v_ingresos_mensuales AS
SELECT
  DATE_FORMAT(paid_at, '%Y-%m') AS mes,
  COUNT(*) AS num_pagos,
  SUM(amount) AS total,
  method
FROM pagos
WHERE status = 'Confirmado'
GROUP BY mes, method
ORDER BY mes DESC;

CREATE OR REPLACE VIEW v_clientes_activos AS
SELECT
  u.id, u.name, u.email, u.company, u.project_type,
  u.created_at,
  (SELECT SUM(h.hours) FROM horas h WHERE h.user_id = u.id) AS total_horas,
  (SELECT SUM(p.amount) FROM pagos p WHERE p.user_id = u.id AND p.status = 'Confirmado') AS total_pagado,
  (SELECT COUNT(*) FROM tickets t WHERE t.user_id = u.id AND t.status != 'Cerrado') AS tickets_abiertos
FROM users u
WHERE u.role = 'client' AND u.active = 1;

SELECT 'Schema apex_cloudworks creado exitosamente.' AS resultado;
