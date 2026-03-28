import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, register } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { Spinner, Alert } from "../ui";

function AuthForm({ mode }) {
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const isLogin = mode === "login";

  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const fn = isLogin ? login : register;
      const payload = isLogin ? { email: form.email, password: form.password } : form;
      const { data } = await fn(payload);
      saveAuth(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-primary)" }}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #ff7410, transparent)" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #ff7410, transparent)" }} />
      </div>

      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center shadow-glow-brand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>StudyMind</span>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {isLogin ? "Sign in to your StudyMind workspace" : "Start studying smarter with AI"}
          </p>

          {error && <div className="mb-4"><Alert message={error} onDismiss={() => setError(null)} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="label">Full Name</label>
                <input className="input" type="text" placeholder="Alex Johnson" value={form.name}
                  onChange={set("name")} required autoFocus />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email}
                onChange={set("email")} required autoFocus={isLogin} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder={isLogin ? "••••••••" : "Min. 6 characters"}
                value={form.password} onChange={set("password")} required />
            </div>

            <button type="submit" disabled={loading} className="btn-brand w-full py-3 text-base mt-2">
              {loading ? <><Spinner size="sm" /> {isLogin ? "Signing in…" : "Creating account…"}</> :
                isLogin ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link to={isLogin ? "/signup" : "/login"}
              className="font-semibold text-brand-500 hover:text-brand-600 transition-colors">
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
          Your notes are private and secured with JWT authentication
        </p>
      </div>
    </div>
  );
}

export function LoginPage()  { return <AuthForm mode="login"  />; }
export function SignupPage() { return <AuthForm mode="signup" />; }
