"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// ─── Types ─────────────────────────────────────────────────────────────────

interface OrderAddress {
  first_name: string; last_name: string; company?: string;
  address_1: string;  address_2?: string;
  city: string; state: string; postcode: string; country: string;
  email?: string; phone?: string;
}

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
  subtotal: string;
  image?: { src: string };
  sku?: string;
}

interface ShippingLine {
  method_title: string;
  total: string;
}

interface FullOrder {
  id: number;
  number: string;
  status: string;
  date_created: string;
  date_modified: string;
  total: string;
  subtotal?: string;
  total_tax: string;
  shipping_total: string;
  discount_total: string;
  currency_symbol: string;
  currency: string;
  payment_method_title: string;
  customer_note?: string;
  billing: OrderAddress;
  shipping: OrderAddress;
  line_items: OrderItem[];
  shipping_lines: ShippingLine[];
}

// ─── Status config ──────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: "#FEF3C7", color: "#92400E", label: "Pending Payment" },
  processing: { bg: "#DBEAFE", color: "#1E40AF", label: "Processing" },
  "on-hold":  { bg: "#FEF3C7", color: "#92400E", label: "On Hold" },
  completed:  { bg: "#D1FAE5", color: "#065F46", label: "Completed" },
  cancelled:  { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" },
  refunded:   { bg: "#E9D5FF", color: "#5B21B6", label: "Refunded" },
  failed:     { bg: "#FEE2E2", color: "#991B1B", label: "Failed" },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params     = useParams<{ id: string }>();
  const { user, token, loading: authLoading } = useAuth();

  const [order,   setOrder]   = useState<FullOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    fetch(`/api/account/orders/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("Order not found.");
        return r.json();
      })
      .then((data: FullOrder) => setOrder(data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load order."))
      .finally(() => setLoading(false));
  }, [user, token, authLoading, params.id]);

  // ── Auth guard ──────────────────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <main>
        <div className="section-container py-20 text-center">
          <p className="text-lg font-semibold mb-4" style={{ color: "var(--leather-900)" }}>
            Please sign in to view your order.
          </p>
          <Link href="/my-account" className="btn-primary">Sign In</Link>
        </div>
      </main>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <main>
        <div className="flex items-center justify-center py-24 gap-3" style={{ color: "var(--color-text-muted)" }}>
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--leather-200)", borderTopColor: "var(--leather-500)" }} />
          Loading order…
        </div>
      </main>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <main>
        <div className="section-container py-20 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg font-semibold mb-2" style={{ color: "var(--leather-900)" }}>{error || "Order not found."}</p>
          <Link href="/my-account?tab=orders" className="btn-primary mt-4 inline-block">Back to Orders</Link>
        </div>
      </main>
    );
  }

  const s          = STATUS_COLORS[order.status] || { bg: "#F3F4F6", color: "#374151", label: order.status };
  const sym        = order.currency_symbol;
  const orderDate  = new Date(order.date_created).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Calculate subtotal from line items
  const subtotal   = order.line_items.reduce((sum, item) => sum + parseFloat(item.subtotal || item.total), 0);

  return (
    <main>
      {/* Banner */}
      <div className="page-banner">
        <div className="section-container">
          <nav className="breadcrumb mb-3">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/my-account?tab=orders" style={{ color: "var(--leather-200)" }}>My Orders</Link>
            <span>/</span>
            <span style={{ color: "var(--leather-200)" }}>Order #{order.number}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="page-banner-title">Order #{order.number}</h1>
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: s.bg, color: s.color }}
            >
              {s.label}
            </span>
          </div>
          <p className="page-banner-sub">{orderDate}</p>
        </div>
      </div>

      <div className="section-container py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left: items + addresses ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Order items */}
            <section className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--leather-100)" }}>
              <div className="px-6 py-4" style={{ background: "var(--leather-50)", borderBottom: "1px solid var(--leather-100)" }}>
                <h2 className="font-bold text-base" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>
                  Order Items
                </h2>
              </div>
              <div className="divide-y" style={{ background: "#fff" }}>
                {order.line_items.map((item) => {
                  const img = item.image?.src || "";
                  return (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                      {/* Thumbnail */}
                      <div
                        className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: "var(--leather-50)" }}
                      >
                        {img ? (
                          <Image src={img} alt={item.name} fill className="object-cover" unoptimized={img.includes("localhost")} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: "var(--leather-900)" }}>{item.name}</p>
                        {item.sku && (
                          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>SKU: {item.sku}</p>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                          Qty: {item.quantity}
                        </p>
                      </div>
                      {/* Price */}
                      <span className="font-bold text-sm flex-shrink-0" style={{ color: "var(--leather-600)" }}>
                        {sym}{parseFloat(item.total).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Billing */}
              <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid var(--leather-100)" }}>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--leather-900)" }}>
                  <span>💳</span> Billing Address
                </h3>
                <address className="not-italic text-sm leading-6" style={{ color: "var(--color-text-muted)" }}>
                  {order.billing.first_name} {order.billing.last_name}<br />
                  {order.billing.company && <>{order.billing.company}<br /></>}
                  {order.billing.address_1}<br />
                  {order.billing.address_2 && <>{order.billing.address_2}<br /></>}
                  {order.billing.city}{order.billing.state ? `, ${order.billing.state}` : ""} {order.billing.postcode}<br />
                  {order.billing.country}<br />
                  {order.billing.phone && <>{order.billing.phone}<br /></>}
                  {order.billing.email && <>{order.billing.email}</>}
                </address>
              </div>

              {/* Shipping */}
              <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid var(--leather-100)" }}>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--leather-900)" }}>
                  <span>🚚</span> Shipping Address
                </h3>
                <address className="not-italic text-sm leading-6" style={{ color: "var(--color-text-muted)" }}>
                  {order.shipping.first_name} {order.shipping.last_name}<br />
                  {order.shipping.company && <>{order.shipping.company}<br /></>}
                  {order.shipping.address_1 || order.billing.address_1}<br />
                  {order.shipping.address_2 && <>{order.shipping.address_2}<br /></>}
                  {(order.shipping.city || order.billing.city)}{order.shipping.state ? `, ${order.shipping.state}` : ""} {order.shipping.postcode || order.billing.postcode}<br />
                  {order.shipping.country || order.billing.country}
                </address>
              </div>
            </div>

            {/* Customer note */}
            {order.customer_note && (
              <div className="rounded-2xl p-5" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <h3 className="font-bold text-sm mb-2" style={{ color: "#92400E" }}>Order Note</h3>
                <p className="text-sm" style={{ color: "#78350F" }}>{order.customer_note}</p>
              </div>
            )}
          </div>

          {/* ── Right: summary ── */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="rounded-2xl p-6 sticky top-24 space-y-5" style={{ background: "var(--leather-50)", border: "1px solid var(--leather-100)" }}>

              {/* Order meta */}
              <div>
                <h2 className="font-bold text-base mb-4" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>
                  Order Summary
                </h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt style={{ color: "var(--color-text-muted)" }}>Order #</dt>
                    <dd className="font-semibold" style={{ color: "var(--leather-800)" }}>{order.number}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt style={{ color: "var(--color-text-muted)" }}>Date</dt>
                    <dd className="font-semibold" style={{ color: "var(--leather-800)" }}>{orderDate}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt style={{ color: "var(--color-text-muted)" }}>Status</dt>
                    <dd>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt style={{ color: "var(--color-text-muted)" }}>Payment</dt>
                    <dd className="font-semibold" style={{ color: "var(--leather-800)" }}>{order.payment_method_title}</dd>
                  </div>
                </dl>
              </div>

              {/* Totals */}
              <div className="pt-4 space-y-2 text-sm" style={{ borderTop: "1px solid var(--leather-200)" }}>
                <div className="flex justify-between">
                  <span style={{ color: "var(--color-text-muted)" }}>Subtotal</span>
                  <span>{sym}{subtotal.toFixed(2)}</span>
                </div>
                {parseFloat(order.discount_total) > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-muted)" }}>Discount</span>
                    <span style={{ color: "#16a34a" }}>−{sym}{parseFloat(order.discount_total).toFixed(2)}</span>
                  </div>
                )}
                {order.shipping_lines.map((sl, i) => (
                  <div key={i} className="flex justify-between">
                    <span style={{ color: "var(--color-text-muted)" }}>Shipping ({sl.method_title})</span>
                    <span>{parseFloat(sl.total) > 0 ? `${sym}${parseFloat(sl.total).toFixed(2)}` : "Free"}</span>
                  </div>
                ))}
                {parseFloat(order.total_tax) > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-muted)" }}>Tax</span>
                    <span>{sym}{parseFloat(order.total_tax).toFixed(2)}</span>
                  </div>
                )}
                <div
                  className="flex justify-between font-bold text-base pt-3"
                  style={{ borderTop: "1px solid var(--leather-200)", color: "var(--leather-900)" }}
                >
                  <span>Total</span>
                  <span style={{ color: "var(--leather-500)" }}>{sym}{parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>

              <Link href="/my-account?tab=orders" className="btn-outline w-full text-center block text-xs">
                ← Back to Orders
              </Link>
              <Link href="/shop" className="btn-primary w-full text-center block text-xs">
                Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
