import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CompCheckResults({
  vehicle, // { year, make, model, trim, price }
  zipcode = "76504",
  radius = 200,
  customerMode = false, // Set to true for customer-facing sheet
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const printRef = useRef();

  const fetchComps = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const url = `/comps/search?year=${vehicle.year}&make=${vehicle.make}&model=${vehicle.model}&trim=${vehicle.trim || ""}&zipcode=${zipcode}&radius=${radius}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Error loading comps. Please try again.");
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (vehicle?.year && vehicle?.make && vehicle?.model) {
      fetchComps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // PDF export function
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(
      `MarketComps_${vehicle.year}_${vehicle.make}_${vehicle.model}_${vehicle.trim || ""}.pdf`
    );
  };

  function formatManagerView() {
    if (!result) return null;
    const { comps, market_avg, market_low, market_high } = result;
    const userPrice = Number(vehicle.price) || 0;
    const flag =
      userPrice > market_high
        ? "OVERPRICED"
        : userPrice < market_low
        ? "UNDERPRICED"
        : "IN MARKET RANGE";
    return (
      <div className="rounded-2xl shadow-lg p-4 my-4 bg-white" ref={printRef}>
        <h2 className="font-bold text-xl mb-2">
          Market Comps for {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim || ""}
        </h2>
        <div className="mb-2 text-base">
          <span className="font-semibold">Your Price:</span> ${userPrice.toLocaleString()} &nbsp;|&nbsp;
          <span className="font-semibold">Market Avg:</span> ${market_avg?.toLocaleString() || "?"} &nbsp;|&nbsp;
          <span className="font-semibold">Market Range:</span> ${market_low?.toLocaleString() || "?"} – ${market_high?.toLocaleString() || "?"}
        </div>
        <div
          className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${
            flag === "OVERPRICED"
              ? "bg-red-600"
              : flag === "UNDERPRICED"
              ? "bg-blue-600"
              : "bg-green-600"
          }`}
        >
          {flag}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th>Year</th>
                <th>Make</th>
                <th>Model</th>
                <th>Trim</th>
                <th>Mileage</th>
                <th>Price</th>
                <th>Location</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {comps?.slice(0, 8).map((c, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td>{c.year}</td>
                  <td>{c.make}</td>
                  <td>{c.model}</td>
                  <td>{c.trim}</td>
                  <td>{c.mileage}</td>
                  <td>${Number(c.price).toLocaleString()}</td>
                  <td>{c.location}</td>
                  <td>
                    <a
                      className="text-blue-700 underline"
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {c.source}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Outliers removed; only market-representative comps are shown.
        </div>
      </div>
    );
  }

  function formatCustomerView() {
    if (!result) return null;
    const { comps } = result;
    return (
      <div className="rounded-2xl shadow-lg p-4 my-4 bg-white" ref={printRef}>
        <h2 className="font-bold text-xl mb-2">
          See for Yourself: Market Comps within 200 Miles
        </h2>
        <div className="mb-2 text-gray-700 text-base">
          We price our vehicles competitively with the local market. Here’s what similar vehicles are listed for right now:
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th>Year</th>
                <th>Make</th>
                <th>Model</th>
                <th>Trim</th>
                <th>Mileage</th>
                <th>Price</th>
                <th>Location</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {comps?.slice(0, 5).map((c, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td>{c.year}</td>
                  <td>{c.make}</td>
                  <td>{c.model}</td>
                  <td>{c.trim}</td>
                  <td>{c.mileage}</td>
                  <td>${Number(c.price).toLocaleString()}</td>
                  <td>{c.location}</td>
                  <td>
                    <a
                      className="text-blue-700 underline"
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {c.source}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          These are real, third-party listings updated in real time.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-3 my-3">
        <button
          onClick={handlePrint}
          className="bg-slate-700 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded-lg shadow"
        >
          Print
        </button>
        <button
          onClick={handleExportPDF}
          className="bg-blue-700 hover:bg-blue-900 text-white font-semibold px-4 py-2 rounded-lg shadow"
        >
          Export PDF
        </button>
      </div>
      {loading && <div className="my-4 text-blue-600">Loading comps...</div>}
      {error && <div className="my-4 text-red-600">{error}</div>}
      {!loading && !error && result && (
        <>{customerMode ? formatCustomerView() : formatManagerView()}</>
      )}
    </div>
  );
}

