import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export default function FloorLog() {
  const [logs, setLogs] = useState([]);

  const API_BASE = import.meta.env.DEV
    ? '/api'
    : 'https://aiventa-crm.onrender.com/api';

  useEffect(() => {
    fetch(`${API_BASE}/floor-traffic/today`)
      .then(res => {
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        return res.json();
      })
      .then(setLogs)
      .catch(() => setLogs([]));
  }, [API_BASE]);

  const headers = [
    { key: 'timeIn', label: 'In' },
    { key: 'timeOut', label: 'Out' },
    { key: 'salesperson', label: 'Sales' },
    { key: 'customerName', label: 'Cust' },
    { key: 'vehicle', label: 'Veh' },
    { key: 'trade', label: 'Trade' },
    { key: 'demo', label: 'Demo' },
    { key: 'writeUp', label: 'WriteUp' },
    { key: 'customerOffer', label: 'Offer' },
    { key: 'mgrTO', label: 'MgrTO' },
    { key: 'origin', label: 'Orig' },
  ];

  const totalCustomers = logs.length;
  const inStoreCount = logs.filter(l => !l.timeOut).length;
  const demoCount = logs.filter(l => l.demo).length;
  const worksheetCount = logs.filter(
    l => l.writeUp || l.worksheet || l.worksheet_complete || l.worksheetComplete || l.write_up
  ).length;
  const offerCount = logs.filter(l => l.customerOffer || l.customer_offer).length;
  const soldCount = logs.filter(l => l.sold).length;
  const pct = c => (totalCustomers ? Math.round((c / totalCustomers) * 100) : 0);

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
            {logs.length > 0 ? (
              logs.map((log, idx) => {
                const isOpen = log.timeIn && !log.timeOut;
                const rowBg = isOpen
                  ? 'bg-yellow-100 dark:bg-yellow-900'
                  : (log.timeOut
                      ? 'bg-gray-50 dark:bg-gray-800'
                      : 'bg-white dark:bg-gray-900');
                return (
                  <tr
                    key={idx}
                    className={`${rowBg} hover:bg-electricblue/10 dark:hover:bg-electricblue/20`}
                  >
                    {headers.map(({ key }) => (
                      <td
                        key={key}
                        className="px-2 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-200"
                      >
                        {['timeIn', 'timeOut'].includes(key)
                          ? log[key]
                            ? new Date(log[key]).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''
                          : String(log[key] ?? '')}
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
