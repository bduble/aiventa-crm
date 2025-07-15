import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Phone, MessageCircle, Mail, Edit, Save, X, Flame, User, Calendar, Star, MapPin, Sun, Moon
} from 'lucide-react'
import clsx from 'clsx'

const TABS = [
  { label: "Profile", key: "profile" },
  { label: "Activity", key: "ledger" },
  { label: "Deals", key: "deals" },
  { label: "AI Insights", key: "ai" },
  { label: "Tasks", key: "tasks" }
]

function getInitials(name = '') {
  return name.split(' ')
    .map(part => part[0]?.toUpperCase())
    .join('').slice(0, 2)
}

export default function CustomerCard() {
  const { id } = useParams()
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

  const [customer, setCustomer] = useState(null)
  const [edited, setEdited] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ledger, setLedger] = useState([])
  const [note, setNote] = useState('')
  const [aiInfo, setAiInfo] = useState({})
  const [tab, setTab] = useState('profile')
  const [theme, setTheme] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light'
  )

  // Hotness bar colors (1-10)
  function hotnessColor(score) {
    if (score >= 8) return "bg-gradient-to-r from-orange-500 via-red-600 to-yellow-400"
    if (score >= 5) return "bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
    if (score > 0)  return "bg-gradient-to-r from-blue-400 to-yellow-400"
    return "bg-gray-200 dark:bg-gray-700"
  }

  // Fetch customer and AI info
  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE}/customers/${id}`)
      .then(r => r.json())
      .then(data => { setCustomer(data); setEdited(data); setLoading(false) })
      .catch(() => setLoading(false))
    fetch(`${API_BASE}/customers/${id}/ai-summary`)
      .then(r => r.json())
      .then(setAiInfo)
    fetch(`${API_BASE}/activities?customer_id=${id}`)
      .then(r => r.json())
      .then(setLedger)
  }, [id])

  // Save logic
  const handleSave = async () => {
    try {
      const payload = {}
      Object.keys(edited).forEach(k => { if (edited[k] !== customer[k]) payload[k] = edited[k] })
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to update customer')
      const data = await res.json()
      setCustomer(data)
      setEdited(data)
      setEditMode(false)
    } catch (err) { alert('Failed to save') }
  }
  const handleCancel = () => { setEdited(customer); setEditMode(false) }

  // Add note
  const handleAddNote = async () => {
    if (!note.trim()) return
    await fetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity_type: 'note', note, customer_id: id })
    })
    setNote(''); fetch(`${API_BASE}/activities?customer_id=${id}`).then(r=>r.json()).then(setLedger)
  }

  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  if (loading) return <div className="flex justify-center items-center h-48">Loading...</div>
  if (!customer) return <div>Customer not found</div>

  // Example scoring logic
  const hotness = aiInfo?.hotness_score ?? customer?.hotness ?? 5
  const inMarket = aiInfo?.in_market ?? hotness >= 7

  // ---- Dynamic Field List ----
  const profileFields = [
    { key: 'full_name', label: 'Full Name', icon: User },
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'phone', label: 'Phone', icon: Phone },
    { key: 'vehicle', label: 'Current Vehicle', icon: Star },
    { key: 'vehicle_interest', label: 'Interested In', icon: Flame },
    { key: 'trade', label: 'Trade-in', icon: Star },
    { key: 'address', label: 'Address', icon: MapPin },
  ].filter(f => customer[f.key])

  // ---- Tabbed Layout ----
  return (
    <div className={clsx("max-w-3xl mx-auto mt-8 mb-12 rounded-2xl shadow-xl p-6 transition-all duration-300", "bg-white dark:bg-slate-900 text-slate-900 dark:text-white")}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 relative">
        {/* Avatar */}
        <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-blue-400 dark:from-slate-700 dark:to-blue-800 text-3xl font-bold text-white shadow-lg">
          {customer.avatar_url
            ? <img src={customer.avatar_url} alt="avatar" className="rounded-full w-16 h-16 object-cover" />
            : getInitials(customer.full_name || customer.name || customer.first_name || "U")}
          {/* In-market badge */}
          {inMarket &&
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 shadow font-bold animate-pulse">IN MARKET</span>}
        </div>
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            {customer.full_name || customer.name || (customer.first_name + ' ' + customer.last_name)}
            <span className={clsx(
              "ml-2 px-2 py-0.5 text-xs rounded-xl font-semibold tracking-wide",
              inMarket ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-yellow-200" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            )}>
              {inMarket ? "🔥 Hot Prospect" : "Active"}
            </span>
          </h2>
          <div className="flex gap-2 items-center mt-1">
            {/* Hotness bar */}
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="font-mono font-bold">{hotness}/10</span>
              <div className="w-24 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ml-2">
                <div
                  className={clsx(hotnessColor(hotness), "h-2 transition-all")}
                  style={{ width: `${hotness * 10}%` }}
                />
              </div>
            </div>
            {/* Last contact / Overdue */}
            {customer.last_contact && (
              <span className="ml-4 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-4 h-4 inline" /> Last Contact: {customer.last_contact}
              </span>
            )}
          </div>
        </div>
        {/* Theme toggle */}
        <button
          className="ml-auto p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
      </div>
      {/* Tags */}
      <div className="flex gap-2 flex-wrap mb-2">
        {(customer.tags || []).map((tag, i) =>
          <span key={i} className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-xs font-semibold dark:bg-sky-900 dark:text-sky-200">{tag}</span>
        )}
        {/* Example: show stage chip */}
        {customer.stage && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold dark:bg-green-900 dark:text-green-200">{customer.stage}</span>}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <a className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900" href={`tel:${customer.phone ?? ''}`} title="Call"><Phone /></a>
        <a className="p-2 rounded hover:bg-green-100 dark:hover:bg-green-900" href={`sms:${customer.phone ?? ''}`} title="Text"><MessageCircle /></a>
        <a className="p-2 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900" href={`mailto:${customer.email ?? ''}`} title="Email"><Mail /></a>
        {/* Appointment/Follow-Up Button */}
        <button className="ml-2 px-3 py-1 bg-blue-700 text-white rounded font-bold shadow" onClick={() => alert('TODO: Book appointment!')}>Book Appt</button>
        <button className="px-3 py-1 bg-orange-600 text-white rounded font-bold shadow" onClick={() => alert('TODO: Add follow-up task!')}>+ Follow-Up</button>
        {/* Edit Toggle */}
        {editMode ? (
          <>
            <button className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-1" onClick={handleSave}><Save className="w-4 h-4" />Save</button>
            <button className="px-3 py-1 bg-gray-400 text-white rounded flex items-center gap-1" onClick={handleCancel}><X className="w-4 h-4" />Cancel</button>
          </>
        ) : (
          <button className="px-3 py-1 bg-blue-500 text-white rounded flex items-center gap-1" onClick={() => setEditMode(true)}><Edit className="w-4 h-4" />Edit</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-slate-300 dark:border-slate-700">
        {TABS.map(t =>
          <button
            key={t.key}
            className={clsx(
              "px-3 py-2 -mb-px border-b-2 font-semibold",
              tab === t.key
                ? "border-blue-700 text-blue-700 dark:border-blue-300 dark:text-blue-300"
                : "border-transparent text-slate-600 dark:text-slate-300 hover:text-blue-600"
            )}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        )}
      </div>

      {/* Main Panel: Render Tab Content */}
      <div>
        {tab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileFields.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 py-2">
                <Icon className="w-5 h-5 text-blue-500" />
                <span className="font-medium w-28">{label}</span>
                {editMode ? (
                  <input
                    className="bg-slate-100 dark:bg-slate-800 border rounded px-2 py-1 flex-1"
                    type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                    value={edited[key] || ''}
                    onChange={e => setEdited({ ...edited, [key]: e.target.value })}
                  />
                ) : (
                  <span className="flex-1">{customer[key]}</span>
                )}
              </div>
            ))}
          </div>
        )}
        {tab === 'ledger' && (
          <div>
            <h3 className="font-bold mb-2">Activity Timeline</h3>
            <div className="max-h-64 overflow-y-auto bg-slate-50 dark:bg-slate-800 rounded p-2 border">
              {ledger.length ? ledger.map(entry =>
                <div key={entry.id} className="mb-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{entry.created_at}</span>
                  <div className="">{entry.note}</div>
                  <div className="text-xs text-slate-400">{entry.activity_type}</div>
                </div>
              ) : <div className="text-slate-400">No activity yet.</div>}
            </div>
            <div className="flex items-end gap-2 mt-3">
              <textarea className="flex-1 border rounded p-2 bg-white dark:bg-slate-900" rows={2} placeholder="Add note..." value={note} onChange={e => setNote(e.target.value)} />
              <button className="px-3 py-1 bg-blue-700 text-white rounded" onClick={handleAddNote}>Add</button>
            </div>
          </div>
        )}
        {tab === 'deals' && (
          <div className="text-slate-500 text-center py-8">
            <span className="text-xl font-semibold">Deals module coming soon!</span>
          </div>
        )}
        {tab === 'ai' && (
          <div>
            <h3 className="font-bold mb-2">AI Insights</h3>
            {aiInfo?.summary && <div className="mb-2">{aiInfo.summary}</div>}
            {aiInfo?.next_steps?.length > 0 && (
              <ul className="list-disc list-inside text-sm">
                {aiInfo.next_steps.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            )}
            {aiInfo?.sms_template && (
              <div className="my-2">
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  onClick={() =>
                    (window.location.href = `sms:${customer.phone}?&body=${encodeURIComponent(aiInfo.sms_template)}`)
                  }
                >
                  Send SMS Template
                </button>
              </div>
            )}
            {aiInfo?.email_template && (
              <div className="my-2">
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  onClick={() =>
                    (window.location.href = `mailto:${customer.email}?body=${encodeURIComponent(aiInfo.email_template)}`)
                  }
                >
                  Send Email Template
                </button>
              </div>
            )}
          </div>
        )}
        {tab === 'tasks' && (
          <div className="text-slate-500 text-center py-8">
            <span className="text-xl font-semibold">Tasks & reminders coming soon!</span>
          </div>
        )}
      </div>

      {/* Back link */}
      <div className="mt-8">
        <Link to="/customers" className="text-blue-600 hover:underline">
          &larr; Back to Customers
        </Link>
      </div>
    </div>
  )
}
