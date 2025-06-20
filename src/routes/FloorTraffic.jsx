// src/routes/FloorTraffic.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function FloorTraffic() {
  const [visits, setVisits] = useState([]);
  const API = import.meta.env.VITE_API_BASE_URL + "/floor-traffic";

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => setVisits(data))
      .catch(err => console.error("Error loading floor traffic:", err));
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Today's Floor Log</h2>
        <Link
          to="/floor-traffic/new"
          className="px-4 py-2 bg-electricblue text-white rounded"
        >
          + New Visit
        </Link>
      </div>

      {visits.length === 0 ? (
        <p>No visits recorded today.</p>
      ) : (
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {visits.map(v => (
              <tr key={v.id} className="border-t">
                <td className="px-4 py-2">{new Date(v.visit_time).toLocaleTimeString()}</td>
                <td className="px-4 py-2">{v.name}</td>
                <td className="px-4 py-2">{v.vehicle_of_interest || "—"}</td>
                <td className="px-4 py-2">{v.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
