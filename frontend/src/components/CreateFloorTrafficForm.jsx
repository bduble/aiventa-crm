// frontend/src/components/CreateFloorTrafficForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function CreateFloorTrafficForm() {
  const navigate = useNavigate();
  const API = `${import.meta.env.VITE_API_BASE_URL}/floor-traffic/`;

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name) {
      toast.error("First + last name are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Visitor logged!");
      navigate("/floor-traffic");
    } catch (err) {
      console.error(err);
      toast.error("Could not save visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded shadow max-w-md mx-auto">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4">Log a Floor Visitor</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { name: "first_name", label: "First Name" },
          { name: "last_name", label: "Last Name" },
          { name: "email", label: "Email (optional)" },
          { name: "phone", label: "Phone (optional)" },
        ].map(({ name, label }) => (
          <div key={name}>
            <label className="block mb-1">{label}</label>
            <input
              name={name}
              value={form[name]}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}
        <div>
          <label className="block mb-1">Notes (optional)</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-electricblue text-white rounded disabled:opacity-50"
        >
          {loading ? "Saving…" : "Log Visitor"}
        </button>
      </form>
    </div>
  );
}
