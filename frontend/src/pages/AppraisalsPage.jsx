import { useEffect, useState } from 'react';
import NewAppraisalForm from './NewAppraisalForm';

export default function AppraisalsPage() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
  const [appraisals, setAppraisals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Load appraisals
  const reloadAppraisals = () => {
    fetch(`${API_BASE}/appraisals/`)
      .then(res => res.json())
      .then(data => setAppraisals(Array.isArray(data) ? data : []));
  };

  useEffect(() => { reloadAppraisals(); }, [API_BASE]);

  // Load customers
  useEffect(() => {
    fetch(`${API_BASE}/customers`)
      .then(res => res.json())
      .then(data => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]));
  }, [API_BASE]);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Appraisals</h1>
      <button
        onClick={() => setShowForm(true)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        New Appraisal
      </button>
      {/* ... your table goes here ... */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded p-8 shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Appraisal</h2>
            <NewAppraisalForm
              onClose={() => setShowForm(false)}
              customers={customers}
              reloadAppraisals={reloadAppraisals}
            />
          </div>
        </div>
      )}
    </div>
  );
}
