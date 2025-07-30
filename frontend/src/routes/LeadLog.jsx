import { useEffect, useState } from 'react';
import { useCustomerCard } from '../context/CustomerCardContext';

export default function LeadLog() {
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/leads`;
  const today = new Date().toISOString().split('T')[0];

  // Overlay context
  const { open } = useCustomerCard();

  // Main State
  const [leads, setLeads] = useState([]);
  const [leadsError, setLeadsError] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [prioritized, setPrioritized] = useState([]);
  const [prioritizedError, setPrioritizedError] = useState('');

  const [awaiting, setAwaiting] = useState([]);
  const [awaitingError, setAwaitingError] = useState('');

  const [metrics, setMetrics] = useState(null);
  const [metricsError, setMetricsError] = useState('');

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [leadId, setLeadId] = useState('');
  const [askError, setAskError] = useState('');

  const formatDate = d => (d ? new Date(d).toLocaleDateString() : '');

  // Fetch Functions
  const fetchLeads = async () => {
    setLeadsError('');
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const url = `${API_BASE}?${params.toString()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        setLeads([]);
        setLeadsError(`API error ${res.status}: ${await res.text()}`);
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        setLeads([]);
        setLeadsError('API did not return an array.');
        return;
      }
      setLeads(data);
    } catch (err) {
      setLeads([]);
      setLeadsError(`Fetch failed: ${err.message}`);
    }
  };

  const fetchPrioritized = async () => {
    setPrioritizedError('');
    const url = `${API_BASE}/prioritized`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        setPrioritized([]);
        setPrioritizedError(`API error ${res.status}: ${await res.text()}`);
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        setPrioritized([]);
        setPrioritizedError('API did not return an array.');
        return;
      }
      setPrioritized(data);
    } catch (err) {
      setPrioritized([]);
      setPrioritizedError(`Fetch failed: ${err.message}`);
    }
  };

  const fetchAwaiting = async () => {
    setAwaitingError('');
    const url = `${API_BASE}/awaiting-response`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        setAwaiting([]);
        setAwaitingError(`API error ${res.status}: ${await res.text()}`);
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        setAwaiting([]);
        setAwaitingError('API did not return an array.');
        return;
      }
      setAwaiting(data);
    } catch (err) {
      setAwaiting([]);
      setAwaitingError(`Fetch failed: ${err.message}`);
    }
  };

  const fetchMetrics = async () => {
    setMetricsError('');
    const url = `${API_BASE}/metrics`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        setMetrics(null);
        setMetricsError(`API error ${res.status}: ${await res.text()}`);
        return;
      }
      const data = await res.json();
      if (!data || typeof data !== 'object') {
        setMetrics(null);
        setMetricsError('API did not return an object.');
        return;
      }
      setMetrics(data);
    } catch (err) {
      setMetrics(null);
      setMetricsError(`Fetch failed: ${err.message}`);
    }
  };

  const askQuestion = async () => {
    setAskError('');
    setAnswer('');
    if (!question.trim()) {
      setAskError('Enter a question.');
      return;
    }
    const url = `${API_BASE}/ask`;
    const payload = { question, lead_id: leadId || null };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setAskError(`API error ${res.status}: ${await res.text()}`);
        setAnswer('');
        return;
      }
      const data = await res.json();
      setAnswer(data.answer || 'No response');
    } catch (err) {
      setAnswer('');
      setAskError(`Fetch failed: ${err.message}`);
    }
  };

  // Fetch triggers
  useEffect(() => { fetchLeads(); }, [startDate, endDate]);
  useEffect(() => { fetchPrioritized(); fetchAwaiting(); fetchMetrics(); }, []);
  useEffect(() => {
    console.log('[LeadLog] API_BASE:', API_BASE);
  }, [API_BASE]);

  // --- UI Render ---
  return (
    <div className="w-full min-h-screen bg-offwhite dark:bg-gray-800 px-4 pb-4 pt-8 grid gap-6 md:grid-cols-2">
      {/* Prioritized */}
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
            Ask aiVenta
          </button>
        </div>
        {askError && <div className="bg-red-100 border border-red-400 text-red-700 rounded p-2 mb-2">{askError}</div>}
        {answer && <p className="border p-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700 whitespace-pre-wrap">{answer}</p>}
        {prioritizedError && (
          <div className="bg-red-100 border border-red-400 text-red-700 rounded p-2 mb-2">{prioritizedError}</div>
        )}
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
                  <td className="p-2 whitespace-nowrap">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => open(l.customer_id || l.id)}
                      title="Open customer card"
                      type="button"
                    >
                      {l.name}
                    </button>
                  </td>
                  <td className="p-2 whitespace-nowrap">{l.email}</td>
                  <td className="p-2 whitespace-nowrap">{formatDate(l.last_lead_response_at)}</td>
                  <td className="p-2 whitespace-nowrap">{formatDate(l.last_staff_response_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lead Log */}
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
        {leadsError && (
          <div className="bg-red-100 border border-red-400 text-red-700 rounded p-2 mb-2">{leadsError}</div>
        )}
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
                  <td className="p-2 whitespace-nowrap">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => open(l.customer_id || l.id)}
                      title="Open customer card"
                      type="button"
                    >
                      {l.name}
                    </button>
                  </td>
                  <td className="p-2 whitespace-nowrap">{l.email}</td>
                  <td className="p-2 whitespace-nowrap">{formatDate(l.created_at)}</td>
                  <td className="p-2 whitespace-nowrap">{formatDate(l.last_lead_response_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Awaiting Response */}
      <section className="bg-white dark:bg-gray-900 shadow rounded p-4 space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Awaiting Response</h2>
        {awaitingError && (
          <div className="bg-red-100 border border-red-400 text-red-700 rounded p-2 mb-2">{awaitingError}</div>
        )}
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
                  <td className="p-2 whitespace-nowrap">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => open(l.customer_id || l.id)}
                      title="Open customer card"
                      type="button"
                    >
                      {l.name}
                    </button>
                  </td>
                  <td className="p-2 whitespace-nowrap">{l.email}</td>
                  <td className="p-2 whitespace-nowrap">{formatDate(l.last_lead_response_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Metrics */}
      <section className="bg-white dark:bg-gray-900 shadow rounded p-4 space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sales Performance Metrics</h2>
        {metricsError && (
          <div className="bg-red-100 border border-red-400 text-red-700 rounded p-2 mb-2">{metricsError}</div>
        )}
        {metrics && (
          <ul className="list-disc pl-5">
            <li>Total leads: {metrics.total_leads}</li>
            <li>Conversion rate: {metrics.conversion_rate}%</li>
            <li>Average response time: {Number(metrics.average_response_time).toFixed(2)} seconds</li>
            <li>Lead engagement rate: {metrics.lead_engagement_rate}%</li>
          </ul>
        )}
      </section>
    </div>
  );
}
