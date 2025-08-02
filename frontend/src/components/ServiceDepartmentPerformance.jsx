import { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';

export default function ServiceDepartmentPerformance() {
  const [stats, setStats] = useState({
    elr: 0,
    hoursPerRo: 0,
    grossProfitPct: 0,
    csi: 0,
    fixedCoverage: 0,
  });

  useEffect(() => {
    const API_BASE = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '';
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/analytics/service-performance`);
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          elr: data.effectiveLaborRate ?? 0,
          hoursPerRo: data.hoursPerRo ?? 0,
          grossProfitPct: data.grossProfitPct ?? 0,
          csi: data.csi ?? 0,
          fixedCoverage: data.fixedCoverage ?? 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const barData = [{ name: 'ELR', value: stats.elr }];

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-3">
      <div className="flex items-center gap-1">
        <Wrench className="w-4 h-4" />
        <h3 className="font-semibold">Service Department Performance</h3>
      </div>
      <div>
        <span className="text-xl font-bold">${stats.elr}/hr</span>
        <div className="h-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical">
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex justify-between text-xs">
        <span>Hours/RO: {stats.hoursPerRo} hrs</span>
        <span>GP%: {stats.grossProfitPct}%</span>
      </div>
      <div className="text-xs space-y-1">
        <div>CSI: {stats.csi}</div>
        <div>FC: {stats.fixedCoverage}%</div>
      </div>
    </div>
  );
}
