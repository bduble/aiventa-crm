import { useEffect, useState } from 'react';

export default function LeadLog() {
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/leads`;
  const [leads, setLeads] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, lead: null, channel: 'email' });

  const fetchLeads = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    try {
      const res = await fetch(`${API_BASE}?${params.toString()}`);
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error('Failed to fetch leads', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [startDate, endDate]);

  const openModal = (lead) => {
    setModal({ open: true, lead, channel: lead.last_lead_response_channel || 'email' });
  };

  const markResponded = async () => {
    if (!modal.lead) return;
    await fetch(`${API_BASE}/${modal.lead.id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: modal.channel }),
    });
    setModal({ open: false, lead: null, channel: 'email' });
    fetchLeads();
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Lead Log</h2>
      <p className="text-sm text-gray-600">Leads are potential customers who have submitted their information online or by phone.</p>

      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm" htmlFor="start">Start</label>
          <input id="start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm" htmlFor="end">End</label>
          <input id="end" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-2 rounded" />
        </div>
        <button onClick={fetchLeads} className="px-3 py-2 bg-electricblue text-white rounded">Filter</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border divide-y">
          <thead className="bg-slategray text-white">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Source</th>
              <th className="p-2 text-left">Vehicle</th>
              <th className="p-2 text-left">Trade-In</th>
              <th className="p-2 text-left">Last Response</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id} className={`${l.outstandingResponse ? 'animate-pulse bg-red-100' : ''}`}>
                <td className="p-2 whitespace-nowrap">{l.name}</td>
                <td className="p-2 whitespace-nowrap">{l.source}</td>
                <td className="p-2 whitespace-nowrap">{l.vehicle_interest || '—'}</td>
                <td className="p-2 whitespace-nowrap">{l.trade_vehicle || '—'}</td>
                <td className="p-2 whitespace-nowrap">
                  {l.last_lead_response_channel ? `${l.last_lead_response_channel} @ ${new Date(l.last_lead_response_at).toLocaleString()}` : '—'}
                </td>
                <td className="p-2">
                  <button onClick={() => openModal(l)} className="px-2 py-1 bg-electricblue text-white rounded">Respond</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded space-y-4 w-80">
            <h3 className="text-lg font-semibold">Mark Responded</h3>
            <div>
              <label className="block text-sm mb-1" htmlFor="channel">Channel</label>
              <select id="channel" value={modal.channel} onChange={e => setModal({ ...modal, channel: e.target.value })} className="border p-2 rounded w-full">
                {['email','text','phone'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal({ open: false, lead: null, channel: 'email' })} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={markResponded} className="px-3 py-2 bg-electricblue text-white rounded">Mark Responded</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
