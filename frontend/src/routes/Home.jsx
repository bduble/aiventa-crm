import React from 'react';
import SalesPerformanceKPI from '../components/SalesPerformanceKPI';
import LeadPerformanceKPI from '../components/LeadPerformanceKPI';
import InventorySnapshot from '../components/InventorySnapshot';
import AIOverview from '../components/AIOverview';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <SalesPerformanceKPI />
      <LeadPerformanceKPI />
      <InventorySnapshot />
      <AIOverview />
    </div>
  );
}
