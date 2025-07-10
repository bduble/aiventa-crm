import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, MessageCircle, Mail } from 'lucide-react'

export default function CustomersPage() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (debounced) params.append('q', debounced)
        const res = await fetch(`${API_BASE}/customers/?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to load customers')
        const data = await res.json()
        setCustomers(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setCustomers([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchCustomers()
  }, [debounced, API_BASE])

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Customers</h2>

      <input
        type="text"
        placeholder="Search by name, email or phone"
        className="border rounded px-3 py-2 w-64"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-slate-700 text-white">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="odd:bg-gray-50 hover:bg-gray-100">
                  <td className="p-2 whitespace-nowrap">
                    <Link to={`/customers/${c.id}`} className="text-blue-600 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="p-2 whitespace-nowrap">{c.email}</td>
                  <td className="p-2 whitespace-nowrap">{c.phone}</td>
                  <td className="p-2 space-x-1 whitespace-nowrap">
                    <button
                      aria-label={`Call ${c.name}`}
                      className="rounded-full p-2 hover:bg-gray-100 transition"
                      onClick={() => { window.location.href = `tel:${c.phone ?? ''}` }}
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={`Text ${c.name}`}
                      className="rounded-full p-2 hover:bg-gray-100 transition"
                      onClick={() => { window.location.href = `sms:${c.phone ?? ''}` }}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={`Email ${c.name}`}
                      className="rounded-full p-2 hover:bg-gray-100 transition"
                      onClick={() => { window.location.href = `mailto:${c.email ?? ''}` }}
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
