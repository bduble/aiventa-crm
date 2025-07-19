import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Sales");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [API_BASE]);

  const fetchUsers = () => {
    fetch(`${API_BASE}/users/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load users");
        return res.json();
      })
      .then(setUsers)
      .catch((err) => {
        console.error(err);
        setError("Unable to fetch users");
      });
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    const nameParts = user.name.split(" ");
    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(" ") || "");
    setEmail(user.email);
    setRole(user.role || "Sales");
    setError("");
  };

  const resetForm = () => {
    setEditId(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("Sales");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: `${firstName} ${lastName}`.trim(),
      email: email.trim(),
      role,
    };
    try {
      let res, updatedUser;
      if (editId) {
        res = await fetch(`${API_BASE}/users/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const { detail } = await res.json();
          throw new Error(detail || "Failed to update user");
        }
        updatedUser = await res.json();
        setUsers((users) =>
          users.map((u) => (u.id === editId ? updatedUser : u))
        );
      } else {
        res = await fetch(`${API_BASE}/users/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const { detail } = await res.json();
          throw new Error(detail || "Failed to save user");
        }
        const newUser = await res.json();
        setUsers((users) => [...users, newUser]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((users) => users.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card className="mb-8">
        <CardContent className="py-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editId ? "Edit User" : "Add User"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <select
              className="border rounded p-2 w-full"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="Sales">Sales</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="w-32">
                {saving
                  ? editId
                    ? "Updating..."
                    : "Saving..."
                  : editId
                  ? "Update User"
                  : "Add User"}
              </Button>
              {editId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </Button>
              )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-8">
          <h3 className="text-xl font-semibold mb-3">Users</h3>
          <ul className="divide-y">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between py-3 group"
              >
                <span>
                  <span className="font-medium">{u.name}</span>
                  <span className="text-gray-400 ml-2 text-sm">
                    ({u.email} • {u.role})
                  </span>
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(u)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(u.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
            {users.length === 0 && (
              <li className="text-gray-400 py-4">No users found.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
