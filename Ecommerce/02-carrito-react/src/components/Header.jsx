function Header({ cartCount, onOpenCart }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="/" className="logo">
          <span className="logo-icon">☕</span>
          <span className="logo-text">Café de Altura</span>
        </a>
        <button className="cart-btn" onClick={onOpenCart} aria-label="Abrir carrito">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className="cart-badge">{cartCount}</span>
        </button>
      </div>
    </header>
  )
}

export default Header
