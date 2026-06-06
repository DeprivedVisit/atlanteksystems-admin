# Fix: UX-01 — Menú Hamburger para Móvil

## HTML — agregar en `index.html` dentro del `<nav>` (después del logo)

```html
<nav>
  <a class="logo-img" href="#"><img src="logo-rflx.png" alt="RFLX Detail" height="44"></a>
  
  <!-- AGREGAR ESTO -->
  <button class="nav-hamburger" id="nav-hamburger" aria-label="Abrir menú" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <!-- FIN -->

  <ul id="nav-menu">
    ...
  </ul>
  ...
</nav>
```

## CSS — agregar en `styles.css`

```css
/* Hamburger button */
.nav-hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px; height: 18px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 600;
}
.nav-hamburger span {
  display: block;
  width: 100%; height: 2px;
  background: var(--yellow);
  border-radius: 2px;
  transition: transform .3s, opacity .3s;
}
.nav-hamburger.open span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
.nav-hamburger.open span:nth-child(2) { opacity: 0; }
.nav-hamburger.open span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }

@media (max-width: 900px) {
  .nav-hamburger { display: flex; }

  nav ul {
    /* Reemplazar "display: none" con esto: */
    display: flex !important;
    flex-direction: column;
    position: fixed;
    top: 0; right: 0;
    width: 75%; max-width: 280px; height: 100vh;
    background: rgba(6,6,10,.98);
    backdrop-filter: blur(24px);
    border-left: 1px solid rgba(240,192,0,.12);
    padding: 5rem 2rem 2rem;
    gap: 1.8rem;
    transform: translateX(100%);
    transition: transform .35s cubic-bezier(.4,0,.2,1);
    z-index: 500;
  }
  nav ul.open { transform: translateX(0); }
  nav ul a { font-size: .9rem; }
}
```

## JS — agregar en `index.html` dentro del `<script>` existente

```js
// Hamburger menu
(function(){
  const btn  = document.getElementById('nav-hamburger');
  const menu = document.querySelector('nav ul');
  if(!btn || !menu) return;

  btn.addEventListener('click', ()=>{
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  // Cerrar al hacer click en un link
  menu.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=>{
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Cerrar al hacer click fuera
  document.addEventListener('click', e=>{
    if(!btn.contains(e.target) && !menu.contains(e.target)){
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();
```
