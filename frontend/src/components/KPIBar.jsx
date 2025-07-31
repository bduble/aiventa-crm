import React from 'react';

export default function KPIBar({ total, newThisMonth, hotLeads, missed, nextAppt }) {
  return (
    <div className="sticky top-0 z-10 bg-white/95 flex items-center justify-between border-b py-3 px-6 shadow-sm">
      <div className="flex gap-6 text-lg font-semibold">
        <span>Total: <b>{total}</b></span>
        <span>New This Month: <b>{newThisMonth}</b></span>
        <span>Hot Leads: <b>{hotLeads}</b></span>
        <span>Missed Opps: <b>{missed}</b></span>
        <span>Next Appt: <b>{nextAppt || '--'}</b></span>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-2xl font-bold shadow-lg hover:bg-blue-700"
        onClick={() => window.dispatchEvent(new CustomEvent('openAddCustomer'))}
      >
        + Add Customer
      </button>
    </div>
  );
}
