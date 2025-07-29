import { useEffect, useState } from 'react';
import CustomerProfileCard from './CustomerProfileCard';

export default function CustomerCardOverlay({ customerId, onClose }) {
  const [customer, setCustomer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  useEffect(() => {
    if (!customerId) return;
    setCustomer(null);
    setLedger([]);
    fetch(`${API_BASE}/customers/${customerId}`)
      .then(res => res.json())
      .then(setCustomer)
      .catch(() => setCustomer(null));
    fetch(`${API_BASE}/activities?customer_id=${customerId}`)
      .then(res => res.json())
      .then(setLedger)
      .catch(() => setLedger([]));
  }, [customerId, API_BASE]);

  if (!customerId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto flex justify-center items-start p-4">
      <div className="w-full max-w-3xl">
        <button
          onClick={onClose}
          className="mb-4 text-blue-600 hover:underline bg-white px-3 py-1 rounded shadow"
        >
          &larr; Back to Floor Log
        </button>
        {customer ? (
          <CustomerProfileCard customer={customer} ledger={ledger} />
        ) : (
          <div className="bg-white p-6 rounded shadow">Loading...</div>
        )}
      </div>
    </div>
  );
}
