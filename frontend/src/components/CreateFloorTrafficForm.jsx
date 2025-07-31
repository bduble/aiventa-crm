import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';
import CustomerPicker from './CustomerPicker'; // You will need a customer picker!

export default function CreateFloorTrafficForm() {
  const navigate = useNavigate();

  // Set default visit_time to now (yyyy-MM-ddTHH:mm for datetime-local)
  const nowStr = new Date().toISOString().slice(0, 16);

  const [form, setForm] = useState({
    visit_time: nowStr,
    salesperson: '',
    customer_id: '',  // This is the ONLY customer field now
    vehicle: '',
    trade: '',
    demo: false,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Called by your customer picker to update the customer_id
  const handleCustomerSelect = (customer) => {
    setForm((prev) => ({
      ...prev,
      customer_id: customer.id,
    }));
  };

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
    setSaving(true);

    try {
      if (!form.customer_id) {
        setError('Customer is required.');
        setSaving(false);
        return;
      }
      let { visit_time } = form;
      if (!visit_time || visit_time.trim() === '') {
        visit_time = new Date().toISOString();
      } else if (!visit_time.includes('T')) {
        const todayDate = new Date().toISOString().slice(0, 10);
        visit_time = `${todayDate}T${visit_time}`;
        visit_time = new Date(visit_time).toISOString();
      } else {
        visit_time = new Date(visit_time).toISOString();
      }

      const floorTrafficPayload = {
        visit_time,
        salesperson: form.salesperson,
        customer_id: form.customer_id,
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
