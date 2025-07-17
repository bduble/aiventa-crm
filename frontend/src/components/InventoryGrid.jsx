import { motion as Motion, AnimatePresence } from 'framer-motion'
import InventoryCard from './InventoryCard'

export default function InventoryGrid({ vehicles, onEdit, onToggle }) {
  return (
    <Motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence>
        {vehicles.map(v => (
          <Motion.div
            key={v.id}
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
