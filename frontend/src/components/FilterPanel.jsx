import { useMemo } from 'react';

export default function FilterPanel({ filters, onChange, options = {} }) {
  const handleInput = e => {
    const { name, value } = e.target
    onChange({ ...filters, [name]: value })
  }

  const handleMulti = name => e => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value)
    onChange({ ...filters, [name]: selected })
  }

  const handleCheck = (name, value) => e => {
    const set = new Set(filters[name] || [])
    if (e.target.checked) set.add(value)
    else set.delete(value)
    onChange({ ...filters, [name]: Array.from(set) })
  }

  const modelOptions = useMemo(() => {
    if (!options.modelsByMake) return []
    if (!filters.make?.length) return options.allModels || []
    const arr = []
    filters.make.forEach(mk => {
      ;(options.modelsByMake[mk] || []).forEach(m => arr.push(m))
    })
    return Array.from(new Set(arr))
  }, [filters.make, options])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <div>
        <label className="block mb-1 text-sm">Type</label>
        <div className="flex gap-2">
          {['New', 'Used', 'Certified'].map(c => (
            <label key={c} className="text-sm flex items-center gap-1">
              <input
                type="checkbox"
                checked={filters.condition?.includes(c)}
                onChange={handleCheck('condition', c)}
              />
              {c}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block mb-1 text-sm">Make</label>
        <select
          multiple
          value={filters.make || []}
          onChange={handleMulti('make')}
          className="w-full border rounded px-2 py-1 h-24"
        >
          {(options.makes || []).map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 text-sm">Model</label>
        <select
          multiple
          value={filters.model || []}
          onChange={handleMulti('model')}
          className="w-full border rounded px-2 py-1 h-24"
        >
          {modelOptions.map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 text-sm">Year From</label>
        <input
          type="number"
          name="yearMin"
          value={filters.yearMin}
          onChange={handleInput}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block mb-1 text-sm">Year To</label>
        <input
          type="number"
          name="yearMax"
          value={filters.yearMax}
          onChange={handleInput}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block mb-1 text-sm">Price Min</label>
        <input
          type="number"
          name="priceMin"
          value={filters.priceMin}
          onChange={handleInput}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block mb-1 text-sm">Price Max</label>
        <input
          type="number"
          name="priceMax"
          value={filters.priceMax}
          onChange={handleInput}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block mb-1 text-sm">Mileage Max</label>
        <input
          type="number"
          name="mileageMax"
          value={filters.mileageMax}
          onChange={handleInput}
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  )
}
