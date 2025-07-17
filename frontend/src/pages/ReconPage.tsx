import { useEffect, useMemo, useState } from 'react';
import { fetchReconData, fetchReconSteps } from '../api/recon';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Helper to calc diff in days
function diffDays(a: Date | string, b: Date | string) {
  return (new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24);
}

export default function ReconPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stepsMap, setStepsMap] = useState<Record<string, any>>({});
  const [range, setRange] = useState('last30days');
  const [stage, setStage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchReconData(range);
      setVehicles(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [range]);

  // fetch steps for vehicles when list changes
  useEffect(() => {
    const fetchAll = async () => {
      const map: Record<string, any> = {};
      await Promise.all(
        vehicles.map(async (v) => {
          try {
            const steps = await fetchReconSteps(v.id);
            map[v.id] = steps || {};
          } catch {}
        })
      );
      setStepsMap(map);
    };
    if (vehicles.length) fetchAll();
  }, [vehicles]);

  // computed metrics
  const metrics = useMemo(() => {
    const completed = vehicles.filter((v) => v.saleReadyDate);
    const adrVals = completed.map((v) => diffDays(v.saleReadyDate, v.reconStartDate));
    const t2lVals = completed.map((v) => diffDays(v.saleReadyDate, v.intakeDate));
    const adr = adrVals.length ? adrVals.reduce((a, b) => a + b, 0) / adrVals.length : 0;
    const t2l = t2lVals.length ? t2lVals.reduce((a, b) => a + b, 0) / t2lVals.length : 0;
    const withinFive = t2lVals.filter((d) => d <= 5).length;
    const pctWithinFive = t2lVals.length ? (withinFive / t2lVals.length) * 100 : 0;

    const distribution = { '0-3': 0, '4-7': 0, '8+': 0 } as Record<string, number>;
    adrVals.forEach((d) => {
      if (d <= 3) distribution['0-3']++;
      else if (d <= 7) distribution['4-7']++;
      else distribution['8+']++;
    });

    // bottleneck: max step gap per vehicle averaged
    const delays: number[] = [];
    Object.values(stepsMap).forEach((steps: any) => {
      const entries = Object.values(steps || {}).sort((a: any, b: any) => new Date(a).getTime() - new Date(b).getTime());
      let max = 0;
      for (let i = 0; i < entries.length - 1; i++) {
        const gap = diffDays(entries[i + 1], entries[i]) * 24; // hours
        if (gap > max) max = gap;
      }
      if (max) delays.push(max);
    });
    const avgDelay = delays.length ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;

    // trends
    const byDate: Record<string, { adrSum: number; t2lSum: number; count: number }> = {};
    completed.forEach((v) => {
      const date = String(v.saleReadyDate).slice(0, 10);
      const a = diffDays(v.saleReadyDate, v.reconStartDate);
      const t = diffDays(v.saleReadyDate, v.intakeDate);
      if (!byDate[date]) byDate[date] = { adrSum: 0, t2lSum: 0, count: 0 };
      byDate[date].adrSum += a;
      byDate[date].t2lSum += t;
      byDate[date].count += 1;
    });
    const trend = Object.keys(byDate)
      .sort()
      .map((d) => ({
        date: d,
        adr: byDate[d].adrSum / byDate[d].count,
        t2l: byDate[d].t2lSum / byDate[d].count,
      }));

    return { adr, t2l, pctWithinFive, distribution, avgDelay, trend };
  }, [vehicles, stepsMap]);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (stage && v.status !== stage) return false;
      return true;
    });
  }, [vehicles, stage]);

  const overThreshold = (v: any) => diffDays(new Date(), v.reconStartDate) > 7;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Recon Dashboard</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 bg-white rounded shadow p-4">
          <p className="text-gray-500">ADR</p>
          <p className="text-2xl font-semibold">{metrics.adr.toFixed(1)} days</p>
        </div>
        <div className="flex-1 bg-white rounded shadow p-4">
          <p className="text-gray-500">T2L</p>
          <p className="text-2xl font-semibold">{metrics.t2l.toFixed(1)} days</p>
        </div>
        <div className="flex-1 bg-white rounded shadow p-4">
          <p className="text-gray-500">% ≤ 5 Days</p>
          <p className="text-2xl font-semibold">{metrics.pctWithinFive.toFixed(0)}%</p>
        </div>
        <div className="flex-1 bg-white rounded shadow p-4">
          <p className="text-gray-500">Avg Bottleneck Delay</p>
          <p className="text-2xl font-semibold">{metrics.avgDelay.toFixed(1)} hrs</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics.trend}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="adr" stroke="#2563eb" name="ADR" />
            <Line type="monotone" dataKey="t2l" stroke="#059669" name="T2L" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded shadow p-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[
            { name: '0-3', value: metrics.distribution['0-3'] },
            { name: '4-7', value: metrics.distribution['4-7'] },
            { name: '8+', value: metrics.distribution['8+'] },
          ]}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 items-center">
        <select value={range} onChange={(e) => setRange(e.target.value)} className="border rounded px-2 py-1">
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="last90days">Last 90 Days</option>
        </select>
        <input type="text" placeholder="Stage" value={stage} onChange={(e) => setStage(e.target.value)} className="border rounded px-2 py-1" />
      </div>

      {loading ? (
        <div className="p-4">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-slategray text-white">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Days In Recon</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className={`${overThreshold(v) ? 'bg-red-100' : ''} odd:bg-gray-50`}>
                  <td className="p-2 whitespace-nowrap">{v.id}</td>
                  <td className="p-2 whitespace-nowrap">{v.status}</td>
                  <td className="p-2 whitespace-nowrap">{diffDays(new Date(), v.reconStartDate).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
