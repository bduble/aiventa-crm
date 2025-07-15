import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Phone, MessageCircle, Mail, Edit, Save, X, Video } from 'lucide-react'
import FieldRow from '../components/FieldRow'
import LedgerEntry from '../components/LedgerEntry'
import Avatar from 'react-avatar'
import Peer from 'peerjs'

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'ledger', label: 'Ledger' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'tradein', label: 'Trade-In' },
  { key: 'video', label: 'Video Chat' },
]

export default function CustomerCard() {
  const { id } = useParams()
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

  const [customer, setCustomer] = useState(null)
  const [edited, setEdited] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ledger, setLedger] = useState([])
  const [note, setNote] = useState('')
  const [aiInfo, setAiInfo] = useState({ summary: '', next_steps: [], sms_template: '', email_template: '', hotness: null })
  const [activeTab, setActiveTab] = useState('profile')
  const [showVideo, setShowVideo] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [peer, setPeer] = useState(null)
  const [call, setCall] = useState(null)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)

  // Load customer data
  const fetchCustomer = async () => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`)
      if (!res.ok) throw new Error('Failed to load customer')
      const data = await res.json()
      setCustomer(data)
      setEdited(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLedger = async () => {
    try {
      const res = await fetch(`${API_BASE}/activities?customer_id=${id}`)
      if (res.ok) {
        const data = await res.json()
        setLedger(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchAiInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}/ai-summary`)
      if (res.ok) {
        const data = await res.json()
        setAiInfo({
          summary: data.summary || '',
          next_steps: data.next_steps || [],
          sms_template: data.sms_template || '',
          email_template: data.email_template || '',
          hotness: typeof data.hotness === 'number' ? data.hotness : null
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCustomer()
    fetchLedger()
    fetchAiInfo()
  }, [id])

  // ---- Video chat logic (PeerJS for demo purposes) ----
  useEffect(() => {
    if (!showVideo) {
      if (peer) peer.destroy()
      setPeer(null)
      setCall(null)
      setLocalStream(null)
      setRemoteStream(null)
      setVideoReady(false)
      return
    }

    // Dynamically load PeerJS if needed
    const _peer = new Peer({ debug: 2 })
    setPeer(_peer)

    // Get local media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream)
        setVideoReady(true)
        _peer.on('call', (incomingCall) => {
          incomingCall.answer(stream)
          incomingCall.on('stream', remote => setRemoteStream(remote))
          setCall(incomingCall)
        })
      })

    // Clean up
    return () => {
      _peer.destroy()
      setPeer(null)
      setCall(null)
      setLocalStream(null)
      setRemoteStream(null)
      setVideoReady(false)
    }
  }, [showVideo])

  const startCall = () => {
    const remoteId = prompt("Enter remote peer ID to call (for demo, open this card in another browser window, copy their ID below)")
    if (!peer || !remoteId || !localStream) return
    const outgoing = peer.call(remoteId, localStream)
    outgoing.on('stream', remote => setRemoteStream(remote))
    setCall(outgoing)
  }

  // --- Save logic
  const handleSave = async () => {
    try {
      const payload = {}
      Object.keys(edited).forEach(k => {
        if (edited[k] !== customer[k]) payload[k] = edited[k]
      })
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
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancel = () => {
    setEdited(customer)
    setEditMode(false)
  }

  const handleAddNote = async () => {
    if (!note.trim()) return
    try {
      const res = await fetch(`${API_BASE}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity_type: 'note', note, customer_id: id })
      })
      if (res.ok) {
        setNote('')
        fetchLedger()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Dynamic field rendering (all customer table fields!)
  const excluded = ['id', 'created_at', 'updated_at']
  const allFields = customer ? Object.keys(customer).filter(
    k => !excluded.includes(k)
  ) : []

  // Group by type for best layout
  const contactFields = ['full_name', 'first_name', 'last_name', 'email', 'phone']
  const vehicleFields = ['vehicle', 'vehicle_interest', 'trade', 'trade_vehicle']
  const salesFields = ['demo', 'worksheet', 'customer_offer', 'sold']
  const otherFields = allFields.filter(
    k => ![...contactFields, ...vehicleFields, ...salesFields].includes(k)
  )

  // UI Elements
  if (loading) return <div className="dark:text-gray-200 text-gray-800">Loading...</div>
  if (!customer) return <div className="dark:text-gray-300 text-gray-700">Customer not found</div>

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      <Link to="/customers" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
        &larr; Back to Customers
      </Link>
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4 relative">
        {/* --- Avatar and Hotness --- */}
        <div className="flex items-center gap-4">
          <Avatar name={customer.full_name || customer.name || 'Customer'} size="64" round={true} />
          <div className="flex-1">
            <div className="text-xl font-bold dark:text-white">{customer.full_name || customer.name}</div>
            {aiInfo.hotness !== null && (
              <div className="flex items-center gap-2 mt-1">
                <span className="font-medium text-gray-600 dark:text-gray-300">Buy Likelihood:</span>
                <div className={`inline-block px-2 py-1 rounded text-xs font-bold ${aiInfo.hotness >= 8
                  ? "bg-green-500 text-white"
                  : aiInfo.hotness >= 5
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-400 text-white"
                }`}>
                  {aiInfo.hotness}/10
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <a className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700" href={`tel:${customer.phone ?? ''}`} title="Call">
              <Phone className="h-5 w-5" />
            </a>
            <a className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700" href={`sms:${customer.phone ?? ''}`} title="Text">
              <MessageCircle className="h-5 w-5" />
            </a>
            <a className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700" href={`mailto:${customer.email ?? ''}`} title="Email">
              <Mail className="h-5 w-5" />
            </a>
            <button
              className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
              onClick={() => setShowVideo(true)}
              title="Start Video Chat"
            >
              <Video className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* ---- Tags (example, can make dynamic) ---- */}
        <div className="flex flex-wrap gap-2 mt-2">
          {customer.tags && Array.isArray(customer.tags)
            ? customer.tags.map(tag => (
              <span key={tag} className="bg-blue-100 dark:bg-blue-900 dark:text-blue-200 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{tag}</span>
            ))
            : <span className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded text-xs">New Customer</span>
          }
        </div>

        {/* ---- Tabs ---- */}
        <div className="mt-6 flex gap-2 border-b dark:border-slate-700">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-3 py-1 -mb-px rounded-t text-sm font-medium focus:outline-none
                ${activeTab === tab.key
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-900 text-gray-700 dark:text-gray-300'
                }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ---- Tab Panels ---- */}
        <div className="mt-4">
          {/* ---- Profile Tab ---- */}
          {activeTab === 'profile' && (
            <>
              <div className="flex justify-end mb-3">
                {editMode ? (
                  <>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1 mr-2" onClick={handleSave}>
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded flex items-center gap-1" onClick={handleCancel}>
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </>
                ) : (
                  <button className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1" onClick={() => setEditMode(true)}>
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                )}
              </div>
              {/* AI Insights */}
              {aiInfo.summary && (
                <div className="mb-4 bg-gray-50 dark:bg-slate-900 p-3 rounded">
                  <h3 className="font-semibold mb-1 dark:text-gray-100">AI Insights</h3>
                  <p className="text-sm whitespace-pre-wrap dark:text-gray-300">{aiInfo.summary}</p>
                  {aiInfo.next_steps.length > 0 && (
                    <ul className="list-disc list-inside text-sm mt-2 dark:text-gray-300">
                      {aiInfo.next_steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  )}
                  {(aiInfo.sms_template || aiInfo.email_template) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {aiInfo.sms_template && customer.phone && (
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                          onClick={() =>
                            (window.location.href = `sms:${customer.phone}?&body=${encodeURIComponent(aiInfo.sms_template)}`)
                          }
                        >
                          Send SMS Template
                        </button>
                      )}
                      {aiInfo.email_template && customer.email && (
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
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

              {/* Grouped fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...contactFields, ...vehicleFields, ...salesFields, ...otherFields].map(key => (
                  customer[key] !== undefined && (
                    <FieldRow
                      key={key}
                      label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      value={edited[key]}
                      type={typeof edited[key] === 'boolean' ? 'checkbox' : 'text'}
                      editMode={editMode}
                      onChange={v => setEdited({ ...edited, [key]: v })}
                    />
                  )
                ))}
              </div>
            </>
          )}

          {/* ---- Ledger Tab ---- */}
          {activeTab === 'ledger' && (
            <div>
              <h3 className="font-semibold mb-2 dark:text-gray-100">Customer Ledger</h3>
              <div className="max-h-60 overflow-y-auto border rounded p-2 mb-2 bg-gray-50 dark:bg-slate-900">
                {ledger.map(entry => (
                  <LedgerEntry key={entry.id} entry={entry} />
                ))}
                {!ledger.length && <div className="text-sm text-gray-500 dark:text-gray-400">No activity yet.</div>}
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  className="flex-1 border rounded p-2 dark:bg-slate-800 dark:text-gray-200"
                  rows="2"
                  placeholder="Add note..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={handleAddNote}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* ---- Appointments Tab ---- */}
          {activeTab === 'appointments' && (
            <div className="dark:text-gray-200">
              <h3 className="font-semibold mb-2">Appointment Booking</h3>
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded text-sm">[Appointment booking widget coming soon!]</div>
            </div>
          )}

          {/* ---- Trade-In Tab ---- */}
          {activeTab === 'tradein' && (
            <div className="dark:text-gray-200">
              <h3 className="font-semibold mb-2">Trade-In Value</h3>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded text-sm">[Trade-in estimator widget coming soon!]</div>
            </div>
          )}

          {/* ---- Video Chat Tab ---- */}
          {activeTab === 'video' && (
            <div>
              <h3 className="font-semibold mb-2 dark:text-gray-100">Live Video Chat</h3>
              {showVideo ? (
                <div className="relative border rounded-lg bg-black p-2 flex flex-col items-center gap-2">
                  <button
                    onClick={() => setShowVideo(false)}
                    className="absolute top-1 right-1 bg-gray-700 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex gap-4 mb-2">
                    <div>
                      <div className="text-xs text-gray-300">Your video</div>
                      <video
                        autoPlay
                        muted
                        playsInline
                        ref={el => { if (el && localStream) el.srcObject = localStream }}
                        className="rounded shadow w-40 h-32 bg-gray-800"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-gray-300">Remote</div>
                      <video
                        autoPlay
                        playsInline
                        ref={el => { if (el && remoteStream) el.srcObject = remoteStream }}
                        className="rounded shadow w-40 h-32 bg-gray-800"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    Your Peer ID: <span className="font-mono">{peer?.id}</span>
                  </div>
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded"
                    onClick={startCall}
                    disabled={!videoReady || !peer}
                  >
                    Start Outbound Call
                  </button>
                </div>
              ) : (
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1"
                  onClick={() => setShowVideo(true)}
                >
                  <Video className="w-4 h-4" /> Start Video Chat
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
