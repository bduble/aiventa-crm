import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from "framer-motion";
import FloorTrafficTable from '../components/FloorTrafficTable';
import FloorTrafficModal from '../components/FloorTrafficModal';
import { Users, MailCheck, Activity, Plus, ArrowUp, ArrowDown, X, Sun, Moon } from 'lucide-react';

// --- THEME SWITCH ---
const getInitialTheme = () =>
  localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const getUrgentAlerts = (rows) => {
  const now = Date.now();
  const waiting = rows.filter(r => !r.time_out && (now - new Date(r.visit_time)) / 60000 > 20);
  const apptsNotFollowed = rows.filter(r => r.appointment && !r.followed_up);
  const alerts = [];
  if (waiting.length > 0) alerts.push(`⚡ ${waiting.length} customers have been waiting >20 min!`);
  if (apptsNotFollowed.length > 0) alerts.push(`🕒 ${apptsNotFollowed.length} appointments not yet followed up.`);
  return alerts;
};

function AnimatedNumber({ value, className = "" }) {
  // Smooth counter using framer-motion
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0.5, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      key={value}
    >
      <motion.span
        animate={{ count: value }}
        transition={{ duration: 0.8, type: "tween" }}
        >
        {value}
      </motion.span>
    </motion.span>
  );
}

