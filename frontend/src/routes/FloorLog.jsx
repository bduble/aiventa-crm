import React, { useEffect, useState } from 'react';

export default function FloorLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Fetch today's floor traffic records
    fetch(__API_BASE__ + '/floor-traffic/today')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Today's Floor Log</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              {['Time In', 'Visitor Name', 'Sales Rep', 'Notes'].map((heading) => (
                <th
                  key={heading}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length ? (
              logs.map((log, idx) => (
                <tr key={log.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(log.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.salesperson}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.notes}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
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
