import React, { useEffect, useState } from 'react';

export default function SalesPerformanceKPI() {
  const [stats, setStats] = useState({ total: 0, demo: 0, writeUp: 0, sold: 0 });

  useEffect(() => {
    const API_BASE = import.meta.env.PROD
      ? import.meta.env.VITE_API_BASE_URL
      : '/api';
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/floor-traffic/month-metrics`);
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          total: data.total_customers ?? data.totalCustomers ?? 0,
          demo: data.demo_count ?? data.demoCount ?? 0,
          writeUp: data.write_up_count ?? data.writeUpCount ?? 0,
          sold: data.sold_count ?? data.soldCount ?? 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const pct = count => (stats.total ? Math.round((count / stats.total) * 100) : 0);
  const kpiClass =
    'rounded-3xl p-6 bg-gradient-to-br from-electricblue via-darkblue to-slategray text-white shadow-frame';

  return (
    <div className={kpiClass}>
      <h2 className="text-lg font-semibold mb-2">MTD Sales Performance</h2>
      <ul className="space-y-1 text-sm">
        <li>Total Customers: {stats.total}</li>
        <li>{pct(stats.demo)}% Demo ({stats.demo})</li>
        <li>{pct(stats.writeUp)}% Writeup ({stats.writeUp})</li>
        <li>{pct(stats.sold)}% Sold ({stats.sold})</li>
      </ul>
    </div>
  );
}
