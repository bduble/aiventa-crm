import React from 'react'

export default function InventoryTable({ vehicles, onEdit, onToggle }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y">
        <thead className="bg-slategray text-white">
          <tr>
            <th className="p-2 text-left">Stock #</th>
            <th className="p-2 text-left">VIN</th>
            <th className="p-2 text-left">Year</th>
            <th className="p-2 text-left">Make</th>
            <th className="p-2 text-left">Model</th>
            <th className="p-2 text-left">Trim</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Mileage</th>
            <th className="p-2 text-left">Color</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.id} className="odd:bg-gray-50 hover:bg-gray-100">
              <td className="p-2 whitespace-nowrap">{v.stockNumber}</td>
              <td className="p-2 whitespace-nowrap">{v.vin}</td>
              <td className="p-2 whitespace-nowrap">{v.year}</td>
              <td className="p-2 whitespace-nowrap">{v.make}</td>
              <td className="p-2 whitespace-nowrap">{v.model}</td>
              <td className="p-2 whitespace-nowrap">{v.trim}</td>
              <td className="p-2 whitespace-nowrap">${v.price?.toLocaleString?.() || v.price}</td>
              <td className="p-2 whitespace-nowrap">{v.mileage?.toLocaleString?.()}</td>
              <td className="p-2 whitespace-nowrap">{v.color}</td>
              <td className="p-2 whitespace-nowrap">{v.active ? 'Active' : 'Inactive'}</td>
              <td className="p-2 whitespace-nowrap text-right space-x-2">
                <button onClick={() => onEdit(v)} className="px-2 py-1 bg-electricblue text-white rounded">Edit</button>
                <button onClick={() => onToggle(v)} className={`px-2 py-1 rounded ${v.active ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>{v.active ? 'Disable' : 'Activate'}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
