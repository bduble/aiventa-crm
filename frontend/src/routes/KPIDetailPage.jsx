import React from 'react';
import { useParams } from 'react-router-dom';
import SalesPerformanceKPI from '../components/SalesPerformanceKPI';
import LeadPerformanceKPI from '../components/LeadPerformanceKPI';
import InventorySnapshot from '../components/InventorySnapshot';
import AIOverview from '../components/AIOverview';
import ServiceDepartmentPerformance from '../components/ServiceDepartmentPerformance';
import CustomerSatisfaction from '../components/CustomerSatisfaction';
import MarketingCampaignROI from '../components/MarketingCampaignROI';
import SalesTeamActivity from '../components/SalesTeamActivity';

const KPI_COMPONENTS = {
  'sales-performance': SalesPerformanceKPI,
  'lead-performance': LeadPerformanceKPI,
  'inventory-snapshot': InventorySnapshot,
  'ai-overview': AIOverview,
  'service-performance': ServiceDepartmentPerformance,
  'customer-satisfaction': CustomerSatisfaction,
  'marketing-roi': MarketingCampaignROI,
  'sales-activity': SalesTeamActivity,
};

export default function KPIDetailPage() {
  const { id } = useParams();
  const Component = KPI_COMPONENTS[id];
  if (!Component) {
    return <p className="p-4">Unknown KPI</p>;
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Component />
    </div>
  );
}
