import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Phone, MessageCircle, Mail, Edit, Save, X, User, Car, Zap } from 'lucide-react'
import FieldRow from '../components/FieldRow'
import LedgerEntry from '../components/LedgerEntry'

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "vehicles", label: "Vehicles" },
  { key: "ledger", label: "Ledger" },
  { key: "ai", label: "AI Insights" }
];

export default function CustomerCard() {
  const { id } = useParams()
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

  const [customer, setCustomer] = useState(null)
  const [edited, setEdited] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ledger, setLedger] = useState([])
  const [note, setNote] = useState('')
  const [aiInfo, setAiInfo] = useState({ summary: '', next_steps: [], hotness: 5, in_market: false, tags: [] })
  const [tab, setTab] = useState("profile")

  // Avatar logic: fallback to initials or car/user icon
  const getAvatar = () => {
    if (customer?.avatar_url) return <img src={customer.avatar_url} className="w-16 h-16 rounded-full border" alt="avatar" />;
    const name = customer?.full_name || customer?.name || "";
    const initials = name
      .split(" ")
      .map(w => w[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
    return (
      <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold border">
        {initials || <User className="w-8 h-8" />}
      </div>
    );
  };

  // Main fetchers
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/customers/${id}`);
        if (!res.ok) throw new Error('Failed to load customer');
        const data = await res.json();
        setCustomer(data);
        setEdited(data);
      } catch (err) {
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    })();
    (async () => {
      const res = await fetch(`${API_BASE}/activities?customer_id=${id}`);
      if (res.ok) setLedger(await res.json());
    })();
    (async () => {
      const res = await fetch(`${API_BASE}/customers/${id}/ai-summary`);
      if (res.ok) setAiInfo(await res.json());
    })();
  }, [id]);

  // Save/update logic
  const handleSave = async () => {
    try {
      const payload = {};
      Object.keys(edited).forEach(k => {
        if (edited[k] !== customer[k]) payload[k] = edited[k];
      });
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update customer');
      const data = await res.json();
      setCustomer(data);
      setEdited(data);
      setEditMode(false);
    } catch (err) { console.error(err); }
  };
  const handleCancel = () => { setEdited(customer); setEditMode(false); };
  const handleAddNote = async () => {
    if (!note.trim()) return;
    const res = await fetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity_type: 'note', note, customer_id: id })
    });
    if (res.ok) { setNote(''); setLedger(await (await fetch(`${API_BASE}/activities?customer_id=${id}`)).json()); }
  };

  if (loading) return <div>Loading...</div>
  if (!customer) return <div>Customer not found</div>

  // --- Build dynamic field groups ---
  const allFields = Object.keys(customer).filter(k => k !== 'id');
  const fieldOrder = [
    'full_name', 'name', 'first_name', 'last_name', 'email', 'phone', 
    'vehicle', 'trade', 'vehicle_interest', 'trade_vehicle',
    'demo', 'worksheet', 'customer_offer', 'sold',
    // Add more as needed...
  ];
  // For "profile" tab: contact & sales info
  const profileFields = fieldOrder.filter(f => allFields.includes(f));
  // For "vehicles" tab: anything vehicle-related
  const vehicleFields = ['vehicle', 'vehicle_interest', 'trade', 'trade_vehicle'].filter(f => allFields.includes(f));
  // Everything else for "other"
  const otherFields = allFields.filter(f => !profileFields.includes(f) && !vehicleFields.includes(f));

  // --- UI components ---
  const ScoreBar = ({ score }) => (
    <div className="flex items-center gap-2">
      <Zap className={score > 7 ? 'text-green-500' : score > 4 ? 'text-yellow-500' : 'text-red-500'} />
      <div className="w-28 h-2 bg-gray-200 rounded">
        <div
          className={`h-2 rounded ${score > 7 ? 'bg-green-500' : score > 4 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${(score || 1) * 10}%` }}
        />
      </div>
      <span className="text-xs font-bold">{score ?? "?"}/10</span>
    </div>
  );

  const Tags = ({ tags, inMarket }) => (
    <div className="flex gap-2 flex-wrap mt-1">
      {tags?.map(tag => (
        <span key={tag} className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">{tag}</span>
      ))}
      {inMarket && (
        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium border border-green-400">
          In Market
        </span>
      )}
    </div>
  );

  // --- Main Render ---
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Link to="/customers" className="text-blue-600 hover:underline">&larr; Customers</Link>
      <div className="bg-white shadow-xl rounded-2xl p-6 mt-2 relative">
        {/* Top row: Avatar, name, hotness, tags, actions */}
        <div className="flex flex-wrap items-center gap-6 border-b pb-4">
          {getAvatar()}
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{customer.full_name || customer.name}</span>
              {customer.sold && (
                <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Sold</span>
              )}
            </div>
            <Tags tags={aiInfo.tags || []} inMarket={aiInfo.in_market} />
            <div className="mt-1"><ScoreBar score={aiInfo.hotness} /></div>
          </div>
          {/* Actions */}
          <div className="flex flex-col gap-2 items-center">
            <a className="p-2 rounded-full hover:bg-gray-100" href={`tel:${customer.phone ?? ''}`}><Phone className="h-5 w-5" /></a>
            <a className="p-2 rounded-full hover:bg-gray-100" href={`sms:${customer.phone ?? ''}`}><MessageCircle className="h-5 w-5" /></a>
            <a className="p-2 rounded-full hover:bg-gray-100" href={`mailto:${customer.email ?? ''}`}><Mail className="h-5 w-5" /></a>
            {editMode ? (
              <div className="flex gap-1 mt-2">
                <button className="px-2 py-1 bg-blue-600 text-white rounded flex items-center gap-1 text-xs" onClick={handleSave}><Save className="w-4 h-4" />Save</button>
                <button className="px-2 py-1 bg-gray-300 rounded flex items-center gap-1 text-xs" onClick={handleCancel}><X className="w-4 h-4" />Cancel</button>
              </div>
            ) : (
              <button className="px-2 py-1 bg-blue-600 text-white rounded flex items-center gap-1 text-xs mt-2" onClick={() => setEditMode(true)}><Edit className="w-4 h-4" />Edit</button>
            )}
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-4 mt-4 border-b pb-1">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`px-3 py-1 rounded-t text-sm font-medium ${tab === t.key ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Tab content */}
        <div className="py-4">
          {/* --- Profile Tab --- */}
          {tab === "profile" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profileFields.map(f => (
                <FieldRow
                  key={f}
                  label={f.replace(/_/g, ' ')}
                  value={edited[f]}
                  type={typeof edited[f] === 'boolean' ? 'checkbox' : 'text'}
                  editMode={editMode}
                  onChange={v => setEdited({ ...edited, [f]: v })}
                />
              ))}
              {otherFields.length > 0 && (
                <div className="sm:col-span-2">
                  <h4 className="font-semibold text-xs mb-1">Other Fields</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {otherFields.map(f => (
                      <FieldRow
                        key={f}
                        label={f.replace(/_/g, ' ')}
                        value={edited[f]}
                        type={typeof edited[f] === 'boolean' ? 'checkbox' : 'text'}
                        editMode={editMode}
                        onChange={v => setEdited({ ...edited, [f]: v })}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* --- Vehicles Tab --- */}
          {tab === "vehicles" && (
            <div>
              {vehicleFields.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehicleFields.map(f => (
                    <FieldRow
                      key={f}
                      label={f.replace(/_/g, ' ')}
                      value={edited[f]}
                      type="text"
                      editMode={editMode}
                      onChange={v => setEdited({ ...edited, [f]: v })}
                    />
                  ))}
                </div>
              ) : <div className="text-gray-500 text-sm">No vehicle data on file.</div>}
            </div>
          )}
          {/* --- Ledger Tab --- */}
          {tab === "ledger" && (
            <div>
              <div className="max-h-60 overflow-y-auto border rounded p-2 mb-2 bg-gray-50">
                {ledger.length ? ledger.map(entry => (
                  <LedgerEntry key={entry.id} entry={entry} />
                )) : <div className="text-sm text-gray-500">No activity yet.</div>}
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  className="flex-1 border rounded p-2"
                  rows="2"
                  placeholder="Add note..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
                <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleAddNote}>Add</button>
              </div>
            </div>
          )}
          {/* --- AI Insights Tab --- */}
          {tab === "ai" && (
            <div>
              {aiInfo.summary && (
                <div className="mb-3 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <h4 className="font-semibold mb-1">AI Summary</h4>
                  <p className="text-sm whitespace-pre-wrap">{aiInfo.summary}</p>
                </div>
              )}
              <div className="mb-2">
                <ScoreBar score={aiInfo.hotness} />
                <Tags tags={aiInfo.tags} inMarket={aiInfo.in_market} />
              </div>
              {aiInfo.next_steps?.length > 0 && (
                <ul className="list-disc list-inside text-sm mb-3">
                  {aiInfo.next_steps.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              )}
              {(aiInfo.sms_template || aiInfo.email_template) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {aiInfo.sms_template && customer.phone && (
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      onClick={() =>
                        (window.location.href = `sms:${customer.phone}?&body=${encodeURIComponent(aiInfo.sms_template)}`)
                      }
                    >
                      Send SMS Template
                    </button>
                  )}
                  {aiInfo.email_template && customer.email && (
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      onClick={() =>
                        (window.location.href = `mailto:${customer.email}?body=${encodeURIComponent(aiInfo.email_template)}`)
                      }
                    >
                      Send Email Template
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
