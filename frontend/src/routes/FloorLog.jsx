import React, { useEffect, useState } from 'react';

export default function FloorLog() {
  const [logs, setLogs] = useState([]);

  // Define table headers and corresponding log keys
  const headers = [
    { key: 'timeIn',       label: 'Time In' },
    { key: 'timeOut',      label: 'Time Out' },
    { key: 'salesperson',  label: 'Salesperson' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'vehicle',      label: 'Vehicle' },
    { key: 'trade',        label: 'Trade' },
    { key: 'demo',         label: 'Demo' },
    { key: 'writeUp',      label: 'Write-Up' },
    { key: 'customerOffer',label: 'Customer Offer' },
    { key: 'mgrTO',        label: 'Mgr TO' },
    { key: 'origin',       label: 'Origin' }
  ];

  useEffect(() => {
    fetch(__API_BASE__ + '/floor-traffic/today')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Today's Floor Log</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full w-full table-auto divide-y divide-gray-200">
            <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                {headers.map(({ label }) => (
                  <th
                    key={label}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {logs.length ? (
                logs.map((log, idx) => {
                  const isOpen = log.timeIn && !log.timeOut;
                  const bgClass = isOpen ? 'bg-yellow-100' : log.timeOut ? 'bg-gray-50' : 'bg-white';
                  return (
                    <tr key={log.id || idx} className={bgClass}>
                      {headers.map(({ key }) => (
                        <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {['timeIn', 'timeOut'].includes(key)
                            ? log[key]
                              ? new Date(log[key]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ''
                            : log[key] ?? ''}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={headers.length} className="px-6 py-8 text-center text-sm text-gray-500">
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
