// src/routes/Leads.jsx
import React, { useState, useEffect } from "react";

export default function Leads() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/leads`)
      .then(r => r.json())
      .then(setLeads)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Lead Log</h2>
      <p className="mb-4 text-sm text-gray-600">
        Leads are potential customers who have submitted their information
        online or over the phone.
      </p>
      <ul>
        {leads.map(l => (
          <li key={l.id}>
            {l.name}{l.email ? ` — ${l.email}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
