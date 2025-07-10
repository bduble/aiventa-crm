import React, { useEffect, useState } from 'react';

export default function LeadPerformanceKPI() {
  const [stats, setStats] = useState({
    total: 0,
    engagement: 0,
    conversion: 0,
    avgResponse: 0,
  });

  useEffect(() => {
    const API_BASE = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '/api';
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/leads/month-metrics`);
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          total: data.total_leads ?? data.totalLeads ?? 0,
          engagement: data.lead_engagement_rate ?? data.leadEngagementRate ?? 0,
          conversion: data.conversion_rate ?? data.conversionRate ?? 0,
          avgResponse: data.average_response_time ?? data.averageResponseTime ?? 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const kpiClass = 'rounded-3xl p-6 bg-gradient-to-br from-electricblue via-darkblue to-slategray text-white shadow-frame';

  const formatTime = secs => {
    if (!secs) return '0m';
    const mins = Math.round(secs / 60);
    return `${mins}m`;
  };

  return (
    <div className={kpiClass}>
      <h2 className="text-lg font-semibold mb-2">MTD Lead Performance</h2>
      <ul className="space-y-1 text-sm">
        <li>Total Leads: {stats.total}</li>
        <li>Engagement Rate: {stats.engagement}%</li>
        <li>Conversion Rate: {stats.conversion}%</li>
        <li>Avg Response: {formatTime(stats.avgResponse)}</li>
      </ul>
    </div>
  );
}
