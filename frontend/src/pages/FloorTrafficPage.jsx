import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import FloorTrafficTable from '../components/FloorTrafficTable';
import FloorTrafficModal from '../components/FloorTrafficModal';
import { Users, MailCheck, Activity } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Create the client once at module load to avoid multiple instances
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function FloorTrafficPage() {
  const API_BASE = import.meta.env.PROD
    ? import.meta.env.VITE_API_BASE_URL
    : '/api';

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [activity, setActivity] = useState({
    salesCalls: 0,
    textMessages: 0,
    appointmentsSet: 0,
  });

  useEffect(() => {
    const fetchRange = async () => {
      setLoading(true);
      setError('');

      try {
        if (supabase) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const endIso = new Date(end.getTime());
          endIso.setDate(endIso.getDate() + 1);
          const { data, error: err } = await supabase
            .from('floor_traffic_customers')
            .select('*')
            .gte('visit_time', start.toISOString())
            .lt('visit_time', endIso.toISOString())
            .order('visit_time', { ascending: true });
          if (err) throw err;
          setRows(data || []);
        } else {
          const params = new URLSearchParams({ start: startDate, end: endDate });
          const res = await fetch(`${API_BASE}/floor-traffic/search?${params}`);
          if (!res.ok) throw new Error('Failed to load traffic');
          const data = await res.json();
          setRows(data || []);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load traffic');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRange();
  }, [API_BASE, startDate, endDate]);

  useEffect(() => {
    const fetchActivityMetrics = async () => {
      try {
        if (supabase) {
          const today = new Date();
          const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const end = new Date(start);
          end.setDate(end.getDate() + 1);
          const { data, error: err } = await supabase
            .from('activities')
            .select('activity_type')
            .gte('created_at', start.toISOString())
            .lt('created_at', end.toISOString());
          if (err) throw err;
          const counts = { salesCalls: 0, textMessages: 0, appointmentsSet: 0 };
          for (const row of data || []) {
            const t = String(row.activity_type || '').toLowerCase();
            if (t.includes('call')) counts.salesCalls++;
            else if (t.includes('text')) counts.textMessages++;
            else if (t.includes('appointment')) counts.appointmentsSet++;
          }
          setActivity(counts);
        } else {
          const res = await fetch(`${API_BASE}/activities/today-metrics`);
          if (!res.ok) throw new Error('Failed to load activity metrics');
          const data = await res.json();
          setActivity({
            salesCalls: data.sales_calls ?? data.salesCalls ?? 0,
            textMessages: data.text_messages ?? data.textMessages ?? 0,
            appointmentsSet: data.appointments_set ?? data.appointmentsSet ?? 0,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchActivityMetrics();
  }, [API_BASE]);

  const responded = rows.filter(r => r.last_response_time).length;
  const unresponded = rows.length - responded;

  const totalCustomers = rows.length;
  const inStoreCount = rows.filter(r => !r.time_out).length;
  const demoCount = rows.filter(r => r.demo).length;
  const worksheetCount = rows.filter(
    r => r.writeUp || r.worksheet || r.worksheet_complete || r.worksheetComplete || r.write_up
  ).length;
  const offerCount = rows.filter(r => r.customer_offer || r.customerOffer).length;

  const handleToggle = async (id, field, value) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
    const payload = { [field]: value };
    try {
      if (supabase) {
        const { error: err } = await supabase
          .from('floor_traffic_customers')
          .update(payload)
          .eq('id', id);
        if (err) throw err;
      } else {
        await fetch(`${API_BASE}/floor-traffic/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async data => {
    if (!editing) return;
    try {
      if (supabase) {
        const { error: err } = await supabase
          .from('floor_traffic_customers')
          .update(data)
          .eq('id', editing.id);
        if (err) throw err;
      } else {
        await fetch(`${API_BASE}/floor-traffic/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          keepalive: true,
        });
      }
      setRows(prev => prev.map(r => (r.id === editing.id ? { ...r, ...data } : r)));
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
    }
  };

  const pct = count => (totalCustomers ? Math.round((count / totalCustomers) * 100) : 0);

  const kpiClass =
    'flex-1 rounded-3xl p-6 bg-gradient-to-br from-electricblue via-darkblue to-slategray text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-transform';

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Floor Traffic</h1>

      <div className="flex items-center gap-2">
        <label className="text-sm">Start:</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <label className="text-sm">End:</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      {!supabase && (
        <p className="mt-4 text-yellow-700">
          Supabase is not configured. Falling back to the API server.
          Ensure VITE_SUPABASE_URL and VITE_SUPABASE_KEY are set if you wish to
          query Supabase directly.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className={kpiClass}>
          <div className="flex items-center gap-2 opacity-90">
            <Users className="w-5 h-5" />
            <p className="uppercase tracking-wider text-sm font-medium">
              Visitors
            </p>
          </div>
          <p className="text-3xl font-bold mt-2">{totalCustomers}</p>
          <p className="text-sm text-white/80">{inStoreCount} currently in store</p>
          <ul className="mt-2 space-y-1 text-sm text-white/90">
            <li>
              {totalCustomers} customers ({pct(totalCustomers)}%)
            </li>
            <li>
              {demoCount} demos ({pct(demoCount)}%)
            </li>
            <li>
              {worksheetCount} worksheets ({pct(worksheetCount)}%)
            </li>
            <li>
              {offerCount} offers ({pct(offerCount)}%)
            </li>
          </ul>
        </div>
        <div className={kpiClass}>
          <div className="flex items-center gap-2 opacity-90">
            <MailCheck className="w-5 h-5" />
            <p className="uppercase tracking-wider text-sm font-medium">Leads</p>
          </div>
          <ul className="mt-4 space-y-1 text-sm text-white/90">
            <li>{responded} responded</li>
            <li>{unresponded} unresponded</li>
          </ul>
        </div>
        <div className={kpiClass}>
          <div className="flex items-center gap-2 opacity-90">
            <Activity className="w-5 h-5" />
            <p className="uppercase tracking-wider text-sm font-medium">
              Today's Activity
            </p>
          </div>
          <ul className="mt-4 space-y-1 text-sm text-white/90">
            <li>{activity.salesCalls} Sales Calls</li>
            <li>{activity.textMessages} Text Messages</li>
            <li>{activity.appointmentsSet} Appointments Set</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {loading ? (
        <div className="p-4">Loading…</div>
      ) : (
        <FloorTrafficTable
          rows={rows}
          onEdit={row => {
            setEditing(row);
            setModalOpen(true);
          }}
          onToggle={handleToggle}
        />
      )}

      <FloorTrafficModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initialData={editing}
      />
    </div>
  );
}
