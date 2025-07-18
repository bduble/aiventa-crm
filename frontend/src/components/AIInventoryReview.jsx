import { useEffect, useState } from 'react';

export default function AIInventoryReview({ vehicleId, open, onClose, radius = 200 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/ai/inventory/${vehicleId}/review`);
        const json = await res.json();
        setData(json);
      } catch {
        setData({ analysis: 'Error loading review' });
      }
      setLoading(false);
    };
    fetchData();
  }, [open, vehicleId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow max-w-md w-full">
        {loading ? (
          <div className="py-10 text-center">Loading…</div>
        ) : (
          <>
            <pre className="whitespace-pre-wrap text-sm">{data?.analysis}</pre>
            <div className="mt-3 text-xs space-y-1">
              {data && (
                <>
                  <div>Avg price: {data.market_avg?.toLocaleString()}</div>
                  <div>Range: {data.market_low?.toLocaleString()}–{data.market_high?.toLocaleString()}</div>
                  <div>Listings in {radius} mi: {data.num_available}</div>
                </>
              )}
            </div>
          </>
        )}
        <div className="text-right mt-4">
          <button onClick={onClose} className="px-3 py-2 bg-electricblue text-white rounded">Close</button>
        </div>
      </div>
    </div>
  );
}
