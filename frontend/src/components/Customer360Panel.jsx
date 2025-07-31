import React from 'react';
import Avatar from './Avatar';

export default function Customer360Panel({ customer, onClose }) {
  if (!customer) return null;
  return (
    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 p-6 overflow-y-auto transition-all duration-300">
      <button className="absolute top-4 right-4 text-gray-600" onClick={onClose}>✖</button>
      <div className="flex items-center gap-4 mb-4">
        <Avatar name={customer.name} />
        <div>
          <div className="text-xl font-bold">{customer.name}</div>
          <div className="text-xs text-gray-400">{customer.email} | {customer.phone}</div>
          <div className="mt-1">Stage: <b>{customer.stage}</b></div>
          {/* Add tags, badges, etc. */}
        </div>
      </div>
      {/* Tabs: Timeline | Vehicles | Offers | Notes | Files, etc. */}
      <div className="mt-4">
        <div className="font-semibold mb-2">Customer History</div>
        {/* Replace this with mapped timeline data */}
        <ul className="list-disc ml-6 text-sm text-gray-600">
          <li>Last contacted: {customer.lastContact}</li>
          <li>Lifetime Value: ${customer.ltv?.toLocaleString() || 0}</li>
          <li>Next Action: {customer.nextAction || '—'}</li>
        </ul>
        {/* Add more as needed */}
      </div>
    </div>
  );
}
