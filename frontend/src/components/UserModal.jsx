import { useState, useEffect } from 'react';

export default function UserModal({ isOpen, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Sales',
    permissions: []
  })

  useEffect(() => {
      setForm({
        name: initialData?.name || '',
        email: initialData?.email || '',
        role: initialData?.role || 'Sales',
        permissions: initialData?.permissions || []
      })
  }, [initialData])

  if (!isOpen) return null

  const handleChange = e => {
    const { name, value, options } = e.target
    if (name === 'permissions') {
      const values = Array.from(options).filter(o => o.selected).map(o => o.value)
      setForm(f => ({ ...f, permissions: values }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded w-96 space-y-4">
        <h3 className="text-lg font-semibold">
          {initialData ? 'Edit User' : 'Add User'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Name</label>
            <input
              name="name"
              type="text"
              className="w-full border rounded px-3 py-2"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              name="email"
              type="email"
              className="w-full border rounded px-3 py-2"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Role</label>
            <select
              name="role"
              className="w-full border rounded px-3 py-2"
              value={form.role}
              onChange={handleChange}
            >
              <option value="">Select role</option>
              {/* values must match backend enum exactly */}
              <option value="Admin">Admin</option>
              <option value="Sales">Sales</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Permissions</label>
            <select
              multiple
              name="permissions"
              className="w-full border rounded px-3 py-2 h-24"
              value={form.permissions}
              onChange={handleChange}
            >
              {['read', 'write', 'delete'].map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">
              Cancel
            </button>
            <button type="submit" className="px-3 py-2 bg-electricblue text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
