import { useState } from "react";

// Get the API base URL from your environment variable
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function LoginPage() {
  const [form, setForm] = useState({ identity: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Login failed");
      }
      const { token } = await res.json();
      if (form.remember) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setForgotSuccess("");
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      if (!res.ok) throw new Error("Email not found or could not send.");
      setForgotSuccess("Password reset code sent! Check your email.");
    } catch (err) {
      setError(err.message || "Could not send reset email.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">aiVenta Login</h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email or Username</label>
            <input
              className="w-full mt-1 border border-gray-300 rounded-xl p-2"
              type="text"
              name="identity"
              value={form.identity}
              onChange={handleChange}
              required
              autoFocus
              autoComplete="username"
              placeholder="Email or Username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              className="w-full mt-1 border border-gray-300 rounded-xl p-2"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="Password"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="rounded"
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline"
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </button>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h3 className="font-bold text-lg mb-3">Reset your password</h3>
            <form onSubmit={handleForgot} className="space-y-4">
              <input
                type="email"
                className="w-full border border-gray-300 rounded-xl p-2"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
              />
              {forgotSuccess && <div className="text-green-600 text-sm">{forgotSuccess}</div>}
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Send Reset Code
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
                  onClick={() => { setShowForgot(false); setForgotEmail(""); setError(""); setForgotSuccess(""); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
