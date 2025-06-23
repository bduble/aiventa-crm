// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Leads                  from "./routes/Leads";
import Users                  from "./routes/Users";
import ActivityTimeline       from "./components/ActivityTimeline";
import CreateLeadForm         from "./components/CreateLeadForm";
import FloorLog               from "./routes/FloorLog";
import CreateFloorTrafficForm from "./components/CreateFloorTrafficForm";

export default function App() {
  return (
    <Router>
      {/* FIXED TOP NAV */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-white shadow dark:bg-gray-900">
        <div className="max-w-7xl mx-auto flex items-center gap-8 px-6 py-3">
          <Link to="/" className="text-gray-800 hover:underline dark:text-gray-100">Home</Link>
          <Link to="/leads" className="text-gray-800 hover:underline dark:text-gray-100">Leads</Link>
          <Link to="/leads/new" className="text-gray-800 hover:underline dark:text-gray-100">New Lead</Link>
          <Link to="/users" className="text-gray-800 hover:underline dark:text-gray-100">Users</Link>
          <Link to="/activities" className="text-gray-800 hover:underline dark:text-gray-100">Activities</Link>
          <Link to="/floor-traffic" className="text-gray-800 hover:underline dark:text-gray-100">Today's Floor Log</Link>
          <Link to="/floor-traffic/new" className="text-gray-800 hover:underline dark:text-gray-100">Log a Visitor</Link>
        </div>
      </nav>

      {/* PUSH CONTENT BELOW NAV */}
      <div className="pt-16 min-h-screen bg-offwhite p-8 dark:bg-gray-800 dark:text-gray-100">
        <Routes>
          <Route path="/" element={<h2>Welcome to aiVenta!</h2>} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/new" element={<CreateLeadForm />} />
          <Route path="/users" element={<Users />} />
          <Route path="/activities" element={<ActivityTimeline />} />
          <Route path="/floor-traffic" element={<FloorLog />} />
          <Route path="/floor-traffic/new" element={<CreateFloorTrafficForm />} />
        </Routes>
      </div>
    </Router>
  );
}
