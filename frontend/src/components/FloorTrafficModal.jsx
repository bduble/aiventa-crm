import { useState, useEffect } from 'react';
import CustomerPicker from './CustomerPicker';

export default function FloorTrafficModal({ isOpen, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    customer_id: '',
    salesperson: '',
    vehicle: '',
    trade: '',
    demo: false,
    worksheet: false,
    customer_offer: false,
    sold: false,
    notes: '',
  });

  // Populate initial data if editing
  useEffect(() => {
    if (initialData) {
      setForm({
        customer_id: initialData.customer_id || '',
        salesperson: initialData.salesperson || '',
        vehicle: initialData.vehicle || '',
        trade: initialData.trade || '',
        demo: !!initialData.demo,
        worksheet:
          !!initialData.worksheet ||
          !!initialData.writeUp ||
          !!initialData.worksheet_complete ||
          !!initialData.worksheetComplete ||
          !!initialData.write_up,
        customer_offer: !!initialData.customer_offer || !!initialData.customerOffer,
        sold: !!initialData.sold,
        notes: initialData.notes || '',
      });
    } else {
      setForm({
        customer_id: '',
        salesperson: '',
        vehicle: '',
        trade: '',
        demo: false,
        worksheet: false,
        customer_offer: false,
        sold: false,
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // This will be called by your customer picker component
  const handleCustomerSelect = customer => {
    setForm(f => ({ ...f, customer_id: customer?.id || '' }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.customer_id) {
      alert('Customer is required.');
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded w-full max-w-xl space-y-4">
        <h3 className="text-lg font-semibold">Floor Traffic Entry</h3>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          {/* Customer Picker */}
          <div>
            <label className="block text-sm mb-1">Customer</label>
            <CustomerPicker
              value={form.customer_id}
              onSelect={handleCustomerSelect}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Salesperson</label>
              <input name="salesperson" value={form.salesperson} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm mb-1">Vehicle</label>
              <input name="vehicle" value={form.vehicle} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Trade</label>
              <input name="trade" value={form.trade} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="demo" checked={form.demo} onChange={handleChange} /> Demo
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="worksheet" checked={form.worksheet} onChange={handleChange} /> Worksheet
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="customer_offer" checked={form.customer_offer} onChange={handleChange} /> Offer
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="sold" checked={form.sold} onChange={handleChange} /> Sold
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded px-2 py-1 h-32" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-3 py-2 bg-electricblue text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
