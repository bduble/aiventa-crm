export async function fetchReconData(range = 'last30days') {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
  const res = await fetch(`${API_BASE}/api/vehicles/recon?range=${encodeURIComponent(range)}`);
  if (!res.ok) throw new Error('Failed to fetch recon data');
  return res.json();
}

export async function fetchReconSteps(id) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
  const res = await fetch(`${API_BASE}/api/vehicles/recon/steps?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch recon steps');
  return res.json();
}

