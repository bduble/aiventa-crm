import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import FloorTrafficTable from '../components/FloorTrafficTable';
import FloorTrafficModal from '../components/FloorTrafficModal';
import { Users, MailCheck, Activity, Plus, AlertTriangle } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function minutesAgo(dt) {
  return (Date.now() - new Date(dt).getTime()) / 60000;
}

export default function FloorTrafficPage() {
  const API_BASE = import.meta.env.PROD
    ? import.meta.env.VITE_API_BASE_URL
    : '/api';

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [view, setView] = useState("today"); // "today" or "week"
  const [activity, setActivity] = useState({
    salesCalls: 0,
    textMessages: 0,
    appointmentsSet: 0,
  });
  const [kpiFilter, setKpiFilter] = useState(null); // Which KPI is filtering table

  // Quick date range helpers
  const todayStr = new Date().toISOString().slice(0, 10);
  const weekAgoStr = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Date ranges for query
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Toggle view updates date range
  useEffect(() => {
    if (view === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else {
      setStartDate(weekAgoStr);
      setEndDate(todayStr);
    }
  }, [view, todayStr, weekAgoStr]);

  // Fetch floor traffic for date range
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

  // Fetch daily activity KPIs
  useEffect(() => {
    const fetchActivityMetrics = async () => {
      try {
        if (supabase) {
          const today = new Date();
          const start = view === "today"
            ? new Date(today.getFullYear(), today.getMonth(), today.getDate())
            : new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
          const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
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
          const url = view === "today"
            ? `${API_BASE}/activities/today-metrics`
            : `${API_BASE}/activities/week-metrics`;
          const res = await fetch(url);
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
  }, [API_BASE, view]);

  // KPIs & calculations
  const now = Date.now();
  const totalCustomers = rows.length;
  const inStoreCount = rows.filter(r => !r.time_out).length;
  const demoCount = rows.filter(r => r.demo).length;
  const worksheetCount = rows.filter(
    r => r.writeUp || r.worksheet || r.worksheet_complete || r.worksheetComplete || r.write_up
  ).length;
  const offerCount = rows.filter(r => r.customer_offer || r.customerOffer).length;

  // Mini-Alert 1: Customers waiting >20 min
  const waitingTooLong = rows.filter(r => !r.time_out && minutesAgo(r.visit_time) > 20);

  // Mini-Alert 2: Appointments not followed up
  // We'll define as "has appointment but no activity/note", tweak as needed
  const apptsNoFollow = rows.filter(r =>
    r.appointment && (!r.last_response_time || !r.follow_up_note)
  );

  // KPI filter logic: clicking a KPI will filter table to matching
  let filteredRows = rows;
  if (kpiFilter === "appointments") filteredRows = rows.filter(r => r.appointment);
  if (kpiFilter === "demos") filteredRows = rows.filter(r => r.demo);
  if (kpiFilter === "offers") filteredRows = rows.filter(r => r.customer_offer || r.customerOffer);

  // --- KPI Card style ---
  const kpiClass = (active) =>
    `flex-1 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-transform cursor-pointer
    bg-gradient-to-br from-electricblue via-darkblue to-slategray text-white 
    ${active ? "ring-4 ring-electricblue scale-105" : ""}`;

  // -- Day/Week Toggle --
  const toggleClass = (on) =>
    `px-4 py-2 rounded-full font-bold transition-colors
    ${on ? "bg-electricblue text-white shadow-md" : "bg-white text-electricblue border border-electricblue"}`;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4 flex items-center justify-between">
        Floor Traffic
        {/* Quick Add Button */}
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-bold shadow-lg text-lg flex items-center gap-2 transition-all"
          style={{ float: 'right', position: 'relative', zIndex: 10 }}
          onClick={() => { setModalOpen(true); setEditing(null); }}
        >
          <Plus className="w-5 h-5" />
          Quick Add
        </button>
      </h1>

      {/* Day/Week Toggle */}
      <div className="flex gap-2 mb-6">
        <button className={toggleClass(view === "today")} onClick={() => setView("today")}>
          Today
        </button>
        <button className={toggleClass(view === "week")} onClick={() => setView("week")}>
          This Week
        </button>
      </div>

      {/* Mini Alerts */}
      <div className="flex gap-4 mb-4">
        {waitingTooLong.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 animate-pulse font-semibold border-l-4 border-yellow-500">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            ⚡ {waitingTooLong.length} customer{waitingTooLong.length > 1 ? 's' : ''} waiting &gt;20 min
          </div>
        )}
        {apptsNoFollow.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 border-l-4 border-red-500 animate-bounce font-semibold">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {apptsNoFollow.length} appointment{apptsNoFollow.length > 1 ? 's' : ''} not followed up
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className={kpiClass(kpiFilter === null)} onClick={() => setKpiFilter(null)}>
          <div className="flex items-center gap-2 opacity-90">
            <Users className="w-5 h-5" />
            <p className="uppercase tracking-wider text-sm font-medium">Visitors</p>
          </div>
          <p className="text-3xl font-bold mt-2">{totalCustomers}</p>
          <p className="text-sm text-white/80">{inStoreCount} currently in store</p>
          <ul className="mt-2 space-y-1 text-sm text-white/90">
            <li onClick={e => { e.stopPropagation(); setKpiFilter("demos"); }}
                className="cursor-pointer hover:underline flex items-center gap-1">
              {demoCount} demos {kpiFilter === "demos" && <span className="bg-green-100 text-green-700 px-2 rounded ml-2">HOT</span>}
            </li>
            <li onClick={e => { e.stopPropagation(); setKpiFilter("offers"); }}
                className="cursor-pointer hover:underline flex items-center gap-1">
              {offerCount} offers {kpiFilter === "offers" && <span className="bg-orange-100 text-orange-700 px-2 rounded ml-2">↑</span>}
            </li>
          </ul>
        </div>
        <div className={kpiClass(kpiFilter === "appointments")} onClick={() => setKpiFilter("appointments")}>
          <div className="flex items-center gap-2 opacity-90">
            <Activity className="w-5 h-5" />
            <p className="uppercase tracking-wider text-sm font-medium">
              Appointments Set
            </p>
          </div>
          <p className="text-3xl font-bold mt-2">{activity.appointmentsSet}</p>
          <p className="text-sm text-white/80">Today{view === "week" && " (7d)"}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-xs">
            Click to filter
          </span>
        </div>
        <div className={kpiClass()} style={{ background: 'linear-gradient(135deg, #34d399 0%, #60a5fa 100%)' }}>
          <div className="flex items-center gap-2 opacity-90">
            <MailCheck className="w-5 h-5" />
            <p className="uppercase tracking-wider text-sm font-medium">Leads</p>
          </div>
          <ul className="mt-4 space-y-1 text-sm text-white/90">
            <li>{activity.salesCalls} Sales Calls</li>
            <li>{activity.textMessages} Text Messages</li>
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
          rows={filteredRows}
          onEdit={row => {
            setEditing(row);
            setModalOpen(true);
          }}
          onToggle={(id, field, value) => {
            setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
            // ...the rest of your update logic here...
          }}
        />
      )}

      <FloorTrafficModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={async data => {
          if (!editing) return;
          // ...your update logic...
          setRows(prev => prev.map(r => (r.id === editing.id ? { ...r, ...data } : r)));
          setModalOpen(false);
          setEditing(null);
        }}
        initialData={editing}
      />
    </div>
  );
}
