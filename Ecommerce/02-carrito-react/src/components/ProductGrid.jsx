import ProductCard from './ProductCard'

function ProductGrid({ products, onAddToCart }) {
  return (
    <section className="products-section" id="productos">
      <div className="container">
        <h2 className="section-title">Nuestros orígenes</h2>
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductGrid
