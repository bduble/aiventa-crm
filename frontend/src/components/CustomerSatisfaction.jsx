import { useEffect, useState } from 'react';
import { Smile, Heart, X } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';

export default function CustomerSatisfaction() {
  const [stats, setStats] = useState({
    csi: 0,
    retention: 0,
    nps: 0,
    retentionSeries: [],
    npsSeries: [],
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const API_BASE = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '/api';
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/customer-satisfaction`);
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          csi: data.csi ?? 0,
          retention: data.retention ?? 0,
          nps: data.nps ?? 0,
          retentionSeries: Array.isArray(data.retentionSeries) ? data.retentionSeries : [],
          npsSeries: Array.isArray(data.npsSeries) ? data.npsSeries : [],
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const csiColor = stats.csi >= 8 ? 'text-green-600' : stats.csi >= 6 ? 'text-orange-500' : 'text-red-600';

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <div className="flex items-center gap-1">
          <Smile className="w-4 h-4" />
          <Heart className="w-4 h-4" />
          <h3 className="font-semibold">Customer Satisfaction & Retention</h3>
        </div>
        <div className={`text-2xl font-bold ${csiColor}`}>{stats.csi.toFixed(1)}</div>
        <div className="space-y-2 text-xs">
          <div>Retention Rate {stats.retention}%</div>
          <div className="h-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'ret', value: stats.retention }]}>\
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>NPS {stats.nps}</div>
          <div className="h-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'nps', value: stats.nps }]}>\
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="text-blue-600 text-xs underline">
          View Details
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-white p-4 rounded shadow max-w-md w-full relative">
            <button className="absolute top-2 right-2" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </button>
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(stats, null, 2)}</pre>
            <div className="text-right mt-4">
              <button onClick={() => setOpen(false)} className="px-3 py-1 bg-electricblue text-white rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
