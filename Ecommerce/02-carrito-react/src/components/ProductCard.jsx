import { useState } from 'react'

function ProductCard({ product, onAddToCart }) {
  const [sizeIndex, setSizeIndex] = useState(0)
  const [grindIndex, setGrindIndex] = useState(0)

  const currentPrice = product.sizes[sizeIndex].price.toFixed(2)

  return (
    <article className="product-card">
      <div className="card-accent" style={{ background: `linear-gradient(135deg, ${product.accent}, ${product.accent}88)` }}></div>
      <div className="card-body">
        <h3 className="card-title">{product.name}</h3>
        <span className="card-region">{product.region}</span>
        <p className="card-desc">{product.description}</p>

        <div className="card-options">
          <div className="option-group">
            <label className="option-label">Presentación</label>
            <select
              value={sizeIndex}
              onChange={e => setSizeIndex(parseInt(e.target.value))}
            >
              {product.sizes.map((s, i) => (
                <option key={i} value={i}>{s.weight} — ${s.price.toFixed(2)}</option>
              ))}
            </select>
          </div>
          <div className="option-group">
            <label className="option-label">Molido</label>
            <select
              value={grindIndex}
              onChange={e => setGrindIndex(parseInt(e.target.value))}
            >
              {product.grindOptions.map((g, i) => (
                <option key={i} value={i}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-bottom">
          <span className="price-display">${currentPrice}</span>
          <button className="btn-add" onClick={() => onAddToCart(product.id, sizeIndex, grindIndex)}>
            Agregar
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
