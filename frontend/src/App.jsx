// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Leads                  from "./routes/Leads";
import Users                  from "./routes/Users";
import ActivityTimeline       from "./components/ActivityTimeline";
import CreateLeadForm         from "./components/CreateLeadForm";
import FloorLog               from "./routes/FloorLog";
import CreateFloorTrafficForm from "./components/CreateFloorTrafficForm";
import Home                   from "./routes/Home";
import Logo                   from "./components/Logo";

export default function App() {
  // Track dark mode preference
  const [isDark, setIsDark] = useState(
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Inline styles for guaranteed layout control
  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: isDark ? '#1a202c' : '#ffffff',
    boxShadow: isDark ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)',
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
  const linkStyle = {
    color: isDark ? '#f7fafc' : '#1a202c',
    textDecoration: 'none',
    fontWeight: 500,
  };
  const contentWrapperStyle = {
    paddingTop: '64px',     // same height as nav
    minHeight: '100vh',
    background: isDark ? '#2d3748' : '#f9f9f9',
    color: isDark ? '#f7fafc' : '#1a202c',
    padding: '2rem',
  };

  return (
    <Router>
      {/* FIXED TOP NAV */}
      <nav style={navStyle}>
        <div style={navInnerStyle}>
          <Link to="/" style={{ marginRight: '1rem' }}>
            <Logo />
          </Link>
          {[
            ['/', 'Home'],
            ['/leads', 'Leads'],
            ['/leads/new', 'New Lead'],
            ['/users', 'Users'],
            ['/activities', 'Activities'],
            ['/floor-traffic', "Today's Floor Log"],
            ['/floor-traffic/new', 'Log a Visitor'],
          ].map(([to, label]) => (
            <Link key={to} to={to} style={linkStyle}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* CONTENT WRAPPER */}
      <div style={contentWrapperStyle}>
        <Routes>
          <Route path="/" element={<Home />} />
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
