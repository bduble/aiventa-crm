import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  // Handle input change
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  // Login submit
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Invalid credentials");
      // Store token, handle session (cookie/localStorage based on remember)
      const { token } = await res.json();
      if (form.remember) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }
      // Redirect to dashboard/home
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  // Forgot password handler
  async function handleForgot(e) {
    e.preventDefault();
    setForgotSuccess("");
    setError("");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      if (!res.ok) throw new Error("Email not found");
      setForgotSuccess("Password reset email sent! Check your inbox.");
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
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              className="w-full mt-1 border border-gray-300 rounded-xl p-2"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
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
                  Send Reset Link
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
