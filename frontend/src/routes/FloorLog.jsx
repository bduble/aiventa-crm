// src/routes/FloorLog.jsx
import React, { useEffect, useState } from 'react';

export default function FloorLog() {
  const [logs, setLogs] = useState([]);

  // Abbreviated headers for single-line display
  const headers = [
    { key: 'timeIn',       label: 'In'     },
    { key: 'timeOut',      label: 'Out'    },
    { key: 'salesperson',  label: 'Sales'  },
    { key: 'customerName', label: 'Cust'   },
    { key: 'vehicle',      label: 'Veh'    },
    { key: 'trade',        label: 'Trade'  },
    { key: 'demo',         label: 'Demo'   },
    { key: 'writeUp',      label: 'WriteUp'},
    { key: 'customerOffer',label: 'Offer'  },
    { key: 'mgrTO',        label: 'MgrTO'  },
    { key: 'origin',       label: 'Orig'   },
  ];

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || '/api';
    fetch(`${base}/floor-traffic/today`)
      .then(r => r.json())
      .then(setLogs)
      .catch(console.error);
  }, []);

  return (
    <div className="w-full min-h-screen bg-offwhite dark:bg-gray-800 p-4">
      <div className="w-full bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 lg:p-6">
        <h1 className="text-lg lg:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Today's Floor Log
        </h1>
        <div className="overflow-x-auto w-full">
          <table className="table-fixed w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                {headers.map(({ label }) => (
                  <th
                    key={label}
                    className="px-2 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase whitespace-nowrap text-[0.7rem] sm:text-xs lg:text-sm"
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
                  const rowClass = isOpen
                    ? 'bg-yellow-100 dark:bg-yellow-900'
                    : log.timeOut
                      ? 'bg-gray-50 dark:bg-gray-800'
                      : 'bg-white dark:bg-gray-900';
                  return (
                    <tr key={idx} className={rowClass}>
                      {headers.map(({ key }) => (
                        <td
                          key={key}
                          className="px-2 py-1 whitespace-nowrap text-[0.75rem] sm:text-sm text-gray-700 dark:text-gray-200"
                        >
                          {['timeIn','timeOut'].includes(key)
                            ? log[key]
                              ? new Date(log[key]).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
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
                  <td colSpan={headers.length} className="px-2 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No visitors recorded yet today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
