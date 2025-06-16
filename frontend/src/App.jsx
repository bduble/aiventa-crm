import { useState, useEffect } from 'react';
import Leads from './Leads';

export default function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    const api = import.meta.env.VITE_API_BASE_URL + '/';
    fetch(api)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Error connecting to API'));
  }, []);

  return (
    <div className="min-h-screen bg-offwhite p-8">
      <h1 className="text-3xl font-bold text-electricblue mb-4">
        {message}
      </h1>
      <p className="text-slategray mb-8">
        This confirms our front-end is talking to the FastAPI back-end.
      </p>

      {/* Always render the Leads component on the page */}
      <Leads />
    </div>
  );
}
// frontend/src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Leads from './routes/Leads'
import Users from './routes/Users'
import ActivityTimeline from './components/ActivityTimeline'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Welcome to aiVenta!</h1>} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/users" element={<Users />} />
        <Route path="/activities" element={<ActivityTimeline />} />
      </Routes>
    </Router>
  )
}
