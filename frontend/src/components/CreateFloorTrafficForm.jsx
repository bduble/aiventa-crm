import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';
import CustomerPicker from './CustomerPicker'; // Use your enhanced picker!

export default function CreateFloorTrafficForm() {
  const navigate = useNavigate();

  // Set default visit_time to now (yyyy-MM-ddTHH:mm for datetime-local)
  const nowStr = new Date().toISOString().slice(0, 16);

  const [form, setForm] = useState({
    visit_time: nowStr,
    salesperson: '',
    customer_id: '',  // Must be set by picker
    vehicle: '',
    trade: '',
    demo: false,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Called by your CustomerPicker to update the customer_id
  const handleCustomerSelect = (customer) => {
    if (!customer || !customer.id) {
      console.warn("No customer selected!", customer);
      setForm((prev) => ({
        ...prev,
        customer_id: '',
      }));
      setError('You must select a customer.');
      return;
    }
    console.log("Customer selected:", customer);
    setForm((prev) => ({
      ...prev,
      customer_id: customer.id,
    }));
    setError('');
  };

  // Generic form field handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // Troubleshooting: Log all form values
    console.log("Form state on submit:", form);

    // Defensive: Check for valid customer_id
    if (!form.customer_id || typeof form.customer_id !== 'string' || form.customer_id.length < 10) {
      setError('Customer is required and must be valid.');
      setSaving(false);
      console.error('Missing or invalid customer_id:', form.customer_id);
      return;
    }

    // Optional: UUID format check (simple)
    if (!/^[0-9a-fA-F-]{36}$/.test(form.customer_id)) {
      setError('Customer ID is invalid.');
      setSaving(false);
      console.error('customer_id does not match UUID format:', form.customer_id);
      return;
    }

    // Defensive: Validate required fields
    if (!form.salesperson) {
      setError('Salesperson is required.');
      setSaving(false);
      return;
    }
    if (!form.visit_time) {
      setError('Visit time is required.');
      setSaving(false);
      return;
    }

    // Timezone: Format visit_time for backend (ensure ISO string)
    let { visit_time } = form;
    try {
      if (!visit_time.includes('T')) {
        // If user manually enters time only (not using datetime-local), construct ISO string
        const todayDate = new Date().toISOString().slice(0, 10);
        visit_time = `${todayDate}T${visit_time}`;
        visit_time = new Date(visit_time).toISOString();
      } else {
        visit_time = new Date(visit_time).toISOString();
      }
    } catch (err) {
      setError('Invalid visit time.');
      setSaving(false);
      console.error('visit_time error:', err);
      return;
    }

    // Build payload
    const floorTrafficPayload = {
      visit_time,
      salesperson: form.salesperson,
      customer_id: form.customer_id,
      vehicle: form.vehicle,
      trade: form.trade,
      demo: form.demo,
      notes: form.notes,
    };

    // Troubleshooting: log payload before insert
    console.log("Inserting floor traffic payload:", floorTrafficPayload);

    try {
      const { error: trafficErr, status, statusText } = await supabase
        .from('floor_traffic_customers')
        .insert([floorTrafficPayload]);

      // Log API response
      console.log("Supabase response:", { trafficErr, status, statusText });

      if (trafficErr) {
        throw trafficErr;
      }

      setSaving(false);
      // Optionally show toast/snackbar here
      navigate('/floor-traffic');
    } catch (err) {
      setSaving(false);
      setError(err.message || 'Failed to log visitor.');
      console.error('Supabase insert error:', err);
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

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        {/* Customer Picker */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">
            Customer <span className="text-red-500">*</span>
          </label>
          <CustomerPicker
            value={form.customer_id}
            onSelect={handleCustomerSelect}
          />
        </div>

        {/* Visit Time */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">
            Visit Time <span className="text-red-500">*</span>
          </label>
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
          <label className="block font-medium text-gray-700 dark:text-gray-200">
            Salesperson <span className="text-red-500">*</span>
          </label>
          <input
            name="salesperson"
            value={form.salesperson}
            onChange={handleChange}
            required
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
          />
        </div>

        {/* Vehicle */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">
            Vehicle
          </label>
          <input
            name="vehicle"
            value={form.vehicle}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
          />
        </div>

        {/* Trade */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">
            Trade
          </label>
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
          <label className="ml-2 font-medium text-gray-700 dark:text-gray-200">
            Demo
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">
            Notes
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 h-32"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {saving ? 'Saving...' : 'Save Visitor'}
        </button>
      </form>
    </div>
  );
}
