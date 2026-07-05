// Apex Cloud Works — Arquitectura Demo — script.js

document.addEventListener('DOMContentLoaded', () => {

  // Efecto de escritura del mensaje de Ana (asistente IA)
  const assistantMsg = document.getElementById('assistant-msg');
  const fullText = 'Detecté 4 ambientes y 186 m² totales. Cocina y sala comparten muro de carga — se puede abrir concepto sin afectar estructura.';
  let i = 0;

  function typeWriter() {
    if (i <= fullText.length) {
      assistantMsg.innerHTML = fullText.slice(0, i) + '<span class="cursor">▍</span>';
      i++;
      setTimeout(typeWriter, 22);
    }
  }
  typeWriter();

  // Selector de materiales — cambia el acento visual del panel
  const swatches = document.querySelectorAll('.swatch');
  const budgetVal = document.getElementById('budget-val');
  const budgetsByMaterial = {
    '#8c6a4f': 96400,
    '#4a4740': 88200,
    '#c9c3bc': 104900,
    '#2c3a33': 92750
  };

  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const color = swatch.getAttribute('data-color');
      const budget = budgetsByMaterial[color] || 96400;
      budgetVal.textContent = '$' + budget.toLocaleString('en-US');
    });
  });

});
