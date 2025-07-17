import { Link } from 'react-router-dom';
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
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Link to="/kpi/sales-performance" className="block">
        <SalesPerformanceKPI />
      </Link>
      <Link to="/kpi/lead-performance" className="block">
        <LeadPerformanceKPI />
      </Link>
      <Link to="/kpi/inventory-snapshot" className="block">
        <InventorySnapshot />
      </Link>
      <Link to="/kpi/ai-overview" className="block">
        <AIOverview />
      </Link>
      <Link to="/kpi/service-performance" className="block">
        <ServiceDepartmentPerformance />
      </Link>
      <Link to="/kpi/customer-satisfaction" className="block">
        <CustomerSatisfaction />
      </Link>
      <Link to="/kpi/marketing-roi" className="block">
        <MarketingCampaignROI />
      </Link>
      <Link to="/kpi/sales-activity" className="block">
        <SalesTeamActivity />
      </Link>
    </div>
  );
}
