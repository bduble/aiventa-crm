import { useEffect, useState } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  // Fetch users on mount
  useEffect(() => {
    fetch(`${API_BASE}/users`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load users');
        return res.json();
      })
      .then(setUsers)
      .catch(err => {
        console.error(err);
        setError('Unable to fetch users');
      });
  }, [API_BASE]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      name: `${firstName} ${lastName}`.trim(),
      email: email.trim()
    };
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const { detail } = await res.json();
        throw new Error(detail || 'Failed to save user');
      }
      const newUser = await res.json();
      setUsers(users => [...users, newUser]);
      setFirstName('');
      setLastName('');
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2>Users</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input
          placeholder="First Name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
        />
        <input
          placeholder="Last Name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Add User'}
        </button>
      </form>

      <ul>
        {users.map(u => (
          <li key={u.id}>{u.name} ({u.email})</li>
        ))}
      </ul>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
