import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AIOverview() {
  const [info, setInfo] = useState({
    forecast: '',
    trendUp: true,
    anomalies: 0,
    recommendations: 0,
    details: '',
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const API_BASE = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '/api';
    const fetchInfo = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/ai-overview`);
        if (!res.ok) return;
        const data = await res.json();
        setInfo({
          forecast: data.forecast ?? '',
          trendUp: data.trendUp !== false,
          anomalies: data.anomalies ?? 0,
          recommendations: data.recommendations ?? 0,
          details: data.details ?? '',
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchInfo();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-3">
      <h3 className="font-semibold">AI Overview</h3>
      <div className="flex items-center gap-1 text-sm">
        <span className="font-medium">Sales Forecast:</span>
        <span>{info.forecast}</span>
        {info.trendUp ? (
          <ArrowUpRight className="w-4 h-4 text-green-500" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-500" />
        )}
      </div>
      <div className="flex gap-2 text-xs">
        <button className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
          Anomalies Detected: {info.anomalies}
        </button>
        <button className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
          Recommendations: {info.recommendations}
        </button>
      </div>
      <button
        onClick={() => setOpen(true)}
        className="mt-2 px-3 py-1 bg-electricblue text-white rounded text-sm"
      >
        View Details
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-white p-4 rounded shadow max-w-lg w-full">
            <pre className="whitespace-pre-wrap">{info.details}</pre>
            <div className="text-right mt-4">
              <button onClick={() => setOpen(false)} className="px-3 py-2 bg-electricblue text-white rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
