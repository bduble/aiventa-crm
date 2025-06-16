// src/App.jsx

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// these paths must match real files under src/routes & src/components
import Leads from "./routes/Leads";
import Users from "./routes/Users";
import ActivityTimeline from "./components/ActivityTimeline";

export default function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    const api = import.meta.env.VITE_API_BASE_URL + "/";
    fetch(api)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Error connecting to API"));
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-offwhite p-8">
        <h1 className="text-3xl font-bold text-electricblue mb-4">
          {message}
        </h1>
        <p className="text-slategray mb-8">
          This confirms our front-end is talking to the FastAPI back-end.
        </p>
        <Routes>
          <Route path="/" element={<h2>Welcome to aiVenta!</h2>} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/users" element={<Users />} />
          {/* and your activity timeline, etc. */}
          <Route
            path="/activities"
            element={<ActivityTimeline />}
          />
        </Routes>
      </div>
    </Router>
  );
}
