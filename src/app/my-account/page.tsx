"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuth, type RegisterData } from "@/context/AuthContext";

// ─── Types ─────────────────────────────────────────────────────────────────

type Tab = "dashboard" | "orders" | "addresses" | "account" | "logout";

interface AddressFields {
  first_name: string; last_name: string; company: string;
  address_1: string;  address_2: string; city: string;
  state: string; postcode: string; country: string;
  email: string; phone: string;
}

const EMPTY_ADDR: AddressFields = {
  first_name: "", last_name: "", company: "", address_1: "",
  address_2: "", city: "", state: "", postcode: "", country: "US",
  email: "", phone: "",
};

interface WCOrder {
  id: number; number: string; status: string;
  date_created: string; total: string; currency_symbol: string;
  line_items: { id: number; name: string; quantity: number; total: string }[];
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: "#FEF3C7", color: "#92400E", label: "Pending Payment" },
  processing: { bg: "#DBEAFE", color: "#1E40AF", label: "Processing" },
  "on-hold":  { bg: "#FEF3C7", color: "#92400E", label: "On Hold" },
  completed:  { bg: "#D1FAE5", color: "#065F46", label: "Completed" },
  cancelled:  { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" },
  refunded:   { bg: "#E9D5FF", color: "#5B21B6", label: "Refunded" },
  failed:     { bg: "#FEE2E2", color: "#991B1B", label: "Failed" },
};

// ─── Demo credentials ───────────────────────────────────────────────────────

const DEMO_LOGIN    = { username: "testcustomer", password: "Test@12345" };
const DEMO_REGISTER = {
  username: "demouser2", email: "demouser2@example.com",
  password: "Demo@12345", first_name: "Demo", last_name: "User",
};

