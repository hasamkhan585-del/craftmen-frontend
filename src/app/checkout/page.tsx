"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart, formatCartPrice } from "@/context/CartContext";
import { useAuth, type AuthAddress } from "@/context/AuthContext";

interface PaymentMethod {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface BillingAddress {
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

const EMPTY_BILLING: BillingAddress = {
  first_name: "", last_name: "", company: "", email: "",
  phone: "", address_1: "", address_2: "", city: "",
  state: "", postcode: "", country: "US",
};

const PAYMENT_ICONS: Record<string, string> = {
  cod:    "💵",
  bacs:   "🏦",
  cheque: "📝",
  paypal: "💙",
  stripe: "💳",
};

export default function CheckoutPage() {
  const router  = useRouter();
  const { cart, clearCart, nonce, cartToken } = useCart();
  const { user, token, login, refreshUser }  = useAuth();

  const [billing,       setBilling]       = useState<BillingAddress>(EMPTY_BILLING);
  const [sameAddress,   setSameAddress]   = useState(true);
  const [shipping,      setShipping]      = useState<BillingAddress>(EMPTY_BILLING);
  const [payMethods,    setPayMethods]    = useState<PaymentMethod[]>([]);
  const [payMethod,     setPayMethod]     = useState("");
  const [note,          setNote]          = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [orderError,    setOrderError]    = useState("");
  const [orderId,       setOrderId]       = useState<number | null>(null);
  // Account creation at checkout (for guests)
  const [createAccount, setCreateAccount] = useState(false);
  const [acctPassword,  setAcctPassword]  = useState("");
  const [acctCreated,   setAcctCreated]   = useState(false);

  const items  = cart?.items   ?? [];
  const totals = cart?.totals;

  // Fetch payment methods
  useEffect(() => {
    fetch("/api/payment-methods")
      .then((r) => r.json())
      .then((data: PaymentMethod[]) => {
        setPayMethods(data);
        if (data.length > 0 && !payMethod) setPayMethod(data[0].id);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-fill billing/shipping from saved My Account addresses (reads WP user meta directly)
  useEffect(() => {
    if (!user || !token) return;

    const fallback = (b: AuthAddress, s: AuthAddress) => {
      setBilling({
        first_name: b.first_name || user.firstName || "",
        last_name:  b.last_name  || user.lastName  || "",
        email:      b.email      || user.email      || "",
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
        first_name: s.first_name || b.first_name || user.firstName || "",
        last_name:  s.last_name  || b.last_name  || user.lastName  || "",
        email:      b.email      || user.email   || "",
        phone:      s.phone      || b.phone      || "",
        company:    s.company    || "",
        address_1:  s.address_1  || "",
        address_2:  s.address_2  || "",
        city:       s.city       || "",
        state:      s.state      || "",
        postcode:   s.postcode   || "",
        country:    s.country    || "US",
      });
    };

    fetch("/api/account/addresses", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d: { billing?: AuthAddress; shipping?: AuthAddress }) => {
        fallback(d.billing ?? {}, d.shipping ?? {});
      })
      .catch(() => {
        fallback(user.billing ?? {}, user.shipping ?? {});
      });
  }, [user?.id, token]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleBilling(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setBilling((p) => ({ ...p, [e.target.name]: e.target.value }));
  }
  function handleShipping(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setShipping((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!payMethod)       { setOrderError("Please select a payment method."); return; }
    if (items.length === 0) { setOrderError("Your cart is empty."); return; }
    if (createAccount && acctPassword.length < 8) {
      setOrderError("Account password must be at least 8 characters."); return;
    }

    setSubmitting(true);
    setOrderError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(nonce     ? { "X-Cart-Nonce":  nonce     } : {}),
          ...(cartToken ? { "X-Cart-Token":  cartToken } : {}),
          // Pass JWT so the checkout API can link the order to the logged-in user
          ...(token     ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          billing_address:  billing,
          shipping_address: sameAddress ? billing : shipping,
          payment_method:   payMethod,
          payment_data:     [],
          customer_note:    note,
        }),
      });

      const data = await res.json() as { order_id?: number; id?: number; message?: string };

      if (!res.ok) {
        throw new Error(data.message || "Order could not be placed. Please try again.");
      }

      const placedOrderId = data.order_id ?? data.id ?? 0;

      // Sync billing/shipping back to WC customer profile for logged-in users
      if (user && token) {
        const shippingToSync = sameAddress
          ? { first_name: billing.first_name, last_name: billing.last_name, company: billing.company,
              address_1: billing.address_1, address_2: billing.address_2, city: billing.city,
              state: billing.state, postcode: billing.postcode, country: billing.country }
          : shipping;
        try {
          await fetch("/api/account/address", {
            method:  "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ billing, shipping: shippingToSync }),
          });
          // Update AuthContext so My Account page reflects the new addresses immediately
          refreshUser();
        } catch { /* non-blocking — order already placed */ }
      }

      // Auto-create WooCommerce account if guest opted in
      if (!user && createAccount && billing.email && acctPassword) {
        const username = billing.email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase() || "customer";
        try {
          const regRes = await fetch("/api/auth/register", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username,
              email:      billing.email,
              password:   acctPassword,
              first_name: billing.first_name,
              last_name:  billing.last_name,
            }),
          });
          if (regRes.ok) {
            // Auto-login the newly created customer
            await login(username, acctPassword);
            setAcctCreated(true);
          }
        } catch { /* account creation is optional; don't block order */ }
      }

      setOrderId(placedOrderId);
      await clearCart();
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Order success screen ──────────────────────────────────────────────────
  if (orderId) {
    return (
      <main>
        <div className="section-container py-16 max-w-xl mx-auto text-center">
          <div className="text-7xl mb-5">🎉</div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>
            Order Confirmed!
          </h1>
          <p className="text-base mb-1" style={{ color: "var(--color-text-muted)" }}>
            Thank you for your purchase. Your order has been received.
          </p>
          <p className="text-lg font-bold mb-6" style={{ color: "var(--leather-500)" }}>
            Order #{orderId}
          </p>

          {/* Account created notice */}
          {acctCreated && (
            <div className="mb-5 p-4 rounded-xl text-sm text-left" style={{ background: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0" }}>
              <strong>Account created!</strong> You can now log in with <strong>{billing.email}</strong> to track this and future orders.
            </div>
          )}

          <div className="p-5 rounded-xl mb-6 text-sm text-left space-y-2" style={{ background: "var(--leather-50)", border: "1px solid var(--leather-100)" }}>
            <div className="flex items-center gap-2">
              <span>📧</span>
              <span style={{ color: "var(--color-text-muted)" }}>
                Confirmation sent to <strong style={{ color: "var(--leather-800)" }}>{billing.email}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>📦</span>
              <span style={{ color: "var(--color-text-muted)" }}>
                Order visible in <strong style={{ color: "var(--leather-800)" }}>WordPress Admin → WooCommerce → Orders</strong>
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/my-account/order/${orderId}`} className="btn-primary">
              View Order Details
            </Link>
            <Link href="/my-account?tab=orders" className="btn-outline">
              All My Orders
            </Link>
          </div>

          {/* Guest prompt to sign in if account wasn&apos;t created */}
          {!user && !acctCreated && (
            <p className="text-xs mt-5" style={{ color: "var(--color-text-muted)" }}>
              Have an account?{" "}
              <Link href="/my-account" className="underline font-medium" style={{ color: "var(--leather-500)" }}>
                Sign in to track your order
              </Link>
            </p>
          )}
        </div>
      </main>
    );
  }

  // Redirect if cart is empty (and loaded)
  if (cart && items.length === 0) {
    router.replace("/cart");
    return null;
  }

  return (
    <main>
      {/* Banner */}
      <div className="page-banner">
        <div className="section-container">
          <nav className="breadcrumb mb-3">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/cart">Cart</Link>
            <span>/</span>
            <span style={{ color: "var(--leather-200)" }}>Checkout</span>
          </nav>
          <h1 className="page-banner-title">Checkout</h1>
        </div>
      </div>

      <div className="section-container py-10">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-10">

            {/* ─── Left: billing + payment ─── */}
            <div className="flex-1 min-w-0 space-y-8">

              {/* Logged-in user notice */}
              {user && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: "var(--leather-50)", border: "1px solid var(--leather-200)" }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--leather-500)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span style={{ color: "var(--leather-700)" }}>
                    Signed in as <strong style={{ color: "var(--leather-900)" }}>{user.firstName ? `${user.firstName} ${user.lastName}`.trim() : user.displayName}</strong>
                    {" "}({user.email}) — your saved address has been pre-filled.
                  </span>
                </div>
              )}

              {/* Billing Details */}
              <section
                className="rounded-xl p-6"
                style={{ background: "#fff", border: "1px solid var(--leather-100)" }}
              >
                <h2 className="text-lg font-bold mb-6" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>
                  Billing Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "first_name", label: "First Name *",   required: true,  type: "text" },
                    { name: "last_name",  label: "Last Name *",    required: true,  type: "text" },
                    { name: "email",      label: "Email Address *", required: true, type: "email", full: true },
                    { name: "phone",      label: "Phone",           required: false, type: "tel" },
                    { name: "company",    label: "Company",         required: false, type: "text" },
                    { name: "address_1",  label: "Address Line 1 *", required: true, type: "text", full: true },
                    { name: "address_2",  label: "Address Line 2",  required: false, type: "text", full: true },
                    { name: "city",       label: "City *",          required: true,  type: "text" },
                    { name: "state",      label: "State / Region *", required: true, type: "text" },
                    { name: "postcode",   label: "Postcode / ZIP *", required: true, type: "text" },
                    { name: "country",    label: "Country *",       required: true,  type: "text" },
                  ].map((f) => (
                    <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                      <label className="contact-label" htmlFor={`billing-${f.name}`}>{f.label}</label>
                      <input
                        id={`billing-${f.name}`}
                        name={f.name}
                        type={f.type}
                        required={f.required}
                        value={(billing as unknown as Record<string,string>)[f.name]}
                        onChange={handleBilling}
                        className="contact-input"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Create account (guests only) */}
              {!user && (
                <section
                  className="rounded-xl p-5"
                  style={{ background: "#fff", border: `1px solid ${createAccount ? "var(--leather-300)" : "var(--leather-100)"}` }}
                >
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                      style={{ accentColor: "var(--leather-500)", width: "1.1rem", height: "1.1rem" }}
                    />
                    <span className="font-semibold text-sm" style={{ color: "var(--leather-900)" }}>
                      Create an account for faster checkout next time
                    </span>
                  </label>
                  {createAccount && (
                    <div className="mt-4">
                      <label className="contact-label" htmlFor="acct-password">
                        Choose a Password *
                      </label>
                      <input
                        id="acct-password"
                        type="password"
                        value={acctPassword}
                        onChange={(e) => setAcctPassword(e.target.value)}
                        required={createAccount}
                        minLength={8}
                        className="contact-input"
                        placeholder="Min. 8 characters"
                      />
                      <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>
                        Your account will be created with email <strong>{billing.email || "—"}</strong>
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* Ship to different address */}
              <section
                className="rounded-xl p-6"
                style={{ background: "#fff", border: "1px solid var(--leather-100)" }}
              >
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!sameAddress}
                    onChange={(e) => setSameAddress(!e.target.checked)}
                    style={{ accentColor: "var(--leather-500)", width: "1.1rem", height: "1.1rem" }}
                  />
                  <span className="font-semibold text-sm" style={{ color: "var(--leather-900)" }}>
                    Ship to a different address
                  </span>
                </label>

                {!sameAddress && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                    {[
                      { name: "first_name", label: "First Name *",    required: true, type: "text" },
                      { name: "last_name",  label: "Last Name *",     required: true, type: "text" },
                      { name: "address_1",  label: "Address Line 1 *", required: true, type: "text", full: true },
                      { name: "city",       label: "City *",           required: true, type: "text" },
                      { name: "state",      label: "State *",          required: true, type: "text" },
                      { name: "postcode",   label: "Postcode / ZIP *", required: true, type: "text" },
                      { name: "country",    label: "Country *",        required: true, type: "text" },
                    ].map((f) => (
                      <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                        <label className="contact-label" htmlFor={`ship-${f.name}`}>{f.label}</label>
                        <input
                          id={`ship-${f.name}`}
                          name={f.name}
                          type={f.type}
                          required={f.required}
                          value={(shipping as unknown as Record<string,string>)[f.name]}
                          onChange={handleShipping}
                          className="contact-input"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Order note */}
              <section
                className="rounded-xl p-6"
                style={{ background: "#fff", border: "1px solid var(--leather-100)" }}
              >
                <label className="contact-label" htmlFor="order-note">Order Note (optional)</label>
                <textarea
                  id="order-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="contact-input resize-none"
                  placeholder="Any special instructions for your order…"
                />
              </section>

              {/* Payment Methods */}
              <section
                className="rounded-xl p-6"
                style={{ background: "#fff", border: "1px solid var(--leather-100)" }}
              >
                <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>
                  Payment Method
                </h2>

                {payMethods.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--leather-200)", borderTopColor: "var(--leather-500)" }} />
                    Loading payment methods…
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payMethods.map((pm) => (
                      <label
                        key={pm.id}
                        className="flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all"
                        style={{
                          border: payMethod === pm.id ? "2px solid var(--leather-500)" : "1px solid var(--leather-100)",
                          background: payMethod === pm.id ? "var(--leather-50)" : "#fff",
                        }}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={pm.id}
                          checked={payMethod === pm.id}
                          onChange={() => setPayMethod(pm.id)}
                          className="mt-0.5"
                          style={{ accentColor: "var(--leather-500)" }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: "var(--leather-900)" }}>
                            <span>{PAYMENT_ICONS[pm.id] ?? "💳"}</span>
                            {pm.title}
                          </div>
                          {pm.description && payMethod === pm.id && (
                            <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                              {pm.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* ─── Right: order summary ─── */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <div
                className="rounded-xl p-6 sticky top-24"
                style={{ background: "var(--leather-50)", border: "1px solid var(--leather-100)" }}
              >
                <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>
                  Your Order
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-5">
                  {items.map((item) => {
                    const img      = item.images?.[0]?.thumbnail || item.images?.[0]?.src || "";
                    const lineTotal = formatCartPrice(item.totals.line_total, item.totals);
                    return (
                      <div key={item.key} className="flex items-center gap-3">
                        <div
                          className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ background: "var(--leather-100)" }}
                        >
                          {img && (
                            <Image src={img} alt={item.name} fill className="object-cover" unoptimized={img.includes("localhost")} />
                          )}
                          <span
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: "var(--leather-500)" }}
                          >
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: "var(--leather-900)" }}>{item.name}</p>
                        </div>
                        <span className="text-xs font-bold flex-shrink-0" style={{ color: "var(--leather-600)" }}>
                          {lineTotal}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                {totals && (
                  <div className="space-y-2 text-sm pt-4" style={{ borderTop: "1px solid var(--leather-200)" }}>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-muted)" }}>Subtotal</span>
                      <span>{formatCartPrice(totals.total_items, totals)}</span>
                    </div>
                    {totals.total_tax !== "0" && (
                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-muted)" }}>Tax</span>
                        <span>{formatCartPrice(totals.total_tax, totals)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-muted)" }}>Shipping</span>
                      <span style={{ color: "var(--leather-600)" }}>
                        {totals.total_shipping ? formatCartPrice(totals.total_shipping, totals) : "Free / TBD"}
                      </span>
                    </div>
                    <div
                      className="flex justify-between font-bold pt-2 text-base"
                      style={{ borderTop: "1px solid var(--leather-200)", color: "var(--leather-900)" }}
                    >
                      <span>Total</span>
                      <span style={{ color: "var(--leather-500)" }}>
                        {formatCartPrice(totals.total_price, totals)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Error */}
                {orderError && (
                  <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>
                    {orderError}
                  </div>
                )}

                {/* Place order */}
                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="btn-primary w-full text-center mt-5"
                  style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
                >
                  {submitting ? "Placing Order…" : "Place Order"}
                </button>

                <p className="text-xs text-center mt-3" style={{ color: "var(--color-text-muted)" }}>
                  🔒 Secure checkout. Your data is never shared.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
