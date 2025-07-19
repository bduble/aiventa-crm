import { useEffect, useState } from 'react'

const BUCKETS = [
  { label: "0-30 Days", key: "0-30", color: "bg-green-200" },
  { label: "31-45 Days", key: "31-45", color: "bg-yellow-200" },
  { label: "46-60 Days", key: "46-60", color: "bg-orange-200" },
  { label: "61-90 Days", key: "61-90", color: "bg-orange-300" },
  { label: "90+ Days", key: "90+", color: "bg-red-300" }
]

function getHealthColor(avgDays) {
  if (avgDays < 30) return "bg-green-400";
  if (avgDays < 45) return "bg-yellow-300";
  if (avgDays < 60) return "bg-orange-400";
  return "bg-red-500";
}

function getGaugeWidth(avgDays) {
  // Pressure gauge width from 10 to 100%, clamped
  let width = Math.min(100, Math.max(10, (avgDays / 90) * 100));
  return width + '%';
}

export default function InventorySnapshot() {
  const [stats, setStats] = useState({
    total: 0,
    newCount: 0,
    usedCount: 0,
    avgDays: 0,
    turnRate: 0,
    buckets: {
      "0-30": 0, "31-45": 0, "46-60": 0, "61-90": 0, "90+": 0
    }
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
          buckets: data.buckets ?? { "0-30": 0, "31-45": 0, "46-60": 0, "61-90": 0, "90+": 0 }
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-white p-4 rounded-2xl shadow space-y-3">
      <h3 className="font-bold text-lg">Inventory Snapshot</h3>
      <div>
        <span className="text-2xl font-bold">Total Inventory: {stats.total}</span>
        <div className="text-xs text-gray-500">New: {stats.newCount} &bull; Used: {stats.usedCount}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <span>Avg Days in Stock: <span className="font-semibold">{stats.avgDays}</span></span>
        <span>Turn Rate: <span className="font-semibold">{stats.turnRate} days</span></span>
      </div>
      {/* Age Buckets */}
      <div className="flex justify-between items-end gap-2 pt-2">
        {BUCKETS.map(b => (
          <div key={b.key} className="flex flex-col items-center">
            <div className={`${b.color} rounded-lg w-12 h-8 flex items-center justify-center font-bold`}>
              {stats.buckets[b.key] ?? 0}
            </div>
            <div className="text-xs text-gray-700 mt-1">{b.label}</div>
          </div>
        ))}
        {/* Pressure Gauge */}
        <div className="flex flex-col items-center ml-3">
          <div className="relative h-10 w-7 flex items-end">
            <div className="absolute bottom-0 left-0 w-full rounded-xl" style={{
              height: getGaugeWidth(stats.avgDays),
              backgroundColor: getHealthColor(stats.avgDays).replace('bg-', '').replace('-', ''),
              transition: 'height 0.4s'
            }} />
            <div className="absolute bottom-0 left-0 w-full border-2 border-gray-300 h-full rounded-xl" />
          </div>
          <div className="text-xs font-semibold mt-1">Health</div>
        </div>
      </div>
    </div>
  );
}
