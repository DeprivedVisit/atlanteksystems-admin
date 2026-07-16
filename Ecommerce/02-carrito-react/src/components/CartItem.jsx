function CartItem({ item, onChangeQuantity, onRemoveItem }) {
  const lineTotal = (item.unitPrice * item.quantity).toFixed(2)

  return (
    <div className="cart-item">
      <div className="item-main">
        <div className="item-info">
          <p className="item-name">{item.name}</p>
          <p className="item-meta">{item.weight} · {item.grind}</p>
          <span className="item-unit-price">${item.unitPrice.toFixed(2)} c/u</span>
        </div>
        <div className="item-right">
          <div className="item-qty">
            <button className="qty-btn qty-minus" onClick={() => onChangeQuantity(item.cartKey, -1)}>−</button>
            <span className="qty-value">{item.quantity}</span>
            <button className="qty-btn qty-plus" onClick={() => onChangeQuantity(item.cartKey, 1)}>+</button>
          </div>
          <p className="item-line-total">${lineTotal}</p>
        </div>
      </div>
      <div className="item-bottom">
        <span></span>
        <button className="item-remove" onClick={() => onRemoveItem(item.cartKey)}>Eliminar</button>
      </div>
    </div>
  )
}

export default CartItem
