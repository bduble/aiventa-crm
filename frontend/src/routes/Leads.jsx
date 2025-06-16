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
      <h2>Leads</h2>
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
