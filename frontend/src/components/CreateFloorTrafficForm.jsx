import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateFloorTrafficForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    timeIn: "",
    timeOut: "",
    salesperson: "",
    customerName: "",
    vehicle: "",
    trade: "",
    demo: false,
    writeUp: "",
    customerOffer: "",
    mgrTO: "",
    origin: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(__API_BASE__ + "/floor-traffic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 404) {
        throw new Error("Endpoint not found. Check your URL.");
      }
      if (res.status === 422) {
        const payload = await res.json();
        throw new Error(payload.message || "Validation failed.");
      }
      if (!res.ok) {
        throw new Error("Failed to save, please try again.");
      }
      // On success, go back to the log
      navigate("/floor-traffic");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-semibold mb-4">Log a Visitor</h2>
      {error && (
        <div className="mb-4 text-red-600 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Time In</label>
          <input
            type="time"
            name="timeIn"
            value={form.timeIn}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block font-medium">Time Out</label>
          <input
            type="time"
            name="timeOut"
            value={form.timeOut}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Salesperson */}
        <div>
          <label className="block font-medium">Salesperson</label>
          <input
            name="salesperson"
            value={form.salesperson}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md"
          />
        </div>

        {/* Customer Name */}
        <div>
          <label className="block font-medium">Customer Name</label>
          <input
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md"
          />
        </div>

        {/* Vehicle */}
        <div>
          <label className="block font-medium">Vehicle</label>
          <input
            name="vehicle"
            value={form.vehicle}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md"
          />
        </div>

        {/* Trade */}
        <div>
          <label className="block font-medium">Trade</label>
          <input
            name="trade"
            value={form.trade}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md"
          />
        </div>

        {/* Demo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="demo"
            checked={form.demo}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label className="ml-2">Demo?</label>
        </div>

        {/* Write-Up */}
        <div>
          <label className="block font-medium">Write-Up</label>
          <input
            name="writeUp"
            value={form.writeUp}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md"
          />
        </div>

        {/* Customer Offer */}
        <div>
          <label className="block font-medium">Customer Offer</label>
          <input
            name="customerOffer"
            value={form.customerOffer}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md"
          />
        </div>

        {/* Mgr TO */}
        <div>
          <label className="block font-medium">Mgr TO</label>
          <input
            name="mgrTO"
            value={form.mgrTO}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md"
          />
        </div>

        {/* Origin */}
        <div>
          <label className="block font-medium">Origin</label>
          <input
            name="origin"
            value={form.origin}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Save Visitor
        </button>
      </form>
    </div>
  );
}
