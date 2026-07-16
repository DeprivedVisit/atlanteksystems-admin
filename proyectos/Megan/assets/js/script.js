/* ===== Megan Tattoo — Scripts ===== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- REVEAL ON SCROLL ---- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ---- SMOOTH SCROLL ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---- FAQ ---- */
  window.toggleFaq = function(el) {
    const parent = el.parentElement;
    parent.classList.toggle('open');
  };

  /* ---- CALENDARIO ---- */
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  let today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let selectedDate = null;

  function generateCalendar() {
    const grid = document.getElementById('calGrid');
    const title = document.getElementById('calMonthTitle');
    grid.innerHTML = '';

    title.textContent = monthNames[currentMonth] + ' ' + currentYear;

    dayNames.forEach(d => {
      const el = document.createElement('div');
      el.className = 'cal-day-name';
      el.textContent = d;
      grid.appendChild(el);
    });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();

    for (let i = firstDay - 1; i >= 0; i--) {
      const el = document.createElement('div');
      el.className = 'cal-day other-month';
      el.textContent = daysInPrev - i;
      grid.appendChild(el);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const el = document.createElement('div');
      el.className = 'cal-day';
      const dateObj = new Date(currentYear, currentMonth, d);
      const dayOfWeek = dateObj.getDay();

      el.textContent = d;

      if (dateObj.toDateString() === today.toDateString()) {
        el.classList.add('today');
      }

      if (dayOfWeek !== 0) {
        el.classList.add('available');
        el.dataset.date = currentYear + '-' + String(currentMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
        el.addEventListener('click', function() {
          document.querySelectorAll('.cal-day.selected').forEach(e => e.classList.remove('selected'));
          this.classList.add('selected');
          selectedDate = this.dataset.date;
          const parts = selectedDate.split('-');
          document.getElementById('selectedDateDisplay').value = parts[2] + ' de ' + monthNames[parseInt(parts[1])-1] + ' ' + parts[0];
        });
      } else {
        el.classList.add('booked');
      }

      grid.appendChild(el);
    }

    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const el = document.createElement('div');
      el.className = 'cal-day other-month';
      el.textContent = i;
      grid.appendChild(el);
    }
  }

  const calPrev = document.getElementById('calPrev');
  const calNext = document.getElementById('calNext');

  if (calPrev) {
    calPrev.addEventListener('click', function() {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      generateCalendar();
    });
  }

  if (calNext) {
    calNext.addEventListener('click', function() {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      generateCalendar();
    });
  }

  generateCalendar();

  /* ---- FORMULARIO ---- */
  const bookingForm = document.getElementById('bookingFormEl');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!selectedDate) {
        alert('Por favor seleccioná un día disponible en el calendario.');
        return;
      }
      const name = document.getElementById('fieldName').value.trim();
      const phone = document.getElementById('fieldPhone').value.trim();
      const time = document.getElementById('fieldTime').value;
      if (!name || !phone || !time) {
        alert('Completá nombre, teléfono y horario.');
        return;
      }
      document.getElementById('formConfirm').classList.add('show');
    });
  }
});
