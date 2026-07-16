const products = [
  {
    id: 1,
    name: 'Tarrazú',
    region: 'Los Santos',
    description: 'Notas de cítricos y chocolate. Cuerpo balanceado y acidez brillante.',
    accent: '#8B3A3A',
    sizes: [
      { weight: '250g', price: 9.90 },
      { weight: '500g', price: 16.90 },
      { weight: '1kg', price: 29.90 }
    ],
    grindOptions: ['Grano entero', 'Molido']
  },
  {
    id: 2,
    name: 'Dota',
    region: 'Los Santos',
    description: 'Notas florales y miel. Cuerpo sedoso con acidez cítrica suave.',
    accent: '#C47E3B',
    sizes: [
      { weight: '250g', price: 10.90 },
      { weight: '500g', price: 18.90 },
      { weight: '1kg', price: 32.90 }
    ],
    grindOptions: ['Grano entero', 'Molido']
  },
  {
    id: 3,
    name: 'Tres Ríos',
    region: 'Cartago',
    description: 'Notas de caramelo y nueces. Cuerpo completo con acidez suave.',
    accent: '#5C3A6B',
    sizes: [
      { weight: '250g', price: 9.50 },
      { weight: '500g', price: 15.90 },
      { weight: '1kg', price: 27.90 }
    ],
    grindOptions: ['Grano entero', 'Molido']
  },
  {
    id: 4,
    name: 'Brunca',
    region: 'Pérez Zeledón',
    description: 'Notas de chocolate oscuro y frutos secos. Cuerpo pesado y dulce.',
    accent: '#4A7C59',
    sizes: [
      { weight: '250g', price: 8.90 },
      { weight: '500g', price: 14.90 },
      { weight: '1kg', price: 25.90 }
    ],
    grindOptions: ['Grano entero', 'Molido']
  },
  {
    id: 5,
    name: 'Orosi',
    region: 'Paraíso, Cartago',
    description: 'Notas de miel de caña y frutas tropicales. Cuerpo medio y dulce natural.',
    accent: '#B8860B',
    sizes: [
      { weight: '250g', price: 9.90 },
      { weight: '500g', price: 16.90 },
      { weight: '1kg', price: 28.90 }
    ],
    grindOptions: ['Grano entero', 'Molido']
  },
  {
    id: 6,
    name: 'Volcán Poás',
    region: 'Alajuela',
    description: 'Notas ahumadas y especias. Cuerpo robusto con acidez vibrante.',
    accent: '#3D5A6E',
    sizes: [
      { weight: '250g', price: 11.90 },
      { weight: '500g', price: 20.90 },
      { weight: '1kg', price: 36.90 }
    ],
    grindOptions: ['Grano entero', 'Molido']
  }
]

