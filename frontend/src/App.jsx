import { useState, useEffect } from 'react';

export default function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Error connecting to API'));
  }, []);

  return (
    <div className="min-h-screen bg-offwhite p-8">
      <h1 className="text-3xl font-bold text-electricblue mb-4">
        {message}
      </h1>
      <p className="text-slategray">
        This confirms our front-end is talking to the FastAPI back-end.
      </p>
    </div>
  );
}