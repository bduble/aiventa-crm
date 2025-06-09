import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Leads from './Leads';

export default function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch(\`\${import.meta.env.VITE_API_BASE_URL}/\`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Error connecting to API'));
  }, []);

  return (
    <Router>
      <nav className="p-4 bg-white shadow">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/leads">Leads</Link>
      </nav>
      <div className="min-h-screen bg-offwhite p-8">
        <h1 className="text-3xl font-bold text-electricblue mb-4">
          {message}
        </h1>
        <p className="text-slategray mb-8">
          This confirms our front-end is talking to the FastAPI back-end.
        </p>
        {/* Always show Leads here */}
        <Leads />
      </div>
    </Router>
  );
}
