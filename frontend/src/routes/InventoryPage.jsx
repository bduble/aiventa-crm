import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

import { API_BASE } from '../apiBase';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import InventoryGrid from '../components/InventoryGrid';
import InventoryTable from '../components/InventoryTable';
import VehicleModal from '../components/VehicleModal';
import BulkActionsBar from '../components/BulkActionsBar';

// --- RecentLeadsPanel component (you can extract this if you want) ---
function RecentLeadsPanel({ vehicle, onClose }) {
  const [leads, setLeads] = useState([]);
  useEffect(() => {
    if (!vehicle) return;
    fetch(`${API_BASE}/api/leads?vehicle_id=${vehicle.id}&limit=5`)
      .then(res => res.json())
      .then(setLeads)
      .catch(() => setLeads([]));
  }, [vehicle]);
  if (!vehicle) return null;
  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-xl p-6 z-50 overflow-auto border-l border-gray-200">
      <button className="absolute top-2 right-2" onClick={onClose}>✖️</button>
      <h3 className="text-lg font-bold mb-2">
        Recent Leads for {vehicle.year} {vehicle.make} {vehicle.model}
      </h3>
      <ul className="divide-y">
        {leads.map(lead => (
          <li key={lead.id} className="py-2 flex justify-between items-center">
            <div>
              <div className="font-semibold">{lead.name}</div>
              <div className="text-xs text-gray-500">
                {lead.source} • {new Date(lead.created_at).toLocaleString()}
              </div>
              <div className="text-xs text-blue-800">{lead.status}</div>
            </div>
            <button
              onClick={() => { /* log follow-up modal, if desired */ }}
              className="text-xs px-2 py-1 rounded bg-blue-100"
            >
              Log Follow-Up
            </button>
          </li>
        ))}
        {leads.length === 0 && (
          <li className="py-2 text-gray-400">No recent leads.</li>
        )}
      </ul>
    </div>
  );
}

