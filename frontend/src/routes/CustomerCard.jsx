import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Phone, MessageCircle, Mail, Edit, Save, X } from 'lucide-react'
import FieldRow from '../components/FieldRow'
import LedgerEntry from '../components/LedgerEntry'

export default function CustomerCard() {
  const { id } = useParams()
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

  const [customer, setCustomer] = useState(null)
  const [edited, setEdited] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ledger, setLedger] = useState([])
  const [note, setNote] = useState('')

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

  useEffect(() => {
    fetchCustomer()
    fetchLedger()
  }, [id])

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

  if (loading) return <div>Loading...</div>
  if (!customer) return <div>Customer not found</div>

  const GROUPS = {
    contact: {
      label: 'Contact Info',
      fields: ['name', 'first_name', 'last_name', 'email', 'phone']
    },
    vehicle: {
      label: 'Vehicle Info',
      fields: ['vehicle', 'vehicle_interest', 'trade', 'trade_vehicle']
    },
    sales: {
      label: 'Sales Info',
      fields: ['demo', 'worksheet', 'customer_offer', 'sold']
    }
  }

  const otherFields = Object.keys(customer).filter(
    k => !Object.values(GROUPS).some(g => g.fields.includes(k)) && k !== 'id'
  )
  if (otherFields.length) {
    GROUPS.other = { label: 'Other Info', fields: otherFields }
  }

  const renderField = (key) => {
    const value = edited[key]
    const type = typeof value === 'boolean' ? 'checkbox' : 'text'
    return (
      <FieldRow
        key={key}
        label={key.replace(/_/g, ' ')}
        value={value}
        type={type}
        editMode={editMode}
        onChange={v => setEdited({ ...edited, [key]: v })}
      />
    )
  }

  return (
    <div className="p-4 space-y-4">
      <Link to="/customers" className="text-blue-600 hover:underline">
        &larr; Back to Customers
      </Link>
      <div className="bg-white shadow rounded p-4 relative">
        <div className="sticky top-0 bg-white pb-2 flex gap-2 z-10">
          {editMode ? (
            <>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1"
                onClick={handleSave}
              >
                <Save className="w-4 h-4" /> Save
              </button>
              <button
                className="px-3 py-1 bg-gray-300 rounded flex items-center gap-1"
                onClick={handleCancel}
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </>
          ) : (
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1"
              onClick={() => setEditMode(true)}
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <a className="p-2 rounded hover:bg-gray-100" href={`tel:${customer.phone ?? ''}`}> <Phone className="h-4 w-4" /> </a>
            <a className="p-2 rounded hover:bg-gray-100" href={`sms:${customer.phone ?? ''}`}> <MessageCircle className="h-4 w-4" /> </a>
            <a className="p-2 rounded hover:bg-gray-100" href={`mailto:${customer.email ?? ''}`}> <Mail className="h-4 w-4" /> </a>
          </div>
        </div>

        {Object.values(GROUPS).map(group => (
          <div key={group.label} className="mt-4">
            <h3 className="font-semibold mb-2">{group.label}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.fields.map(renderField)}
            </div>
          </div>
        ))}

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Customer Ledger</h3>
          <div className="max-h-60 overflow-y-auto border rounded p-2 mb-2 bg-gray-50">
            {ledger.map(entry => (
              <LedgerEntry key={entry.id} entry={entry} />
            ))}
            {!ledger.length && <div className="text-sm text-gray-500">No activity yet.</div>}
          </div>
          <div className="flex items-end gap-2">
            <textarea
              className="flex-1 border rounded p-2"
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
      </div>
    </div>
  )
}
