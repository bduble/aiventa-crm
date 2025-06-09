import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const API = import.meta.env.VITE_API_BASE_URL + '/leads/';

  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => setLeads(data))
      .catch((err) => console.error('Error fetching leads:', err));
  }, []);

  const submit = () => {
    if (!form.name) return;
    setLoading(true);
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((newLead) => {
        setLeads([newLead, ...leads]);
        setForm({ name: '', email: '', phone: '', source: '', notes: '' });
        toast.success('Lead added!');
      })
      .catch(() => toast.error('Failed to add lead'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-8 bg-white rounded shadow space-y-6 overflow-auto">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold">Leads</h2>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['name', 'email', 'phone', 'source', 'notes'].map((key) => (
          <input
            key={key}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring"
          />
        ))}
        <button
          onClick={submit}
          disabled={!form.name || loading}
          className="col-span-full md:col-span-1 px-4 py-2 bg-electricblue text-white rounded disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Lead'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-slategray text-white">
            <tr>
              {['Name', 'Email', 'Phone', 'Source', 'Notes', 'Created At'].map((col) => (
                <th key={col} className="py-2 px-4 text-left whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b">
                <td className="py-2 px-4">{l.name}</td>
                <td className="py-2 px-4">{l.email || '—'}</td>
                <td className="py-2 px-4">{l.phone || '—'}</td>
                <td className="py-2 px-4">{l.source || '—'}</td>
                <td className="py-2 px-4">{l.notes || '—'}</td>
                <td className="py-2 px-4 whitespace-nowrap">
                  {new Date(l.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
