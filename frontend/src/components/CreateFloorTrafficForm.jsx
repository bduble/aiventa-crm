import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';


export default function CreateFloorTrafficForm() {
  const navigate = useNavigate();
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Helper: build customer display name
  const getFullName = (first, last) => {
    const fn = first?.trim() || '';
    const ln = last?.trim() || '';
    return `${fn} ${ln}`.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // 1. Normalize visit_time to ISO string
    let { visit_time } = form;
    if (visit_time) {
      if (!visit_time.includes('T')) {
        const todayDate = new Date().toISOString().slice(0, 10);
        visit_time = `${todayDate}T${visit_time}`;
      }
      visit_time = new Date(visit_time).toISOString();
    }

    // 2. Check for existing customer (by phone or email if provided)
    let customer_id = null;
    try {
      let orFilters = [];
      if (form.phone) orFilters.push(`phone.eq.${form.phone}`);
      if (form.email) orFilters.push(`email.eq.${form.email}`);

      let existingCustomer = null;
      if (orFilters.length) {
        const { data: found, error: findErr } = await supabase
          .from('customers')
          .select('*')
          .or(orFilters.join(','));
        if (findErr) throw findErr;
        if (found && found.length > 0) existingCustomer = found[0];
      }

      // 3. Insert new customer if needed
      if (existingCustomer) {
        customer_id = existingCustomer.customer_id;
      } else {
        const displayName = getFullName(form.first_name, form.last_name);
        const { data: inserted, error: insertErr } = await supabase
          .from('customers')
          .insert([
            {
              name: displayName,
              first_name: form.first_name,
              last_name: form.last_name,
              phone: form.phone || null,
              email: form.email || null,
            },
          ])
          .select();
        if (insertErr) throw insertErr;
        customer_id = inserted[0].customer_id;
      }

      // 4. Insert floor traffic record
      const floorTrafficPayload = {
        visit_time,
        salesperson: form.salesperson,
        customer_id, // foreign key
        vehicle: form.vehicle,
        trade: form.trade,
        demo: form.demo,
        notes: form.notes,
      };

      const { error: trafficErr } = await supabase
        .from('floor_traffic_customers')
        .insert([floorTrafficPayload]);
      if (trafficErr) throw trafficErr;

      setSaving(false);
      navigate('/floor-traffic');
    } catch (err) {
      setSaving(false);
      setError(err.message || 'Failed to log visitor.');
      console.error(err);
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

        {/* First Name & Last Name (both required) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Email & Phone (optional, but used for deduplication if entered) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              Phone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600"
            />
          </div>
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
