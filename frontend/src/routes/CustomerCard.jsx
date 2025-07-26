import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useParams, Link } from 'react-router-dom'
import { formatDateTime } from '../utils/formatDateTime'
import {
  Phone, MessageCircle, Mail, Edit, Save, X, Flame, User, Calendar, Star, MapPin,
  Sun, Moon, BadgeCheck, Upload, Cloud, Users, Globe, File, Map, CheckCircle, Plus, Shield, CreditCard, TrendingUp
} from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

function getInitials(name = '') {
  return name.split(' ').map(part => part[0]?.toUpperCase()).join('').slice(0, 2)
}

const TABS = [
  { label: "Profile", key: "profile" },
  { label: "Activity", key: "ledger" },
  { label: "Deals", key: "deals" },
  { label: "AI Insights", key: "ai" },
  { label: "Tasks", key: "tasks" },
  { label: "Appointments", key: "appointments" },
  { label: "Docs", key: "docs" },
  { label: "Map", key: "map" },
  { label: "Deal Desk", key: "dealdesk" },
  { label: "Finance", key: "finance" },
]

const PROFILE_FIELDS = [
  { key: 'name', label: 'Full Name', icon: User },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'vehicle', label: 'Current Vehicle', icon: Star },
  { key: 'vehicle_interest', label: 'Interested In', icon: Flame },
  { key: 'trade', label: 'Trade-in', icon: Star },
  { key: 'address', label: 'Address', icon: MapPin }
]

const ANIM_PROPS = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.2 } }

