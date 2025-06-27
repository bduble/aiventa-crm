// frontend/src/components/Home.jsx
import React from 'react';
import logo from '../assets/logo.png';   // adjust extension if yours is .svg or .jpg

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full pt-16">
      <img
        src={logo}
        alt="aiVenta Logo"
        className="h-24 w-auto mb-6"
      />
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
        Welcome to aiVenta!
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        The Smart CRM for your dealership.
      </p>
    </div>
  );
}
