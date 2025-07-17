// frontend/src/routes/Users.jsx
import { useEffect, useState } from 'react';

export default function Users() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  // Use configured API base URL or default to the proxy path
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

  useEffect(() => {
    fetch(`${API_BASE}/users`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load users')
        return res.json()
      })
      .then(setUsers)
      .catch(err => {
        console.error(err)
        setError('Unable to fetch users')
      })
  }, [])

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