export default function CustomerCard({ userRole = "sales" }) {
  const { id } = useParams()
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
  const CURRENT_USER_ID = 1

  const [customer, setCustomer] = useState(null)
  const [edited, setEdited] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ledger, setLedger] = useState([])
  const [note, setNote] = useState('')
  const [aiInfo, setAiInfo] = useState({})
  const [tab, setTab] = useState('profile')
  const { theme, setTheme } = useTheme()
  const [isOnline, setIsOnline] = useState(false)
  const [social, setSocial] = useState({ linkedin: '', facebook: '', twitter: '', found: false })
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [tasks, setTasks] = useState([])
  const [appointments, setAppointments] = useState([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showApptModal, setShowApptModal] = useState(false)
  const [dealOffers, setDealOffers] = useState([]);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditStatus, setCreditStatus] = useState(null);

  // ---- AI Live Hotness Auto-Update ----
  useEffect(() => {
    if (!customer) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/customers/${id}/ai-hotness`);
        if (res.ok) {
          const { score } = await res.json();
          setCustomer(prev => ({ ...prev, hotness: score }));
        }
      } catch {}
    }, 8000);
    return () => clearInterval(interval);
  }, [id, customer]);

  // ---- Next Best Action ----
  const [nextAction, setNextAction] = useState('');
  useEffect(() => {
    fetch(`${API_BASE}/customers/${id}/ai-next-action`)
      .then(res => res.json()).then(data => setNextAction(data.action));
  }, [id, ledger, tasks]);

  useEffect(() => {
    const timer = setInterval(() => setIsOnline(Math.random() > 0.5), 6000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE}/customers/${id}`)
      .then(r => r.json()).then(data => { setCustomer(data); setEdited(data); setLoading(false) })
      .catch(() => setLoading(false))
    fetch(`${API_BASE}/customers/${id}/ai-summary`)
      .then(r => r.json()).then(setAiInfo)
    fetch(`${API_BASE}/activities?customer_id=${id}`)
      .then(r => r.json()).then(setLedger)
    fetch(`${API_BASE}/customers/${id}/files`)
      .then(r => r.json()).then(docs => setFiles(docs || []))
    // Social Lookup (Mocked)
    setTimeout(() => setSocial({
      linkedin: "https://linkedin.com/in/fake-profile",
      facebook: "https://facebook.com/fake-profile",
      twitter: "https://twitter.com/fake-profile",
      found: true
    }), 900)
    fetchTasks()
    fetchAppointments()
    fetchDealOffers();
    logActivity('view', '', 'Viewed customer card')
  }, [id])

  useEffect(() => {
    if (tab === "tasks") fetchTasks()
    if (tab === "appointments") fetchAppointments()
    if (tab === "dealdesk") fetchDealOffers()
  }, [tab, id])

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks?customer_id=${id}`)
      if (res.ok) setTasks(await res.json())
      else setTasks([])
    } catch { setTasks([]) }
  }
  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_BASE}/appointments?customer_id=${id}`)
      if (res.ok) setAppointments(await res.json())
      else setAppointments([])
    } catch { setAppointments([]) }
  }
  const fetchDealOffers = async () => {
    try {
      const res = await fetch(`${API_BASE}/deals?customer_id=${id}`);
      if (res.ok) setDealOffers(await res.json());
      else setDealOffers([]);
    } catch { setDealOffers([]) }
  }

  const logActivity = async (type, note = '', subject = '') => {
    const payload = { activity_type: type, note, subject, customer_id: id, user_id: CURRENT_USER_ID }
    try {
      await fetch(`${API_BASE}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      fetch(`${API_BASE}/activities?customer_id=${id}`)
        .then(r => r.json()).then(setLedger)
    } catch (err) { }
  }

  const handleSave = async () => {
    try {
      const payload = {}
      PROFILE_FIELDS.forEach(({ key }) => payload[key] = edited[key] ?? "")
      if (userRole === "manager") payload['hashed_password'] = edited['hashed_password'] ?? ""
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
    } catch (err) { }
  }
  const handleCancel = () => { setEdited(customer); setEditMode(false) }

  const handleAddNote = async () => {
    if (!note.trim()) return
    await logActivity('note', note, 'Note')
    setNote('')
  }

  // ---- Smart Upload ----
  const handleSmartUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append("file", file)
    const res = await fetch(`${API_BASE}/customers/${id}/files/smart`, { method: 'POST', body: form })
    if (res.ok) {
      const { fields } = await res.json();
      setEdited(prev => ({ ...prev, ...fields }));
    }
    setUploading(false)
    fetch(`${API_BASE}/customers/${id}/files`).then(r => r.json()).then(docs => setFiles(docs || []))
  }

  // ---- Credit Modal ----
  function CreditAppModal({ onClose }) {
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState(creditStatus);
    const [form, setForm] = useState({ ssn: '', dob: '', income: '' });
    const submitApp = async () => {
      setSubmitting(true);
      // Replace with your credit API
      setTimeout(() => {
        setStatus('Approved');
        setCreditStatus('Approved');
        setSubmitting(false);
      }, 1800);
    }
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow w-96 max-w-full">
          <h3 className="font-bold mb-2 flex items-center gap-2"><CreditCard /> Credit Application</h3>
          <input className="border rounded w-full p-2 mb-2" placeholder="SSN" value={form.ssn} onChange={e => setForm(f => ({ ...f, ssn: e.target.value }))} />
          <input className="border rounded w-full p-2 mb-2" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
          <input className="border rounded w-full p-2 mb-2" placeholder="Monthly Income" value={form.income} onChange={e => setForm(f => ({ ...f, income: e.target.value }))} />
          {status && <div className="my-2 px-3 py-2 bg-green-100 text-green-800 rounded font-bold">{status}</div>}
          <div className="flex gap-2">
            <button className="bg-blue-700 text-white px-3 py-1 rounded" onClick={submitApp} disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</button>
            <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Task & Appointment Modals ----
  function TaskModal({ onClose }) {
    const [title, setTitle] = useState('')
    const [due, setDue] = useState('')
    const handleAdd = async () => {
      if (!title) return
      await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, due_date: due, customer_id: id })
      })
      onClose()
      fetchTasks()
    }
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow w-80">
          <h3 className="font-bold mb-2 flex items-center gap-2"><Plus /> Add Task</h3>
          <input className="border rounded w-full p-2 mb-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <input className="border rounded w-full p-2 mb-2" type="datetime-local" value={due} onChange={e => setDue(e.target.value)} />
          <div className="flex gap-2">
            <button className="bg-blue-700 text-white px-3 py-1 rounded" onClick={handleAdd}>Add</button>
            <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }
  function AppointmentModal({ onClose }) {
    const [type, setType] = useState('')
    const [start, setStart] = useState('')
    const handleAdd = async () => {
      if (!type || !start) return
      await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_type: type, start_time: start, customer_id: id })
      })
      onClose()
      fetchAppointments()
    }
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow w-80">
          <h3 className="font-bold mb-2 flex items-center gap-2"><Plus /> Book Appointment</h3>
          <input className="border rounded w-full p-2 mb-2" placeholder="Type (e.g., Test Drive)" value={type} onChange={e => setType(e.target.value)} />
          <input className="border rounded w-full p-2 mb-2" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
          <div className="flex gap-2">
            <button className="bg-green-700 text-white px-3 py-1 rounded" onClick={handleAdd}>Book</button>
            <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) return <div className="flex justify-center items-center h-48">Loading...</div>
  if (!customer) return <div>Customer not found</div>

  const hotness = aiInfo?.hotness_score ?? customer?.hotness ?? 5
  const inMarket = aiInfo?.in_market ?? hotness >= 7

  const nextTask = tasks.filter(t => !t.completed).sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0]
  const nextAppt = appointments.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0]
  const profileFields = [...PROFILE_FIELDS]
  if (userRole === "manager") profileFields.push({ key: 'hashed_password', label: 'Password Hash', icon: BadgeCheck })

  const socialIcons = [
    { label: "LinkedIn", icon: <Globe />, url: social.linkedin },
    { label: "Facebook", icon: <Users />, url: social.facebook },
    { label: "Twitter", icon: <Globe />, url: social.twitter }
  ].filter(s => s.url)

  // ---- UI ----
  return (
    <div className={clsx(
      "max-w-3xl mx-auto mt-8 mb-12 rounded-2xl shadow-2xl p-4 sm:p-6 transition-all duration-300",
      "bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
      "border border-slate-100 dark:border-slate-800"
    )}>
      {/* ---- Context Highlights ---- */}
      <div className="flex flex-wrap gap-4 mb-2">
        {nextTask && (
          <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-3 py-1 rounded font-semibold animate-pulse">
            ⚡ Next Task: {nextTask.title} (Due {formatDateTime(nextTask.due_date)})
          </div>
        )}
        {nextAppt && (
          <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded font-semibold animate-bounce">
            <Calendar className="inline w-4 h-4 mr-1" /> Next Appt: {nextAppt.appointment_type || "Appointment"} ({formatDateTime(nextAppt.start_time)})
          </div>
        )}
        {/* Next Best Action */}
        {nextAction && (
          <div className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 px-3 py-1 rounded font-bold animate-bounce">
            <TrendingUp className="inline w-4 h-4 mr-1" />
            Next Best Action: {nextAction}
            <button className="ml-2 px-2 py-0.5 rounded bg-blue-700 text-white text-xs" onClick={() => { /* Trigger Action Here */ }}>Do It</button>
          </div>
        )}
      </div>

      {/* ---- Customer Header ---- */}
      <div className="flex items-center gap-4 mb-4 relative">
        <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-blue-400 dark:from-slate-700 dark:to-blue-800 text-3xl font-bold text-white shadow-lg">
          {customer.avatar_url
            ? <img src={customer.avatar_url} alt="avatar" className="rounded-full w-16 h-16 object-cover" />
            : getInitials(customer.full_name || customer.name || customer.first_name || "U")}
          {inMarket &&
            <Motion.span {...ANIM_PROPS}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 shadow font-bold animate-pulse"
            >IN MARKET</Motion.span>}
          {isOnline &&
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow"></span>}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold flex flex-wrap items-center gap-2">
            {customer.full_name || customer.name || (customer.first_name + ' ' + customer.last_name)}
            <span className={clsx(
              "ml-2 px-2 py-0.5 text-xs rounded-xl font-semibold tracking-wide",
              inMarket ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-yellow-200" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            )}>
              {inMarket ? "🔥 Hot Prospect" : "Active"}
            </span>
            {customer.verified && <BadgeCheck className="w-5 h-5 text-green-400 ml-2" title="Verified" />}
          </h2>
          <div className="flex gap-2 items-center mt-1 flex-wrap">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="font-mono font-bold">{hotness}/10</span>
              <div className="w-24 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ml-2">
                <div
                  className={clsx(
                    hotness >= 8 ? "bg-gradient-to-r from-orange-500 via-red-600 to-yellow-400"
                      : hotness >= 5 ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
                        : "bg-gradient-to-r from-blue-400 to-yellow-400", "h-2 transition-all"
                  )}
                  style={{ width: `${hotness * 10}%` }}
                />
              </div>
            </div>
            {customer.last_contact && (
              <span className="ml-4 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-4 h-4 inline" /> Last Contact: {customer.last_contact}
              </span>
            )}
          </div>
        </div>
        <button
          className="ml-auto p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
      </div>
      <div className="flex gap-2 flex-wrap mb-2 items-center">
        {(customer.tags || []).map((tag, i) =>
          <span key={i} className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-xs font-semibold dark:bg-sky-900 dark:text-sky-200">{tag}</span>
        )}
        {customer.stage && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold dark:bg-green-900 dark:text-green-200">{customer.stage}</span>}
        {social.found && socialIcons.map(s =>
          <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" title={s.label}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            {s.icon}
          </a>
        )}
        {isOnline && <span className="text-green-400 flex items-center text-xs font-semibold"><CheckCircle className="w-4 h-4 mr-1" /> Online</span>}
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <a className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900" href={`tel:${customer.phone ?? ''}`} title="Call" onClick={() => logActivity('call', '', 'Phone call')}><Phone /></a>
        <a className="p-2 rounded hover:bg-green-100 dark:hover:bg-green-900" href={`sms:${customer.phone ?? ''}`} title="Text" onClick={() => logActivity('text', '', 'Text message')}><MessageCircle /></a>
        <a className="p-2 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900" href={`mailto:${customer.email ?? ''}`} title="Email" onClick={() => logActivity('email', '', 'Email')}><Mail /></a>
        <button className="ml-2 px-3 py-1 bg-blue-700 text-white rounded font-bold shadow" onClick={() => setShowApptModal(true)}>Book Appt</button>
        <button className="px-3 py-1 bg-orange-600 text-white rounded font-bold shadow" onClick={() => setShowTaskModal(true)}>+ Follow-Up</button>
        {editMode ? (
          <>
            <button className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-1" onClick={handleSave}><Save className="w-4 h-4" />Save</button>
            <button className="px-3 py-1 bg-gray-400 text-white rounded flex items-center gap-1" onClick={handleCancel}><X className="w-4 h-4" />Cancel</button>
          </>
        ) : (
          <button className="px-3 py-1 bg-blue-500 text-white rounded flex items-center gap-1" onClick={() => setEditMode(true)}><Edit className="w-4 h-4" />Edit</button>
        )}
        <button className="ml-2 px-3 py-1 bg-green-700 text-white rounded font-bold shadow" onClick={() => setShowCreditModal(true)}>Credit App</button>
      </div>

      <div className="flex gap-4 mb-4 border-b border-slate-300 dark:border-slate-700 overflow-x-auto">
        {TABS.map(t =>
          <button
            key={t.key}
            className={clsx(
              "px-3 py-2 -mb-px border-b-2 font-semibold whitespace-nowrap",
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
      <div>
        <AnimatePresence mode="wait">
          {tab === 'profile' && (
            <Motion.div key="profile" {...ANIM_PROPS}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileFields.map(({ key, label, icon }) => {
                  const IconComp = icon;
                  return (
                    <div key={key} className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 py-2">
                      <IconComp className="w-5 h-5 text-blue-500" />
                      <span className="font-medium w-28">{label}</span>
                      {editMode ? (
                        <input
                          className="bg-slate-100 dark:bg-slate-800 border rounded px-2 py-1 flex-1"
                          type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                          value={edited?.[key] ?? ''}
                          onChange={e => setEdited({ ...edited, [key]: e.target.value })}
                          placeholder={label}
                        />
                      ) : (
                        <span className="flex-1">{customer[key] ?? <span className="text-slate-400 italic">Not set</span>}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Motion.div>
          )}

          {tab === 'ledger' && (
            <Motion.div key="ledger" {...ANIM_PROPS}>
              <h3 className="font-bold mb-2">Activity Timeline</h3>
              <div className="max-h-64 overflow-y-auto bg-slate-50 dark:bg-slate-800 rounded p-2 border">
                <AnimatePresence>
                  {ledger.length ? ledger.map((entry, idx) =>
                    <Motion.div key={entry.id} {...ANIM_PROPS} transition={{ delay: idx * 0.04 }}>
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{formatDateTime(entry.created_at)}</span>
                        <div>{entry.note}</div>
                        <div className="text-xs text-slate-400">{entry.activity_type}</div>
                      </div>
                    </Motion.div>
                  ) : <div className="text-slate-400">No activity yet.</div>}
                </AnimatePresence>
              </div>
              <div className="flex items-end gap-2 mt-3">
                <textarea className="flex-1 border rounded p-2 bg-white dark:bg-slate-900" rows={2} placeholder="Add note..." value={note} onChange={e => setNote(e.target.value)} />
                <button className="px-3 py-1 bg-blue-700 text-white rounded" onClick={handleAddNote}>Add</button>
              </div>
            </Motion.div>
          )}

          {tab === 'deals' && (
            <Motion.div key="deals" {...ANIM_PROPS}>
              <div className="text-slate-500 text-center py-8 text-lg">
                <Star className="mx-auto mb-2 w-6 h-6" />
                Deals module coming soon!
              </div>
            </Motion.div>
          )}

          {tab === 'ai' && (
            <Motion.div key="ai" {...ANIM_PROPS}>
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
            </Motion.div>
          )}

          {tab === 'tasks' && (
            <Motion.div key="tasks" {...ANIM_PROPS}>
              <div className="flex items-center mb-3">
                <h3 className="font-bold flex-1">Tasks & Reminders</h3>
                <button className="bg-blue-700 text-white px-2 py-1 rounded flex items-center gap-1" onClick={() => setShowTaskModal(true)}><Plus className="w-4 h-4" /> New Task</button>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {tasks.length ? tasks.map(t => (
                  <div key={t.id} className="py-2 flex items-center gap-2">
                    <input type="checkbox" checked={t.completed} readOnly className="accent-blue-600" />
                    <div className="flex-1">
                      <div className={clsx("font-semibold", t.completed && "line-through opacity-60")}>{t.title}</div>
                      <div className="text-xs text-slate-500">{formatDateTime(t.due_date)}</div>
                    </div>
                  </div>
                )) : <div className="text-slate-400 py-8 text-center">No tasks yet.</div>}
              </div>
            </Motion.div>
          )}

          {tab === 'appointments' && (
            <Motion.div key="appointments" {...ANIM_PROPS}>
              <div className="flex items-center mb-3">
                <h3 className="font-bold flex-1">Appointments</h3>
                <button className="bg-blue-700 text-white px-2 py-1 rounded flex items-center gap-1" onClick={() => setShowApptModal(true)}><Plus className="w-4 h-4" /> Book Appt</button>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {appointments.length ? appointments.map(a => (
                  <div key={a.id} className="py-2">
                    <div className="font-semibold">{a.appointment_type}</div>
                    <div className="text-xs text-slate-500">{formatDateTime(a.start_time)}</div>
                  </div>
                )) : <div className="text-slate-400 py-8 text-center">No appointments yet.</div>}
              </div>
            </Motion.div>
          )}

          {tab === 'docs' && (
            <Motion.div key="docs" {...ANIM_PROPS}>
              <div className="mb-3 flex items-center gap-3">
                <File className="w-5 h-5" />
                <h3 className="font-bold">Documents & Uploads</h3>
                <label className="ml-auto cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <input type="file" className="hidden" disabled={uploading} onChange={handleSmartUpload} />
                  <span className="text-sm">{uploading ? "Uploading..." : "Smart Upload"}</span>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {files.map(file =>
                  <a href={file.url} key={file.id} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 border rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Cloud className="w-4 h-4" />
                    <span className="truncate">{file.name}</span>
                  </a>
                )}
                {!files.length && <div className="col-span-2 text-slate-400">No documents uploaded yet.</div>}
              </div>
            </Motion.div>
          )}

          {tab === 'map' && (
            <Motion.div key="map" {...ANIM_PROPS}>
              <div className="flex items-center gap-2 mb-3">
                <Map className="w-5 h-5" />
                <h3 className="font-bold">Customer Location</h3>
              </div>
              {customer.address ? (
                <iframe
                  className="w-full h-60 rounded border"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(customer.address)}&output=embed`}
                  title="Customer Location Map"
                />
              ) : <div className="text-slate-400">No address provided.</div>}
            </Motion.div>
          )}

          {/* Deal Desk */}
          {tab === 'dealdesk' && (
            <Motion.div key="dealdesk" {...ANIM_PROPS}>
              <div className="flex items-center mb-3 gap-2">
                <Star className="w-5 h-5" />
                <h3 className="font-bold flex-1">Deal Desk</h3>
                <button className="bg-green-700 text-white px-2 py-1 rounded flex items-center gap-1" onClick={() => alert("Add Deal Offer flow here!")}>+ New Offer</button>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {dealOffers.length ? dealOffers.map(offer => (
                  <div key={offer.id} className="py-2 flex items-center gap-2">
                    <span className={clsx(
                      "px-2 py-0.5 rounded-full font-bold",
                      offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-700'
                    )}>{offer.status}</span>
                    <span className="flex-1">{offer.vehicle} — ${offer.amount}</span>
                    {offer.status === "pending" && (
                      <>
                        <button className="bg-blue-700 text-white rounded px-2 py-1 text-xs" onClick={() => alert("Accept Offer")}>Accept</button>
                        <button className="bg-red-700 text-white rounded px-2 py-1 text-xs" onClick={() => alert("Reject Offer")}>Reject</button>
                      </>
                    )}
                  </div>
                )) : <div className="text-slate-400 py-8 text-center">No offers yet.</div>}
              </div>
            </Motion.div>
          )}

          {/* Finance/Credit App */}
          {tab === 'finance' && (
            <Motion.div key="finance" {...ANIM_PROPS}>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5" />
                <h3 className="font-bold">Credit & F&I Docs</h3>
                <button className="bg-blue-700 text-white px-2 py-1 rounded flex items-center gap-1" onClick={() => setShowCreditModal(true)}><CreditCard className="w-4 h-4" /> Start Credit App</button>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded text-blue-900 dark:text-blue-200">
                Credit Application status: <span className="font-semibold">{creditStatus || "Not started"}</span>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-8">
        <Link to="/customers" className="text-blue-600 dark:text-blue-300 hover:underline">&larr; Back to Customers</Link>
      </div>
      {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} />}
      {showApptModal && <AppointmentModal onClose={() => setShowApptModal(false)} />}
      {showCreditModal && <CreditAppModal onClose={() => setShowCreditModal(false)} />}
    </div>
  )
}
