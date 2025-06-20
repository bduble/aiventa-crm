import { useEffect, useState } from "react";

export default function FloorLog() {
  const [visits, setVisits] = useState([]);
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/floor-traffic?date_str=${today}`)
      .then((r) => r.json())
      .then(setVisits)
      .catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Today's Floor Log</h2>
      {visits.length === 0 ? (
        <p>No visitors yet today.</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              {["Time","Name","Email","Phone","Notes"].map((h) => (
                <th key={h} className="p-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.id} className="border-b">
                <td className="p-2">{new Date(v.visit_time).toLocaleTimeString()}</td>
                <td className="p-2">{v.first_name} {v.last_name}</td>
                <td className="p-2">{v.email || "—"}</td>
                <td className="p-2">{v.phone || "—"}</td>
                <td className="p-2">{v.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
