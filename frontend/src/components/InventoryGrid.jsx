import { motion as Motion, AnimatePresence } from 'framer-motion'
import InventoryCard from './InventoryCard'

export default function InventoryGrid({ vehicles = [], onEdit, onToggle }) {
  return (
    <Motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence>
        {vehicles.length === 0 && (
          <Motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="col-span-full text-center text-gray-500 p-8"
          >
            No vehicles found.
          </Motion.div>
        )}
        {vehicles.map(v => (
          <Motion.div
            key={v.id || v.vin} // Always prefer UUID id, but fallback to VIN
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <InventoryCard vehicle={v} onEdit={onEdit} onToggle={onToggle} />
          </Motion.div>
        ))}
      </AnimatePresence>
    </Motion.div>
  )
}
