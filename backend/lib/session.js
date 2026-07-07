'use strict';
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  createDatabaseTable: false, // la tabla `sessions` ya existe en schema.sql
  expiration: 8 * 60 * 60 * 1000,
  checkExpirationInterval: 15 * 60 * 1000,
});

module.exports = session({
  name: 'apex_sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SECURE === 'true' ? 'none' : 'lax',
    maxAge: 8 * 60 * 60 * 1000,
  },
});
