import React from 'react';
import logo from '../assets/logo.png';

export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`.trim()}>
      <img src={logo} alt="aiVenta logo" className="h-12 w-auto md:h-14" />
    </span>
  );
}
