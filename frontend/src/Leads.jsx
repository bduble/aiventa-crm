import { useState, useEffect } from 'react';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    notes: ''
  });

  useEffect(() => {
    fetch(\`\${import.meta.env.VITE_API_BASE_URL}/leads\`)
      .then(r => r.json())
      .then(setLeads)
      .catch(console.error);
  }, []);

  const submit = () => {
    fetch(\`\${import.meta.env.VITE_API_BASE_URL}/leads\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(r => r.json())
      .then(newLead => {
        setLeads([newLead, ...leads]);
        setForm({ name: '', email: '', phone: '', source: '', notes: '' });
      })
      .catch(console.error);
  };

  return (
    <div className="p-8 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Leads</h2>
      <div className="mb-6 space-y-2">
        {['name','email','phone','source','notes'].map((key) => (
          <input
            key={key}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={form[key]}
            onChange={e => setForm({ ...form, [key]: e.target.value })}
            className="block w-full p-2 border rounded"
          />
        ))}
        <button onClick={submit} className="px-4 py-2 bg-electricblue text-white rounded">
          Add Lead
        </button>
      </div>
      <ul className="space-y-2">
        {leads.map(l => (
          <li key={l.id} className="border p-4 rounded">
            <strong>{l.name}</strong><br/>
            <span className="text-sm">{l.email} | {l.phone}</span><br/>
            <em className="text-xs">Source: {l.source}</em><br/>
            <p className="mt-1">{l.notes}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
