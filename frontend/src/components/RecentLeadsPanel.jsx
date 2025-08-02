// components/RecentLeadsPanel.jsx
import React, { useEffect, useState } from "react";
import { API_BASE } from "../apiBase";

export default function RecentLeadsPanel({ vehicle, onClose }) {
  const [leads, setLeads] = useState([]);
  useEffect(() => {
    if (!vehicle) return;
    // Replace with your CRM API call!
    fetch(`${API_BASE}/api/leads?vehicle_id=${vehicle.id}&limit=5`)
      .then((res) => res.json())
      .then(setLeads)
      .catch(() => setLeads([]));
  }, [vehicle]);
  if (!vehicle) return null;
  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-xl p-6 z-50 overflow-auto border-l border-gray-200">
      <button className="absolute top-2 right-2" onClick={onClose}>
        ✖️
      </button>
      <h3 className="text-lg font-bold mb-2">
        Recent Leads for {vehicle.year} {vehicle.make} {vehicle.model}
      </h3>
      <ul className="divide-y">
        {leads.map((lead) => (
          <li key={lead.id} className="py-2 flex justify-between items-center">
            <div>
              <div className="font-semibold">{lead.name}</div>
              <div className="text-xs text-gray-500">
                {lead.source} • {new Date(lead.created_at).toLocaleString()}
              </div>
              <div className="text-xs text-blue-800">{lead.status}</div>
            </div>
            <button
              onClick={() => {
                /* e.g. open log follow-up modal */
              }}
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
