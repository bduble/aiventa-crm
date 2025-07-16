// frontend/src/components/CustomerProfileCard.jsx
import React, { useState, useEffect } from "react";
import { Phone, MessageCircle, Mail, Edit, Save, X } from "lucide-react";

// --- Helper: Get initials for avatar ---
function getInitials(name, fallback = "?") {
  if (!name) return fallback;
  const parts = name.split(" ");
  return (
    (parts[0]?.[0] ?? "") +
    (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase();
}

// --- Customer Tag/Badge (customize colors/types as needed) ---
function Tag({ label, color = "bg-blue-100 text-blue-700" }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mr-2 ${color}`}
    >
      {label}
    </span>
  );
}

// --- Tab Component ---
function Tabs({ activeTab, onTab, tabs }) {
  return (
    <div className="flex border-b mb-4 space-x-4">
      {tabs.map((t) => (
        <button
          key={t}
          className={`px-3 py-2 text-sm font-medium ${
            activeTab === t
              ? "border-b-2 border-blue-600 text-blue-700"
              : "text-gray-500"
          }`}
          onClick={() => onTab(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// --- Fields to exclude from edit/detail view ---
const EXCLUDE_FIELDS = [
  "id",
  "created_at",
  "updated_at",
  "account_id",
  "ledger",
  "last_visit",
];

// --- Renders all editable fields ---
function CustomerFields({ customer, editMode, onChange }) {
  if (!customer) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.keys(customer)
        .filter(
          (key) =>
            !EXCLUDE_FIELDS.includes(key) &&
            !(key === "name" && (customer["first_name"] || customer["last_name"]))
        )
        .map((key) => (
          <div key={key} className="flex flex-col mb-2">
            <label className="font-semibold mb-1 capitalize">
              {key.replace(/_/g, " ")}
            </label>
            {editMode ? (
              <input
                className="border rounded px-2 py-1"
                value={customer[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                type="text"
                disabled={key === "email"}
              />
            ) : (
              <span className="text-gray-800">
                {customer[key] ?? <span className="text-gray-400">—</span>}
              </span>
            )}
          </div>
        ))}
    </div>
  );
}

// --- Show customer ledger/history ---
function CustomerLedger({ ledger }) {
  if (!ledger || ledger.length === 0)
    return <div className="mt-6 text-gray-500 italic">No history yet.</div>;
  return (
    <div className="mt-3">
      <div className="bg-gray-50 rounded p-3 max-h-64 overflow-y-auto text-sm">
        {ledger.map((entry, idx) => (
          <div key={entry.id || idx} className="border-b last:border-b-0 py-2">
            <div className="text-xs text-gray-600">
              {entry.timestamp
                ? new Date(entry.timestamp).toLocaleString()
                : null}
            </div>
            <div className="font-medium">{entry.type || "Note"}</div>
            <div className="text-gray-800">
              {entry.summary || entry.detail || entry.note}
            </div>
            {entry.staff && (
              <div className="text-xs text-gray-500">by {entry.staff}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main Card Component ---
export default function CustomerProfileCard({ customer, ledger = [], onSave }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(customer);
  const [activeTab, setActiveTab] = useState("Details");
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
  const CURRENT_USER_ID = 1

  const logActivity = async (type, note = '', subject = '') => {
    const payload = { activity_type: type, note, subject, customer_id: customer?.id, user_id: CURRENT_USER_ID }
    try {
      await fetch(`${API_BASE}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch {}
  }

  // Simulated tags: you might fetch or compute these
  const tags = [
    customer.loyalty
      ? { label: "Loyal", color: "bg-green-100 text-green-700" }
      : null,
    customer.lead_source
      ? { label: customer.lead_source, color: "bg-yellow-100 text-yellow-700" }
      : null,
    customer.vip ? { label: "VIP", color: "bg-purple-100 text-purple-700" } : null,
  ].filter(Boolean);

  useEffect(() => {
    setForm(customer);
    if (customer?.id) {
      logActivity('view', '', 'Viewed customer card');
    }
  }, [customer]);

  function handleFieldChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (typeof onSave === "function") onSave(form);
    setEditMode(false);
  }

  function CommunicationActions({ phone, email }) {
    return (
      <div className="flex items-center gap-3 my-2">
        {phone && (
          <>
            <button
              className="rounded-full p-2 hover:bg-blue-100"
              onClick={() => { logActivity('call', '', 'Phone call'); window.location.href = `tel:${phone}` }}
              title="Call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              className="rounded-full p-2 hover:bg-blue-100"
              onClick={() => { logActivity('text', '', 'Text message'); window.location.href = `sms:${phone}` }}
              title="Text"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </>
        )}
        {email && (
          <button
            className="rounded-full p-2 hover:bg-blue-100"
            onClick={() => { logActivity('email', '', 'Email'); window.location.href = `mailto:${email}` }}
            title="Email"
          >
            <Mail className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow bg-white p-6 space-y-4 max-w-3xl mx-auto mt-8">
      {/* --- Top: Avatar, Name, Tags, Actions --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-700 shadow">
            {customer.avatar_url ? (
              <img
                src={customer.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              getInitials(
                customer.name ||
                  [customer.first_name, customer.last_name]
                    .filter(Boolean)
                    .join(" ")
              )
            )}
          </div>
          <div>
            <div className="text-2xl font-bold">
              {form.name ||
                [form.first_name, form.last_name].filter(Boolean).join(" ") ||
                "Customer"}
            </div>
            {/* Tags */}
            <div className="flex flex-wrap items-center my-1">
              {tags.length === 0 && (
                <span className="text-xs text-gray-400">No tags</span>
              )}
              {tags.map((tag, i) => (
                <Tag key={i} label={tag.label} color={tag.color} />
              ))}
            </div>
            {/* Main communications */}
            <CommunicationActions phone={form.phone} email={form.email} />
          </div>
        </div>
        {/* Edit/Save buttons */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {editMode ? (
            <>
              <button
                className="btn btn-primary flex items-center gap-1"
                onClick={handleSave}
                title="Save"
              >
                <Save className="w-4 h-4" /> Save
              </button>
              <button
                className="btn btn-outline flex items-center gap-1"
                onClick={() => {
                  setForm(customer); // revert changes
                  setEditMode(false);
                }}
                title="Cancel"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </>
          ) : (
            <button
              className="btn btn-outline flex items-center gap-1"
              onClick={() => setEditMode(true)}
              title="Edit"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
          )}
        </div>
      </div>
      {/* --- Tabs --- */}
      <Tabs
        activeTab={activeTab}
        onTab={setActiveTab}
        tabs={["Details", "Ledger", "Appointments", "Vehicles"]}
      />
      {/* --- Tab Content --- */}
      <div>
        {activeTab === "Details" && (
          <CustomerFields
            customer={form}
            editMode={editMode}
            onChange={handleFieldChange}
          />
        )}
        {activeTab === "Ledger" && <CustomerLedger ledger={ledger} />}
        {activeTab === "Appointments" && (
          <div className="mt-4 text-gray-500 italic">No appointments yet.</div>
        )}
        {activeTab === "Vehicles" && (
          <div className="mt-4 text-gray-500 italic">No vehicles on file.</div>
        )}
      </div>
    </div>
  );
}
