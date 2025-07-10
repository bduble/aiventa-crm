import React from 'react';
import SalesPerformanceKPI from '../components/SalesPerformanceKPI';
import LeadPerformanceKPI from '../components/LeadPerformanceKPI';
import InventorySnapshot from '../components/InventorySnapshot';
import AIOverview from '../components/AIOverview';
import ServiceDepartmentPerformance from '../components/ServiceDepartmentPerformance';
import CustomerSatisfaction from '../components/CustomerSatisfaction';
import MarketingCampaignROI from '../components/MarketingCampaignROI';
import SalesTeamActivity from '../components/SalesTeamActivity';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
      <SalesPerformanceKPI />
      <LeadPerformanceKPI />
      <InventorySnapshot />
      <AIOverview />
      <ServiceDepartmentPerformance />
      <CustomerSatisfaction />
      <MarketingCampaignROI />
      <SalesTeamActivity />
    </div>
  );
}
