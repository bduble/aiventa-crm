import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { TrendingUp, PercentCircle } from 'lucide-react';

export default function SalesPerformanceKPI() {
  const [stats, setStats] = useState({
    current: 0,
    goal: 0,
    avgDealSize: 0,
    conversionRate: 0,
    daily: [],
  });

  useEffect(() => {
    const API_BASE = import.meta.env.PROD
      ? import.meta.env.VITE_API_BASE_URL
      : '/api';
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/sales-overview`);
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          current: data.current ?? 0,
          goal: data.goal ?? 0,
          avgDealSize: data.avgDealSize ?? 0,
          conversionRate: data.conversionRate ?? 0,
          daily: Array.isArray(data.daily) ? data.daily : [],
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const pct = stats.goal ? Math.round((stats.current / stats.goal) * 100) : 0;
  const pieData = [
    { name: 'progress', value: pct },
    { name: 'remain', value: 100 - pct },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-3">
      <h3 className="font-semibold">MTD Sales Performance</h3>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold">
          ${stats.current} of ${stats.goal} MTD
        </span>
        <PieChart width={60} height={60}>
          <Pie
            startAngle={90}
            endAngle={-270}
            innerRadius={20}
            outerRadius={28}
            paddingAngle={0}
            data={pieData}
            dataKey="value"
          >
            <Cell fill="#10b981" />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </div>
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.daily} margin={{ left: -20, right: 0 }}>
            <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          <span>Avg Deal Size: ${stats.avgDealSize}</span>
        </div>
        <div className="flex items-center gap-1">
          <PercentCircle className="w-4 h-4" />
          <span>Conversion Rate: {stats.conversionRate}%</span>
        </div>
      </div>
    </div>
  );
}
