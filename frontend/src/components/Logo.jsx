import React from 'react';

export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center space-x-2 ${className}`.trim()}>

      <img src="/logo.png" alt="aiVenta icon" className="h-10 w-10" />
      <span className="text-3xl font-semibold">aiVenta</span>

      <img src="/logo.png" alt="aiVenta icon" className="h-8 w-8" />
      <span className="text-2xl font-semibold">aiVenta</span>

    </span>
  );
}
