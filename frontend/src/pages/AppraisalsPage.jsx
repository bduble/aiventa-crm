import { useEffect, useState } from "react";
import NewAppraisalForm from "../components/NewAppraisalForm";
import { API_BASE } from "../apiBase";
import {
  ArrowUpRight, Search, MessageCircle, Image, Mic, Zap,
  TrendingUp, TrendingDown, Printer, Share2, Edit3, Save, X, CheckCircle
} from "lucide-react";

// ----------- MOCK MARKET COMPS (for demo) --------------
const mockComps = [
  { dealer: "Joe's Auto", year: 2022, miles: 59000, price: 19995, hot: true },
  { dealer: "City Cars", year: 2021, miles: 63400, price: 21300, hot: false },
  { dealer: "SuperCarz", year: 2023, miles: 48000, price: 22600, hot: true },
];

// ---------- Utility: Copy to clipboard ----------
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

// ------------------- Main Page Component ----------------------
export default function AppraisalsPage() {
  const [appraisals, setAppraisals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);

  // --- Market scan/AI values ---
  const [vin, setVin] = useState("");
  const [aiValue, setAiValue] = useState(22500);
  const [risk, setRisk] = useState("Moderate");
  const [daysToSell, setDaysToSell] = useState(13);
  const [flipScore, setFlipScore] = useState(8.7);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState(null); // for clickable KPI cards

  // --- Fetch Appraisals & Customers ---
  const reloadAppraisals = () => {
    fetch(`${API_BASE}/api/appraisals/`)
      .then((res) => res.json())
      .then((data) => setAppraisals(Array.isArray(data) ? data : []))
      .catch(() => setAppraisals([]));
  };
  useEffect(() => { reloadAppraisals(); }, []);
  useEffect(() => {
    fetch(`${API_BASE}/api/customers/`)
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]));
  }, []);

  // --- Helper: Get customer name by UUID, fallback to "No Customer" ---
  const getCustomerName = (id) => {
    if (!id) return <span className="italic text-gray-400">No Customer</span>;
    const c = customers.find((cust) => String(cust.id) === String(id));
    if (c) return c.name || `${c.first_name || ""} ${c.last_name || ""}`.trim();
    return <span className="italic text-gray-400">Unknown</span>;
  };

  // --- Animated counter for KPIs ---
  function AnimatedNumber({ value }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let start = display, end = value, diff = end - start, step = 10, frame = 0;
      if (diff === 0) return;
      const tick = () => {
        frame++;
        setDisplay(Math.round(start + (diff * frame) / step));
        if (frame < step) setTimeout(tick, 25);
        else setDisplay(end);
      };
      tick();
      // eslint-disable-next-line
    }, [value]);
    return <span className="font-bold tabular-nums">{display}</span>;
  }

  // --- Stats for header cards (you can wire these to API/AI logic) ---
  const kpis = [
    {
      label: "Total Appraisals",
      value: appraisals.length,
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      badge: appraisals.length > 10 ? (
        <span className="bg-green-100 text-green-700 rounded px-2 py-0.5 text-xs ml-2 animate-bounce">HOT</span>
      ) : null,
      filter: null,
      color: "from-blue-100 via-blue-200 to-blue-50",
    },
    {
      label: "In Progress",
      value: appraisals.filter(a => a.status === "Draft").length,
      icon: <Search className="w-6 h-6 text-yellow-500" />,
      badge: null,
      filter: "Draft",
      color: "from-yellow-100 via-yellow-200 to-yellow-50",
    },
    {
      label: "Finalized",
      value: appraisals.filter(a => a.status === "Final").length,
      icon: <ArrowUpRight className="w-6 h-6 text-green-500" />,
      badge: null,
      filter: "Final",
      color: "from-green-100 via-green-200 to-green-50",
    },
    {
      label: "Rejected",
      value: appraisals.filter(a => a.status === "Rejected").length,
      icon: <TrendingDown className="w-6 h-6 text-red-500" />,
      badge: null,
      filter: "Rejected",
      color: "from-red-100 via-red-200 to-red-50",
    },
  ];

  // --- Alerts for urgent things (example only, wire real logic) ---
  const waitingLong = appraisals.filter(a => a.status === "Draft").length >= 2;
  const noFollowUp = appraisals.filter(a => a.status === "Final" && !a.followed_up).length >= 2;

  // --- Handlers for future actions ---
  const handleMarketScan = () => {
    setScanning(true);
    setTimeout(() => {
      setAiValue(22750 + Math.floor(Math.random() * 500));
      setRisk(Math.random() > 0.6 ? "High" : "Moderate");
      setDaysToSell(10 + Math.floor(Math.random() * 5));
      setFlipScore(7.5 + Math.random() * 2.5);
      setScanning(false);
    }, 1200);
  };
  const handleQuickAdd = () => setShowForm(true);

  // --- Table filter logic ---
  const filteredAppraisals = filter
    ? appraisals.filter(a => a.status === filter)
    : appraisals;

  // --- Main Render ---
  return (
    <div className="max-w-6xl mx-auto pt-24 px-2 pb-8 relative">
      {/* ---- Quick Add floating button (mobile aware) ---- */}
      <button
        onClick={handleQuickAdd}
        className="fixed z-40 top-16 right-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-5 py-3 shadow-lg transition-all md:top-24"
        style={{ boxShadow: "0 4px 18px 2px #4F8AFB44" }}
      >
        + Quick Add
      </button>

      {/* ---- Urgent alerts / badges ---- */}
      <div className="flex flex-wrap gap-3 mb-4 mt-1">
        {waitingLong && (
          <div className="flex items-center bg-yellow-100 border-l-4 border-yellow-400 px-3 py-1.5 rounded animate-pulse">
            <span className="ml-2 font-semibold text-yellow-700">
              2 appraisals “In Progress” &gt;20 min!
            </span>
          </div>
        )}
        {noFollowUp && (
          <div className="flex items-center bg-orange-100 border-l-4 border-orange-400 px-3 py-1.5 rounded animate-bounce">
            <Zap className="w-4 h-4 text-orange-500 mr-1" />
            <span className="font-semibold text-orange-700">3 finalized appraisals need follow-up!</span>
          </div>
        )}
      </div>

      {/* ---- KPI CARDS (clickable, animated, mobile-stackable) ---- */}
      <div className="flex flex-col gap-3 md:flex-row md:gap-4 mb-8">
        {kpis.map(({ label, value, icon, badge, filter: cardFilter, color }) => (
          <div
            key={label}
            className={`flex-1 bg-gradient-to-br ${color} rounded-2xl shadow-lg px-6 py-6 flex flex-col items-start cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all relative`}
            onClick={() => setFilter(cardFilter)}
          >
            <div className="flex items-center gap-2 text-lg font-semibold mb-1">
              {icon} <span>{label}</span> {badge}
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-blue-900">
              <AnimatedNumber value={value} />
            </div>
            {filter === cardFilter && (
              <button
                className="absolute top-2 right-2 bg-blue-600 text-white text-xs rounded px-2 py-0.5 shadow"
                onClick={e => { e.stopPropagation(); setFilter(null); }}
              >
                Clear
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ---- Next-Gen Appraisal Entry/Market/AI Tool ---- */}
      <div className="flex flex-col lg:flex-row gap-6 mb-10">
        {/* Entry/Scan Panel */}
        <div className="flex-1 bg-white rounded-xl shadow-xl p-6 flex flex-col gap-4 border">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <input
              className="border rounded px-4 py-2 flex-1 text-lg"
              placeholder="Enter VIN to auto-scan market…"
              value={vin}
              onChange={e => setVin(e.target.value)}
              maxLength={17}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
              onClick={handleMarketScan}
              disabled={!vin || scanning}
            >
              <Search className="w-4 h-4" />
              {scanning ? "Scanning…" : "Decode & Market"}
            </button>
            {scanning && (
              <span className="animate-pulse text-green-500 font-bold ml-2">Scanning…</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <div className="bg-slate-100 rounded px-2 py-1 text-xs font-semibold flex items-center">
              <span className="font-bold text-blue-700">AI Value:</span>
              <span className="ml-1">${aiValue.toLocaleString()}</span>
              <button className="ml-2 text-xs text-blue-600 underline">Why?</button>
            </div>
            <div className={`rounded px-2 py-1 text-xs font-semibold flex items-center
              ${risk === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
              <span>Risk:</span>
              <span className="ml-1">{risk}</span>
              {risk === "High" ? <TrendingDown className="w-4 h-4 ml-1" /> : null}
            </div>
            <div className="bg-purple-100 rounded px-2 py-1 text-xs font-semibold flex items-center">
              <span>Days-to-Sell:</span>
              <span className="ml-1">{daysToSell}</span>
            </div>
            <div className="bg-gradient-to-r from-green-200 via-yellow-100 to-red-100 px-2 py-1 rounded text-xs font-semibold flex items-center">
              Flip Score: <span className="ml-1">{flipScore.toFixed(1)}/10</span>
            </div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> Text Offer
            </button>
            <button className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <Image className="w-4 h-4" /> Upload Photos
            </button>
            <button className="bg-slate-200 hover:bg-slate-300 text-black px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <Mic className="w-4 h-4" /> Voice Note
            </button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <Zap className="w-4 h-4" /> Negotiate
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600 italic">
            <span>Last scanned: Just now · <span className="font-bold text-blue-600">3 new comps</span> pulled from 50mi radius.</span>
          </div>
        </div>
        {/* Market Comps Panel */}
        <div className="flex-1 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-xl shadow-xl p-6 flex flex-col gap-2 border min-h-[220px]">
          <div className="font-bold text-blue-900 mb-1 text-lg">Market Comps
            <span className="bg-blue-200 text-blue-700 px-2 py-1 rounded-full text-xs ml-2 animate-pulse">HOT</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[300px]">
              <thead>
                <tr>
                  <th className="font-semibold">Dealership</th>
                  <th className="font-semibold">Year</th>
                  <th className="font-semibold">Mileage</th>
                  <th className="font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {mockComps.map((comp, i) => (
                  <tr key={i} className="hover:bg-blue-50">
                    <td>{comp.dealer} {comp.hot && <span className="bg-green-100 text-green-700 px-2 rounded-full text-[10px] ml-1">HOT</span>}</td>
                    <td>{comp.year}</td>
                    <td>{comp.miles.toLocaleString()}</td>
                    <td className={comp.hot ? "font-bold text-green-700" : "font-bold text-blue-800"}>
                      ${comp.price.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-2 bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-900">
            Side-by-Side Compare
          </button>
        </div>
      </div>

      {/* ---- Appraisal Table (mobile scrollable, themed) ---- */}
      <div className="overflow-x-auto rounded-lg shadow border bg-white">
        <table className="w-full text-sm min-w-[650px]">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 font-bold">Customer</th>
              <th className="p-2 font-bold">VIN</th>
              <th className="p-2 font-bold">Year</th>
              <th className="p-2 font-bold">Make</th>
              <th className="p-2 font-bold">Model</th>
              <th className="p-2 font-bold">Mileage</th>
              <th className="p-2 font-bold">Status</th>
              <th className="p-2 font-bold">Appraised Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppraisals.map((a) => (
              <tr
                key={a.id}
                className="odd:bg-gray-50 hover:bg-blue-100 transition-all cursor-pointer"
                onClick={() => setSelectedAppraisal(a)}
              >
                <td className="p-2 whitespace-nowrap">{getCustomerName(a.customer_id)}</td>
                <td className="p-2 whitespace-nowrap">{a.vehicle_vin || <span className="text-gray-400">—</span>}</td>
                <td className="p-2 whitespace-nowrap">{a.year || <span className="text-gray-400">—</span>}</td>
                <td className="p-2 whitespace-nowrap">{a.make || <span className="text-gray-400">—</span>}</td>
                <td className="p-2 whitespace-nowrap">{a.model || <span className="text-gray-400">—</span>}</td>
                <td className="p-2 whitespace-nowrap">{a.mileage != null ? a.mileage : <span className="text-gray-400">—</span>}</td>
                <td className="p-2 whitespace-nowrap">
                  <span className={
                    a.status === "Final" ? "bg-green-100 text-green-800 px-2 rounded-full" :
                      a.status === "Rejected" ? "bg-red-100 text-red-700 px-2 rounded-full" :
                        "bg-yellow-100 text-yellow-800 px-2 rounded-full"
                  }>
                    {a.status || "—"}
                  </span>
                </td>
                <td className="p-2 whitespace-nowrap">{a.appraisal_value != null ? `$${a.appraisal_value}` : <span className="text-gray-400">—</span>}</td>
              </tr>
            ))}
            {filteredAppraisals.length === 0 && (
              <tr>
                <td colSpan="8" className="p-2 text-center text-gray-500">
                  No appraisals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---- Appraisal Detail Drawer/Modal ---- */}
      {selectedAppraisal && (
        <AppraisalDetailDrawer
          appraisal={selectedAppraisal}
          onClose={() => setSelectedAppraisal(null)}
          customers={customers}
          reloadAppraisals={reloadAppraisals}
        />
      )}

      {/* ---- New Appraisal Modal ---- */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-lg relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-red-600 font-bold"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">New Appraisal</h2>
            <NewAppraisalForm
              onClose={() => setShowForm(false)}
              customers={customers}
              reloadAppraisals={reloadAppraisals}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============ AppraisalDetailDrawer ============

function AppraisalDetailDrawer({ appraisal, onClose, customers, reloadAppraisals }) {
  const [tab, setTab] = useState("info");
  const [editMode, setEditMode] = useState(true); // enable edit by default
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...appraisal });

  // Find customer
  const customer = customers.find(c => String(c.id) === String(appraisal.customer_id));
  const customerName = customer ? (customer.name || `${customer.first_name} ${customer.last_name}`) : "—";

  // Handle field edits
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  // Save edits
  async function handleSave() {
    setSaving(true);
    await fetch(`/api/appraisals/${appraisal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);
    reloadAppraisals?.();
    setEditMode(false);
    onClose();
  }

  // Print handler
  function handlePrint() {
    window.print();
  }

  // Share handler
  function handleShare() {
    copyToClipboard(window.location.href + `#appraisal-${appraisal.id}`);
    alert("Link copied to clipboard!");
  }

  // Tab content
  const tabContent = {
    info: (
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-500">VIN</label>
          <input
            name="vehicle_vin"
            value={form.vehicle_vin || ""}
            onChange={handleChange}
            readOnly={!editMode}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Year</label>
            <input
              name="year"
              value={form.year || ""}
              onChange={handleChange}
              readOnly={!editMode}
              className="w-full border rounded p-2"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Make</label>
            <input
              name="make"
              value={form.make || ""}
              onChange={handleChange}
              readOnly={!editMode}
              className="w-full border rounded p-2"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Model</label>
            <input
              name="model"
              value={form.model || ""}
              onChange={handleChange}
              readOnly={!editMode}
              className="w-full border rounded p-2"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500">Mileage</label>
          <input
            name="mileage"
            value={form.mileage || ""}
            onChange={handleChange}
            readOnly={!editMode}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Customer</label>
          <input
            value={customerName}
            readOnly
            className="w-full border rounded p-2 bg-gray-50"
          />
        </div>
      </div>
    ),
    photos: (
      <div>
        <div className="mb-2 text-xs text-gray-600">Vehicle Photos</div>
        <div className="flex gap-2 flex-wrap">
          {(form.photos || []).map((url, i) => (
            <img key={i} src={url} alt={`Vehicle Photo ${i + 1}`} className="h-24 rounded shadow" />
          ))}
        </div>
        <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold print-hide">
          + Upload Photos
        </button>
      </div>
    ),
    comps: (
      <div>
        <div className="mb-2 text-xs text-gray-600">Market Comps (50mi Radius)</div>
        <table className="w-full text-xs bg-slate-50 rounded">
          <thead>
            <tr>
              <th className="font-semibold">Dealer</th>
              <th className="font-semibold">Year</th>
              <th className="font-semibold">Mileage</th>
              <th className="font-semibold">Price</th>
            </tr>
          </thead>
          <tbody>
            {mockComps.map((comp, i) => (
              <tr key={i} className="hover:bg-blue-50">
                <td>{comp.dealer}</td>
                <td>{comp.year}</td>
                <td>{comp.miles.toLocaleString()}</td>
                <td className="font-bold">${comp.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="mt-2 bg-slate-800 text-white px-3 py-1 rounded text-xs font-bold hover:bg-slate-900 print-hide">
          Side-by-Side Compare
        </button>
      </div>
    ),
    notes: (
      <div>
        <textarea
          name="notes"
          value={form.notes || ""}
          onChange={handleChange}
          rows={6}
          readOnly={!editMode}
          className="w-full border rounded p-2"
          placeholder="Add any important notes here…"
        />
      </div>
    ),
  };

  // Print date helper
  const printDate = new Date().toLocaleString();

  return (
    <>
      {/* PRINT STYLES */}
      <style>
        {`
@media print {
  body * {
    visibility: hidden !important;
  }
  .appraisal-print-area, .appraisal-print-area * {
    visibility: visible !important;
  }
  .appraisal-print-area {
    position: absolute !important;
    left: 0; top: 0;
    width: 100vw;
    background: #fff !important;
    box-shadow: none !important;
    z-index: 9999;
    padding: 32px 24px !important;
    min-height: 100vh;
  }
  .appraisal-print-header {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 18px;
    border-bottom: 2px solid #003366;
    padding-bottom: 8px;
  }
  .appraisal-print-logo {
    height: 40px;
  }
  .appraisal-print-title {
    font-size: 2rem;
    color: #003366;
    font-weight: bold;
    letter-spacing: 1px;
  }
  .print-hide { display: none !important; }
  .appraisal-print-footer {
    margin-top: 32px;
    padding-top: 12px;
    border-top: 1px solid #ccc;
    font-size: 13px;
    color: #333;
    text-align: right;
  }
}
        `}
      </style>
      <div className="fixed inset-0 flex items-end md:items-center justify-center bg-black/40 z-50">
        <div className="appraisal-print-area w-full max-w-2xl bg-white rounded-t-2xl md:rounded-2xl p-6 shadow-2xl relative animate-slide-in-up">
          {/* Header (Branded, for print and digital) */}
          <div className="appraisal-print-header">
            <img
              className="appraisal-print-logo"
              src="https://www.garlynshelton.com/images/logo.png"
              alt="Garlyn Shelton Logo"
            />
            <div className="appraisal-print-title">
              Vehicle Appraisal Report
            </div>
          </div>
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 font-bold print-hide"
          >×</button>

          {/* ACTION BAR */}
          <div className="flex gap-3 items-center mb-4 justify-end print-hide">
            <button className="p-2" onClick={handlePrint} title="Print">
              <Printer className="w-5 h-5" />
            </button>
            <button className="p-2" onClick={handleShare} title="Share">
              <Share2 className="w-5 h-5" />
            </button>
            {!editMode && (
              <button className="p-2" onClick={() => setEditMode(true)} title="Edit">
                <Edit3 className="w-5 h-5" />
              </button>
            )}
            {editMode && (
              <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded" onClick={handleSave} disabled={saving}>
                <Save className="w-5 h-5" />
                {saving && <span className="ml-2 text-xs">Saving…</span>}
              </button>
            )}
            <button className="p-2 bg-green-600 hover:bg-green-700 text-white rounded" title="Approve">
              <CheckCircle className="w-5 h-5" />
            </button>
          </div>

          {/* TABS */}
          <div className="flex gap-4 border-b mb-4 print-hide">
            {["info", "photos", "comps", "notes"].map((key) => (
              <button
                key={key}
                className={`pb-2 px-3 font-bold capitalize border-b-2 ${
                  tab === key ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500"
                }`}
                onClick={() => setTab(key)}
              >
                {key === "info" && "Vehicle Info"}
                {key === "photos" && "Photos"}
                {key === "comps" && "Market Comps"}
                {key === "notes" && "Notes"}
              </button>
            ))}
          </div>

          {/* TAB PANEL */}
          <div className="min-h-[160px]">{tabContent[tab]}</div>

          {/* PRINT FOOTER */}
          <div className="appraisal-print-footer">
            Garlyn Shelton Automotive Group | Temple, TX | (254) 771-0128<br />
            Appraisal Generated: {printDate}
          </div>
        </div>
      </div>
    </>
  );
}
