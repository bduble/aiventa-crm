import React from 'react'
import InventoryCard from './InventoryCard'

export default function InventoryGrid({ vehicles, onEdit, onToggle }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {vehicles.map(v => (
        <InventoryCard key={v.id} vehicle={v} onEdit={onEdit} onToggle={onToggle} />
      ))}
    </div>
  )
}
