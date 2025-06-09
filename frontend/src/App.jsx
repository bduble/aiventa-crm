import { useState, useEffect } from 'react';

export default function App() {
  const [leads, setLeads] = useState(null);
  const api = 'https://aiventa-crm.onrender.com/leads';

  useEffect(() => {
    console.log('Fetching from:', api);
    fetch(api)
      .then(r => {
        console.log('Status:', r.status);
        return r.json();
      })
      .then(data => {
        console.log('Data:', data);
        setLeads(data);
      })
      .catch(err => console.error('Error:', err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Lead Fetch Test</h1>
      {leads === null ? (
        <p>Loading...</p>
      ) : (
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(leads, null, 2)}</pre>
      )}
    </div>
  );
}
