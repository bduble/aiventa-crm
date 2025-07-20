import { useEffect, useState } from 'react'
import VehicleBucketOverlay from './VehicleBucketOverlay'

const BUCKETS = [
  { label: "0-30 Days", key: "0-30", color: "bg-green-200" },
  { label: "31-45 Days", key: "31-45", color: "bg-yellow-200" },
  { label: "46-60 Days", key: "46-60", color: "bg-orange-200" },
  { label: "61-90 Days", key: "61-90", color: "bg-orange-300" },
  { label: "90+ Days", key: "90+", color: "bg-red-300" }
];

const bucketRanges = {
  "0-30": [0, 30],
  "31-45": [31, 45],
  "46-60": [46, 60],
  "61-90": [61, 90],
  "90+": [91, 9999],
};

function getHealthColor(avgDays) {
  if (avgDays < 30) return "bg-green-400";
  if (avgDays < 45) return "bg-yellow-300";
  if (avgDays < 60) return "bg-orange-400";
  return "bg-red-500";
}

function getGaugeWidth(avgDays) {
  let width = Math.min(100, Math.max(10, (avgDays / 90) * 100));
  return width + '%';
}

function InventoryCard({ title, stats, type, onBucketClick }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow hover:shadow-xl border border-gray-100 transition-all space-y-3 w-full">
      <h3 className="font-bold text-lg">{title} Inventory</h3>
      <div>
        <span className="text-2xl font-bold">Total: {stats.total}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <span>Avg Days in Stock: <span className="font-semibold">{stats.avgDays}</span></span>
        <span>Turn Rate: <span className="font-semibold">{stats.turnRate} days</span></span>
      </div>
      <div className="flex justify-between items-end gap-2 pt-2">
        {BUCKETS.map(b => (
          <div key={b.key} className="flex flex-col items-center">
            <div
              className={`${b.color} rounded-lg w-12 h-8 flex items-center justify-center font-bold cursor-pointer hover:scale-105 transition`}
              onClick={() => onBucketClick(type, b.key)}
              title={`Show vehicles in ${title} - ${b.label}`}
            >
              {stats.buckets?.[b.key] ?? 0}
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

export default function InventorySnapshot() {
  const [data, setData] = useState({
    new: { total: 0, avgDays: 0, turnRate: 0, buckets: { "0-30": 0, "31-45": 0, "46-60": 0, "61-90": 0, "90+": 0 } },
    used: { total: 0, avgDays: 0, turnRate: 0, buckets: { "0-30": 0, "31-45": 0, "46-60": 0, "61-90": 0, "90+": 0 } },
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalParams, setModalParams] = useState(null);

  useEffect(() => {
    const API_BASE = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '/api';
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/inventory-overview`);
        if (!res.ok) return;
        const json = await res.json();
        setData({
          new: json.new ?? data.new,
          used: json.used ?? data.used,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
    // eslint-disable-next-line
  }, []);

  function handleBucketClick(type, bucketKey) {
    const [min, max] = bucketRanges[bucketKey];
    setModalParams({ type, bucketKey, min, max });
    setModalOpen(true);
  }

  return (
    <>
     <div className="max-w-md mx-auto">
  <InventoryCard
    title="New"
    stats={data.new}
    type="new"
    onBucketClick={handleBucketClick}
  />
</div>
<div className="max-w-md mx-auto">
  <InventoryCard
    title="Used"
    stats={data.used}
    type="used"
    onBucketClick={handleBucketClick}
  />
</div>

      )}
