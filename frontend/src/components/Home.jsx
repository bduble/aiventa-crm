// frontend/src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Home() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center text-center px-4 bg-blue-900 text-white">
      {/* background overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-700 via-blue-500 to-green-400 opacity-60" />
      {/* content */}
      <div className="relative z-10 space-y-6">
        {/* display logo with brand text */}
        <Logo className="mx-auto" />

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
