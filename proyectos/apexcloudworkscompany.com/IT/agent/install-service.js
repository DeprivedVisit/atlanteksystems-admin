'use strict';
const path = require('path');
const { Service } = require('node-windows');

const svc = new Service({
  name: 'Apex RMM Agent',
  description: 'Agente de monitoreo Apex RMM — reporta CPU/disco/uptime al backend',
  script: path.join(__dirname, 'agent.js'),
});

svc.on('install', () => svc.start());
svc.on('alreadyinstalled', () => console.log('El servicio ya estaba instalado.'));
svc.on('error', (err) => console.error('Error instalando el servicio:', err));

svc.install();
