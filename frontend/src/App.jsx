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
      <nav className="fixed inset-x-0 top-0 z-50 bg-white shadow-md dark:bg-gray-900">
        <div className="max-w-7xl mx-auto flex items-center space-x-8 px-6 py-4">
          <Link to="/" className="text-gray-800 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300">Home</Link>
          <Link to="/leads" className="text-gray-800 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300">Leads</Link>
          <Link to="/leads/new" className="text-gray-800 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300">New Lead</Link>
          <Link to="/users" className="text-gray-800 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300">Users</Link>
          <Link to="/activities" className="text-gray-800 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300">Activities</Link>
          <Link to="/floor-traffic" className="text-gray-800 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300">Today's Floor Log</Link>
          <Link to="/floor-traffic/new" className="text-gray-800 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300">Log a Visitor</Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-offwhite dark:bg-gray-800 dark:text-gray-100">
        <Routes>
          <Route path="/" element={<h2 className="text-xl font-medium">Welcome to aiVenta!</h2>} />
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
