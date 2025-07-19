import { useState } from 'react';

// Props:
// - onClose: function to close the modal
// - customers: array of customer objects (for dropdown) (optional)
// - customer: customer object (for context use, locks customer) (optional)
// - reloadAppraisals: callback to refresh parent data (optional)
export default function NewAppraisalForm({ onClose, customers = [], customer = null, reloadAppraisals }) {
  const [form, setForm] = useState({
    vin: "",
    customerId: customer?.id || "",
    year: "",
    make: "",
    model: "",
    mileage: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      vehicle_vin: form.vin,
      customer_id: form.customerId || null, // null if not attached
      year: form.year ? Number(form.year) : undefined,
      make: form.make,
      model: form.model,
      mileage: form.mileage ? Number(form.mileage) : undefined,
    };
    try {
      const res = await fetch('/api/appraisals/', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to create appraisal");
      reloadAppraisals && reloadAppraisals();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer Dropdown or Locked Customer */}
      {!customer ? (
        <label className="block">
          Customer
          <select
            className="border rounded p-2 w-full"
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
          >
            <option value="">No Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
            ))}
          </select>
        </label>
      ) : (
        <div className="font-medium mb-2">
          Customer: <span className="text-blue-600">{customer.name} ({customer.email})</span>
        </div>
      )}
      <label className="block">
        VIN <input className="border rounded p-2 w-full" name="vin" value={form.vin} onChange={handleChange} required />
      </label>
      <div className="flex gap-2">
        <input
          className="border rounded p-2 w-1/4"
          name="year"
          type="number"
          placeholder="Year"
          value={form.year}
          onChange={handleChange}
        />
        <input
          className="border rounded p-2 w-1/4"
          name="make"
          placeholder="Make"
          value={form.make}
          onChange={handleChange}
        />
        <input
          className="border rounded p-2 w-1/4"
          name="model"
          placeholder="Model"
          value={form.model}
          onChange={handleChange}
        />
        <input
          className="border rounded p-2 w-1/4"
          name="mileage"
          type="number"
          placeholder="Mileage"
          value={form.mileage}
          onChange={handleChange}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
          {saving ? "Saving..." : "Create"}
        </button>
        <button type="button" onClick={onClose} className="border px-4 py-2 rounded">Cancel</button>
      </div>
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
}
