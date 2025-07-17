console.log("pages/Home.jsx loaded!");

import { useEffect, useState, cloneElement } from 'react';
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Sparkline } from "react-sparklines"; // Add sparklines for KPI cards

import Logo from "../components/Logo";
import SalesTeamActivity from "../components/SalesTeamActivity";
import SalesPerformanceKPI from "../components/SalesPerformanceKPI";
import LeadPerformanceKPI from "../components/LeadPerformanceKPI";
import InventorySnapshot from "../components/InventorySnapshot";
import AIOverview from "../components/AIOverview";
import ServiceDepartmentPerformance from "../components/ServiceDepartmentPerformance";
import CustomerSatisfaction from "../components/CustomerSatisfaction";
import MarketingCampaignROI from "../components/MarketingCampaignROI";
import AIQuoteOfTheDay from "../components/AIQuoteOfTheDay";
import AIWidget from "../components/AIWidget";
import NotificationsBar from "../components/NotificationsBar";
import ProductivityWidget from "../components/ProductivityWidget";
import QuickActionPanel from "../components/QuickActionPanel";
import SmartSearchBar from "../components/SmartSearchBar";
// import MultiRooftopSwitcher from "../components/MultiRooftopSwitcher";

console.log({ SalesTeamActivity, SalesPerformanceKPI, LeadPerformanceKPI, InventorySnapshot, AIOverview, ServiceDepartmentPerformance, CustomerSatisfaction, MarketingCampaignROI })

import useAuth from "../hooks/useAuth";

export default function Home() {
  const [showHero, setShowHero] = useState(true);
  const { user } = useAuth();

useEffect(() => {
  console.log("Setting timeout for hero...");
  const t = setTimeout(() => {
    console.log("Timeout complete, hiding hero!");
    setShowHero(false);
  }, 2200);
  return () => clearTimeout(t);
}, []);


  const AnimatedCard = ({ to, children, delay = 0, sparklineData }) => (
    <Link
      to={to}
      className="group block bg-white rounded-2xl shadow-xl p-7 hover:shadow-2xl hover:bg-blue-50 transition"
    >
      <Motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.55 }}
      >
        {/* KPI with optional sparkline */}
        <div className="flex flex-col gap-2">
          {sparklineData && (
            <Sparkline
              data={sparklineData}
              width={100}
              height={20}
              style={{ marginBottom: "0.5rem" }}
            />
          )}
          {cloneElement(children, { countUp: true })}
        </div>
      </Motion.div>
    </Link>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-tr from-blue-900 via-gray-950 to-green-500 relative">
      {/* Always-on AI Widget */}
      <AIWidget />

      {/* HERO */}
      {showHero && (
        <section
          className="fixed inset-0 z-40 h-screen flex flex-col items-center justify-center text-center bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/textures/high-tech.svg')",
            animation: "pulseBG 4s linear infinite"
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-700 to-green-400 opacity-60" />
          <div className="relative z-10 space-y-7 px-4">
            <Logo className="mx-auto w-36 sm:w-52 animate-bounce" />
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white drop-shadow-lg">
              Welcome, {user?.name || "there"}!
            </h1>
            <AIQuoteOfTheDay />
            <p className="text-xl sm:text-2xl text-white max-w-xl mx-auto font-medium tracking-wide">
              The most advanced automotive CRM. AI-driven. All you.  
            </p>
            <Link
              to="/leads"
              className="inline-block px-10 py-4 bg-green-400 text-blue-900 font-extrabold rounded-2xl 
                         hover:bg-green-300 shadow-lg transition text-lg tracking-wide"
            >
              Dive In
            </Link>
          </div>
        </section>
      )}

      {/* DASHBOARD */}
      {!showHero && (
       // <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.15 }}
          className="max-w-8xl mx-auto py-8 px-2 md:px-6 space-y-10 relative"
        >
          {/* Top Bar: Notifications, Rooftop Switcher, Profile, etc */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <NotificationsBar />
            {/* <MultiRooftopSwitcher /> */}
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-900">
                {user?.name || "User"}
              </span>
              {/* Add profile dropdown, dark mode toggle, etc */}
            </div>
          </div>

          {/* Smart Search + Quick Actions */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <SmartSearchBar />
            <QuickActionPanel />
            <ProductivityWidget />
          </div>

          {/* KPIs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatedCard to="/kpi/sales-activity" delay={0.08} sparklineData={[8, 9, 12, 10, 14, 17]}>
              <SalesTeamActivity />
            </AnimatedCard>
            <AnimatedCard to="/kpi/sales-performance" delay={0.15} sparklineData={[22, 28, 25, 27, 32, 30]}>
              <SalesPerformanceKPI />
            </AnimatedCard>
            <AnimatedCard to="/kpi/lead-performance" delay={0.21} sparklineData={[45, 44, 48, 51, 47, 53]}>
              <LeadPerformanceKPI />
            </AnimatedCard>
            <AnimatedCard to="/kpi/inventory-snapshot" delay={0.26} sparklineData={[202, 207, 208, 205, 200, 199]}>
              <InventorySnapshot />
            </AnimatedCard>
            <AnimatedCard to="/kpi/ai-overview" delay={0.32}>
              <AIOverview />
            </AnimatedCard>
            <AnimatedCard to="/kpi/service-performance" delay={0.36} sparklineData={[97, 105, 110, 102, 108, 111]}>
              <ServiceDepartmentPerformance />
            </AnimatedCard>
            <AnimatedCard to="/kpi/customer-satisfaction" delay={0.4} sparklineData={[4.5, 4.7, 4.8, 4.9, 4.7, 5.0]}>
              <CustomerSatisfaction />
            </AnimatedCard>
            <AnimatedCard to="/kpi/marketing-roi" delay={0.45} sparklineData={[1.4, 2.1, 2.0, 2.2, 2.5, 2.7]}>
              <MarketingCampaignROI />
            </AnimatedCard>
          </div>

          {/* Always-on AI assistant for power users (can minimize/maximize) */}
          <div className="fixed right-4 bottom-4 z-50">
            <AIWidget />
          </div>
       // </Motion.div>
      )}

      {/* Optional: Add subtle animated BG */}
      <style>{`
        @keyframes pulseBG {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.96; }
        }
      `}</style>
    </div>
  );
}
