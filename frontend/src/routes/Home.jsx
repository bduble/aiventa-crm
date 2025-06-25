import React from 'react';

export default function Home() {
  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-electricblue via-neongreen to-darkblue flex items-center justify-center text-offwhite text-center px-4">
      <div>
        <h1 className="text-4xl sm:text-6xl font-bold mb-6 drop-shadow-lg">Welcome to aiVenta CRM</h1>
        <p className="text-lg sm:text-2xl mb-8 max-w-2xl">Manage leads, users and floor traffic effortlessly in one modern interface.</p>
        <a
          href="/leads"
          className="inline-block px-6 py-3 bg-offwhite text-darkblue font-semibold rounded shadow hover:bg-neongreen hover:text-slategray transition"
        >
          Get Started
        </a>
      </div>
    </section>
  );
}
