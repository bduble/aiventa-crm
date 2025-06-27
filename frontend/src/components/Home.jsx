// frontend/src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';       // needed for your Get Started button
import logo from '../assets/logo.png';       // ← this line must match your file name

export default function Home() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center text-center px-4 bg-blue-900 text-white">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-700 via-blue-500 to-green-400 opacity-60" />
      <div className="relative z-10 space-y-6">
        <img
          src={logo}
          alt="aiVenta Logo"
          className="mx-auto h-24 w-auto drop-shadow-xl"
        />
        <p className="text-xl sm:text-3xl font-medium max-w-2xl mx-auto">
          Manage leads, users and floor traffic with next-gen efficiency.
        </p>
        <Link
          to="/leads"
          className="inline-block px-8 py-4 text-lg font-semibold bg-green-400 text-blue-900 rounded-md hover:bg-white hover:text-blue-900 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
