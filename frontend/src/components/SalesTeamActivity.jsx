import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';

export default function SalesTeamActivity() {
  const [stats, setStats] = useState({
    unitsByRep: [],
    grossPerUnit: 0,
    closingRatio: 0,
    fiPenetration: 0,
    appraisalToTrade: '',
  });

  useEffect(() => {
    const API_BASE = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '/api';
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/sales-team-activity`);
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          unitsByRep: Array.isArray(data.unitsByRep) ? data.unitsByRep : [],
          grossPerUnit: data.grossPerUnit ?? 0,
          closingRatio: data.closingRatio ?? 0,
          fiPenetration: data.fiPenetration ?? 0,
          appraisalToTrade: data.appraisalToTrade ?? '',
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-3">
      <div className="flex items-center gap-1">
        <BarChart3 className="w-4 h-4" />
        <h3 className="font-semibold">Sales Team Activity & Productivity</h3>
      </div>
      <table className="text-xs w-full">
        <thead>
          <tr className="text-left">
            <th className="pr-2">Rep</th>
            <th>Units</th>
          </tr>
        </thead>
        <tbody>
          {stats.unitsByRep.map((r) => (
            <tr key={r.rep}>
              <td className="pr-2">{r.rep}</td>
              <td>{r.units}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs flex justify-between">
        <span>GP/Vehicle: ${stats.grossPerUnit}</span>
        <span>Closing: {stats.closingRatio}%</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <span>F&amp;I Penetration: {stats.fiPenetration}%</span>
        <span>Appraisal/Trade: {stats.appraisalToTrade}</span>
      </div>
    </div>
  );
}
