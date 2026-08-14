import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Unable to sign in");
        return;
      }
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      const destination = location.state?.from || "/dashboard";
      navigate(destination, { replace: true });
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 px-5 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/10">
        <h1 className="mb-2 text-center text-3xl font-bold text-slate-900">Welcome Back</h1>
        <p className="mb-6 text-center text-slate-500">Sign in to your placement account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10" type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} autoComplete="email" required />
          <input className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10" type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} autoComplete="current-password" required />
          <button className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-blue-600">{message}</p>}
        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account? <Link className="font-semibold text-blue-600 hover:underline" to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
