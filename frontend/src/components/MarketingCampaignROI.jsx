import React, { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';

export default function MarketingCampaignROI() {
  const [stats, setStats] = useState({
    spend: 0,
    revenue: 0,
    cpl: 0,
    roi: 0,
    conversionByChannel: [],
  });

  useEffect(() => {
    const API_BASE = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '/api';
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/marketing-roi`);
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          spend: data.spend ?? 0,
          revenue: data.revenue ?? 0,
          cpl: data.cpl ?? 0,
          roi: data.roi ?? 0,
          conversionByChannel: Array.isArray(data.conversionByChannel) ? data.conversionByChannel : [],
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const pct = stats.spend && stats.revenue ? Math.min((stats.revenue / stats.spend) * 100, 100) : 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-3">
      <div className="flex items-center gap-1">
        <Megaphone className="w-4 h-4" />
        <h3 className="font-semibold">Marketing Campaign ROI</h3>
      </div>
      <div>
        <span className="font-semibold">${stats.spend} / ${stats.revenue}</span>
        <div className="h-2 bg-gray-200 rounded mt-1">
          <div className="h-2 bg-blue-500 rounded" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="text-xs flex justify-between">
        <span>CPL: ${stats.cpl}</span>
        <span>ROI: {stats.roi}%</span>
      </div>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.conversionByChannel} layout="vertical">
            <Tooltip />
            <Bar dataKey="rate" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
