import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateFloorTrafficForm() {
  const navigate = useNavigate();

  // Determine API base: use VITE_API_BASE_URL or fall back to proxy
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  const [form, setForm] = useState({
    visit_time: '',
    salesperson: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    vehicle: '',
    trade: '',
    demo: false,
    notes: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Normalize visit_time to ISO string
    let { visit_time } = form;
    if (visit_time) {
      if (!visit_time.includes('T')) {
        const todayDate = new Date().toISOString().slice(0, 10);
        visit_time = `${todayDate}T${visit_time}`;
      }
      visit_time = new Date(visit_time).toISOString();
    }

    const payload = { ...form, visit_time };

    try {
      const res = await fetch(`${API_BASE}/floor-traffic/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to save visitor');
      }
      navigate('/floor-traffic');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white shadow rounded-lg p-6 mt-8 dark:bg-gray-800 dark:border dark:border-gray-700">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Log a Visitor</h2>

      {error && (
        <div className="mb-4 text-red-600 bg-red-100 border border-red-200 p-2 rounded dark:bg-red-900 dark:border-red-600 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Visit Time */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Visit Time</label>
          <input
            type="datetime-local"
            name="visit_time"
            value={form.visit_time}
            onChange={handleChange}
            required
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-600"
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
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
          />
        </div>

        {/* First Name */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">First Name</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Last Name</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
          />
        </div>

        {/* Vehicle */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Vehicle</label>
          <input
            name="vehicle"
            value={form.vehicle}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
          />
        </div>

        {/* Trade */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Trade</label>
          <input
            name="trade"
            value={form.trade}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
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
          <label className="ml-2 font-medium text-gray-700 dark:text-gray-200">Demo</label>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
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
