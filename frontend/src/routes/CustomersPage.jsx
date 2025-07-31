import { useState, useEffect } from 'react';
import KPIBar from '../components/KPIBar';
import CustomerFilters from '../components/CustomerFilters';
import CustomerTable from '../components/CustomerTable';
import Customer360Panel from '../components/Customer360Panel';

export default function CustomersPage() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(['All', 'Hot Leads', 'Service', 'BMW Owners', 'Equity+']);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [customers, setCustomers] = useState([]);
  const [panelCustomer, setPanelCustomer] = useState(null);
  // These stats could come from an API endpoint or calculated here
  const [kpi, setKPI] = useState({ total: 0, newThisMonth: 0, hotLeads: 0, missed: 0, nextAppt: '--' });

  useEffect(() => {
    // Fetch customers & update KPI stats
    const fetchCustomers = async () => {
      try {
        let url = `${API_BASE}/customers`;
        const params = [];
        if (search) params.push(`q=${encodeURIComponent(search)}`);
        // For filter: implement custom filter logic (API or frontend)
        url += params.length ? '?' + params.join('&') : '';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load customers');
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : []);
        // Calculate KPI here for demo (replace with real stats API)
        setKPI({
          total: data.length,
          newThisMonth: data.filter(c => isNewThisMonth(c.created_at)).length,
          hotLeads: data.filter(c => c.hotness >= 8).length,
          missed: data.filter(c => c.missedFollowup).length,
          nextAppt: data
            .filter(c => c.nextAppointment)
            .sort((a, b) => new Date(a.nextAppointment) - new Date(b.nextAppointment))[0]?.nextAppointment || '--'
        });
      } catch (err) {
        setCustomers([]);
        setKPI({ total: 0, newThisMonth: 0, hotLeads: 0, missed: 0, nextAppt: '--' });
      }
    };
    fetchCustomers();
  }, [search, selectedFilter, API_BASE]);

  function isNewThisMonth(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <KPIBar {...kpi} />
      <CustomerFilters search={search} setSearch={setSearch} filters={filters} onFilterClick={setSelectedFilter} />
      <CustomerTable customers={customers} onRowClick={setPanelCustomer} />
      {panelCustomer && (
        <Customer360Panel
          customer={panelCustomer}
          onClose={() => setPanelCustomer(null)}
        />
      )}
      {/* AddCustomerModal and ImportCSVModal go here, triggered by events/buttons */}
    </div>
  );
}
