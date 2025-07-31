import { useEffect, useState } from 'react';
import supabase from '../supabase';
import FloorTrafficTable from '../components/FloorTrafficTable';
import FloorTrafficModal from '../components/FloorTrafficModal';
import { Users, MailCheck, Activity, XCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import toast from 'react-hot-toast';

export default function FloorTrafficPage() {
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
  const [filterBy, setFilterBy] = useState(null);
  const [kpiRange, setKpiRange] = useState("today");

  // FETCH FLOOR TRAFFIC W/ JOINED CUSTOMER DATA
  useEffect(() => {
    const fetchRange = async () => {
      setLoading(true);
      setError('');
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const endIso = new Date(end.getTime());
        endIso.setDate(endIso.getDate() + 1);

        const { data, error: err } = await supabase
          .from('floor_traffic_customers')
          .select(`
            *,
            customer:customer_id!floor_traffic_customers_customer_id_fkey (
              customer_name, first_name, last_name, email, phone
            )
          `)
          .gte('visit_time', start.toISOString())
          .lt('visit_time', endIso.toISOString())
          .order('visit_time', { ascending: true });

        if (err) throw err;
        setRows(data || []);
      } catch (err) {
        setError('Failed to load traffic: ' + (err.message || JSON.stringify(err)));
        setRows([]);
        console.error('Supabase error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRange();
  }, [startDate, endDate]);

  // FETCH DAILY KPI METRICS
  useEffect(() => {
    const fetchActivityMetrics = async () => {
      try {
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
      } catch (err) {
        setActivity({ salesCalls: 0, textMessages: 0, appointmentsSet: 0 });
      }
    };
    fetchActivityMetrics();
  }, []);

  // FILTERED ROWS
  const filteredRows = filterBy
    ? rows.filter(r => {
        if (filterBy === 'appointmentsSet') return r.appointment_set || r.appointments_set;
        if (filterBy === 'demo') return r.demo;
        if (filterBy === 'worksheet') return r.worksheet;
        return true;
      })
    : rows;

  // KPI logic
  const responded = rows.filter(r => r.last_response_time).length;
  const totalCustomers = rows.length;
  const inStoreCount = rows.filter(r => !r.time_out).length;
  const demoCount = rows.filter(r => r.demo).length;
  const worksheetCount = rows.filter(
    r => r.writeUp || r.worksheet || r.worksheet_complete || r.worksheetComplete || r.write_up
  ).length;

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

  const navSpacer = <div className="h-20 md:h-20 w-full" />;

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

  const waitingLong = rows.filter(
    r => r.time_out === null && r.visit_time && (Date.now() - new Date(r.visit_time).getTime()) > 20 * 60 * 1000
  ).length;
  const alertMsgs = [];
  if (waitingLong > 0) alertMsgs.push(`⚡ ${waitingLong} customers have been waiting &gt;20 min!`);
  if (activity.appointmentsSet > 0 && activity.appointmentsSet > responded)
    alertMsgs.push(`${activity.appointmentsSet - responded} appointments not yet followed up.`);

  // Floor Traffic Quick Add/Modal Submit
  const handleSubmit = async (formData) => {
    setError('');
    if (!formData.customer_id) {
      setError('Customer is required.');
      return;
    }

    setLoading(true);
    try {
      let visit_time = formData.visit_time;
      if (!visit_time || visit_time.trim() === '') {
        visit_time = new Date().toISOString();
      } else if (!visit_time.includes('T')) {
        const today = new Date().toISOString().slice(0, 10);
        visit_time = `${today}T${visit_time}`;
        visit_time = new Date(visit_time).toISOString();
      } else {
        visit_time = new Date(visit_time).toISOString();
      }
      let newEntry = { ...formData, visit_time };
      Object.keys(newEntry).forEach(
        key => (newEntry[key] === '' || newEntry[key] == null) && delete newEntry[key]
      );
      // Only include fields relevant to floor_traffic_customers table!
      const allowedFields = [
        'customer_id', 'visit_time', 'salesperson', 'vehicle', 'trade', 'demo', 'notes', 'customer_offer',
        'worksheet', 'sold', 'status'
      ];
      newEntry = Object.fromEntries(Object.entries(newEntry).filter(([k]) => allowedFields.includes(k)));

      const { data, error: insertErr } = await supabase
        .from('floor_traffic_customers')
        .insert([newEntry])
        .select(`
          *,
          customer:customer_id!floor_traffic_customers_customer_id_fkey (
            customer_name, first_name, last_name, email, phone
          )
        `);

      if (insertErr) throw insertErr;

      setRows(prev => [ ...(data || []), ...prev ]);
      setModalOpen(false);
      setEditing(null);
      toast.success('Visitor logged!');
    } catch (err) {
      setError('Failed to add customer. Please check all required fields.');
      console.error('Supabase insert error:', err);
    } finally {
      setLoading(false);
    }
  };

  // SOLD TOASTS + BADGE LOGIC
  const handleToggle = async (id, field, value) => {
    setRows(rows =>
      rows.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
    try {
      const { error } = await supabase
        .from('floor_traffic_customers')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;

      if (field === 'sold' && value === true) {
        const soldRow = rows.find(row => row.id === id);
        // Prevent duplicate deals
        const { data: existingDeal, error: dealCheckErr } = await supabase
          .from('deals')
          .select('id')
          .eq('floor_traffic_customer_id', id)
          .maybeSingle();

        if (dealCheckErr) throw dealCheckErr;

        if (!existingDeal) {
          await supabase.from('deals').insert([{
            floor_traffic_customer_id: id,
            customer_id: soldRow.customer_id || null,
            customer_name: soldRow.customer?.customer_name || '',
            vehicle: soldRow.vehicle || null,
            trade: soldRow.trade || null,
            notes: soldRow.notes || null,
            salesperson: soldRow.salesperson || null,
            sold: true,
            stage: "Contract Pending",
            status: "open",
            created_at: new Date().toISOString(),
            audit: JSON.stringify({
              created_from: "floor_traffic_customers",
              triggered_by: "frontend",
              timestamp: new Date().toISOString(),
              auto_created_on_sold: true,
            }),
          }]);
          toast.success('Deal created and marked SOLD!');
        } else {
          toast('Already marked SOLD. Deal exists.', { icon: '✅' });
        }
      }
    } catch (err) {
      setRows(rows =>
        rows.map(row =>
          row.id === id ? { ...row, [field]: !value } : row
        )
      );
      toast.error('Failed to update record.');
      console.error(err);
    }
  };

  // BADGE: Add to table rendering
  function FloorTrafficTableWithSoldBadge(props) {
    return (
      <FloorTrafficTable
        {...props}
        renderCustomerName={row => (
          <>
            {row.customer?.customer_name || ''}
            {row.sold && (
              <span className="inline-block ml-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">SOLD</span>
            )}
          </>
        )}
      />
    );
  }

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
              dangerouslySetInnerHTML={{ __html: msg }}
            />
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
            <FloorTrafficTableWithSoldBadge
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
