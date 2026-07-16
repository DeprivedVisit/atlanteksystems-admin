# Ecoomerce — Pendientes

> Creado 09 Jul 2026 · Fin sesión madrugada

---

## ✅ Lo que ya está

| Proyecto | Estado |
|----------|--------|
| `01-carrito-vanilla/` | ✅ Completo — carrito funcional, filtros, sort, toast, clear cart |
| `02-carrito-react/` | ✅ Build exitoso — 10 componentes React con Vite |

---

## 🔥 Siguiente sesión

### Prioridad 1: Explorar 02-carrito-react en el navegador
```bash
cd 02-carrito-react
npm run dev
```
Ver que todo funcione igual que el vanilla. Jugar con React DevTools.

### Prioridad 2: Entender conceptos clave uno por uno
- ¿Cómo funciona `useState` en ProductCard.jsx? (tiene su PROPIO estado local)
- ¿Cómo funciona `useEffect` con localStorage en App.jsx?
- ¿Por qué se usa `useCallback` en las funciones del carrito?
- ¿Cómo fluyen las props de App → ProductGrid → ProductCard?

### Prioridad 3: Modificar algo para practicar
- Agregar un filtro por precio (ej. "$10 - $20") en FilterBar
- Mostrar la cantidad total de items en el hero
- Hacer que el badge tenga animación (como en vanilla)

---

## 📐 Roadmap completo

| # | Proyecto | Estado |
|---|----------|--------|
| 1 | `01-carrito-vanilla/` | ✅ Completo |
| 2 | `02-carrito-react/` | ✅ Build ok — explorar y practicar |
| 3 | `03-api-productos/` | ⏳ Pendiente — Node/Express + JSON |
| 4 | `04-ecommerce-fullstack/` | ⏳ Pendiente — React + Express + PostgreSQL + Stripe |

---

## 🧠 Para Wilson

> ⚠️ Recordatorio automático para "hey wilson":
> - Garett avanzó con Ecoomerce sandbox: carrito vanilla con features + migración a React (build exitoso)
> - Próxima sesión: explorar React build en navegador, practicar modificando componentes
> - Cuando esté listo para API, avisar: proyecto 03-api-productos con Express
