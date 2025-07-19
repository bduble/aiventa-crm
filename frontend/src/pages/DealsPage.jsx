import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800",
  Delivered: "bg-blue-100 text-blue-900",
  Booked: "bg-green-400 text-white",
  Unwound: "bg-gray-300 text-gray-700",
};

function statusClass(status, daysToBook) {
  if (status === "Booked" && daysToBook > 3) return "bg-red-600 text-white";
  return STATUS_COLORS[status] || "bg-gray-200 text-gray-900";
}

function formatCurrency(n) {
  if (typeof n !== "number") return "";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDays(n) {
  if (n === null || n === undefined) return "-";
  return n === 1 ? "1 day" : `${n} days`;
}

const EDITABLE_FIELDS = [
  "salesperson",
  "customer_id",
  "vehicle",
  "trade",
  "front_gross",
  "back_gross",
  "total_gross",
  "status",
];

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [editing, setEditing] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // In-table edit state
  const [editCell, setEditCell] = useState({ id: null, field: null, value: "" });
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetch("/api/deals")
      .then((res) => res.json())
      .then((data) => setDeals(data));
  }, [refresh]);

  function handleEdit(deal) {
    setSelectedDeal(deal);
    setEditing(true);
  }

  function handleUnwind(deal) {
    if (!window.confirm("Unwind this deal?")) return;
    fetch(`/api/deals/${deal.id}/unwind`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Manager unwind from UI" }),
    }).then(() => setRefresh((r) => r + 1));
  }

  function handleSave(e) {
    e.preventDefault();
    const form = e.target;
    const updated = {
      status: form.status.value,
      salesperson: form.salesperson.value,
      customer_id: form.customer_id.value,
      vehicle: form.vehicle.value,
      trade: form.trade.value,
      front_gross: parseFloat(form.front_gross.value) || 0,
      back_gross: parseFloat(form.back_gross.value) || 0,
      total_gross: parseFloat(form.total_gross.value) || 0,
    };
    fetch(`/api/deals/${selectedDeal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).then(() => {
      setEditing(false);
      setRefresh((r) => r + 1);
    });
  }

  function flagStatus(deal) {
    if (deal.status !== "Booked") return null;
    if (deal.days_to_book > 7)
      return (
        <span className="ml-2 text-red-600 font-bold animate-pulse">
          EMAIL SENT!
        </span>
      );
    if (deal.days_to_book > 5)
      return (
        <span className="ml-2 text-orange-600 font-semibold animate-pulse">
          FLAGGED!
        </span>
      );
    if (deal.days_to_book > 3)
      return (
        <span className="ml-2 text-red-500 font-semibold animate-pulse">
          OVER 3 DAYS
        </span>
      );
    return null;
  }

  // In-table editing handlers
  function startEdit(id, field, value) {
    setEditCell({ id, field, value: value ?? "" });
  }

  function changeEditValue(e) {
    setEditCell((prev) => ({ ...prev, value: e.target.value }));
  }

  function saveEditCell() {
    if (!editCell.id || !editCell.field) return;
    setSavingId(editCell.id);
    let val = editCell.value;
    // Numbers for currency fields
    if (
      ["front_gross", "back_gross", "total_gross"].includes(editCell.field)
    ) {
      val = parseFloat(val) || 0;
    }
    fetch(`/api/deals/${editCell.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [editCell.field]: val }),
    })
      .then(() => {
        setEditCell({ id: null, field: null, value: "" });
        setSavingId(null);
        setRefresh((r) => r + 1);
      })
      .catch(() => setSavingId(null));
  }

  function onCellKeyDown(e) {
    if (e.key === "Enter") {
      saveEditCell();
    } else if (e.key === "Escape") {
      setEditCell({ id: null, field: null, value: "" });
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Deals – Current Month</h1>
      <div className="overflow-x-auto rounded-lg shadow mb-8">
        <table className="min-w-full text-sm bg-white rounded-xl">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-xs uppercase">
              <th className="py-2 px-3 text-left">Staff</th>
              <th className="py-2 px-3 text-left">Customer</th>
              <th className="py-2 px-3 text-left">Vehicle</th>
              <th className="py-2 px-3 text-left">Trade</th>
              <th className="py-2 px-3 text-right">Front Gross</th>
              <th className="py-2 px-3 text-right">Back Gross</th>
              <th className="py-2 px-3 text-right">Total Gross</th>
              <th className="py-2 px-3 text-center">Status</th>
              <th className="py-2 px-3 text-center">Days to Book</th>
              <th className="py-2 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <motion.tr
                key={deal.id}
                className={`border-b last:border-none transition ${
                  savingId === deal.id ? "bg-blue-50" : ""
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * deal.id }}
              >
                {EDITABLE_FIELDS.map((field) => (
                  <td
                    key={field}
                    className={`py-2 px-3 ${
                      field === "status"
                        ? "text-center"
                        : field.includes("gross")
                        ? "text-right"
                        : ""
                    }`}
                    onClick={() => startEdit(deal.id, field, deal[field])}
                  >
                    {editCell.id === deal.id && editCell.field === field ? (
                      field === "status" ? (
                        <select
                          className="border rounded px-2 py-1 w-full text-sm"
                          value={editCell.value}
                          autoFocus
                          onChange={changeEditValue}
                          onBlur={saveEditCell}
                          onKeyDown={onCellKeyDown}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Booked">Booked</option>
                          <option value="Unwound">Unwound</option>
                        </select>
                      ) : (
                        <input
                          type={
                            ["front_gross", "back_gross", "total_gross"].includes(
                              field
                            )
                              ? "number"
                              : "text"
                          }
                          className="border rounded px-1 py-1 w-full text-sm"
                          value={editCell.value}
                          autoFocus
                          onChange={changeEditValue}
                          onBlur={saveEditCell}
                          onKeyDown={onCellKeyDown}
                          style={{ minWidth: 80 }}
                        />
                      )
                    ) : field === "status" ? (
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold ${statusClass(
                          deal.status,
                          deal.days_to_book
                        )}`}
                      >
                        {deal.status}
                      </span>
                    ) : field.includes("gross") ? (
                      formatCurrency(deal[field])
                    ) : (
                      deal[field] ?? "-"
                    )}
                  </td>
                ))}
                {/* Non-editable cells for Days to Book and Actions */}
                <td className="py-2 px-3 text-center">
                  <span
                    className={
                      deal.days_to_book > 3 && deal.status === "Booked"
                        ? "text-red-500 font-semibold"
                        : ""
                    }
                  >
                    {formatDays(deal.days_to_book)}
                  </span>
                  {flagStatus(deal)}
                </td>
                <td className="py-2 px-3 text-center space-x-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleEdit(deal)}
                  >
                    Edit
                  </button>
                  {deal.status !== "Unwound" && (
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleUnwind(deal)}
                    >
                      Unwind
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Side-panel edit (optional, advanced fields) */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-40">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8"
          >
            <form onSubmit={handleSave} className="space-y-4">
              <h2 className="text-xl font-bold mb-2">Edit Deal</h2>
              <div className="flex gap-2">
                <label className="block flex-1">
                  Salesperson
                  <input
                    name="salesperson"
                    defaultValue={selectedDeal?.salesperson || ""}
                    className="border rounded w-full p-2"
                  />
                </label>
                <label className="block flex-1">
                  Customer ID
                  <input
                    name="customer_id"
                    defaultValue={selectedDeal?.customer_id || ""}
                    className="border rounded w-full p-2"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <label className="block flex-1">
                  Vehicle
                  <input
                    name="vehicle"
                    defaultValue={selectedDeal?.vehicle || ""}
                    className="border rounded w-full p-2"
                  />
                </label>
                <label className="block flex-1">
                  Trade
                  <input
                    name="trade"
                    defaultValue={selectedDeal?.trade || ""}
                    className="border rounded w-full p-2"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <label className="block flex-1">
                  Front Gross
                  <input
                    name="front_gross"
                    defaultValue={selectedDeal?.front_gross || ""}
                    className="border rounded w-full p-2"
                    type="number"
                  />
                </label>
                <label className="block flex-1">
                  Back Gross
                  <input
                    name="back_gross"
                    defaultValue={selectedDeal?.back_gross || ""}
                    className="border rounded w-full p-2"
                    type="number"
                  />
                </label>
                <label className="block flex-1">
                  Total Gross
                  <input
                    name="total_gross"
                    defaultValue={selectedDeal?.total_gross || ""}
                    className="border rounded w-full p-2"
                    type="number"
                  />
                </label>
              </div>
              <label className="block">
                Status
                <select
                  name="status"
                  defaultValue={selectedDeal?.status || "Pending"}
                  className="border rounded w-full p-2"
                >
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Booked">Booked</option>
                  <option value="Unwound">Unwound</option>
                </select>
              </label>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-700 text-white rounded-xl px-4 py-2 font-bold shadow hover:bg-blue-800 transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="ml-2 rounded-xl px-4 py-2 bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
