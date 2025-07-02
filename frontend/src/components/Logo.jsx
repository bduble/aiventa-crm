import React from 'react';

export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`.trim()}>

      <img src="/logo.png" alt="aiVenta logo" className="h-48 w-auto md:h-52" />

    </span>
  );
}
