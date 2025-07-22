import { useState } from 'react';

export default function NewAppraisalForm({ onClose, customers = [] }) {
  const [form, setForm] = useState({
    vin: "",
    customerId: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    body: "",
    engine: "",
    mileage: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [decoding, setDecoding] = useState(false);

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // VIN Decoder
  const handleDecodeVin = async () => {
    setError("");
    setDecoding(true);
    try {
      const vin = form.vin.trim();
      if (vin.length !== 17) throw new Error("VIN must be 17 characters.");
      const res = await fetch(`/api/vin/decode/${vin}`);
      if (!res.ok) throw new Error("Could not decode VIN");
      const data = await res.json();
      setForm(f => ({
        ...f,
        year: data.year ?? "",
        make: data.make ?? "",
        model: data.model ?? "",
        trim: data.trim ?? "",
        body: data.body ?? "",
        engine: data.engine ?? ""
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setDecoding(false);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      vehicle_vin: form.vin,
      customer_id: form.customerId,
      year: form.year ? Number(form.year) : undefined,
      make: form.make,
      model: form.model,
      trim: form.trim,
      body: form.body,
      engine: form.engine,
      mileage: form.mileage ? Number(form.mileage) : undefined,
    };
    try {
      const res = await fetch('/api/appraisals/', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to create appraisal");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer Select Dropdown */}
      <label className="block">
        Customer
        <select
          className="border rounded p-2 w-full"
          name="customerId"
          value={form.customerId}
          onChange={handleChange}
          required
        >
          <option value="">Select Customer</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
          ))}
        </select>
      </label>
      {/* VIN Field and Decode Button */}
      <label className="block">
        VIN
        <div className="flex gap-2">
          <input
            className="border rounded p-2 w-full"
            name="vin"
            value={form.vin}
            onChange={handleChange}
            maxLength={17}
            required
          />
          <button
            type="button"
            onClick={handleDecodeVin}
            disabled={form.vin.length !== 17 || decoding}
            className="bg-blue-500 text-white px-3 rounded disabled:opacity-50"
            title="Decode VIN"
          >
            {decoding ? "Decoding..." : "Decode VIN"}
          </button>
        </div>
      </label>
      {/* Vehicle Details - Expanded */}
      <div className="flex flex-wrap gap-2">
        <input
          className="border rounded p-2 flex-1 min-w-[80px]"
          name="year"
          type="number"
          placeholder="Year"
          value={form.year}
          onChange={handleChange}
        />
        <input
          className="border rounded p-2 flex-1 min-w-[80px]"
          name="make"
          placeholder="Make"
          value={form.make}
          onChange={handleChange}
        />
        <input
          className="border rounded p-2 flex-1 min-w-[80px]"
          name="model"
          placeholder="Model"
          value={form.model}
          onChange={handleChange}
        />
        <input
          className="border rounded p-2 flex-1 min-w-[80px]"
          name="trim"
          placeholder="Trim"
          value={form.trim}
          onChange={handleChange}
        />
        <input
          className="border rounded p-2 flex-1 min-w-[120px]"
          name="body"
          placeholder="Body Style"
          value={form.body}
          onChange={handleChange}
        />
        <input
          className="border rounded p-2 flex-1 min-w-[100px]"
          name="engine"
          placeholder="Engine"
          value={form.engine}
          onChange={handleChange}
        />
        <input
          className="border rounded p-2 flex-1 min-w-[80px]"
          name="mileage"
          type="number"
          placeholder="Mileage"
          value={form.mileage}
          onChange={handleChange}
        />
      </div>
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="bg-electricblue text-white px-4 py-2 rounded">
          {saving ? "Saving..." : "Create"}
        </button>
        <button type="button" onClick={onClose} className="border px-4 py-2 rounded">Cancel</button>
      </div>
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
}
