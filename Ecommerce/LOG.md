# Ecoomerce — LOG de aprendizaje

## 09 Jul 2026 — Proyecto 1: carrito-vanilla

### Qué se creó
- Sandbox Ecoomerce para aprender ecommerce desde cero
- **Proyecto 01-carrito-vanilla**: carrito funcional con café gourmet como catálogo demo

### Conceptos cubiertos
- Arrays de objetos (catálogo de productos con sizes y grindOptions)
- Render dinámico del DOM con template literals
- Carrito en localStorage (persistencia entre sesiones)
- Lógica de agregar/eliminar/actualizar cantidad en carrito
- Cálculo de subtotal, IVA (13%), total
- Event delegation (click en botones de agregar, cantidad, eliminar)
- Sidebar toggle con overlay
- Badge de cantidad con animación
- Mobile-first CSS con diseño premium

### Archivos creados
| Archivo | Propósito |
|---------|-----------|
| `01-carrito-vanilla/index.html` | Estructura HTML semántica |
| `01-carrito-vanilla/assets/css/style.css` | Estilos mobile-first, diseño café premium |
| `01-carrito-vanilla/assets/js/script.js` | Lógica del carrito, render, eventos |

### Próximo paso
→ Proyecto 02: Migrar a React (al terminar Semana 3 JS)

---

## 09 Jul 2026 — v2: Filtros, sort, toast, clear cart

### Qué se agregó
- **Filtro por región**: botones dinámicos (Todos, Los Santos, Cartago, etc.) extraídos del array de productos con `Set`
- **Ordenar por precio**: dropdown de menor a mayor / mayor a menor
- **Toast notification**: aparece abajo a la izquierda cuando agregás un producto, se autodestruye a los 2.3 segundos
- **Vaciar carrito**: botón en el footer del carrito, elimina todos los items

### Conceptos cubiertos
- `Set` para obtener valores únicos de un array (`getRegions()`)
- `.filter()` para filtrar catálogo por región
- `.sort()` para ordenar por precio (menor→mayor y mayor→menor)
- Spread operator `[...products]` para no mutar el array original al ordenar
- `document.createElement()` + `setTimeout()` para notificaciones dinámicas
- Nuevo event listener delegado para los botones de filtro
- Sticky filter bar que sigue al scrollear

### Archivos modificados
| Archivo | Cambios |
|---------|---------|
| `index.html` | +filter bar, +toast container, +clear cart button |
| `style.css` | +filter/sort styles, +toast animaciones, +clear cart |
| `script.js` | +5 funciones, +3 event listeners

---

## 09 Jul 2026 — Proyecto 2: carrito-react

### Qué se creó
- **Proyecto 02-carrito-react**: mismo carrito migrado a React con Vite
- 10 componentes funcionales, estado en App.jsx, props entre componentes

### Conceptos cubiertos (React 101)
- **Componentes funcionales**: Header, Hero, FilterBar, ProductCard, ProductGrid, CartSidebar, CartItem, Toast, Footer, App
- **JSX**: HTML-like syntax dentro de JS (`className`, camelCase en SVG atributos)
- **useState**: estado del carrito, filtros, sidebar, toast
- **useEffect** con localStorage: sincronizar carrito automáticamente
- **useEffect** para efectos secundarios (body scroll lock, Escape key)
- **Props**: pasar datos y funciones entre componentes (`cartCount`, `onAddToCart`, etc.)
- **Event handlers en React**: `onClick`, `onChange` con closures
- **Render condicional**: `{isEmpty ? <Empty /> : <Items />}`
- **Render de listas**: `.map()` con `key` prop
- **Lifting state up**: todo el estado en App, fluye hacia abajo via props
- **useCallback**: funciones estables que no se recrean en cada render

### Estructura de componentes
```
App.jsx                  ← estado global + lógica
├── Header               ← logo + badge
├── Hero                 ← estático
├── FilterBar            ← región + sort
├── ProductGrid          ← mapea productos
│   └── ProductCard      ← card individual con su propio useState
├── CartSidebar          ← overlay + sidebar
│   └── CartItem         ← item individual con +/-/eliminar
├── Toast                ← notificación auto-dismiss
└── Footer               ← estático
```

### Archivos creados (15 archivos)
| Archivo | Propósito |
|---------|-----------|
| `package.json` | Dependencias React + Vite |
| `vite.config.js` | Config Vite con React plugin |
| `index.html` | Entry point HTML |
| `src/main.jsx` | ReactDOM.createRoot |
| `src/App.jsx` | Estado global + lógica + composición |
| `src/app.css` | Todos los estilos (portados de vanilla) |
| `src/data/products.js` | Catálogo exportado |
| `src/components/Header.jsx` | Header con badge |
| `src/components/Hero.jsx` | Hero estático |
| `src/components/FilterBar.jsx` | Filtros + sort |
| `src/components/ProductGrid.jsx` | Grid container |
| `src/components/ProductCard.jsx` | Card con useState |
| `src/components/CartSidebar.jsx` | Sidebar con overlay |
| `src/components/CartItem.jsx` | Item del carrito |
| `src/components/Toast.jsx` | Notificación temporizada |
| `src/components/Footer.jsx` | Footer estático |

### Cómo correrlo
```bash
cd 02-carrito-react
npm run dev
```
