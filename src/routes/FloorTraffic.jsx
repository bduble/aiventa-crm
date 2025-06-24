// src/components/CreateFloorTrafficForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateFloorTrafficForm() {
  const navigate = useNavigate();

  // In dev, proxy “/api” → your local server.
  // In prod, always hit your Render API’s /api namespace.
  const API_BASE = import.meta.env.DEV
    ? "/api"
    : "https://aiventa-crm.onrender.com/api";  // <— force this exact URL in prod

  const [form, setForm] = useState({ /* …fields… */ });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE}/floor-traffic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 405) {
        throw new Error("Server received the request but doesn’t accept POST here");
      }
      if (res.status === 404) {
        throw new Error("No such endpoint—check your URL");
      }
      if (res.status === 422) {
        const { message } = await res.json();
        throw new Error(message || "Validation failed");
      }
      if (!res.ok) {
        throw new Error("Unknown error saving visitor");
      }

      navigate("/floor-traffic");
    } catch (err) {
      setError(err.message);
    }
  };

  // …the rest of your form JSX…
}
