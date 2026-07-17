// Resuelve la URL del backend según el entorno — un solo lugar para admin.html y portal/*.
// TODO: reemplazar 'https://api.apexcloudworkscompany.com' por la URL real una vez
// que el backend (backend/) esté deployado a EC2. Hoy ese subdominio no existe todavía.
(function () {
  const PROD_HOSTS = ['apexcloudworkscompany.com', 'www.apexcloudworkscompany.com'];
  const PROD_API_BASE = 'https://api.apexcloudworkscompany.com';
  const DEV_API_BASE = 'http://localhost:3000';

  window.APEX_API_BASE = PROD_HOSTS.includes(location.hostname) ? PROD_API_BASE : DEV_API_BASE;
})();
