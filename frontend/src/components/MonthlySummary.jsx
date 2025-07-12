import React, { useEffect, useState } from 'react';

export default function MonthlySummary() {
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const API_BASE = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '/api';
    const fetchSummary = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/month-summary`);
        if (!res.ok) return;
        const data = await res.json();
        setSummary(data.summary || '');
      } catch (err) {
        console.error(err);
      }
    };
    fetchSummary();
  }, []);

  const kpiClass = 'rounded-3xl p-6 bg-gradient-to-br from-electricblue via-darkblue to-slategray text-white shadow-frame';

  return (
    <div className={kpiClass}>
      <h2 className="text-lg font-semibold mb-2">AI Monthly Summary</h2>
      <p className="text-sm whitespace-pre-wrap">{summary}</p>
    </div>
  );
}
