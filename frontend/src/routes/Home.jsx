import React from 'react';
import SalesPerformanceKPI from '../components/SalesPerformanceKPI';
import LeadPerformanceKPI from '../components/LeadPerformanceKPI';
import InventorySnapshot from '../components/InventorySnapshot';
import MonthlySummary from '../components/MonthlySummary';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto p-6 grid gap-4 md:grid-cols-2">
      <SalesPerformanceKPI />
      <LeadPerformanceKPI />
      <InventorySnapshot />
      <MonthlySummary />
    </div>
  );
}
