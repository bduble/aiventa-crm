import React from 'react';

export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`.trim()}>

      <img src="/logo.png" alt="aiVenta logo" className="h-32 w-auto md:h-36" />

    </span>
  );
}
