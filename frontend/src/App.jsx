import { useState, useEffect, useRef } from 'react';
import { useTheme } from './context/ThemeContext.jsx';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";

import LeadLog                from "./routes/LeadLog";
import UsersPage              from "./routes/UsersPage";
import InventoryPage          from "./routes/InventoryPage";
import CustomersPage          from "./routes/CustomersPage";
import CustomerCard           from "./routes/CustomerCard";
import { Toaster }            from "react-hot-toast";
import ActivityTimeline       from "./components/ActivityTimeline";
import CreateLeadForm         from "./components/CreateLeadForm";
import FloorTrafficPage       from "./pages/FloorTrafficPage";
import CreateFloorTrafficForm from "./components/CreateFloorTrafficForm";
import Home                   from "./pages/Home";
import NewEntryPage           from "./pages/NewEntryPage";
import EditAppraisalPage      from "./pages/EditAppraisalPage";
import Logo                   from "./components/Logo";
import ReconPage              from "./pages/ReconPage";
import AppraisalsPage         from "./pages/AppraisalsPage";
import ChatGPTPrompt          from "./components/ChatGPTPrompt";
import KPIDetailPage          from "./routes/KPIDetailPage";
import DealsPage              from "./pages/DealsPage"; // <-- Add this line!
import { Plus, User }         from "lucide-react";

// Debug check
console.log({ Home, Logo });

export default function App() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [customerMenuOpen, setCustomerMenuOpen] = useState(false);
  const [logMenuOpen, setLogMenuOpen] = useState(false);
  const [lightText, setLightText] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;
    const update = () => {
      const rgb = window.getComputedStyle(navEl).backgroundColor;
      const values = rgb.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
      document.documentElement.style.setProperty(
        "--current-bg-rgb",
        `${values[0]},${values[1]},${values[2]}`
      );
      const luminance =
        (0.299 * values[0] + 0.587 * values[1] + 0.114 * values[2]) / 255;
      setLightText(luminance < 0.5);
    };
    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, []);

  // Inline styles
  const navStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgb(var(--current-bg-rgb))",
    zIndex: 1000,
  };
  const navInnerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    width: "100%",
    padding: "0.75rem 1.5rem",
  };
  const linkStyle = {
    textDecoration: "none",
    fontWeight: 500,
  };
  const navTextColor = lightText ? "#ffffff" : "#000000";
  const contentWrapperStyle = {
    paddingTop: "64px",
    minHeight: "100vh",
    background: isDark ? "#2d3748" : "#f9f9f9",
    color: isDark ? "#f7fafc" : "#1a202c",
    padding: "2rem",
  };

  // Nav items as an array for clarity
  const navItems = [
    { to: "/",         label: "Home"             },
    { to: "/users",    label: "Users"            },
    { to: "/inventory",label: "Inventory"        },
    { to: "/deals",    label: "Deals"            },
    { to: "/appraisals", label: "Appraisals"     },
    { to: "/recon",    label: "Recon"            },
    {
      to: "/new",
      label: (
        <span className="flex items-center">
          <Plus className="h-4 w-4" />
          <User className="h-4 w-4 ml-1" />
        </span>
      ),
    },
  ];

  return (
    <Router>
      <Toaster position="top-right" />

      {/* FIXED TOP NAV */}
      <nav ref={navRef} style={navStyle} className={`transition-colors duration-1000 ${lightText ? 'text-white' : 'text-black'}`}>
        <div style={navInnerStyle}>
          <Link to="/" style={{ marginRight: "1rem" }}>
            <Logo />
          </Link>

          {/* Main nav links */}
          {navItems.map(({ to, label }) => (
            <Link key={to} to={to} style={{ ...linkStyle, color: navTextColor }}>
              {label}
            </Link>
          ))}

          {/* Log dropdown */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setLogMenuOpen(true)}
            onMouseLeave={() => setLogMenuOpen(false)}
          >
            <span
              style={{ ...linkStyle, color: navTextColor, cursor: "pointer" }}
              role="button"
              aria-haspopup="menu"
              aria-expanded={logMenuOpen}
            >
              Log ▾
            </span>
            {logMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  backgroundColor: isDark ? "#1a202c" : "#ffffff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  padding: "0.5rem 0",
                  borderRadius: "4px",
                  minWidth: "150px",
                }}
              >
                <Link
                  to="/floor-traffic"
                  style={{
                    ...linkStyle,
                    display: "block",
                    padding: "0.25rem 1rem",
                    color: isDark ? "#f7fafc" : "#1a202c",
                  }}
                >
                  Floor Log
                </Link>
                <Link
                  to="/leads"
                  style={{
                    ...linkStyle,
                    display: "block",
                    padding: "0.25rem 1rem",
                    color: isDark ? "#f7fafc" : "#1a202c",
                  }}
                >
                  Lead Log
                </Link>
              </div>
            )}
          </div>

          {/* Customers dropdown */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setCustomerMenuOpen(true)}
            onMouseLeave={() => setCustomerMenuOpen(false)}
          >
            <span style={{ ...linkStyle, color: navTextColor, cursor: "pointer" }}>
              Customers ▾
            </span>
            {customerMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  backgroundColor: isDark ? "#1a202c" : "#ffffff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  padding: "0.5rem 0",
                  borderRadius: "4px",
                  minWidth: "150px",
                }}
              >
                <Link
                  to="/customers"
                  style={{
                    ...linkStyle,
                    display: "block",
                    padding: "0.25rem 1rem",
                    color: isDark ? "#f7fafc" : "#1a202c",
                  }}
                >
                  Customer List
                </Link>
                <Link
                  to="/activities"
                  style={{
                    ...linkStyle,
                    display: "block",
                    padding: "0.25rem 1rem",
                    color: isDark ? "#f7fafc" : "#1a202c",
                  }}
                >
                  Activities
                </Link>
              </div>
            )}
          </div>

          <ChatGPTPrompt />
        </div>
      </nav>

      {/* CONTENT WRAPPER */}
      <div style={contentWrapperStyle}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/leads" element={<LeadLog />} />
            <Route path="/leads/new" element={<CreateLeadForm />} />
            <Route path="/new" element={<NewEntryPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerCard />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/deals" element={<DealsPage />} /> {/* <-- Add this! */}
            <Route path="/appraisals" element={<AppraisalsPage />} />
            <Route path="/recon" element={<ReconPage />} />
            <Route path="/activities" element={<ActivityTimeline />} />
            <Route path="/floor-traffic" element={<FloorTrafficPage />} />
            <Route path="/floor-traffic/new" element={<CreateFloorTrafficForm />} />
            <Route path="/appraisals/:id" element={<EditAppraisalPage />} />
            <Route path="/kpi/:id" element={<KPIDetailPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}
