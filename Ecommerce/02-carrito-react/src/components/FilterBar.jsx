import { products } from '../data/products'

const regions = ['all', ...new Set(products.map(p => p.region))]

function FilterBar({ activeRegion, sortBy, onRegionChange, onSortChange }) {
  return (
    <div className="filter-bar">
      <div className="container">
        <div className="filter-inner">
          <div className="filter-regions">
            {regions.map(region => (
              <button
                key={region}
                className={`filter-btn ${region === activeRegion ? 'active' : ''}`}
                onClick={() => onRegionChange(region)}
              >
                {region === 'all' ? 'Todos' : region}
              </button>
            ))}
          </div>
          <select
            className="sort-select"
            value={sortBy}
            onChange={e => onSortChange(e.target.value)}
          >
            <option value="default">Ordenar por</option>
            <option value="low">Precio: menor a mayor</option>
            <option value="high">Precio: mayor a menor</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
