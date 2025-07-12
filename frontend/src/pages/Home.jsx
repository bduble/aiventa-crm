import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';

import Logo from '../components/Logo';
import SalesTeamActivity from '../components/SalesTeamActivity';
import SalesPerformanceKPI from '../components/SalesPerformanceKPI';
import LeadPerformanceKPI from '../components/LeadPerformanceKPI';
import InventorySnapshot from '../components/InventorySnapshot';
import AIOverview from '../components/AIOverview';
import ServiceDepartmentPerformance from '../components/ServiceDepartmentPerformance';
import CustomerSatisfaction from '../components/CustomerSatisfaction';
import MarketingCampaignROI from '../components/MarketingCampaignROI';

// Example hook; replace with your auth/context
import useAuth from '../hooks/useAuth';

export default function Home() {
  const [showHero, setShowHero] = useState(true);
  const { user } = useAuth(); // { name: "Brian", ... }

  // After 3s, fade out the hero and show dashboard
  useEffect(() => {
    const t = setTimeout(() => setShowHero(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // A small wrapper to add count-up to any KPI component
  const AnimatedCard = ({ to, children, delay = 0 }) => (
    <Link
      to={to}
      className="group block bg-white rounded-lg shadow-md p-6 hover:shadow-xl hover:bg-blue-50 transition"
    >
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.6 }}
      >
        {/* 
          We assume each KPI component accepts a `countUp` boolean
          and animates its numeric reads via react-countup internally.
          If not, wrap numbers yourself with <CountUp /> inside each.
        */}
        {React.cloneElement(children, { countUp: true })}
      </Motion.div>
    </Link>
  );

  return (
    <div className="w-full min-h-screen">
      {/* HERO */}
      {showHero && (
        <section
          className="relative h-screen flex flex-col items-center justify-center text-center bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/textures/high-tech.svg')",
          }}
        >
          {/* dark + gradient overlays */}
          <div className="absolute inset-0 bg-black opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-600 to-green-400 opacity-60" />

          <div className="relative z-10 space-y-6 px-4">
            <Logo className="mx-auto w-36 sm:w-48" />

            <h1 className="text-4xl sm:text-6xl font-bold text-white">
              Welcome, {user?.name || 'there'}!
            </h1>

            <p className="text-lg sm:text-2xl text-white max-w-xl mx-auto">
              Manage leads, users & floor traffic with next-gen efficiency.
            </p>

            <Link
              to="/leads"
              className="inline-block px-8 py-4 bg-green-400 text-blue-900 font-semibold rounded-md 
                         hover:bg-green-300 transition"
            >
              Get Started
            </Link>
          </div>
        </section>
      )}

      {/* DASHBOARD */}
      {!showHero && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-7xl mx-auto py-8 px-4 space-y-8"
        >
          {/* Top 2 KPIs: Sales Team Activity & MTD Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatedCard to="/kpi/sales-activity" delay={0.1}>
              <SalesTeamActivity />
            </AnimatedCard>
            <AnimatedCard to="/kpi/sales-performance" delay={0.3}>
              <SalesPerformanceKPI />
            </AnimatedCard>
          </div>

          {/* Other 6 KPIs in two rows of three */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatedCard to="/kpi/lead-performance" delay={0.5}>
              <LeadPerformanceKPI />
            </AnimatedCard>
            <AnimatedCard to="/kpi/inventory-snapshot" delay={0.6}>
              <InventorySnapshot />
            </AnimatedCard>
            <AnimatedCard to="/kpi/ai-overview" delay={0.7}>
              <AIOverview />
            </AnimatedCard>
            <AnimatedCard to="/kpi/service-performance" delay={0.8}>
              <ServiceDepartmentPerformance />
            </AnimatedCard>
            <AnimatedCard to="/kpi/customer-satisfaction" delay={0.9}>
              <CustomerSatisfaction />
            </AnimatedCard>
            <AnimatedCard to="/kpi/marketing-roi" delay={1.0}>
              <MarketingCampaignROI />
            </AnimatedCard>
          </div>
        </Motion.div>
      )}
    </div>
  );
}
