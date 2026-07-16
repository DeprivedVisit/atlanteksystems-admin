import CartItem from './CartItem'

function CartSidebar({ cart, isOpen, onClose, onChangeQuantity, onRemoveItem, onClearCart }) {
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const iva = subtotal * 0.13
  const total = subtotal + iva
  const isEmpty = cart.length === 0

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3 className="cart-title">Tu carrito</h3>
          <button className="cart-close" onClick={onClose} aria-label="Cerrar carrito">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="cart-body">
          {isEmpty ? (
            <div className="cart-empty">
              <span className="cart-empty-icon">🛒</span>
              <p className="cart-empty-title">Tu carrito está vacío</p>
              <p className="cart-empty-text">Agregá productos para empezar tu pedido</p>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map(item => (
                <CartItem
                  key={item.cartKey}
                  item={item}
                  onChangeQuantity={onChangeQuantity}
                  onRemoveItem={onRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {!isEmpty && (
          <div className="cart-footer">
            <div className="cart-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>IVA (13%)</span>
                <span>${iva.toFixed(2)}</span>
              </div>
              <div className="total-row total-final">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button className="btn-clear" onClick={onClearCart}>Vaciar carrito</button>
            <button className="btn-checkout" disabled>
              Proceder al pago
              <span className="btn-checkout-note">Próximamente</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

export default CartSidebar
