import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function CustomerCard() {
  const { id } = useParams();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  const [customer, setCustomer] = useState(null);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`${API_BASE}/customers/${id}`);
        if (!res.ok) throw new Error('Failed to load customer');
        const data = await res.json();
        setCustomer(data);
        if (data.lead_id) {
          const lr = await fetch(`${API_BASE}/leads/${data.lead_id}`);
          if (lr.ok) {
            setLead(await lr.json());
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id, API_BASE]);

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Customer not found</div>;

  return (
    <div className="p-4 space-y-4">
      <Link to="/customers" className="text-blue-600 hover:underline">
        &larr; Back to Customers
      </Link>
      <div className="bg-white shadow rounded p-4 space-y-2">
        <h2 className="text-2xl font-bold">{customer.name}</h2>
        {customer.email && <p>Email: {customer.email}</p>}
        {customer.phone && <p>Phone: {customer.phone}</p>}
        {lead?.vehicle_interest && <p>Vehicle Interest: {lead.vehicle_interest}</p>}
        {lead?.trade_vehicle && <p>Trade Vehicle: {lead.trade_vehicle}</p>}
      </div>
    </div>
  );
}