// ─── Forgot Password Form ──────────────────────────────────────────────────

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [userLogin,  setUserLogin]  = useState("");
  const [sending,    setSending]    = useState(false);
  const [success,    setSuccess]    = useState("");
  const [err,        setErr]        = useState("");

  const WP_API = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true); setErr(""); setSuccess("");
    try {
      const res = await fetch(`${WP_API}/headless/v1/forgot-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ user_login: userLogin }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) { setErr(data.message || "Something went wrong."); return; }
      setSuccess(data.message || "If that account exists, a reset link has been sent.");
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-2xl p-8" style={{ background: "#fff", border: "1px solid var(--leather-100)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold mb-6" style={{ color: "var(--leather-500)" }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Sign In
        </button>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>Forgot Password?</h2>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
          Enter your username or email and we&rsquo;ll send a reset link.
        </p>

        {success && (
          <div className="mb-4 p-4 rounded-lg text-sm" style={{ background: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0" }}>
            {success}
          </div>
        )}
        {err && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>{err}</div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="contact-label" htmlFor="forgot-login">Username or Email Address</label>
              <input
                id="forgot-login"
                type="text"
                value={userLogin}
                onChange={(e) => setUserLogin(e.target.value)}
                required
                className="contact-input"
                placeholder="your@email.com"
              />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full text-center" style={{ opacity: sending ? 0.7 : 1, cursor: sending ? "not-allowed" : "pointer" }}>
              {sending ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Login Form ────────────────────────────────────────────────────────────

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login, loading, error, clearError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [forgotPw, setForgotPw] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    await login(username, password);
  }

  function fillDemo() {
    clearError();
    setUsername(DEMO_LOGIN.username);
    setPassword(DEMO_LOGIN.password);
  }

  if (forgotPw) {
    return <ForgotPasswordForm onBack={() => setForgotPw(false)} />;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4 p-4 rounded-xl text-sm" style={{ background: "#FEF3C7", border: "1px solid #FCD34D" }}>
        <p className="font-bold mb-1" style={{ color: "#92400E" }}>🧪 Test Account</p>
        <p style={{ color: "#78350F" }}>
          Username: <code className="font-mono font-bold">{DEMO_LOGIN.username}</code><br />
          Password: <code className="font-mono font-bold">{DEMO_LOGIN.password}</code>
        </p>
        <button onClick={fillDemo} className="mt-2 text-xs font-semibold underline" style={{ color: "#92400E" }}>
          Click to fill demo credentials →
        </button>
      </div>

      <div className="rounded-2xl p-8" style={{ background: "#fff", border: "1px solid var(--leather-100)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>Sign In</h2>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>Welcome back! Sign in to your account.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="contact-label" htmlFor="login-username">Username or Email</label>
            <input id="login-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="contact-input" placeholder="your@email.com" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="contact-label mb-0" htmlFor="login-password">Password</label>
              <button type="button" onClick={() => setForgotPw(true)} className="text-xs font-semibold" style={{ color: "var(--leather-500)" }}>
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input id="login-password" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="contact-input pr-10" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--leather-500)" }}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full text-center" style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-center mt-5" style={{ color: "var(--color-text-muted)" }}>
          Don&rsquo;t have an account?{" "}
          <button onClick={onSwitch} className="font-semibold underline" style={{ color: "var(--leather-500)" }}>Register here</button>
        </p>
      </div>
    </div>
  );
}

// ─── Register Form ─────────────────────────────────────────────────────────

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register, loading, error, clearError } = useAuth();
  const [form, setForm]     = useState<RegisterData>({ username: "", email: "", password: "", first_name: "", last_name: "" });
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [localErr, setLocalErr] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function fillDemo() {
    clearError(); setLocalErr("");
    setForm(DEMO_REGISTER);
    setConfirm(DEMO_REGISTER.password);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError(); setLocalErr("");
    if (form.password !== confirm) { setLocalErr("Passwords do not match."); return; }
    if (form.password.length < 8)  { setLocalErr("Password must be at least 8 characters."); return; }
    await register(form);
  }

  const displayErr = localErr || error;

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4 p-4 rounded-xl text-sm" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <p className="font-bold mb-1" style={{ color: "#1E40AF" }}>🧪 Test Registration</p>
        <p style={{ color: "#1E3A8A" }}>
          Username: <code className="font-mono font-bold">{DEMO_REGISTER.username}</code><br />
          Email: <code className="font-mono font-bold">{DEMO_REGISTER.email}</code><br />
          Password: <code className="font-mono font-bold">{DEMO_REGISTER.password}</code>
        </p>
        <button onClick={fillDemo} className="mt-2 text-xs font-semibold underline" style={{ color: "#1E40AF" }}>
          Click to fill test data →
        </button>
      </div>

      <div className="rounded-2xl p-8" style={{ background: "#fff", border: "1px solid var(--leather-100)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>Create Account</h2>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>Join us and track your orders in one place.</p>

        {displayErr && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>{displayErr}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="contact-label" htmlFor="reg-first">First Name</label>
              <input id="reg-first" name="first_name" type="text" value={form.first_name} onChange={handleChange} className="contact-input" placeholder="John" />
            </div>
            <div>
              <label className="contact-label" htmlFor="reg-last">Last Name</label>
              <input id="reg-last" name="last_name" type="text" value={form.last_name} onChange={handleChange} className="contact-input" placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="contact-label" htmlFor="reg-username">Username *</label>
            <input id="reg-username" name="username" type="text" value={form.username} onChange={handleChange} required className="contact-input" placeholder="johndoe" />
          </div>
          <div>
            <label className="contact-label" htmlFor="reg-email">Email Address *</label>
            <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} required className="contact-input" placeholder="john@example.com" />
          </div>
          <div>
            <label className="contact-label" htmlFor="reg-password">Password *</label>
            <div className="relative">
              <input id="reg-password" name="password" type={showPw ? "text" : "password"} value={form.password} onChange={handleChange} required minLength={8} className="contact-input pr-10" placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--leather-500)" }}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="contact-label" htmlFor="reg-confirm">Confirm Password *</label>
            <input id="reg-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="contact-input" placeholder="Repeat password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full text-center" style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center mt-5" style={{ color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <button onClick={onSwitch} className="font-semibold underline" style={{ color: "var(--leather-500)" }}>Sign in here</button>
        </p>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ─────────────────────────────────────────────────────────

function DashboardTab({ onNav }: { onNav: (t: Tab) => void }) {
  const { user } = useAuth();
  return (
    <div>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>Dashboard</h2>
      <div className="p-5 rounded-xl mb-6" style={{ background: "var(--leather-50)", border: "1px solid var(--leather-100)" }}>
        <p style={{ color: "var(--color-text-muted)" }}>
          Hello, <strong style={{ color: "var(--leather-800)" }}>{user?.firstName || user?.displayName}</strong>! 👋
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          From your account dashboard you can view your{" "}
          <button onClick={() => onNav("orders")} className="underline font-medium" style={{ color: "var(--leather-500)" }}>recent orders</button>,
          manage your{" "}
          <button onClick={() => onNav("addresses")} className="underline font-medium" style={{ color: "var(--leather-500)" }}>shipping and billing addresses</button>,
          and{" "}
          <button onClick={() => onNav("account")} className="underline font-medium" style={{ color: "var(--leather-500)" }}>edit your password and account details</button>.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {([
          { tab: "orders",    icon: "📦", label: "My Orders" },
          { tab: "addresses", icon: "📍", label: "Addresses" },
          { tab: "account",   icon: "👤", label: "Account Details" },
          { tab: "logout",    icon: "🚪", label: "Logout" },
        ] as { tab: Tab; icon: string; label: string }[]).map((item) => (
          <button
            key={item.tab}
            onClick={() => onNav(item.tab)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all"
            style={{ background: "#fff", border: "1px solid var(--leather-100)", color: "var(--leather-800)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--leather-300)"; e.currentTarget.style.background = "var(--leather-50)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--leather-100)"; e.currentTarget.style.background = "#fff"; }}
          >
            <span className="text-2xl">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Orders Tab ────────────────────────────────────────────────────────────

function OrdersTab() {
  const { user, token } = useAuth();
  const [orders,   setOrders]   = useState<WCOrder[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/account/orders?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => { setTotal(parseInt(r.headers.get("X-WP-Total") || "0")); return r.json(); })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, token, page]);

  if (loading) return (
    <div className="flex items-center gap-3 py-12 justify-center" style={{ color: "var(--color-text-muted)" }}>
      <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--leather-200)", borderTopColor: "var(--leather-500)" }} />
      Loading orders…
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: "var(--leather-50)", border: "1px solid var(--leather-100)" }}>
          <div className="text-5xl mb-3">📦</div>
          <p className="text-base font-semibold" style={{ color: "var(--leather-800)" }}>No orders yet</p>
          <p className="text-sm mt-1 mb-5" style={{ color: "var(--color-text-muted)" }}>When you place an order, it will appear here.</p>
          <Link href="/shop" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const s      = STATUS_COLORS[order.status] || { bg: "#F3F4F6", color: "#374151", label: order.status };
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--leather-100)" }}>
                {/* Row header */}
                <div
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4"
                  style={{ background: isOpen ? "var(--leather-50)" : "#fff" }}
                >
                  <button
                    className="flex-1 min-w-0 text-left"
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                  >
                    <span className="font-bold text-sm" style={{ color: "var(--leather-900)" }}>Order #{order.number}</span>
                    <span className="mx-2 text-xs" style={{ color: "var(--leather-200)" }}>|</span>
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {new Date(order.date_created).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </button>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  <span className="font-bold text-sm" style={{ color: "var(--leather-600)" }}>{order.currency_symbol}{order.total}</span>
                  {/* View Details link */}
                  <Link
                    href={`/my-account/order/${order.id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                    style={{ background: "var(--leather-100)", color: "var(--leather-700)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="flex-shrink-0"
                    aria-label="Toggle order items"
                  >
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--leather-400)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Expanded items */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-3" style={{ background: "var(--leather-50)", borderTop: "1px solid var(--leather-100)" }}>
                    <div className="space-y-2 mb-3">
                      {order.line_items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span style={{ color: "var(--leather-800)" }}>
                            {item.name} <span style={{ color: "var(--color-text-muted)" }}>× {item.quantity}</span>
                          </span>
                          <span className="font-medium" style={{ color: "var(--leather-700)" }}>
                            {order.currency_symbol}{item.total}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--leather-200)" }}>
                      <span className="font-bold text-sm" style={{ color: "var(--leather-900)" }}>
                        Total: <span style={{ color: "var(--leather-500)" }}>{order.currency_symbol}{order.total}</span>
                      </span>
                      <Link href={`/my-account/order/${order.id}`} className="text-xs font-semibold underline" style={{ color: "var(--leather-500)" }}>
                        Full details →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 10 && (
        <div className="flex items-center justify-between mt-5">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline text-sm px-4 py-2" style={{ opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Page {page} of {Math.ceil(total / 10)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 10)} className="btn-outline text-sm px-4 py-2" style={{ opacity: page >= Math.ceil(total / 10) ? 0.4 : 1 }}>Next →</button>
        </div>
      )}
    </div>
  );
}

// ─── Address Card (defined at module level — avoids re-mount on parent render) ─

interface AddressCardProps {
  type:        "billing" | "shipping";
  addr:        AddressFields;
  isEditing:   boolean;
  saving:      boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave:      () => void;
  onChange:    (field: string, value: string) => void;
}

function AddressCard({ type, addr, isEditing, saving, onStartEdit, onCancelEdit, onSave, onChange }: AddressCardProps) {
  const label   = type === "billing" ? "Billing Address" : "Shipping Address";
  const icon    = type === "billing" ? "💳" : "🚚";
  const hasData = addr.address_1 || addr.city;

  return (
    <div className="rounded-xl p-5" style={{ background: "#fff", border: `1px solid ${isEditing ? "var(--leather-300)" : "var(--leather-100)"}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--leather-900)" }}>
          <span>{icon}</span> {label}
        </h3>
        {!isEditing && (
          <button onClick={onStartEdit} className="text-xs font-semibold underline" style={{ color: "var(--leather-500)" }}>
            {hasData ? "Edit" : "Add"}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {(["first_name", "last_name"] as const).map((f) => (
              <div key={f}>
                <label className="contact-label" htmlFor={`${type}-${f}`}>{f === "first_name" ? "First Name" : "Last Name"}</label>
                <input
                  id={`${type}-${f}`}
                  type="text"
                  value={addr[f]}
                  onChange={(e) => onChange(f, e.target.value)}
                  className="contact-input"
                />
              </div>
            ))}
          </div>

          {type === "billing" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="contact-label" htmlFor="billing-email">Email</label>
                <input
                  id="billing-email"
                  type="email"
                  value={addr.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  className="contact-input"
                />
              </div>
              <div>
                <label className="contact-label" htmlFor="billing-phone">Phone</label>
                <input
                  id="billing-phone"
                  type="tel"
                  value={addr.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  className="contact-input"
                />
              </div>
            </div>
          )}

          {[
            { n: "company",   l: "Company",        t: "text" },
            { n: "address_1", l: "Address Line 1", t: "text" },
            { n: "address_2", l: "Address Line 2", t: "text" },
          ].map((f) => (
            <div key={f.n}>
              <label className="contact-label" htmlFor={`${type}-${f.n}`}>{f.l}</label>
              <input
                id={`${type}-${f.n}`}
                type={f.t}
                value={(addr as unknown as Record<string, string>)[f.n] || ""}
                onChange={(e) => onChange(f.n, e.target.value)}
                className="contact-input"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            {[
              { n: "city",     l: "City" },
              { n: "state",    l: "State / Region" },
              { n: "postcode", l: "Postcode / ZIP" },
              { n: "country",  l: "Country" },
            ].map((f) => (
              <div key={f.n}>
                <label className="contact-label" htmlFor={`${type}-${f.n}`}>{f.l}</label>
                <input
                  id={`${type}-${f.n}`}
                  type="text"
                  value={(addr as unknown as Record<string, string>)[f.n] || ""}
                  onChange={(e) => onChange(f.n, e.target.value)}
                  className="contact-input"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="btn-primary text-sm px-5 py-2"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving…" : "Save Address"}
            </button>
            <button type="button" onClick={onCancelEdit} className="btn-outline text-sm px-5 py-2">Cancel</button>
          </div>
        </div>
      ) : hasData ? (
        <address className="not-italic text-sm leading-6" style={{ color: "var(--color-text-muted)" }}>
          {addr.first_name} {addr.last_name}<br />
          {addr.company && <>{addr.company}<br /></>}
          {addr.address_1}<br />
          {addr.address_2 && <>{addr.address_2}<br /></>}
          {addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postcode}<br />
          {addr.country}<br />
          {addr.phone && <>{addr.phone}<br /></>}
          {type === "billing" && addr.email && <>{addr.email}</>}
        </address>
      ) : (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No address set. Click Add to fill in your details.</p>
      )}
    </div>
  );
}

// ─── Addresses Tab ─────────────────────────────────────────────────────────

function AddressesTab() {
  const { user, token, refreshUser } = useAuth();
  const [billing,  setBilling]  = useState<AddressFields>(EMPTY_ADDR);
  const [shipping, setShipping] = useState<AddressFields>(EMPTY_ADDR);
  const [editing,  setEditing]  = useState<"billing" | "shipping" | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState("");
  const [err,      setErr]      = useState("");
  const [loading,  setLoading]  = useState(false);

  // ── Load saved addresses — reads directly from user meta, not WC API ─────
  const loadAddresses = useCallback(async (jwt: string, fallbackUser?: typeof user) => {
    setLoading(true);
    try {
      const r = await fetch("/api/account/addresses", {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: "no-store",
      });
      if (!r.ok) return;
      const d = await r.json() as {
        billing?: Partial<AddressFields>;
        shipping?: Partial<AddressFields>;
      };
      const b = d.billing  || {};
      const s = d.shipping || {};
      const fn = fallbackUser?.firstName || "";
      const ln = fallbackUser?.lastName  || "";
      const em = fallbackUser?.email     || "";
      setBilling({
        ...EMPTY_ADDR,
        first_name: b.first_name || fn,
        last_name:  b.last_name  || ln,
        email:      b.email      || em,
        phone:      b.phone      || "",
        company:    b.company    || "",
        address_1:  b.address_1  || "",
        address_2:  b.address_2  || "",
        city:       b.city       || "",
        state:      b.state      || "",
        postcode:   b.postcode   || "",
        country:    b.country    || "US",
      });
      setShipping({
        ...EMPTY_ADDR,
        first_name: s.first_name || fn,
        last_name:  s.last_name  || ln,
        email:      s.email      || b.email || em,
        phone:      s.phone      || b.phone || "",
        company:    s.company    || "",
        address_1:  s.address_1  || "",
        address_2:  s.address_2  || "",
        city:       s.city       || "",
        state:      s.state      || "",
        postcode:   s.postcode   || "",
        country:    s.country    || "US",
      });
    } catch {
      // ignore — form stays as-is
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load when authenticated
  useEffect(() => {
    if (user && token) loadAddresses(token, user);
  }, [user?.id, token, loadAddresses]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveAddress = useCallback(async (type: "billing" | "shipping") => {
    if (!user || !token) return;
    setSaving(true); setErr(""); setSuccess("");
    try {
      const res = await fetch("/api/account/address", {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          billing:  type === "billing"  ? billing  : undefined,
          shipping: type === "shipping" ? shipping : undefined,
        }),
      });
      const data = await res.json() as {
        ok?: boolean; message?: string;
        billing?: Partial<AddressFields>; shipping?: Partial<AddressFields>;
      };
      if (!res.ok) { setErr(data.message || "Save failed."); return; }

      setSuccess(`${type === "billing" ? "Billing" : "Shipping"} address saved!`);
      setEditing(null);

      // Apply the confirmed-saved values the server returned — no extra fetch needed.
      // Avoids the WC object-cache stale-read that was wiping saved data.
      if (type === "billing"  && data.billing)  {
        setBilling((p) => ({ ...p, ...data.billing  }));
      }
      if (type === "shipping" && data.shipping) {
        setShipping((p) => ({ ...p, ...data.shipping }));
      }

      // Update AuthContext so checkout pre-fills with the new address
      refreshUser();
    } catch {
      setErr("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [user, token, billing, shipping, refreshUser]);

  function handleBillingChange(field: string, value: string) {
    setBilling((p) => ({ ...p, [field]: value }));
  }
  function handleShippingChange(field: string, value: string) {
    setShipping((p) => ({ ...p, [field]: value }));
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>Addresses</h2>
      {success && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0" }}>{success}</div>}
      {err     && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>{err}</div>}
      {loading && !saving && (
        <div className="mb-4 text-xs" style={{ color: "var(--leather-400)" }}>Loading addresses…</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AddressCard
          type="billing"
          addr={billing}
          isEditing={editing === "billing"}
          saving={saving}
          onStartEdit={() => { setEditing("billing"); setSuccess(""); }}
          onCancelEdit={() => setEditing(null)}
          onSave={() => saveAddress("billing")}
          onChange={handleBillingChange}
        />
        <AddressCard
          type="shipping"
          addr={shipping}
          isEditing={editing === "shipping"}
          saving={saving}
          onStartEdit={() => { setEditing("shipping"); setSuccess(""); }}
          onCancelEdit={() => setEditing(null)}
          onSave={() => saveAddress("shipping")}
          onChange={handleShippingChange}
        />
      </div>
    </div>
  );
}

// ─── Account Details Tab ───────────────────────────────────────────────────

function AccountTab() {
  const { user, token } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName,  setLastName]  = useState(user?.lastName  || "");
  const [newPw,     setNewPw]     = useState("");
  const [confPw,    setConfPw]    = useState("");
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState("");
  const [err,       setErr]       = useState("");

  useEffect(() => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName  || "");
  }, [user]);

  async function handleProfile(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true); setErr(""); setSuccess("");
    try {
      const res = await fetch("/api/account/profile", {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ customer_id: user.id, first_name: firstName, last_name: lastName }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) { setErr(data.message || "Update failed."); return; }
      setSuccess("Profile updated successfully!");
    } catch {
      setErr("Update failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault();
    if (newPw !== confPw) { setErr("Passwords do not match."); return; }
    if (newPw.length < 8) { setErr("Password must be at least 8 characters."); return; }
    setSaving(true); setErr(""); setSuccess("");
    try {
      const res = await fetch("/api/account/password", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ password: newPw }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) { setErr(data.message || "Password change failed."); return; }
      setSuccess("Password changed successfully!");
      setNewPw(""); setConfPw("");
    } catch {
      setErr("Password change failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-bold" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>Account Details</h2>
      {success && <div className="p-3 rounded-lg text-sm" style={{ background: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0" }}>{success}</div>}
      {err     && <div className="p-3 rounded-lg text-sm" style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>{err}</div>}

      <form onSubmit={handleProfile} className="rounded-xl p-5 space-y-4" style={{ background: "#fff", border: "1px solid var(--leather-100)" }}>
        <h3 className="font-semibold text-sm uppercase tracking-widest" style={{ color: "var(--leather-700)" }}>Personal Info</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="contact-label" htmlFor="acc-first">First Name</label>
            <input id="acc-first" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="contact-input" />
          </div>
          <div>
            <label className="contact-label" htmlFor="acc-last">Last Name</label>
            <input id="acc-last" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="contact-input" />
          </div>
        </div>
        <div>
          <label className="contact-label">Email Address</label>
          <input type="email" value={user?.email || ""} disabled className="contact-input opacity-60 cursor-not-allowed" />
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Email cannot be changed here.</p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5" style={{ opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>

      <form onSubmit={handlePassword} className="rounded-xl p-5 space-y-4" style={{ background: "#fff", border: "1px solid var(--leather-100)" }}>
        <h3 className="font-semibold text-sm uppercase tracking-widest" style={{ color: "var(--leather-700)" }}>Change Password</h3>
        <div>
          <label className="contact-label" htmlFor="new-pw">New Password</label>
          <input id="new-pw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required className="contact-input" placeholder="Min. 8 characters" />
        </div>
        <div>
          <label className="contact-label" htmlFor="conf-pw">Confirm New Password</label>
          <input id="conf-pw" type="password" value={confPw} onChange={(e) => setConfPw(e.target.value)} required className="contact-input" placeholder="Repeat password" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5" style={{ opacity: saving ? 0.7 : 1 }}>
          {saving ? "Changing…" : "Change Password"}
        </button>
      </form>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function MyAccountPage() {
  const { user, loading, logout } = useAuth();
  const searchParams = useSearchParams();
  const [authMode,   setAuthMode]   = useState<"login" | "register">("login");
  const [activeTab,  setActiveTab]  = useState<Tab>("dashboard");

  // Read ?tab= from URL on mount
  useEffect(() => {
    const tab = searchParams.get("tab") as Tab | null;
    if (tab && ["dashboard", "orders", "addresses", "account"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  function handleNav(t: Tab) {
    if (t === "logout") { logout(); return; }
    setActiveTab(t);
  }

  const NAV_ITEMS: { tab: Tab; icon: string; label: string }[] = [
    { tab: "dashboard",  icon: "🏠", label: "Dashboard" },
    { tab: "orders",     icon: "📦", label: "Orders" },
    { tab: "addresses",  icon: "📍", label: "Addresses" },
    { tab: "account",    icon: "👤", label: "Account Details" },
    { tab: "logout",     icon: "🚪", label: "Logout" },
  ];

  return (
    <main>
      {/* Banner */}
      <div className="page-banner">
        <div className="section-container">
          <nav className="breadcrumb mb-3">
            <Link href="/">Home</Link>
            <span>/</span>
            <span style={{ color: "var(--leather-200)" }}>My Account</span>
          </nav>
          <h1 className="page-banner-title">My Account</h1>
        </div>
      </div>

      <div className="section-container py-10">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3" style={{ color: "var(--color-text-muted)" }}>
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--leather-200)", borderTopColor: "var(--leather-500)" }} />
            Loading…
          </div>
        )}

        {/* Guest */}
        {!loading && !user && (
          <div className="py-6">
            <div className="flex max-w-md mx-auto mb-6 rounded-xl overflow-hidden" style={{ border: "1px solid var(--leather-100)" }}>
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setAuthMode(m)}
                  className="flex-1 py-3 text-sm font-semibold transition-colors"
                  style={{ background: authMode === m ? "var(--leather-500)" : "#fff", color: authMode === m ? "#fff" : "var(--leather-700)" }}
                >
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>
            {authMode === "login"
              ? <LoginForm    onSwitch={() => setAuthMode("register")} />
              : <RegisterForm onSwitch={() => setAuthMode("login")}    />
            }
          </div>
        )}

        {/* Logged-in */}
        {!loading && user && (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--leather-100)", background: "#fff" }}>
                <div className="p-5 flex items-center gap-3" style={{ background: "var(--leather-50)", borderBottom: "1px solid var(--leather-100)" }}>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ background: "var(--leather-200)" }}>
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.displayName} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold" style={{ color: "var(--leather-700)" }}>
                        {user.firstName?.charAt(0) || user.displayName?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "var(--leather-900)" }}>
                      {user.firstName ? `${user.firstName} ${user.lastName}`.trim() : user.displayName}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{user.email}</p>
                  </div>
                </div>
                <nav className="py-2">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.tab}
                      onClick={() => handleNav(item.tab)}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors text-left"
                      style={{
                        background: activeTab === item.tab ? "var(--leather-50)" : "transparent",
                        color:      activeTab === item.tab ? "var(--leather-500)" : "var(--leather-800)",
                        borderLeft: activeTab === item.tab ? "3px solid var(--leather-500)" : "3px solid transparent",
                      }}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0 rounded-2xl p-6" style={{ background: "#fff", border: "1px solid var(--leather-100)" }}>
              {activeTab === "dashboard"  && <DashboardTab onNav={handleNav} />}
              {activeTab === "orders"     && <OrdersTab />}
              {activeTab === "addresses"  && <AddressesTab />}
              {activeTab === "account"    && <AccountTab />}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
