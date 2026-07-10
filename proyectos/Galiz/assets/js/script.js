document.addEventListener('DOMContentLoaded', () => {
  const tabs2 = document.getElementById('svc-tabs-b');
  const list2 = document.getElementById('svc-list-b');
  if (!tabs2 || !list2) return;
  let cat2 = Object.keys(SERVICES)[0];

  function showCat2(cat) {
    cat2 = cat;
    tabs2.querySelectorAll('.svc-tab').forEach(b => b.classList.toggle('active', b.textContent === cat));
    list2.innerHTML = '';
    SERVICES[cat].forEach(svc => {
      const card = document.createElement('div');
      card.className = 'svc-card' + (selService?.id === svc.id ? ' active' : '');
      card.innerHTML = `<div class="svc-name">${svc.name}</div>
        <div class="svc-row"><span class="svc-price">${svc.price}</span><span class="svc-dur">${durLabel(svc.duration)}</span></div>
        ${svc.special ? '<div class="svc-note">Requiere confirmación previa</div>' : ''}`;
      card.addEventListener('click', () => {
        selService = { ...svc, category: cat };
        selDate = null; selSlot = null;
        list2.querySelectorAll('.svc-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const bar = document.getElementById('sel-bar');
        bar.innerHTML = `<span>✓ ${svc.name}</span><span>${svc.price} · ${durLabel(svc.duration)}</span>`;
        bar.style.display = 'flex';
        stepShow('step-2'); stepHide('step-3'); stepHide('step-4');
        setDot(2);
        renderCal();
        document.getElementById('step-2').scrollIntoView({ behavior: 'smooth', block: 'start' });
        updateBtn();
      });
      list2.appendChild(card);
    });
  }
  Object.keys(SERVICES).forEach((cat, i) => {
    const b = document.createElement('button');
    b.className = 'svc-tab' + (i === 0 ? ' active' : '');
    b.textContent = cat;
    b.addEventListener('click', () => showCat2(cat));
    tabs2.appendChild(b);
  });
  showCat2(cat2);

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  document.querySelectorAll('input[name="sf-diseno"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('sf-diseno-ref').style.display =
        document.querySelector('input[name="sf-diseno"]:checked')?.value === 'Sí' ? 'block' : 'none';
    });
  });

  const waBtn   = document.getElementById('wa-float-btn');
  const waPopup = document.getElementById('wa-popup');
  waBtn.addEventListener('click', e => {
    e.stopPropagation();
    waPopup.classList.toggle('open');
  });
  document.addEventListener('click', () => waPopup.classList.remove('open'));
  document.getElementById('wa-popup-form').addEventListener('click', () => {
    waPopup.classList.remove('open');
  });

  const menuBtn = document.getElementById('nav-menu-btn');
  const dropdown = document.getElementById('nav-dropdown');
  menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => dropdown.classList.remove('open'));
  dropdown.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => dropdown.classList.remove('open'));
  });
});