export default function FloorTrafficPage() {
  const API_BASE = import.meta.env.PROD
    ? import.meta.env.VITE_API_BASE_URL
    : '/api';

  const [theme, setTheme] = useState(getInitialTheme());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('today'); // today|week
  const [filterBy, setFilterBy] = useState('');
  const todayStr = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [activity, setActivity] = useState({
    salesCalls: 0,
    textMessages: 0,
    appointmentsSet: 0,
  });

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch traffic
  useEffect(() => {
    const fetchRange = async () => {
      setLoading(true); setError('');
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
        setError('Failed to load traffic');
        setRows([]);
      } finally { setLoading(false); }
    };
    fetchRange();
  }, [API_BASE, startDate, endDate]);

  // Fetch activity metrics (today/week)
  useEffect(() => {
    const fetchActivityMetrics = async () => {
      try {
        if (supabase) {
          let start, end;
          if (view === "today") {
            const today = new Date();
            start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            end = new Date(start);
            end.setDate(end.getDate() + 1);
          } else {
            const today = new Date();
            const day = today.getDay() || 7;
            start = new Date(today);
            start.setDate(today.getDate() - day + 1);
            end = new Date(today);
            end.setDate(start.getDate() + 7);
          }
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
          const res = await fetch(`${API_BASE}/activities/${view}-metrics`);
          if (!res.ok) throw new Error('Failed to load activity metrics');
          const data = await res.json();
          setActivity({
            salesCalls: data.sales_calls ?? data.salesCalls ?? 0,
            textMessages: data.text_messages ?? data.textMessages ?? 0,
            appointmentsSet: data.appointments_set ?? data.appointmentsSet ?? 0,
          });
        }
      } catch (err) {}
    };
    fetchActivityMetrics();
  }, [API_BASE, view]);

  // Derived stats
  const responded = rows.filter(r => r.last_response_time).length;
  const unresponded = rows.length - responded;
  const totalCustomers = rows.length;
  const inStoreCount = rows.filter(r => !r.time_out).length;
  const demoCount = rows.filter(r => r.demo).length;
  const worksheetCount = rows.filter(
    r => r.writeUp || r.worksheet || r.worksheet_complete || r.worksheetComplete || r.write_up
  ).length;
  const offerCount = rows.filter(r => r.customer_offer || r.customerOffer).length;
  const urgentAlerts = getUrgentAlerts(rows);

  // Quick add handler
  const handleQuickAdd = () => setModalOpen(true);

  // Table filter
  const filteredRows = filterBy
    ? rows.filter(r =>
        filterBy === 'appointments'
          ? r.activity_type?.toLowerCase().includes('appointment') || r.appointment
          : filterBy === 'calls'
          ? r.activity_type?.toLowerCase().includes('call')
          : filterBy === 'texts'
          ? r.activity_type?.toLowerCase().includes('text')
          : true
      )
    : rows;

  // KPI card
  const kpiClass =
    'flex-1 min-w-[140px] rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-electricblue via-darkblue to-slategray text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-transform relative cursor-pointer outline-none focus:ring-2 focus:ring-blue-400';

  return (
    <div className={`pt-20 p-2 sm:p-6 space-y-4 max-w-6xl mx-auto ${theme === "dark" ? "bg-[#181f2a] text-gray-100" : "bg-[#f9f9f9] text-gray-900"}`}>

      {/* THEME SWITCH */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed z-50 top-6 right-6 bg-white/80 dark:bg-black/50 rounded-full p-2 border shadow hover:scale-110 transition"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
      </button>

      {/* Quick Add floating */}
      <button
        onClick={handleQuickAdd}
        className="fixed z-50 right-5 top-[82px] sm:top-[92px] bg-green-500 hover:bg-green-600 text-white shadow-xl px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-all border-4 border-white"
        style={{ boxShadow: "0 8px 24px 0 rgba(20,120,70,0.17)" }}
      >
        <Plus className="w-5 h-5" /> Quick Add
      </button>

      {/* Alerts */}
      {urgentAlerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {urgentAlerts.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.95, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded animate-pulse"
            >
              <span className="font-semibold">{msg}</span>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <h1 className="text-3xl font-bold tracking-tight">Floor Traffic</h1>
        <div className="flex gap-2 items-center">
          {/* Toggle Today/Week */}
          <button
            onClick={() => setView('today')}
            className={`px-3 py-1 rounded-full font-semibold text-xs transition ${
              view === 'today'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-blue-700 border border-blue-400'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1 rounded-full font-semibold text-xs transition ${
              view === 'week'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-blue-700 border border-blue-400'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Filter badge */}
      <AnimatePresence>
        {filterBy && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium mb-1 w-fit shadow"
          >
            <span>Filter: {filterBy.charAt(0).toUpperCase() + filterBy.slice(1)}</span>
            <button onClick={() => setFilterBy("")} className="ml-1 text-blue-700">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <div
          className={kpiClass}
          tabIndex={0}
          onClick={() => setFilterBy('')}
          aria-label="Show all"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="uppercase tracking-wider text-sm font-medium">
              Visitors
            </span>
            {totalCustomers > 10 && (
              <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">HOT</span>
            )}
          </div>
          <div className="flex items-end gap-2 mt-2">
            <AnimatedNumber value={totalCustomers} className="text-4xl font-extrabold" />
            {totalCustomers > 10 ? (
              <ArrowUp className="text-green-400 w-5 h-5" />
            ) : (
              <ArrowDown className="text-yellow-400 w-5 h-5" />
            )}
          </div>
          <div className="text-sm text-white/80">{inStoreCount} currently in store</div>
          <ul className="mt-2 space-y-1 text-sm text-white/90">
            <li>
              <b>{demoCount}</b> demos
              <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">Details</span>
            </li>
            <li>
              <b>{worksheetCount}</b> worksheets
            </li>
            <li>
              <b>{offerCount}</b> offers
            </li>
          </ul>
        </div>

        <div
          className={kpiClass + ' sm:max-w-[220px]'}
          tabIndex={0}
          onClick={() => setFilterBy('')}
          aria-label="Show all leads"
        >
          <div className="flex items-center gap-2">
            <MailCheck className="w-5 h-5" />
            <span className="uppercase tracking-wider text-sm font-medium">Leads</span>
          </div>
          <div className="flex gap-2 mt-2">
            <AnimatedNumber value={responded} className="text-2xl font-bold" />
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">Responded</span>
          </div>
          <div className="flex gap-2 mt-1">
            <AnimatedNumber value={unresponded} className="text-2xl font-bold" />
            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-semibold">Unresponded</span>
          </div>
        </div>

        <div className={kpiClass + " focus:ring-green-400"} tabIndex={0}>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <span className="uppercase tracking-wider text-sm font-medium">
              {view === "today" ? "Today's" : "This Week's"} Activity
            </span>
          </div>
          <ul className="mt-2 space-y-1 text-base text-white/90">
            <li className="flex items-center gap-2">
              <AnimatedNumber value={activity.salesCalls} className="font-bold text-xl" /> Sales Calls
              <button
                className="ml-2 text-xs underline text-blue-200"
                onClick={() => setFilterBy('calls')}
              >Details</button>
            </li>
            <li className="flex items-center gap-2">
              <AnimatedNumber value={activity.textMessages} className="font-bold text-xl" /> Text Messages
              <button
                className="ml-2 text-xs underline text-blue-200"
                onClick={() => setFilterBy('texts')}
              >Details</button>
            </li>
            <li className="flex items-center gap-2">
              <AnimatedNumber value={activity.appointmentsSet} className="font-bold text-xl" /> Appointments Set
              <button
                className="ml-2 text-xs underline text-blue-200"
                onClick={() => setFilterBy('appointments')}
              >Details</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Table and modals */}
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
            // TODO: Add your update logic here if needed
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
          // TODO: Add your update logic here if needed
          setRows(prev => prev.map(r => (r.id === editing.id ? { ...r, ...data } : r)));
          setModalOpen(false);
          setEditing(null);
        }}
        initialData={editing}
      />
    </div>
  );
}
