import { useState } from 'react';

export default function AddCustomerModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', stage: 'New' });
  if (!open) return null;

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
    setForm({ name: '', phone: '', email: '', stage: 'New' });
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form className="bg-white rounded-2xl shadow-xl p-8 min-w-[340px] flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="text-xl font-bold mb-2">Add New Customer</div>
        <input name="name" required placeholder="Name" value={form.name} onChange={handleChange} className="border px-3 py-2 rounded" />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="border px-3 py-2 rounded" />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border px-3 py-2 rounded" />
        <select name="stage" value={form.stage} onChange={handleChange} className="border px-3 py-2 rounded">
          <option>New</option><option>Active</option><option>Sold</option><option>Service</option><option>Lost</option>
        </select>
        <div className="flex gap-2 mt-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700">Save</button>
          <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-xl">Cancel</button>
        </div>
      </form>
    </div>
  );
}
