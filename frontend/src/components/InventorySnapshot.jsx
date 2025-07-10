import React, { useEffect, useState } from 'react';

export default function InventorySnapshot() {
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  useEffect(() => {
    const API_BASE = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '/api';
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/inventory/snapshot`);
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          total: data.total ?? 0,
          active: data.active ?? 0,
          inactive: data.inactive ?? 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const kpiClass = 'rounded-3xl p-6 bg-gradient-to-br from-electricblue via-darkblue to-slategray text-white shadow-lg';

  return (
    <div className={kpiClass}>
      <h2 className="text-lg font-semibold mb-2">Inventory Snapshot</h2>
      <ul className="space-y-1 text-sm">
        <li>Total Vehicles: {stats.total}</li>
        <li>Active: {stats.active}</li>
        <li>Inactive: {stats.inactive}</li>
      </ul>
    </div>
  );
}
