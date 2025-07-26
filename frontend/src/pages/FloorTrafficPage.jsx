import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
//import FloorTrafficTable from '../components/FloorTrafficTable';
//import FloorTrafficModal from '../components/FloorTrafficModal';
import { Users, MailCheck, Activity, XCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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

  // Filtering logic
  const [filterBy, setFilterBy] = useState(null);

  // Only filter if filterBy is set
  const filteredRows = filterBy
    ? rows.filter(r => {
        if (filterBy === 'appointmentsSet') return r.appointment_set || r.appointments_set;
        if (filterBy === 'demo') return r.demo;
        if (filterBy === 'worksheet') return r.worksheet;
        return true;
      })
    : rows;

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
      } catch (err) {}
    };

    fetchActivityMetrics();
  }, [API_BASE]);

  // KPI logic
  const responded = rows.filter(r => r.last_response_time).length;
  const unresponded = rows.length - responded;
  const totalCustomers = rows.length;
  const inStoreCount = rows.filter(r => !r.time_out).length;
  const demoCount = rows.filter(r => r.demo).length;
  const worksheetCount = rows.filter(
    r => r.writeUp || r.worksheet || r.worksheet_complete || r.worksheetComplete || r.write_up
  ).length;
  const offerCount = rows.filter(r => r.customer_offer || r.customerOffer).length;

  // Animated counters
  function Counter({ value }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let start = display;
      if (start === value) return;
      const duration = 500;
      const increment = (value - start) / (duration / 20);
      let raf;
      function animate() {
        start += increment;
        if ((increment > 0 && start >= value) || (increment < 0 && start <= value)) {
          setDisplay(value);
        } else {
          setDisplay(Math.round(start));
          raf = setTimeout(animate, 20);
        }
      }
      animate();
      return () => clearTimeout(raf);
    }, [value]);
    return <span className="font-extrabold text-3xl">{display}</span>;
  }

  // Quick Add (Floating button)
  function QuickAddButton() {
    return (
      <button
        className="fixed top-[86px] right-6 z-50 bg-gradient-to-br from-electricblue to-blue-700 text-white px-5 py-2 rounded-full shadow-lg border-2 border-white font-bold hover:scale-105 transition-transform"
        onClick={() => setModalOpen(true)}
        title="Quick Add Floor Log"
      >
        + Quick Add
      </button>
    );
  }

  // Spacing for nav bar
  const navSpacer = <div className="h-20 md:h-20 w-full" />;

  // KPI Cards (clickable)
  const kpiCards = [
    {
      label: (
        <>
          Visitors
          <span className="ml-2 px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{inStoreCount} in store</span>
        </>
      ),
      value: totalCustomers,
      onClick: null,
      icon: <Users className="w-6 h-6" />,
    },
    {
      label: (
        <>
          Appointments Set
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${activity.appointmentsSet > 0 ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-yellow-100 text-yellow-700'}`}>{activity.appointmentsSet > 0 ? 'HOT' : 'Low'}</span>
        </>
      ),
      value: activity.appointmentsSet,
      onClick: () => setFilterBy('appointmentsSet'),
      icon: <Activity className="w-6 h-6" />,
    },
    {
      label: (
        <>
          Demo
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${demoCount > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{demoCount > 0 ? '▲' : '▼'}</span>
        </>
      ),
      value: demoCount,
      onClick: () => setFilterBy('demo'),
      icon: <Activity className="w-6 h-6" />,
    },
    {
      label: (
        <>
          Worksheets
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${worksheetCount > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{worksheetCount > 0 ? '▲' : '▼'}</span>
        </>
      ),
      value: worksheetCount,
      onClick: () => setFilterBy('worksheet'),
      icon: <Activity className="w-6 h-6" />,
    },
    {
      label: (
        <>
          Sales Calls
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${activity.salesCalls > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{activity.salesCalls > 0 ? '▲' : '▼'}</span>
        </>
      ),
      value: activity.salesCalls,
      onClick: null,
      icon: <MailCheck className="w-6 h-6" />,
    },
  ];

  // Mini-alerts
  const waitingLong = rows.filter(
    r => r.time_out === null && r.visit_time && (Date.now() - new Date(r.visit_time).getTime()) > 20 * 60 * 1000
  ).length;
  const alertMsgs = [];
  if (waitingLong > 0) alertMsgs.push(`⚡ ${waitingLong} customers have been waiting &gt;20 min!`);
  if (activity.appointmentsSet > 0 && activity.appointmentsSet > responded)
    alertMsgs.push(`${activity.appointmentsSet - responded} appointments not yet followed up.`);

  // Day/Week toggle
  const [kpiRange, setKpiRange] = useState("today");

  // Handlers
  const handleToggle = (id, field, value) => {
    console.log('Toggle:', id, field, value);
    // TODO: update record in Supabase or via API
  };

  const handleSubmit = formData => {
    console.log('Form submit:', formData);
    // TODO: insert or update record
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="p-2 pt-8 md:p-8 relative min-h-screen bg-gray-50">
      {navSpacer}
      <QuickAddButton />

      {/* Alerts */}
      {alertMsgs.length > 0 && (
        <div className="mb-3">
          {alertMsgs.map((msg, i) => (
            <div
              key={i}
              className="mb-1 px-3 py-2 border-l-4 border-yellow-400 bg-yellow-100 text-yellow-900 font-bold rounded-r shadow animate-pulse"
            >
              {msg}
            </div>
          ))}
        </div>
      )}

      {/* KPI/Filter Row */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex flex-row flex-wrap gap-3 w-full">
          {kpiCards.map((k, i) => (
            <div
              key={i}
              onClick={k.onClick}
              className={`flex-1 min-w-[130px] p-4 rounded-2xl shadow-lg bg-white border hover:border-blue-400 transition cursor-pointer select-none ${
                k.onClick ? 'hover:bg-blue-50' : ''
              }`}
              style={{ maxWidth: 210 }}
            >
              <div className="flex items-center gap-2">{k.icon}<span className="font-semibold text-base">{k.label}</span></div>
              <div className="mt-1 text-4xl font-extrabold text-darkblue">
                <Counter value={k.value} />
              </div>
              {k.onClick && filterBy === Object.keys(kpiCards)[i] && (
                <span className="inline-block mt-2 bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Filtering
                </span>
              )}
            </div>
          ))}
          {/* Filter badge */}
          {filterBy && (
            <span
              className="ml-3 mt-2 px-3 py-2 bg-slate-200 text-blue-700 font-bold rounded-full cursor-pointer flex items-center animate-pulse"
              onClick={() => setFilterBy(null)}
              title="Clear Filter"
            >
              <XCircle className="w-4 h-4 mr-1" /> Clear Filter
            </span>
          )}
        </div>
        {/* Day/Week toggle */}
        <div className="flex gap-2 items-center ml-auto">
          <button
            className={`px-4 py-1 rounded-l-full font-bold ${kpiRange === 'today' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
            onClick={() => setKpiRange('today')}
          >
            Today
          </button>
          <button
            className={`px-4 py-1 rounded-r-full font-bold ${kpiRange === 'week' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
            onClick={() => setKpiRange('week')}
          >
            Week
          </button>
        </div>
      </div>

      {/* Date pickers */}
      <div className="flex flex-col sm:flex-row gap-3 items-center mb-3">
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

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">Loading…</div>
          ) : (
            <FloorTrafficTable
              rows={filteredRows}
              onEdit={row => {
                setEditing(row);
                setModalOpen(true);
              }}
              onToggle={handleToggle}
            />
          )}
        </CardContent>
      </Card>

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
