// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

- import Leads from "./routes/Leads";
- import Users from "./routes/Users";
- import ActivityTimeline from "./components/ActivityTimeline";
+ import Leads from "./routes/Leads";
+ import Users from "./routes/Users";
+ import ActivityTimeline from "./components/ActivityTimeline";

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
  );
}
