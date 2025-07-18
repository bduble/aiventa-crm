import { useState, useEffect } from 'react';

export default function FloorTrafficModal({ isOpen, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    salesperson: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    vehicle: '',
    trade: '',
    demo: false,
    worksheet: false,
    customer_offer: false,
    sold: false,
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        salesperson: initialData.salesperson || '',
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
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
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded w-full max-w-xl space-y-4">
        <h3 className="text-lg font-semibold">Edit Customer</h3>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
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
              <label className="block text-sm mb-1">First Name</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm mb-1">Last Name</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Trade</label>
              <input name="trade" value={form.trade} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="flex items-center gap-2 mt-5">
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
