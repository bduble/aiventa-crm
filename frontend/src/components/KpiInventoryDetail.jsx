import { useEffect } from 'react';

export default function KpiInventoryDetail({ onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Inventory Details</h2>
        {/* ...KPI details go here... */}
      </div>
    </div>
  );
}
