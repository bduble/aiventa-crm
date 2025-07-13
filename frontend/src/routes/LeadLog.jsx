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
    } catch (err) {
      console.error(err);
      setPrioritized([]);
    }
  };

  const fetchAwaiting = async () => {
    try {
      const res = await fetch(`${API_BASE}/awaiting-response`);
      setAwaiting(await res.json());
    } catch (err) {
      console.error(err);
      setAwaiting([]);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/metrics`);
      setMetrics(await res.json());
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      setAnswer('Failed to get response');
    }
  };

  useEffect(() => { fetchLeads(); }, [startDate, endDate]);
  useEffect(() => { fetchPrioritized(); fetchAwaiting(); fetchMetrics(); }, []);

  const formatDate = d => (d ? new Date(d).toLocaleDateString() : '');

  return (
    <div className="w-full min-h-screen bg-offwhite dark:bg-gray-800 px-4 pb-4 pt-8 grid gap-6 md:grid-cols-2">
      <section className="bg-white dark:bg-gray-900 shadow rounded p-4 space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI‑Powered Leads Prioritization</h2>
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Lead ID (optional)"
            value={leadId}
            onChange={e => setLeadId(e.target.value)}
            className="border p-2 rounded dark:bg-gray-900 dark:border-gray-600"
          />
          <input
            type="text"
            placeholder="Ask a question or compose message"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="border flex-1 p-2 rounded dark:bg-gray-900 dark:border-gray-600"
          />
          <button onClick={askQuestion} className="bg-electricblue text-white px-3 py-2 rounded">
            Ask ChatGPT
          </button>
        </div>
        {answer && <p className="border p-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700 whitespace-pre-wrap">{answer}</p>}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-slategray dark:bg-slategray text-white">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Last Lead Response</th>
                <th className="p-2 text-left">Last Staff Response</th>
              </tr>
            </thead>
            <tbody>
              {prioritized.map(l => (
                <tr key={l.id} className="odd:bg-gray-50 dark:odd:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="p-2 whitespace-nowrap">{l.name}</td>
                  <td className="p-2 whitespace-nowrap">{l.email}</td>
                  <td className="p-2 whitespace-nowrap">{formatDate(l.last_lead_response_at)}</td>
                  <td className="p-2 whitespace-nowrap">{formatDate(l.last_staff_response_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900 shadow rounded p-4 space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lead Log</h2>
        <div className="flex gap-4 items-end mb-2">
          <div>
            <label className="block text-sm" htmlFor="start">Start</label>
            <input id="start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-2 rounded dark:bg-gray-900 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm" htmlFor="end">End</label>
            <input id="end" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-2 rounded dark:bg-gray-900 dark:border-gray-600" />
          </div>
          <button onClick={fetchLeads} className="px-3 py-2 bg-electricblue text-white rounded">Filter</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-slategray dark:bg-slategray text-white">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Last Lead Response</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id} className="odd:bg-gray-50 dark:odd:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="p-2 whitespace-nowrap">{l.name}</td>
                  <td className="p-2 whitespace-nowrap">{l.email}</td>
                  <td className="p-2 whitespace-nowrap">{formatDate(l.created_at)}</td>
                  <td className="p-2 whitespace-nowrap">{formatDate(l.last_lead_response_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900 shadow rounded p-4 space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Awaiting Response</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-slategray dark:bg-slategray text-white">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Last Lead Response</th>
              </tr>
            </thead>
            <tbody>
              {awaiting.map(l => (
                <tr key={l.id} className="bg-red-100 dark:bg-red-900 odd:bg-red-50 dark:odd:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700">
                  <td className="p-2 whitespace-nowrap">{l.name}</td>
                  <td className="p-2 whitespace-nowrap">{l.email}</td>
                  <td className="p-2 whitespace-nowrap">{formatDate(l.last_lead_response_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900 shadow rounded p-4 space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sales Performance Metrics</h2>
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
