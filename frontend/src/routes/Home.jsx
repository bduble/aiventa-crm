import React from 'react';
import Logo from '../components/Logo';

export default function Home() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center text-offwhite text-center px-4 bg-darkblue">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-700 via-electricblue to-neongreen opacity-60 animate-gradient" />
      <div className="relative z-10">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-2xl">

          aiVenta CRM

          <Logo className="mx-auto" />

        </h1>
        <p className="text-xl sm:text-3xl mb-8 max-w-3xl font-medium">
          Manage leads, users and floor traffic with next‑gen efficiency.
        </p>
        <a
          href="/leads"
          className="sheen-link inline-block px-8 py-4 text-lg font-semibold text-darkblue bg-neongreen rounded-md shadow-xl hover:bg-offwhite hover:text-darkblue transition-colors"
        >
          Get Started
        </a>
      </div>
    </section>
  );
}
