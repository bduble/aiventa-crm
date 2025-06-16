// frontend/src/routes/Users.jsx
import React, { useEffect, useState } from 'react'

export default function Users() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE_URL + '/users')
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error)
  }, [])

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  )
}
