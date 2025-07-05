import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import FloorTrafficTable from '../components/FloorTrafficTable';

export default function FloorTrafficPage() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
  const API_BASE = import.meta.env.PROD
    ? import.meta.env.VITE_API_BASE_URL
    : '/api';

  // Gracefully handle missing env vars to avoid runtime errors
  const supabase =
    supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchToday = async () => {
      setLoading(true);
      setError('');

      try {
        if (supabase) {
          const today = new Date();
          const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const end = new Date(start);
          end.setDate(end.getDate() + 1);
          const { data, error: err } = await supabase
            .from('floor_traffic_customers')
            .select('*')
            .gte('visit_time', start.toISOString())
            .lt('visit_time', end.toISOString())
            .order('visit_time', { ascending: true });
          if (err) throw err;
          setRows(data || []);
        } else {
          const res = await fetch(`${API_BASE}/floor-traffic`);
          if (!res.ok) throw new Error('Failed to load traffic');
          const data = await res.json();
          setRows(data || []);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load traffic');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchToday();
  }, [supabase, API_BASE]);

  const responded = rows.filter(r => r.last_response_time).length;
  const unresponded = rows.length - responded;

  const kpiClass =
    'flex-1 bg-white shadow rounded-2xl p-4 hover:-translate-y-1 transition-transform';

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Floor Traffic</h1>

      {!supabase && (
        <p className="mt-4 text-yellow-700">
          Supabase is not configured. Falling back to the API server.
          Ensure VITE_SUPABASE_URL and VITE_SUPABASE_KEY are set if you wish to
          query Supabase directly.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className={kpiClass}>
          <p className="text-gray-500">Total Visitors Today</p>
          <p className="text-2xl font-semibold">{rows.length}</p>
        </div>
        <div className={kpiClass}>
          <p className="text-gray-500">Responded Leads</p>
          <p className="text-2xl font-semibold">{responded}</p>
        </div>
        <div className={kpiClass}>
          <p className="text-gray-500">Unresponded Leads</p>
          <p className="text-2xl font-semibold">{unresponded}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {loading ? (
        <div className="p-4">Loading…</div>
      ) : (
        <FloorTrafficTable rows={rows} />
      )}
    </div>
  );
}
