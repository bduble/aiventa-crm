import React from 'react'

export default function FilterPanel({ filters, onChange }) {
  const handleInput = e => {
    const { name, value } = e.target
    onChange({ ...filters, [name]: value })
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <div>
        <label className="block mb-1 text-sm">Make</label>
        <input name="make" value={filters.make} onChange={handleInput} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block mb-1 text-sm">Model</label>
        <input name="model" value={filters.model} onChange={handleInput} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block mb-1 text-sm">Year Min</label>
        <input type="number" name="yearMin" value={filters.yearMin} onChange={handleInput} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block mb-1 text-sm">Year Max</label>
        <input type="number" name="yearMax" value={filters.yearMax} onChange={handleInput} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block mb-1 text-sm">Price Min</label>
        <input type="number" name="priceMin" value={filters.priceMin} onChange={handleInput} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block mb-1 text-sm">Price Max</label>
        <input type="number" name="priceMax" value={filters.priceMax} onChange={handleInput} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block mb-1 text-sm">Mileage Max</label>
        <input type="number" name="mileageMax" value={filters.mileageMax} onChange={handleInput} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block mb-1 text-sm">Condition</label>
        <select name="condition" value={filters.condition} onChange={handleInput} className="w-full border rounded px-2 py-1">
          <option value="">Any</option>
          <option value="new">New</option>
          <option value="used">Used</option>
        </select>
      </div>
      <div>
        <label className="block mb-1 text-sm">Color</label>
        <input name="color" value={filters.color} onChange={handleInput} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block mb-1 text-sm">Fuel Type</label>
        <input name="fuelType" value={filters.fuelType} onChange={handleInput} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block mb-1 text-sm">Drivetrain</label>
        <input name="drivetrain" value={filters.drivetrain} onChange={handleInput} className="w-full border rounded px-2 py-1" />
      </div>
    </div>
  )
}
