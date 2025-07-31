import React, { useState } from 'react';
import Avatar from './Avatar';

export default function Customer360Panel({ customer, onClose }) {
  const [tab, setTab] = useState('timeline');
  if (!customer) return null;
  // Demo: fake AI suggestion (replace with real AI call if you have it)
  const aiSuggestion = customer.stage === 'New'
    ? "Call today—customer hasn't been contacted in 4 days. Offer a test drive."
    : customer.stage === 'Sold'
    ? "Check-in for service follow-up and CSI survey."
    : "Send current offer—lease matures in 3 months.";

  return (
    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 p-6 overflow-y-auto transition-all duration-300">
      <button className="absolute top-4 right-4 text-gray-600" onClick={onClose}>✖</button>
      <div className="flex items-center gap-4 mb-4">
        <Avatar name={customer.name} />
        <div>
          <div className="text-xl font-bold">{customer.name}</div>
          <div className="text-xs text-gray-400">{customer.email} | {customer.phone}</div>
          <div className="mt-1">Stage: <b>{customer.stage}</b></div>
        </div>
      </div>
      <div className="mb-4">
        <div className="text-blue-700 font-bold">AI Next Best Action:</div>
        <div className="bg-blue-100 text-blue-900 rounded-xl p-2 mt-1">{aiSuggestion}</div>
      </div>
      {/* Tabs */}
      <div className="flex gap-3 mb-4">
        <button className={tab==='timeline' ? 'font-bold text-blue-700' : 'text-gray-500'} onClick={()=>setTab('timeline')}>Timeline</button>
        <button className={tab==='vehicles' ? 'font-bold text-blue-700' : 'text-gray-500'} onClick={()=>setTab('vehicles')}>Vehicles</button>
        <button className={tab==='notes' ? 'font-bold text-blue-700' : 'text-gray-500'} onClick={()=>setTab('notes')}>Notes</button>
        <button className={tab==='offers' ? 'font-bold text-blue-700' : 'text-gray-500'} onClick={()=>setTab('offers')}>Offers</button>
      </div>
      <div>
        {tab === 'timeline' && (
          <ul className="list-disc ml-6 text-sm text-gray-600 space-y-2">
            {(customer.timeline || []).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
            {/* Replace with real timeline from API */}
          </ul>
        )}
        {tab === 'vehicles' && (
          <ul className="list-disc ml-6 text-sm text-gray-600 space-y-2">
            {(customer.vehicles || []).map((v, i) => (
              <li key={i}>{v.year} {v.make} {v.model} ({v.vin})</li>
            ))}
            {/* Replace with real vehicle data */}
          </ul>
        )}
        {tab === 'notes' && (
          <ul className="list-disc ml-6 text-sm text-gray-600 space-y-2">
            {(customer.notes || []).map((n, i) => (
              <li key={i}>{n.date}: {n.text}</li>
            ))}
          </ul>
        )}
        {tab === 'offers' && (
          <ul className="list-disc ml-6 text-sm text-gray-600 space-y-2">
            {(customer.offers || []).map((o, i) => (
              <li key={i}>{o.date}: {o.description} — <b>{o.status}</b></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
