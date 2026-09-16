// Skindoctors WhatsApp Configuration
// Cambiar este número cuando el cliente firme y pague los $450 USD
// Formato: código de país + número sin espacios ni guiones
// Ejemplo Costa Rica: 506XXXXXXXX

const WA_CONFIG = {
  // Número actual (Garett personal) - CAMBIAR AL FIRMAR
  phone: '50663144171',
  
  // Número formateado para mostrar
  phoneFormatted: '+506 6314-4171',
  
  // Mensaje por defecto para wa.me links
  defaultMessage: 'Hola, quiero información sobre los productos Skindoctors'
};

// Exportar para uso en browser (si se usa como módulo)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WA_CONFIG;
}