export default function InventoryPage() {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const initialSearch = params.get('q') || '';

  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [debounced, setDebounced] = useState('');
  const [filters, setFilters] = useState({
    make: [],
    model: [],
    yearMin: '',
    yearMax: '',
    priceMin: '',
    priceMax: '',
    mileageMax: '',
    condition: [],
    color: '',
    fuelType: '',
    drivetrain: ''
  });
  const [sort, setSort] = useState('');
  const [view, setView] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // --- New: Bulk selection and recent leads ---
  const [selectedIds, setSelectedIds] = useState([]);
  const [recentLeadsVehicle, setRecentLeadsVehicle] = useState(null);

  // Update search when URL query changes
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setSearch(p.get('q') || '');
  }, [location.search]);

  const makeOptions = useMemo(
    () => Array.from(new Set(vehicles.map(v => v.make).filter(Boolean))).sort(),
    [vehicles]
  );

  const modelsByMake = useMemo(() => {
    const map = {};
    vehicles.forEach(v => {
      if (!v.make || !v.model) return;
      if (!map[v.make]) map[v.make] = new Set();
      map[v.make].add(v.model);
    });
    const result = {};
    Object.keys(map).forEach(k => {
      result[k] = Array.from(map[k]).sort();
    });
    return result;
  }, [vehicles]);

  const allModels = useMemo(
    () => Array.from(new Set(vehicles.map(v => v.model).filter(Boolean))).sort(),
    [vehicles]
  );

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchInventory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/inventory/`);
      if (!res.ok) throw new Error('Failed to load inventory');
      const data = await res.json();
      setVehicles(data);
    } catch (err) {
      console.error(err);
      setError('Unable to fetch inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  // Apply search, filter, and sort options to the vehicles list
  const applyFilters = () => {
    let list = [...vehicles];
    if (debounced) {
      const t = debounced.toLowerCase();
      list = list.filter(v =>
        v.stockNumber?.toLowerCase().includes(t) ||
        v.vin?.toLowerCase().includes(t) ||
        `${v.make} ${v.model}`.toLowerCase().includes(t)
      );
    }
    if (filters.make?.length)
      list = list.filter(v => filters.make.includes(v.make));
    if (filters.model?.length)
      list = list.filter(v => filters.model.includes(v.model));
    if (filters.yearMin) list = list.filter(v => Number(v.year) >= Number(filters.yearMin));
    if (filters.yearMax) list = list.filter(v => Number(v.year) <= Number(filters.yearMax));
    if (filters.priceMin) list = list.filter(v => Number(v.price) >= Number(filters.priceMin));
    if (filters.priceMax) list = list.filter(v => Number(v.price) <= Number(filters.priceMax));
    if (filters.mileageMax) list = list.filter(v => Number(v.mileage) <= Number(filters.mileageMax));
    if (filters.condition?.length)
      list = list.filter(v => {
        const val = String(v.condition || v.type || '').toLowerCase();
        const isCertified = Boolean(v.certified) || val.includes('certified');
        return (
          (filters.condition.includes('Certified') && isCertified) ||
          (filters.condition.includes('New') && val === 'new') ||
          (filters.condition.includes('Used') && val === 'used')
        );
      });
    if (filters.color) list = list.filter(v => v.color?.toLowerCase().includes(filters.color.toLowerCase()));
    if (filters.fuelType) list = list.filter(v => v.fuelType?.toLowerCase().includes(filters.fuelType.toLowerCase()));
    if (filters.drivetrain) list = list.filter(v => v.drivetrain?.toLowerCase().includes(filters.drivetrain.toLowerCase()));

    if (sort) {
      list.sort((a, b) => {
        if (sort === 'price' || sort === 'mileage' || sort === 'year') {
          return Number(a[sort]) - Number(b[sort]);
        }
        if (sort === 'days') {
          return Number(a.daysInInventory) - Number(b.daysInInventory);
        }
        return 0;
      });
    }
    setFiltered(list);
    setCurrentPage(1);
  };

  useEffect(() => { applyFilters(); }, [vehicles, debounced, filters, sort]);

  const handleToggle = async vehicle => {
    const updated = { ...vehicle, active: !vehicle.active };
    setVehicles(prev => prev.map(v => v.id === vehicle.id ? updated : v));
    setFiltered(prev => prev.map(v => v.id === vehicle.id ? updated : v));
    try {
      const res = await fetch(`${API_BASE}/api/inventory/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: updated.active })
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Vehicle updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update vehicle');
      setVehicles(prev => prev.map(v => v.id === vehicle.id ? vehicle : v));
      setFiltered(prev => prev.map(v => v.id === vehicle.id ? vehicle : v));
    }
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = vehicle => { setEditing(vehicle); setModalOpen(true); };

  const handleSubmit = async data => {
    const isEdit = !!editing;
    try {
      const url = `${API_BASE}/api/inventory${isEdit ? '/' + editing.id : '/'}`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save vehicle');
      toast.success(isEdit ? 'Vehicle updated' : 'Vehicle added');
      setModalOpen(false);
      setEditing(null);
      fetchInventory();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error saving vehicle');
    }
  };

  // --- New: Bulk actions ---
  const handleBulkAction = (action, ids) => {
    if (!ids?.length) return;
    toast.success(`"${action}" for ${ids.length} vehicle(s)!`);
    setSelectedIds([]);
    // Implement your actual logic here: open modal, call API, etc.
  };

  // --- New: Pass selection props to table/grid ---
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="p-4 space-y-4 relative">
      <h2 className="text-2xl font-bold">Inventory</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Keyword"
            className="border rounded px-3 py-2 w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={sort} onChange={e => setSort(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Sort</option>
            <option value="price">Price</option>
            <option value="mileage">Mileage</option>
            <option value="year">Year</option>
            <option value="days">Days In Inventory</option>
          </select>
          <button onClick={() => setView(v => v === 'grid' ? 'table' : 'grid')} className="px-2 py-2 border rounded">
            {view === 'grid' ? 'Table' : 'Grid'}
          </button>
        </div>
        <button onClick={openAdd} className="px-3 py-2 bg-electricblue text-white rounded self-start">
          Add Vehicle
        </button>
      </div>

      <FilterPanel
        filters={filters}
        onChange={setFilters}
        options={{ makes: makeOptions, modelsByMake, allModels }}
      />

      <div className="text-sm text-gray-600 dark:text-gray-300">
        Showing {filtered.length} vehicles
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-8 w-8 text-gray-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      ) : (
        view === 'grid' ? (
          <InventoryGrid
            vehicles={paginated}
            onEdit={openEdit}
            onToggle={handleToggle}
            // New:
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onShowLeads={setRecentLeadsVehicle}
          />
        ) : (
          <InventoryTable
            vehicles={paginated}
            onEdit={openEdit}
            onToggle={handleToggle}
            // New:
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onShowLeads={setRecentLeadsVehicle}
          />
        )
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <VehicleModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        initialData={editing}
      />

      {/* CRM Bulk Actions Bar */}
      <BulkActionsBar
        count={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onMassText={() => handleBulkAction("massText", selectedIds)}
        onMassEmail={() => handleBulkAction("massEmail", selectedIds)}
        onTag={() => handleBulkAction("tag", selectedIds)}
      />

      {/* Recent Leads Panel */}
      <RecentLeadsPanel
        vehicle={recentLeadsVehicle}
        onClose={() => setRecentLeadsVehicle(null)}
      />
    </div>
  );
}
