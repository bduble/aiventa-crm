import { useState } from 'react';

export default function NewAppraisalForm({ onClose }) {
  const [vin, setVin] = useState("");
  const [customerId, setCustomerId] = useState("");
  // ... add other fields as needed

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { vehicle_vin: vin, customer_id: customerId };
    await fetch('/api/appraisals/', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    onClose();
    // Optionally, trigger parent to reload appraisals
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">VIN <input className="border rounded p-2" value={vin} onChange={e => setVin(e.target.value)} /></label>
      <label className="block">Customer ID <input className="border rounded p-2" value={customerId} onChange={e => setCustomerId(e.target.value)} /></label>
      {/* Add more fields */}
      <div className="flex gap-2">
        <button type="submit" className="bg-electricblue text-white px-4 py-2 rounded">Create</button>
        <button type="button" onClick={onClose} className="border px-4 py-2 rounded">Cancel</button>
      </div>
    </form>
  );
}
