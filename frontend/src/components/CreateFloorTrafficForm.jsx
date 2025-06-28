import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateFloorTrafficForm() {
  const navigate = useNavigate();

  // Determine API base: use VITE_API_BASE_URL in production; use proxy in development
  const API_BASE = import.meta.env.PROD
    ? import.meta.env.VITE_API_BASE_URL
    : "/api";

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
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // The FastAPI backend expects a trailing slash while Express
      // tolerates it, so include the slash to work with both.
      const payload = {
        ...form,
        // Include aliases expected by the FastAPI backend
        visit_time: form.timeIn,
        customer_name: form.customerName,
      };
      const res = await fetch(`${API_BASE}/floor-traffic/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        throw new Error("Endpoint not found – check your URL");
      }
      if (res.status === 405) {
        throw new Error("That URL exists but does not accept POST");
      }
      if (res.status === 422) {
        const payload = await res.json();
        const msg =
          payload.message ||
          (typeof payload.detail === "string" ? payload.detail : undefined);
        throw new Error(msg || "Validation failed");
      }
      if (!res.ok) {
        throw new Error("Failed to save, please try again.");
      }

      navigate("/floor-traffic");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white shadow rounded-lg p-6 mt-8 dark:bg-gray-800 dark:border dark:border-gray-700">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Log a Visitor
      </h2>

      {error && (
        <div className="mb-4 text-red-600 bg-red-100 border border-red-200 p-2 rounded dark:bg-red-900 dark:border-red-600 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Time In */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Time In</label>
          <input
            type="time"
            name="timeIn"
            value={form.timeIn}
            onChange={handleChange}
            required
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 dark:text-gray-100"
          />
        </div>
        {/* Time Out */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Time Out</label>
          <input
            type="time"
            name="timeOut"
            value={form.timeOut}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 dark:text-gray-100"
          />
        </div>
        {/* Salesperson */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Salesperson</label>
          <input
            name="salesperson"
            value={form.salesperson}
            onChange={handleChange}
            required
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        {/* Customer Name */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Customer Name</label>
          <input
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            required
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        {/* Vehicle */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Vehicle</label>
          <input
            name="vehicle"
            value={form.vehicle}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        {/* Trade */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Trade</label>
          <input
            name="trade"
            value={form.trade}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        {/* Demo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="demo"
            checked={form.demo}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded dark:border-gray-600"
          />
          <label className="ml-2 font-medium text-gray-700 dark:text-gray-200">Demo?</label>
        </div>
        {/* Write-Up */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Write-Up</label>
          <input
            name="writeUp"
            value={form.writeUp}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        {/* Customer Offer */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Customer Offer</label>
          <input
            name="customerOffer"
            value={form.customerOffer}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        {/* Mgr TO */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Mgr TO</label>
          <input
            name="mgrTO"
            value={form.mgrTO}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        {/* Origin */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Origin</label>
          <input
            name="origin"
            value={form.origin}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Save Visitor
        </button>
      </form>
    </div>
  );
}
