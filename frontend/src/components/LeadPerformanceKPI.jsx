import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  Tooltip,
  LabelList,
} from 'recharts';
import { Clock } from 'lucide-react';

export default function LeadPerformanceKPI() {
  const [stats, setStats] = useState({
    new: 0,
    qualified: 0,
    avgResponse: 0,
    funnel: [],
  });

  useEffect(() => {
    const API_BASE = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '/api';
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/lead-overview`);
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          new: data.new ?? 0,
          qualified: data.qualified ?? 0,
          avgResponse: data.avgResponse ?? 0,
          funnel: Array.isArray(data.funnel) ? data.funnel : [],
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const formatTime = secs => {
    if (!secs) return '0m';
    const mins = Math.round(secs / 60);
    return `${mins}m`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-3">
      <h3 className="font-semibold">Lead Performance</h3>
      <div className="flex justify-between text-sm">
        <span>New Leads: {stats.new}</span>
        <span>Qualified: {stats.qualified}</span>
      </div>
      <div className="flex items-center gap-1 text-xs">
        <Clock className="w-4 h-4" />
        <span>Avg Response Time: {formatTime(stats.avgResponse)}</span>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip />
            <Funnel
              dataKey="value"
              data={stats.funnel}
              isAnimationActive={false}
              orientation="vertical"
            >
              <LabelList position="right" fill="#374151" stroke="none" dataKey="stage" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
