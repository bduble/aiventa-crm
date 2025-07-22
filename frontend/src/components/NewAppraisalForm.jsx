import { useState } from "react";
import { API_BASE, FALLBACK_VIN_DECODER } from "./apiBase"; // adjust path as needed

// Debug: See if variables are correct in your browser console
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("API_BASE:", API_BASE);

// Helper: safely parse integer or return undefined
function safeInt(val) {
  if (val === undefined || val === null) return undefined;
  const num = Number(val);
  return !isNaN(num) && Number.isFinite(num) ? num : undefined;
}

// Helper: parse NHTSA (fallback) data to your shape
function parseNHTSA(data) {
  const r = Array.isArray(data.Results) ? data.Results[0] : {};
  return {
    year: r.ModelYear || "",
    make: r.Make || "",
    model: r.Model || "",
    trim: r.Trim || "",
    body: r.BodyClass || "",
    engine: r.EngineModel || "",
    // Add more as needed, but don't submit non-schema fields
  };
}

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

    // Attempt primary backend decode first
    try {
      const res = await fetch(`${API_BASE}/api/vin/decode/${vin}`);
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({
          ...f,
          ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ""])),
        }));
        setDecoding(false);
        return;
      } else if (res.status !== 404) {
        throw new Error("Could not decode VIN (server error).");
      }
    } catch (err) {
      // Continue to fallback
    }

    // Fallback: Try public NHTSA decoder (or another backup)
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

    // Only include fields present in your Supabase schema
    const payload = {
      vehicle_vin: form.vin,
      customer_id: form.customerId, // UUID, don't use safeInt for UUIDs!
      year: safeInt(form.year),
      make: form.make || undefined,
      model: form.model || undefined,
      trim: form.trim || undefined,
      engine: form.engine || undefined,
      mileage: safeInt(form.mileage),
      // Add other fields your backend expects as needed
    };

    // Debugging output
    console.log("POSTing to:", `${API_BASE}/api/appraisals/`);
    console.log("Payload:", payload);

    try {
      const res = await fetch(`${API_BASE}/api/appraisals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
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
