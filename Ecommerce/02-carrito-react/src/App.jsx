import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import FilterBar from './components/FilterBar'
import ProductGrid from './components/ProductGrid'
import CartSidebar from './components/CartSidebar'
import Toast from './components/Toast'
import Footer from './components/Footer'
import { products } from './data/products'
import './app.css'

function getCartKey(productId, sizeIndex, grindIndex) {
  return `${productId}-${sizeIndex}-${grindIndex}`
}

function App() {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ecoomerce-cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [activeRegion, setActiveRegion] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem('ecoomerce-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isCartOpen])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isCartOpen])

  const addToCart = useCallback((productId, sizeIndex, grindIndex) => {
    const product = products.find(p => p.id === productId)
    const size = product.sizes[sizeIndex]
    const grind = product.grindOptions[grindIndex]
    const cartKey = getCartKey(productId, sizeIndex, grindIndex)

    setCart(prev => {
      const existing = prev.find(item => item.cartKey === cartKey)
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        cartKey,
        productId: product.id,
        name: product.name,
        weight: size.weight,
        grind,
        unitPrice: size.price,
        quantity: 1
      }]
    })

    setToast(`${product.name} ${size.weight} · ${grind}`)
    setIsCartOpen(true)
  }, [])

  const changeQuantity = useCallback((cartKey, delta) => {
    setCart(prev => {
      const item = prev.find(i => i.cartKey === cartKey)
      if (!item) return prev

      const newQty = item.quantity + delta
      if (newQty <= 0) {
        return prev.filter(i => i.cartKey !== cartKey)
      }
      return prev.map(i =>
        i.cartKey === cartKey ? { ...i, quantity: newQty } : i
      )
    })
  }, [])

  const removeItem = useCallback((cartKey) => {
    setCart(prev => prev.filter(i => i.cartKey !== cartKey))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const filteredProducts = (() => {
    let result = activeRegion === 'all'
      ? [...products]
      : products.filter(p => p.region === activeRegion)

    if (sortBy === 'low') {
      result.sort((a, b) => a.sizes[0].price - b.sizes[0].price)
    } else if (sortBy === 'high') {
      result.sort((a, b) => b.sizes[0].price - a.sizes[0].price)
    }

    return result
  })()

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <Header cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />
      <Hero />
      <FilterBar
        activeRegion={activeRegion}
        sortBy={sortBy}
        onRegionChange={setActiveRegion}
        onSortChange={setSortBy}
      />
      <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
      <CartSidebar
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onChangeQuantity={changeQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
      />
      {toast && (
        <Toast
          message={`✓ ${toast} agregado al carrito`}
          onDone={() => setToast(null)}
        />
      )}
      <Footer />
    </>
  )
}

export default App
