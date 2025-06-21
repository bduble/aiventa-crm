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
  // Inline styles for guaranteed layout control
  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1000,
  };
  const navInnerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '0.75rem 1.5rem',
  };
  const contentWrapperStyle = {
    paddingTop: '64px',     // same height as nav
    minHeight: '100vh',
    background: '#f9f9f9',
    padding: '2rem',
  };

  return (
    <Router>
      {/* FIXED TOP NAV */}
      <nav style={navStyle}>
        <div style={navInnerStyle}>
          <Link to="/">Home</Link>
          <Link to="/leads">Leads</Link>
          <Link to="/leads/new">New Lead</Link>
          <Link to="/users">Users</Link>
          <Link to="/activities">Activities</Link>
          <Link to="/floor-traffic">Today's Floor Log</Link>
          <Link to="/floor-traffic/new">Log a Visitor</Link>
        </div>
      </nav>

      {/* CONTENT WRAPPER */}
      <div style={contentWrapperStyle}>
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

