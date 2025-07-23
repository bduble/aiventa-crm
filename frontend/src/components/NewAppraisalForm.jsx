import { useState, useEffect } from "react";
import { API_BASE, FALLBACK_VIN_DECODER } from "../apiBase"; // adjust import as needed

// Debug: Check env variables and customer list
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("API_BASE:", API_BASE);

function safeInt(val) {
  if (val === undefined || val === null) return undefined;
  const num = Number(val);
  return !isNaN(num) && Number.isFinite(num) ? num : undefined;
}

// Helper: parse NHTSA (fallback) data
function parseNHTSA(data) {
  const r = Array.isArray(data.Results) ? data.Results[0] : {};
  return {
    year: r.ModelYear || "",
    make: r.Make || "",
    model: r.Model || "",
    trim: r.Trim || "",
    body: r.BodyClass || "",
    engine: r.EngineModel || "",
  };
}

export default function NewAppraisalForm({
  onClose,
  customers = [],
  reloadAppraisals,
}) {
  // Only allow customers with UUID id (36 chars)
  const validCustomers = customers.filter(
    (c) => typeof c.id === "string" && c.id.length === 36
  );

  // Helpful debugging:
  useEffect(() => {
    console.log("Customers for dropdown:", customers);
    console.log("Filtered (UUID only):", validCustomers);
  }, [customers]);

  const [form, setForm] = useState({
    customer_id: "", // UUID string
    vin: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    body: "",
    engine: "",
    mileage: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [decoding, setDecoding] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // VIN Decoder (with fallback logic)
  const handleDecodeVin = async () => {
    setError("");
    setDecoding(true);
    const vin = form.vin.trim();
    if (vin.length !== 17) {
      setError("VIN must be 17 characters.");
      setDecoding(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/vin/decode/${vin}`);
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({
          ...f,
          ...Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, v ?? ""])
          ),
        }));
        setDecoding(false);
        return;
      } else if (res.status !== 404) {
        throw new Error("Could not decode VIN (server error).");
      }
    } catch (err) {
      // fallback
    }

    // Fallback: NHTSA
    try {
      const fallbackUrl = `${FALLBACK_VIN_DECODER}/${vin}?format=json`;
      const res = await fetch(fallbackUrl);
      if (res.ok) {
        const data = await res.json();
        const parsed = parseNHTSA(data);
        if (parsed.year || parsed.make || parsed.model) {
          setForm((f) => ({ ...f, ...parsed }));
        } else {
          throw new Error("VIN could not be decoded by fallback service.");
        }
      } else {
        throw new Error("VIN not found in fallback decoder.");
      }
    } catch (err) {
      setError(
        "We couldn't decode this VIN automatically. Please enter details manually."
      );
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
      customer_id: form.customer_id, // UUID string only!
      vehicle_vin: form.vin,
      year: safeInt(form.year),
      make: form.make || undefined,
      model: form.model || undefined,
      trim: form.trim || undefined,
      body: form.body || undefined,
      engine: form.engine || undefined,
      mileage: safeInt(form.mileage),
      // Add more fields if needed
    };

    console.log("POSTing to:", `${API_BASE}/api/appraisals/`);
    console.log("Payload:", payload);

    try {
      const res = await fetch(`${API_BASE}/api/appraisals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error("Failed to create appraisal: " + detail);
      }
      if (reloadAppraisals) reloadAppraisals();
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
          name="customer_id"
          value={form.customer_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Customer</option>
          {validCustomers.length === 0 && (
            <option disabled>No customers with UUIDs found</option>
          )}
          {validCustomers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name ||
                `${c.first_name || ""} ${c.last_name || ""}`.trim()}{" "}
              {c.email ? `(${c.email})` : ""}
            </option>
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

      {/* Vehicle Details */}
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
        <button
          type="submit"
          disabled={saving}
          className="bg-electricblue text-white px-4 py-2 rounded"
        >
          {saving ? "Saving..." : "Create"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
}
