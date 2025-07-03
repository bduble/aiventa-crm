import { useEffect, useState } from 'react';

export default function LeadLog() {
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/leads`;
  const today = new Date().toISOString().split('T')[0];

  const [leads, setLeads] = useState([]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [prioritized, setPrioritized] = useState([]);
  const [awaiting, setAwaiting] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [leadId, setLeadId] = useState('');

  const fetchLeads = async () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    try {
      const res = await fetch(`${API_BASE}?${params.toString()}`);
      setLeads(await res.json());
    } catch (err) {
      console.error(err);
      setLeads([]);
    }
  };

  const fetchPrioritized = async () => {
    try {
      const res = await fetch(`${API_BASE}/prioritized`);
      setPrioritized(await res.json());
    } catch (e) {
      setPrioritized([]);
    }
  };

  const fetchAwaiting = async () => {
    try {
      const res = await fetch(`${API_BASE}/awaiting-response`);
      setAwaiting(await res.json());
    } catch (e) {
      setAwaiting([]);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/metrics`);
      setMetrics(await res.json());
    } catch (e) {
      setMetrics(null);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lead_id: leadId || null }),
      });
      const data = await res.json();
      setAnswer(data.answer || 'No response');
    } catch (e) {
      setAnswer('Failed to get response');
    }
  };

  useEffect(() => { fetchLeads(); }, [startDate, endDate]);
  useEffect(() => { fetchPrioritized(); fetchAwaiting(); fetchMetrics(); }, []);

  return (
    <div className="space-y-8 p-4">
      <section>
        <h2 className="text-2xl font-bold mb-2">AI‑Powered Leads Prioritization</h2>
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Lead ID (optional)"
            value={leadId}
            onChange={e => setLeadId(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Ask a question or compose message"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="border flex-1 p-2 rounded"
          />
          <button onClick={askQuestion} className="bg-electricblue text-white px-3 py-2 rounded">
            Ask ChatGPT
          </button>
        </div>
        {answer && <p className="border p-2 rounded bg-gray-50 whitespace-pre-wrap">{answer}</p>}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border divide-y">
            <thead className="bg-slategray text-white">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {prioritized.map(l => (
                <tr key={l.id}>
                  <td className="p-2 whitespace-nowrap">{l.name}</td>
                  <td className="p-2 whitespace-nowrap">{l.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-2">Lead Log</h2>
        <div className="flex gap-4 items-end mb-2">
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
                <th className="p-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id}>
                  <td className="p-2 whitespace-nowrap">{l.name}</td>
                  <td className="p-2 whitespace-nowrap">{l.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-2">Awaiting Response</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border divide-y">
            <thead className="bg-slategray text-white">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {awaiting.map(l => (
                <tr key={l.id} className="bg-red-100">
                  <td className="p-2 whitespace-nowrap">{l.name}</td>
                  <td className="p-2 whitespace-nowrap">{l.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-2">Sales Performance Metrics</h2>
        {metrics && (
          <ul className="list-disc pl-5">
            <li>Total leads: {metrics.total_leads}</li>
            <li>Conversion rate: {metrics.conversion_rate}%</li>
            <li>Average response time: {metrics.average_response_time.toFixed(2)} seconds</li>
            <li>Lead engagement rate: {metrics.lead_engagement_rate}%</li>
          </ul>
        )}
      </section>
    </div>
  );
}