function loadCart() {
  try {
    const saved = localStorage.getItem('ecoomerce-cart')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveCart() {
  localStorage.setItem('ecoomerce-cart', JSON.stringify(cart))
}

function getCartKey(productId, sizeIndex, grindIndex) {
  return `${productId}-${sizeIndex}-${grindIndex}`
}

const cart = loadCart()
const productGrid = document.getElementById('productGrid')
const cartSidebar = document.getElementById('cartSidebar')
const cartOverlay = document.getElementById('cartOverlay')
const cartItems = document.getElementById('cartItems')
const cartEmpty = document.getElementById('cartEmpty')
const cartFooter = document.getElementById('cartFooter')
const cartBadge = document.getElementById('cartBadge')

let activeRegion = 'all'
let sortBy = 'default'

function renderProducts(productsToRender = products) {
  productGrid.innerHTML = productsToRender.map(product => {
    const sizeOptions = product.sizes.map((s, i) =>
      `<option value="${i}">${s.weight} — $${s.price.toFixed(2)}</option>`
    ).join('')

    const grindOptions = product.grindOptions.map((g, i) =>
      `<option value="${i}">${g}</option>`
    ).join('')

    const defaultPrice = product.sizes[0].price.toFixed(2)

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="card-accent" style="background:linear-gradient(135deg,${product.accent},${product.accent}88)"></div>
        <div class="card-body">
          <h3 class="card-title">${product.name}</h3>
          <span class="card-region">${product.region}</span>
          <p class="card-desc">${product.description}</p>
          <div class="card-options">
            <div class="option-group">
              <label class="option-label">Presentación</label>
              <select class="size-select" data-product-id="${product.id}">
                ${sizeOptions}
              </select>
            </div>
            <div class="option-group">
              <label class="option-label">Molido</label>
              <select class="grind-select" data-product-id="${product.id}">
                ${grindOptions}
              </select>
            </div>
          </div>
          <div class="card-bottom">
            <span class="price-display" id="price-${product.id}">$${defaultPrice}</span>
            <button class="btn-add" data-product-id="${product.id}">Agregar</button>
          </div>
        </div>
      </article>
    `
  }).join('')
}

function getRegions() {
  const regions = [...new Set(products.map(p => p.region))]
  return ['all', ...regions]
}

function renderFilters() {
  const container = document.getElementById('filterRegions')
  const regions = getRegions()

  container.innerHTML = regions.map(region =>
    `<button class="filter-btn ${region === activeRegion ? 'active' : ''}" data-region="${region}">${region === 'all' ? 'Todos' : region}</button>`
  ).join('')
}

function getFilteredProducts() {
  let result = activeRegion === 'all'
    ? [...products]
    : products.filter(p => p.region === activeRegion)

  if (sortBy === 'low') {
    result.sort((a, b) => a.sizes[0].price - b.sizes[0].price)
  } else if (sortBy === 'high') {
    result.sort((a, b) => b.sizes[0].price - a.sizes[0].price)
  }

  return result
}

function addToCart(productId, sizeIndex, grindIndex) {
  const product = products.find(p => p.id === productId)
  const size = product.sizes[sizeIndex]
  const grind = product.grindOptions[grindIndex]
  const cartKey = getCartKey(productId, sizeIndex, grindIndex)

  const existing = cart.find(item => item.cartKey === cartKey)

  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({
      cartKey,
      productId: product.id,
      name: product.name,
      weight: size.weight,
      grind,
      unitPrice: size.price,
      quantity: 1
    })
  }

  showToast(product.name, size.weight, grind)
  saveCart()
  updateCartUI()
  animateBadge()
  openCartSidebar()
}

function changeItemQuantity(cartKey, delta) {
  const item = cart.find(i => i.cartKey === cartKey)
  if (!item) return

  item.quantity += delta

  if (item.quantity <= 0) {
    removeCartItem(cartKey)
    return
  }

  saveCart()
  updateCartUI()
}

function removeCartItem(cartKey) {
  const index = cart.findIndex(i => i.cartKey === cartKey)
  if (index === -1) return

  cart.splice(index, 1)
  saveCart()
  updateCartUI()
}

function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
}

function calculateIVA(subtotal) {
  return subtotal * 0.13
}

function updateCartUI() {
  const isEmpty = cart.length === 0

  cartEmpty.style.display = isEmpty ? 'block' : 'none'
  cartItems.style.display = isEmpty ? 'none' : 'block'
  cartFooter.style.display = isEmpty ? 'none' : 'block'

  if (!isEmpty) {
    renderCartItems()
    updateTotals()
  }

  updateBadge()
}

function renderCartItems() {
  cartItems.innerHTML = cart.map(item => {
    const lineTotal = (item.unitPrice * item.quantity).toFixed(2)

    return `
      <div class="cart-item" data-cart-key="${item.cartKey}">
        <div class="item-main">
          <div class="item-info">
            <p class="item-name">${item.name}</p>
            <p class="item-meta">${item.weight} · ${item.grind}</p>
            <span class="item-unit-price">$${item.unitPrice.toFixed(2)} c/u</span>
          </div>
          <div class="item-right">
            <div class="item-qty">
              <button class="qty-btn qty-minus" data-cart-key="${item.cartKey}">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn qty-plus" data-cart-key="${item.cartKey}">+</button>
            </div>
            <p class="item-line-total">$${lineTotal}</p>
          </div>
        </div>
        <div class="item-bottom">
          <span></span>
          <button class="item-remove" data-cart-key="${item.cartKey}">Eliminar</button>
        </div>
      </div>
    `
  }).join('')
}

function updateTotals() {
  const subtotal = calculateSubtotal()
  const iva = calculateIVA(subtotal)
  const total = subtotal + iva

  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`
  document.getElementById('iva').textContent = `$${iva.toFixed(2)}`
  document.getElementById('total').textContent = `$${total.toFixed(2)}`
}

function updateBadge() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0)
  cartBadge.textContent = count
}

function animateBadge() {
  cartBadge.classList.remove('pop')
  void cartBadge.offsetWidth
  cartBadge.classList.add('pop')
}

function openCartSidebar() {
  cartSidebar.classList.add('open')
  cartOverlay.classList.add('open')
  document.body.style.overflow = 'hidden'
}

function closeCartSidebar() {
  cartSidebar.classList.remove('open')
  cartOverlay.classList.remove('open')
  document.body.style.overflow = ''
}

function showToast(productName, weight, grind) {
  const container = document.getElementById('toastContainer')
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = `✓ ${productName} ${weight} · ${grind} agregado al carrito`
  container.appendChild(toast)

  setTimeout(() => toast.remove(), 2300)
}

function clearCart() {
  if (cart.length === 0) return
  cart.length = 0
  saveCart()
  updateCartUI()
}

renderProducts()
renderFilters()
updateCartUI()

document.getElementById('cartBtn').addEventListener('click', openCartSidebar)
document.getElementById('closeCart').addEventListener('click', closeCartSidebar)
cartOverlay.addEventListener('click', closeCartSidebar)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cartSidebar.classList.contains('open')) {
    closeCartSidebar()
  }
})

productGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-add')
  if (!btn) return

  const productId = parseInt(btn.dataset.productId)
  const card = btn.closest('.product-card')
  const sizeIndex = parseInt(card.querySelector('.size-select').value)
  const grindIndex = parseInt(card.querySelector('.grind-select').value)

  addToCart(productId, sizeIndex, grindIndex)
})

productGrid.addEventListener('change', (e) => {
  const select = e.target.closest('.size-select')
  if (!select) return

  const productId = parseInt(select.dataset.productId)
  const product = products.find(p => p.id === productId)
  const sizeIndex = parseInt(select.value)
  const priceDisplay = document.getElementById(`price-${productId}`)
  priceDisplay.textContent = `$${product.sizes[sizeIndex].price.toFixed(2)}`
})

cartItems.addEventListener('click', (e) => {
  const plusBtn = e.target.closest('.qty-plus')
  const minusBtn = e.target.closest('.qty-minus')
  const removeBtn = e.target.closest('.item-remove')

  if (plusBtn) {
    changeItemQuantity(plusBtn.dataset.cartKey, 1)
  } else if (minusBtn) {
    changeItemQuantity(minusBtn.dataset.cartKey, -1)
  } else if (removeBtn) {
    removeCartItem(removeBtn.dataset.cartKey)
  }
})

document.getElementById('filterRegions').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn')
  if (!btn) return

  activeRegion = btn.dataset.region
  renderFilters()
  renderProducts(getFilteredProducts())
})

document.getElementById('sortSelect').addEventListener('change', (e) => {
  sortBy = e.target.value
  renderProducts(getFilteredProducts())
})

document.getElementById('clearCart').addEventListener('click', () => {
  clearCart()
})
