import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import FloorTrafficTable from '../components/FloorTrafficTable';
import FloorTrafficModal from '../components/FloorTrafficModal';
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

  // State
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [activity, setActivity] = useState({ salesCalls: 0, textMessages: 0, appointmentsSet: 0 });
  const [filterBy, setFilterBy] = useState(null);

  // Handler stubs
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

  // Fetch data range
  useEffect(() => {
    async function fetchRange() {
      setLoading(true);
      setError('');
      try {
        const start = new Date(startDate).toISOString();
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        const end = endDateObj.toISOString();

        let data;
        if (supabase) {
          const res = await supabase
            .from('floor_traffic_customers')
            .select('*')
            .gte('visit_time', start)
            .lt('visit_time', end)
            .order('visit_time', { ascending: true });
          if (res.error) throw res.error;
          data = res.data;
        } else {
          const params = new URLSearchParams({ start: startDate, end: endDate });
          const res = await fetch(`${API_BASE}/floor-traffic/search?${params}`);
          if (!res.ok) throw new Error('Failed to load traffic');
          data = await res.json();
        }
        setRows(data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load traffic');
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRange();
  }, [API_BASE, startDate, endDate]);

  // Fetch activity metrics
  useEffect(() => {
    async function fetchActivity() {
      try {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const end = new Date(new Date(start).getTime() + 24 * 60 * 60 * 1000).toISOString();

        let metrics;
        if (supabase) {
          const res = await supabase
            .from('activities')
            .select('activity_type')
            .gte('created_at', start)
            .lt('created_at', end);
          if (res.error) throw res.error;
          metrics = res.data;
        } else {
          const res = await fetch(`${API_BASE}/activities/today-metrics`);
          if (!res.ok) throw new Error('Failed to load activity metrics');
          metrics = await res.json();
        }

        const counts = { salesCalls: 0, textMessages: 0, appointmentsSet: 0 };
        for (const row of metrics || []) {
          const t = (row.activity_type || '').toLowerCase();
          if (t.includes('call')) counts.salesCalls++;
          else if (t.includes('text')) counts.textMessages++;
          else if (t.includes('appointment')) counts.appointmentsSet++;
        }
        setActivity(counts);
      } catch (err) {
        console.error(err);
      }
    }
    fetchActivity();
  }, [API_BASE]);

  // Stats
  const responded = rows.filter(r => r.last_response_time).length;
  const totalCustomers = rows.length;

  // UI Components
  const navSpacer = <div className="h-20 w-full" />;

  const QuickAddButton = () => (
    <button
      className="fixed top-[86px] right-6 z-50 bg-gradient-to-br from-electricblue to-blue-700 text-white px-5 py-2 rounded-full shadow-lg border-2 border-white font-bold hover:scale-105 transition-transform"
      onClick={() => setModalOpen(true)}
    >+ Quick Add</button>
  );

  return (
    <div className="p-4 pt-8 relative min-h-screen bg-gray-50">
      {navSpacer}
      <QuickAddButton />

      {/* Date Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
        <label className="flex items-center gap-2">
          <span>Start:</span>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </label>
        <label className="flex items-center gap-2">
          <span>End:</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </label>
      </div>

      {error && <div className="mb-3 p-3 bg-red-100 text-red-800 rounded">{error}</div>}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">Loading…</div>
          ) : (
            <FloorTrafficTable
              rows={rows}
              onToggle={handleToggle}
              onEdit={row => {
                setEditing(row);
                setModalOpen(true);
              }}
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
