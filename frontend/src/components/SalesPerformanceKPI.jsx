import React, { useEffect, useState } from 'react';

export default function SalesPerformanceKPI() {
  const [stats, setStats] = useState({ demo: 0, worksheet: 0, offer: 0, sold: 0 });

  useEffect(() => {
    const API_BASE = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '/api';
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/floor-traffic/month-metrics`);
        if (!res.ok) return;
        const data = await res.json();
        const total = data.total_customers ?? data.totalCustomers ?? 0;
        const demo = data.demo_count ?? data.demoCount ?? 0;
        const worksheet =
          data.worksheet_count ?? data.worksheetCount ?? data.write_up_count ?? data.writeUpCount ?? 0;
        const offer = data.customer_offer_count ?? data.customerOfferCount ?? 0;
        const sold = data.sold_count ?? data.soldCount ?? 0;
        const pct = c => (total ? Math.round((c / total) * 100) : 0);
        setStats({
          demo: pct(demo),
          worksheet: pct(worksheet),
          offer: pct(offer),
          sold: pct(sold),
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-3">
      <h3 className="font-semibold">MTD Sales Performance</h3>
      <ul className="text-sm space-y-1">
        <li>Demo: {stats.demo}%</li>
        <li>Worksheet: {stats.worksheet}%</li>
        <li>Customer Offer: {stats.offer}%</li>
        <li>Sold: {stats.sold}%</li>
      </ul>
    </div>
  );
}
