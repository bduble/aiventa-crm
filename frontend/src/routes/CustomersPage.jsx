import { useState, useEffect } from 'react';
import KPIBar from '../components/KPIBar';
import CustomerFilters from '../components/CustomerFilters';
import CustomerTable from '../components/CustomerTable';
import Customer360Panel from '../components/Customer360Panel';
import AddCustomerModal from '../components/AddCustomerModal';
import ImportCSVModal from '../components/ImportCSVModal';
import BulkActionsBar from '../components/BulkActionsBar';
import MassTextModal from '../components/MassTextModal';
import MassEmailModal from '../components/MassEmailModal';

export default function CustomersPage() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(['All', 'Hot Leads', 'Service', 'BMW Owners', 'Equity+']);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [customers, setCustomers] = useState([]);
  const [panelCustomer, setPanelCustomer] = useState(null);
  const [kpi, setKPI] = useState({ total: 0, newThisMonth: 0, hotLeads: 0, missed: 0, nextAppt: '--' });

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Bulk actions
  const [selected, setSelected] = useState([]);
  const [showMassText, setShowMassText] = useState(false);
  const [showMassEmail, setShowMassEmail] = useState(false);

  useEffect(() => {
    function openAdd() { setShowAdd(true); }
    function openImport() { setShowImport(true); }
    window.addEventListener('openAddCustomer', openAdd);
    window.addEventListener('openImportCSV', openImport);
    return () => {
      window.removeEventListener('openAddCustomer', openAdd);
      window.removeEventListener('openImportCSV', openImport);
    };
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [search, selectedFilter, API_BASE]);

  function isNewThisMonth(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  async function fetchCustomers() {
    try {
      let url = `${API_BASE}/customers`;
      const params = [];
      if (search) params.push(`q=${encodeURIComponent(search)}`);
      url += params.length ? '?' + params.join('&') : '';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load customers');
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
      setKPI({
        total: data.length,
        newThisMonth: data.filter(c => isNewThisMonth(c.created_at)).length,
        hotLeads: data.filter(c => c.hotness >= 8).length,
        missed: data.filter(c => c.missedFollowup).length,
        nextAppt: data
          .filter(c => c.nextAppointment)
          .sort((a, b) => new Date(a.nextAppointment) - new Date(b.nextAppointment))[0]?.nextAppointment || '--'
      });
      setSelected([]); // Clear selection on data load
    } catch (err) {
      setCustomers([]);
      setKPI({ total: 0, newThisMonth: 0, hotLeads: 0, missed: 0, nextAppt: '--' });
      setSelected([]);
    }
  }

  async function handleSaveCustomer(form) {
    await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' }
    });
    setShowAdd(false);
    fetchCustomers();
  }

  async function handleImport(customers) {
    await Promise.all(customers.map(c =>
      fetch(`${API_BASE}/customers`, {
        method: 'POST',
        body: JSON.stringify(c),
        headers: { 'Content-Type': 'application/json' }
      })
    ));
    setShowImport(false);
    fetchCustomers();
  }

  // Bulk selection logic
  function handleSelect(id, checked) {
    setSelected(sel => checked ? [...sel, id] : sel.filter(_id => _id !== id));
  }
  function handleSelectAll(checked) {
    setSelected(checked ? customers.map(c => c.id) : []);
  }
  function clearSelection() {
    setSelected([]);
  }

  // Mass action logic
  async function handleMassTextSend(message) {
    // Example endpoint - update as needed
    await fetch(`${API_BASE}/bulk/text`, {
      method: 'POST',
      body: JSON.stringify({ ids: selected, message }),
      headers: { 'Content-Type': 'application/json' }
    });
    setShowMassText(false);
    clearSelection();
  }
  async function handleMassEmailSend({ subject, body }) {
    await fetch(`${API_BASE}/bulk/email`, {
      method: 'POST',
      body: JSON.stringify({ ids: selected, subject, body }),
      headers: { 'Content-Type': 'application/json' }
    });
    setShowMassEmail(false);
    clearSelection();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <KPIBar {...kpi} />
      <CustomerFilters search={search} setSearch={setSearch} filters={filters} onFilterClick={setSelectedFilter} />
      <CustomerTable
        customers={customers}
        onRowClick={setPanelCustomer}
        selected={selected}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
      />
      {panelCustomer && (
        <Customer360Panel
          customer={panelCustomer}
          onClose={() => setPanelCustomer(null)}
        />
      )}
      <AddCustomerModal open={showAdd} onClose={() => setShowAdd(false)} onSave={handleSaveCustomer} />
      <ImportCSVModal open={showImport} onClose={() => setShowImport(false)} onImport={handleImport} />
      <BulkActionsBar
        count={selected.length}
        onClear={clearSelection}
        onMassText={() => setShowMassText(true)}
        onMassEmail={() => setShowMassEmail(true)}
        onTag={() => alert('Tagging coming soon!')}
      />
      <MassTextModal
        open={showMassText}
        onClose={() => setShowMassText(false)}
        onSend={handleMassTextSend}
        count={selected.length}
      />
      <MassEmailModal
        open={showMassEmail}
        onClose={() => setShowMassEmail(false)}
        onSend={handleMassEmailSend}
        count={selected.length}
      />
    </div>
  );
}
