import { useEffect, useState } from 'react';
import NewAppraisalForm from '../components/NewAppraisalForm';
import { API_BASE } from '../apiBase'; // Adjust path if your structure differs

export default function AppraisalsPage() {
  const [appraisals, setAppraisals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Helper to reload appraisals after a new one is added
  const reloadAppraisals = () => {
    fetch(`${API_BASE}/api/appraisals/`)
      .then(res => res.json())
      .then(data => setAppraisals(Array.isArray(data) ? data : []))
      .catch(() => setAppraisals([]));
  };

  // Fetch appraisals on mount
  useEffect(() => { reloadAppraisals(); }, []);

  // Fetch customers on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/customers/`)
      .then(res => res.json())
      .then(data => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]));
  }, []);

  // Debug: See customers in your console
  useEffect(() => {
    console.log("Customers for dropdown:", customers);
  }, [customers]);

  // Helper: Get customer name by UUID, fallback to ID
  const getCustomerName = (id) => {
    const c = customers.find(cust => String(c.id) === String(id));
    return c ? (c.name || `${c.first_name || ""} ${c.last_name || ""}`.trim()) : id;
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Appraisals</h1>
      <button
        onClick={() => setShowForm(true)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        New Appraisal
      </button>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th className="p-2">Customer</th>
              <th className="p-2">VIN</th>
              <th className="p-2">Year</th>
              <th className="p-2">Make</th>
              <th className="p-2">Model</th>
              <th className="p-2">Mileage</th>
              <th className="p-2">Status</th>
              <th className="p-2">Appraised Value</th>
            </tr>
          </thead>
          <tbody>
            {appraisals.map(a => (
              <tr key={a.id} className="odd:bg-gray-50 hover:bg-gray-100">
                <td className="p-2 whitespace-nowrap">{getCustomerName(a.customer_id)}</td>
                <td className="p-2 whitespace-nowrap">{a.vehicle_vin}</td>
                <td className="p-2 whitespace-nowrap">{a.year}</td>
                <td className="p-2 whitespace-nowrap">{a.make}</td>
                <td className="p-2 whitespace-nowrap">{a.model}</td>
                <td className="p-2 whitespace-nowrap">{a.mileage}</td>
                <td className="p-2 whitespace-nowrap">{a.status}</td>
                <td className="p-2 whitespace-nowrap">{a.appraisal_value}</td>
              </tr>
            ))}
            {appraisals.length === 0 && (
              <tr>
                <td colSpan="8" className="p-2 text-center text-gray-500">
                  No appraisals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
