import React from 'react'

export default function InventoryGrid({ vehicles, onEdit, onToggle }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {vehicles.map(v => (
        <div key={v.id} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <img src={v.photos?.[0]} alt="thumb" className="h-40 w-full object-cover" />
          <div className="p-4 space-y-1 text-sm">
            <div className="font-semibold">{v.year} {v.make} {v.model} {v.trim}</div>
            <div>Stock #{v.stockNumber} • VIN {v.vin}</div>
            <div>Price: ${v.price?.toLocaleString?.() || v.price}</div>
            <div>Mileage: {v.mileage?.toLocaleString?.()} mi</div>
            <div>Color: {v.color}</div>
            <div>Status: {v.active ? 'Active' : 'Inactive'}</div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => onEdit(v)} className="px-2 py-1 bg-electricblue text-white rounded">Edit</button>
              <button onClick={() => onToggle(v)} className={`px-2 py-1 rounded ${v.active ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>{v.active ? 'Disable' : 'Activate'}</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
