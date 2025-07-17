import { useEffect, useState } from 'react';
import toast from 'react-hot-toast'
import UserModal from '../components/UserModal'
import Pagination from '../components/Pagination'

export default function UsersPage() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const filterData = (list, term) =>
    list.filter(u => {
      const t = term.toLowerCase()
      return (
        u.name.toLowerCase().includes(t) ||
        u.email.toLowerCase().includes(t) ||
        (u.role || '').toLowerCase().includes(t)
      )
    })

  const fetchUsers = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/users`)
      if (!res.ok) throw new Error('Failed to load users')
      const data = await res.json()
      setUsers(data)
      setFiltered(filterData(data, search))
    } catch (err) {
      console.error(err)
      setError('Unable to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  useEffect(() => {
    setFiltered(filterData(users, search))
    setCurrentPage(1)
  }, [search, users])

  const handleToggle = async user => {
    const updated = { ...user, active: !user.active }
    setUsers(prev => prev.map(u => (u.id === user.id ? updated : u)))
    setFiltered(prev => prev.map(u => (u.id === user.id ? updated : u)))
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: updated.active })
      })
      if (!res.ok) throw new Error('Failed to update user')
      toast.success('User updated')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update user')
      setUsers(prev => prev.map(u => (u.id === user.id ? user : u)))
      setFiltered(prev => prev.map(u => (u.id === user.id ? user : u)))
    }
  }

  const openAdd = () => { setEditing(null); setModalOpen(true) }
  const openEdit = user => { setEditing(user); setModalOpen(true) }

  const handleSubmit = async data => {
    try {
      const isEdit = !!editing
      const url = `${API_BASE}/users${isEdit ? '/' + editing.id : ''}`
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to save user')
      toast.success(isEdit ? 'User updated' : 'User added')
      setModalOpen(false)
      setEditing(null)
      fetchUsers()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Error saving user')
    }
  }

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Users</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search users..."
          className="border rounded px-3 py-2 w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={openAdd} className="px-3 py-2 bg-electricblue text-white rounded">
          Add User
        </button>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-slategray text-white">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(u => (
                <tr key={u.id} className="odd:bg-gray-50 hover:bg-gray-100">
                  <td className="p-2 whitespace-nowrap">{u.name}</td>
                  <td className="p-2 whitespace-nowrap">{u.email}</td>
                  <td className="p-2 whitespace-nowrap">{u.role}</td>
                  <td className="p-2 whitespace-nowrap">
                    <button
                      onClick={() => handleToggle(u)}
                      className={`px-2 py-1 rounded ${u.active ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
                    >
                      {u.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-2 whitespace-nowrap text-right">
                    <button onClick={() => openEdit(u)} className="px-2 py-1 bg-electricblue text-white rounded">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <UserModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
        initialData={editing}
      />
    </div>
  )
}
