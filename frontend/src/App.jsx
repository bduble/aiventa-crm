// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Leads from "./routes/Leads";
import Users from "./routes/Users";
import ActivityTimeline from "./components/ActivityTimeline";
import CreateLeadForm from "./components/CreateLeadForm";
import FloorTraffic from "./routes/FloorTraffic.jsx";
import CreateFloorTrafficForm from "./components/CreateFloorTrafficForm";

export default function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-100 space-x-4">
        <Link to="/">Home</Link>
        <Link to="/leads">Leads</Link>
        <Link to="/leads/new">New Lead</Link>
        <Link to="/users">Users</Link>
        <Link to="/activities">Activities</Link>
        <Link to="/floor-traffic">Today's Floor Log</Link>
        <Link to="/floor-traffic/new">Log a Visitor</Link>
      </nav>
      <div className="min-h-screen bg-offwhite p-8">
        <Routes>
          <Route path="/" element={<h2>Welcome to aiVenta!</h2>} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/new" element={<CreateLeadForm />} />
          <Route path="/users" element={<Users />} />
          <Route path="/activities" element={<ActivityTimeline />} />
          <Route path="/floor-traffic" element={<FloorTraffic />} />
          <Route path="/floor-traffic/new" element={<CreateFloorTrafficForm />} />
        </Routes>
      </div>
    </Router>
  );
}
