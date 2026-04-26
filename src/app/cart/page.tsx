"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, formatCartPrice } from "@/context/CartContext";

function QuantityControl({
  cartKey,
  quantity,
  min = 1,
  max = 99,
}: {
  cartKey: string;
  quantity: number;
  min?: number;
  max?: number;
}) {
  const { updateItem, loading } = useCart();

  return (
    <div
      className="flex items-center rounded border overflow-hidden"
      style={{ borderColor: "var(--leather-200)" }}
    >
      <button
        disabled={loading || quantity <= min}
        onClick={() => updateItem(cartKey, quantity - 1)}
        className="w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-40"
        style={{ background: "var(--leather-50)", color: "var(--leather-800)" }}
      >
        −
      </button>
      <span
        className="w-10 text-center text-sm font-semibold"
        style={{ color: "var(--leather-900)" }}
      >
        {quantity}
      </span>
      <button
        disabled={loading || quantity >= max}
        onClick={() => updateItem(cartKey, quantity + 1)}
        className="w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-40"
        style={{ background: "var(--leather-50)", color: "var(--leather-800)" }}
      >
        +
      </button>
    </div>
  );
}

export default function CartPage() {
  const { cart, loading, error, removeItem, clearCart } = useCart();

  const items   = cart?.items   ?? [];
  const totals  = cart?.totals;
  const isEmpty = items.length === 0;

  return (
    <main>
      {/* Banner */}
      <div className="page-banner">
        <div className="section-container">
          <nav className="breadcrumb mb-3">
            <Link href="/">Home</Link>
            <span>/</span>
            <span style={{ color: "var(--leather-200)" }}>Shopping Cart</span>
          </nav>
          <h1 className="page-banner-title">Your Cart</h1>
          {!isEmpty && (
            <p className="page-banner-sub">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          )}
        </div>
      </div>

      <div className="section-container py-10">
        {loading && !cart ? (
          <div className="text-center py-24">
            <div className="inline-block w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: "var(--leather-200)", borderTopColor: "var(--leather-500)" }} />
            <p className="mt-4 text-sm" style={{ color: "var(--color-text-muted)" }}>Loading your cart…</p>
          </div>
        ) : isEmpty ? (
          <div className="text-center py-24 max-w-sm mx-auto">
            <div className="text-7xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>
              Your cart is empty
            </h2>
            <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
              Browse our handcrafted leather collection and find something you&rsquo;ll love.
            </p>
            <Link href="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Left: items */}
            <div className="flex-1 min-w-0">
              {/* Error */}
              {error && (
                <div className="mb-4 p-4 rounded-lg text-sm" style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>
                  {error}
                </div>
              )}

              {/* Table header */}
              <div
                className="hidden md:grid grid-cols-12 gap-4 pb-3 mb-4 text-xs font-bold uppercase tracking-widest"
                style={{ borderBottom: "1px solid var(--leather-100)", color: "var(--leather-500)" }}
              >
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => {
                  const img     = item.images?.[0]?.thumbnail || item.images?.[0]?.src || "";
                  const price   = formatCartPrice(item.prices.price,         item.prices);
                  const lineTotal = formatCartPrice(item.totals.line_total,  item.totals);

                  return (
                    <div
                      key={item.key}
                      className="grid grid-cols-12 gap-4 items-center py-4"
                      style={{ borderBottom: "1px solid var(--leather-50)" }}
                    >
                      {/* Image + name */}
                      <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                        <div
                          className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative"
                          style={{ background: "var(--leather-50)", border: "1px solid var(--leather-100)" }}
                        >
                          {img ? (
                            <Image
                              src={img}
                              alt={item.name}
                              fill
                              className="object-cover"
                              unoptimized={img.includes("localhost")}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🧳</div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/shop/${item.permalink?.split("/").filter(Boolean).pop() || ""}`}
                            className="font-semibold text-sm leading-snug transition-colors"
                            style={{ color: "var(--leather-900)" }}
                          >
                            {item.name}
                          </Link>
                          {item.short_description && (
                            <p
                              className="text-xs mt-1 line-clamp-1"
                              style={{ color: "var(--color-text-muted)" }}
                              dangerouslySetInnerHTML={{ __html: item.short_description }}
                            />
                          )}
                          {/* Remove — visible on mobile below name */}
                          <button
                            onClick={() => removeItem(item.key)}
                            className="md:hidden text-xs mt-2 underline transition-colors"
                            style={{ color: "var(--leather-400)" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Unit price */}
                      <div className="hidden md:flex col-span-2 justify-center text-sm font-medium" style={{ color: "var(--leather-700)" }}>
                        {price}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-7 md:col-span-3 flex justify-center">
                        <QuantityControl cartKey={item.key} quantity={item.quantity} />
                      </div>

                      {/* Line total + remove */}
                      <div className="col-span-5 md:col-span-2 flex items-center justify-end gap-3">
                        <span className="font-bold text-sm" style={{ color: "var(--leather-500)" }}>
                          {lineTotal}
                        </span>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="hidden md:flex w-7 h-7 items-center justify-center rounded-full transition-all"
                          style={{ background: "var(--leather-50)", color: "var(--leather-400)" }}
                          aria-label="Remove item"
                          title="Remove"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: "1px solid var(--leather-100)" }}>
                <Link href="/shop" className="text-sm font-semibold transition-colors" style={{ color: "var(--leather-500)" }}>
                  ← Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="text-xs uppercase tracking-wider font-semibold transition-colors"
                  style={{ color: "var(--leather-400)" }}
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Right: order summary */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div
                className="rounded-xl p-6 sticky top-24"
                style={{ background: "var(--leather-50)", border: "1px solid var(--leather-100)" }}
              >
                <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>
                  Order Summary
                </h2>

                {totals && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-muted)" }}>Subtotal</span>
                      <span className="font-semibold" style={{ color: "var(--leather-800)" }}>
                        {formatCartPrice(totals.total_items, totals)}
                      </span>
                    </div>

                    {totals.total_tax !== "0" && (
                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-muted)" }}>Tax</span>
                        <span style={{ color: "var(--leather-800)" }}>
                          {formatCartPrice(totals.total_tax, totals)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-muted)" }}>Shipping</span>
                      <span style={{ color: "var(--leather-600)" }}>
                        {totals.total_shipping ? formatCartPrice(totals.total_shipping, totals) : "Calculated at checkout"}
                      </span>
                    </div>

                    <div
                      className="flex justify-between pt-3 font-bold text-base"
                      style={{ borderTop: "1px solid var(--leather-200)", color: "var(--leather-900)" }}
                    >
                      <span>Total</span>
                      <span style={{ color: "var(--leather-500)" }}>
                        {formatCartPrice(totals.total_price, totals)}
                      </span>
                    </div>
                  </div>
                )}

                <Link href="/checkout" className="btn-primary w-full text-center block mt-6">
                  Proceed to Checkout
                </Link>

                {/* Trust badges */}
                <div className="mt-5 space-y-2">
                  {[
                    { icon: "🔒", text: "Secure SSL checkout" },
                    { icon: "📦", text: "Free returns within 30 days" },
                    { icon: "🛡️", text: "Lifetime quality guarantee" },
                  ].map((b) => (
                    <div key={b.text} className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      <span>{b.icon}</span>
                      {b.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
