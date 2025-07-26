import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { formatTime } from '../utils/formatDateTime';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function FloorLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Match your API or Supabase field names!
  const headers = [
    { key: 'visit_time', label: 'In' },
    { key: 'time_out', label: 'Out' },
    { key: 'salesperson', label: 'Sales' },
    { key: 'customer_name', label: 'Cust' },
    { key: 'vehicle', label: 'Veh' },
    { key: 'trade', label: 'Trade' },
    { key: 'demo', label: 'Demo' },
    { key: 'worksheet', label: 'Worksheet' },
    { key: 'customer_offer', label: 'Offer' },
    { key: 'mgrTO', label: 'MgrTO' },
    { key: 'origin', label: 'Orig' },
    { key: 'sold', label: 'Sold' }
  ];

  // Fetch today’s floor traffic
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        let data;
        if (supabase) {
          const today = new Date();
          const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
          const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
          const { data: res, error } = await supabase
            .from('floor_traffic_customers')
            .select('*')
            .gte('visit_time', start)
            .lt('visit_time', end)
            .order('visit_time', { ascending: true });
          if (error) throw error;
          data = res || [];
        } else {
          const API_BASE = import.meta.env.DEV
            ? '/api'
            : 'https://aiventa-crm.onrender.com/api';
          const res = await fetch(`${API_BASE}/floor-traffic/today`);
          data = await res.json();
        }
        setLogs(data || []);
      } catch (err) {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // KPI calculations
  const totalCustomers = logs.length;
  const inStoreCount = logs.filter(l => !l.time_out).length;
  const demoCount = logs.filter(l => l.demo).length;
  const worksheetCount = logs.filter(
    l => l.writeUp || l.worksheet || l.worksheet_complete || l.worksheetComplete || l.write_up
  ).length;
  const offerCount = logs.filter(l => l.customer_offer || l.customerOffer).length;
  const soldCount = logs.filter(l => l.sold).length;
  const pct = c => (totalCustomers ? Math.round((c / totalCustomers) * 100) : 0);

  // Handle checkbox change and persist it
  const handleToggle = async (id, field, value) => {
    setLogs(logs =>
      logs.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
    try {
      if (supabase) {
        const { error } = await supabase
          .from('floor_traffic_customers')
          .update({ [field]: value })
          .eq('id', id);

        if (error) throw error;

        if (field === 'sold' && value === true) {
          const soldRow = logs.find(row => row.id === id);
          await supabase.from('deals').insert([{
            customer_id: soldRow.customer_id || null,
            vehicle: soldRow.vehicle || null,
            salesperson: soldRow.salesperson || null,
            floor_traffic_id: soldRow.id,
            date: new Date().toISOString(),
          }]);
        }
      } else {
        // Call your API here if not Supabase
      }
    } catch (err) {
      // revert UI if backend fails
      setLogs(logs =>
        logs.map(row =>
          row.id === id ? { ...row, [field]: !value } : row
        )
      );
      alert('Failed to update record.');
      console.error(err);
    }
  };

  const kpiClass =
    'flex-1 rounded-3xl p-6 bg-gradient-to-br from-electricblue via-darkblue to-slategray text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-transform';

  return (
    <div className="w-full min-h-screen bg-offwhite dark:bg-gray-800 p-4">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Floor Log
      </h1>
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className={kpiClass}>
          <div className="flex items-center gap-2 opacity-90">
            <Users className="w-5 h-5" />
            <p className="uppercase tracking-wider text-sm font-medium">Visitors</p>
          </div>
          <p className="text-4xl font-bold mt-2">{totalCustomers}</p>
          <ul className="mt-4 space-y-1 text-sm text-white/90">
            <li>{totalCustomers} Customers</li>
            <li>{inStoreCount} In Store</li>
            <li>{demoCount} Demo ({pct(demoCount)}%)</li>
            <li>{worksheetCount} Worksheet ({pct(worksheetCount)}%)</li>
            <li>{offerCount} Customer Offer ({pct(offerCount)}%)</li>
            <li>{soldCount} Sold ({pct(soldCount)}%)</li>
          </ul>
        </div>
      </div>
      <div className="w-full bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 lg:p-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-electricblue dark:bg-darkblue sticky top-0 z-10 text-white">
            <tr>
              {headers.map(({ label }) => (
                <th
                  key={label}
                  className="px-2 py-2 text-left font-semibold uppercase whitespace-nowrap text-xs sm:text-sm lg:text-base"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="px-2 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : logs.length > 0 ? (
              logs.map((log, idx) => {
                const isOpen = log.visit_time && !log.time_out;
                const isSold = !!log.sold;
                const rowBg = isSold
                  ? 'bg-green-100 dark:bg-green-900'
                  : isOpen
                  ? 'bg-yellow-100 dark:bg-yellow-900'
                  : (log.time_out
                      ? 'bg-gray-50 dark:bg-gray-800'
                      : 'bg-white dark:bg-gray-900');
                return (
                  <tr
                    key={log.id || idx}
                    className={`${rowBg} hover:bg-electricblue/10 dark:hover:bg-electricblue/20`}
                  >
                    {headers.map(({ key }) => (
                      <td
                        key={key}
                        className="px-2 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-200"
                      >
                        {key === 'visit_time' || key === 'time_out' ? (
                          log[key] ? formatTime(log[key]) : ''
                        ) : typeof log[key] === 'boolean' ? (
                          <input
                            type="checkbox"
                            checked={!!log[key]}
                            disabled={key === 'sold' && !!log[key]} // can't uncheck sold
                            onChange={e => {
                              if (key === 'sold' && log[key]) return; // no unchecking sold
                              handleToggle(log.id, key, e.target.checked);
                            }}
                          />
                        ) : (
                          String(log[key] ?? '')
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-2 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No visitors recorded yet today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
