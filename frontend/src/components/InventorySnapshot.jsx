import React, { useEffect, useState } from 'react';

export default function InventorySnapshot() {
  const [stats, setStats] = useState({
    total: 0,
    newCount: 0,
    usedCount: 0,
    avgDays: 0,
    turnRate: 0,
    overThirty: 0,
  });

  useEffect(() => {
    const API_BASE = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '/api';
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/inventory-overview`);
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          total: data.total ?? 0,
          newCount: data.newCount ?? 0,
          usedCount: data.usedCount ?? 0,
          avgDays: data.avgDays ?? 0,
          turnRate: data.turnRate ?? 0,
          overThirty: data.overThirty ?? 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const kpiClass = 'rounded-3xl p-6 bg-gradient-to-br from-electricblue via-darkblue to-slategray text-white shadow-frame';

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-3">
      <h3 className="font-semibold">Inventory Snapshot</h3>
      <div>
        <span className="text-xl font-bold">Total Inventory: {stats.total}</span>
        <div className="text-xs text-gray-500">New: {stats.newCount} &bull; Used: {stats.usedCount}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <span>Avg Days in Stock: {stats.avgDays}</span>
        <span>Turn Rate: {stats.turnRate} days</span>
      </div>
      <div className={stats.overThirty > 20 ? 'text-red-600 text-sm font-semibold' : 'text-sm'}>
        % &gt;30 days: {stats.overThirty}%
      </div>
    </div>
  );
}
