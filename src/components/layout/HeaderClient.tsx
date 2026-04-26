"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ACFHeaderOptions, ACFNavItem } from "@/types/acf";

interface Props {
  options: ACFHeaderOptions;
}

function NavItem({ item, onClose }: { item: ACFNavItem; onClose: () => void }) {
  const [dropOpen, setDropOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={item.link}
        target={item.open_new_tab ? "_blank" : undefined}
        rel={item.open_new_tab ? "noopener noreferrer" : undefined}
        className={
          item.highlight
            ? "px-4 py-2 rounded font-semibold text-sm transition-opacity hover:opacity-90"
            : "font-medium text-sm transition-colors tracking-wide"
        }
        style={item.highlight ? { backgroundColor: "var(--leather-500)", color: "#fff" } : { color: "var(--leather-800)" }}
        onMouseEnter={!item.highlight ? (e) => (e.currentTarget.style.color = "var(--leather-500)") : undefined}
        onMouseLeave={!item.highlight ? (e) => (e.currentTarget.style.color = "var(--leather-800)") : undefined}
        onClick={onClose}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseLeave={() => setDropOpen(false)}>
      <button
        className="flex items-center gap-1 font-medium text-sm transition-colors tracking-wide"
        style={{ color: "var(--leather-800)" }}
        onMouseEnter={(e) => { setDropOpen(true); (e.currentTarget as HTMLElement).style.color = "var(--leather-500)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--leather-800)"; }}
        onClick={() => setDropOpen(!dropOpen)}
      >
        {item.label}
        <svg className="w-3.5 h-3.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {dropOpen && (
        <div className="absolute top-full left-0 pt-2 w-48 z-50">
          <div
            className="rounded-lg shadow-xl border py-2"
            style={{ background: "#fff", borderColor: "var(--leather-100)" }}
          >
            {item.children.map((child, ci) => (
              <Link
                key={ci}
                href={child.link}
                className="block px-4 py-2 text-sm transition-colors"
                style={{ color: "var(--leather-700)", backgroundColor: "transparent" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--leather-50)"; e.currentTarget.style.color = "var(--leather-900)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--leather-700)"; }}
                onClick={() => { setDropOpen(false); onClose(); }}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HeaderClient({ options }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const { logo, site_name, cta, nav } = options;
  const { itemCount } = useCart();
  const { user, logout }  = useAuth();
  const [acctOpen, setAcctOpen] = useState(false);

  // Defer cart badge rendering to the client to avoid SSR/CSR hydration mismatch
  // (server renders 0 items; client loads cart from API/localStorage)
  useEffect(() => { setMounted(true); }, []);

  return (
    <header
      className="sticky top-0 z-50"
      style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.10)", borderBottom: "1px solid var(--leather-100)" }}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            {logo?.url ? (
              <Image
                src={logo.url}
                alt={logo.alt || site_name}
                width={125}
                height={60}
                className="object-contain"
                style={{ width: "125px", height: "auto" }}
                unoptimized={logo.url.startsWith("http://localhost")}
              />
            ) : (
              <div className="flex items-center gap-2.5">
                {/* Saddle stitching icon */}
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect width="36" height="36" rx="5" fill="#3B2A1A" />
                  {/* Horizontal saddle stitch lines */}
                  <path d="M7 10h9M20 10h9" stroke="#C8973E" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M7 15h9M20 15h9" stroke="#C8973E" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M7 20h9M20 20h9" stroke="#C8973E" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M7 25h9M20 25h9" stroke="#C8973E" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Center stitch thread */}
                  <path d="M18 8v20" stroke="#C8973E" strokeWidth="1" strokeDasharray="2.5 2.5" strokeLinecap="round" />
                  {/* Needle */}
                  <path d="M17 6 Q18 5 19 6 L18.5 9 L17.5 9 Z" fill="#C8973E" />
                </svg>
                <div className="flex flex-col leading-none">
                  <span
                    className="font-black tracking-[0.18em] text-sm"
                    style={{ color: "var(--leather-900)", fontFamily: "Georgia, serif" }}
                  >
                    CRAFT
                  </span>
                  <span
                    className="font-black tracking-[0.25em] text-sm"
                    style={{ color: "var(--leather-600)", fontFamily: "Georgia, serif" }}
                  >
                    MEN
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {nav.map((item, i) => (
              <NavItem key={i} item={item} onClose={() => {}} />
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <Link
              href="/search"
              className="transition-colors p-1"
              style={{ color: "var(--leather-700)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--leather-500)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--leather-700)")}
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Account icon */}
            <div className="relative" onMouseLeave={() => setAcctOpen(false)}>
              {user ? (
                <button
                  className="p-1 transition-colors flex items-center gap-1.5"
                  style={{ color: "var(--leather-700)" }}
                  onMouseEnter={() => setAcctOpen(true)}
                  onClick={() => setAcctOpen(!acctOpen)}
                  aria-label="My Account"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden md:inline text-xs font-semibold" style={{ color: "var(--leather-700)" }}>
                    {user.firstName || user.displayName}
                  </span>
                </button>
              ) : (
                <Link
                  href="/my-account"
                  className="p-1 transition-colors"
                  style={{ color: "var(--leather-700)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--leather-500)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--leather-700)")}
                  aria-label="Sign In"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}

              {/* Account dropdown for logged-in user */}
              {user && acctOpen && (
                <div className="absolute right-0 top-full pt-2 w-52 z-50">
                  <div
                    className="rounded-xl shadow-xl border py-2"
                    style={{ background: "#fff", borderColor: "var(--leather-100)" }}
                  >
                    <div className="px-4 py-2 border-b" style={{ borderColor: "var(--leather-100)" }}>
                      <p className="text-xs font-bold truncate" style={{ color: "var(--leather-900)" }}>
                        {user.firstName ? `${user.firstName} ${user.lastName}`.trim() : user.displayName}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{user.email}</p>
                    </div>
                    {[
                      { href: "/my-account",               label: "Dashboard" },
                      { href: "/my-account?tab=orders",    label: "My Orders" },
                      { href: "/my-account?tab=addresses", label: "Addresses" },
                      { href: "/my-account?tab=account",   label: "Account Details" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm transition-colors"
                        style={{ color: "var(--leather-700)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--leather-50)"; e.currentTarget.style.color = "var(--leather-900)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--leather-700)"; }}
                        onClick={() => setAcctOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: "1px solid var(--leather-100)" }} className="pt-1 mt-1">
                      <button
                        onClick={() => { logout(); setAcctOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm transition-colors"
                        style={{ color: "#991B1B" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cart icon with badge */}
            <Link
              href="/cart"
              className="relative p-1 transition-colors"
              style={{ color: "var(--leather-700)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--leather-500)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--leather-700)")}
              aria-label={mounted ? `Cart — ${itemCount} item${itemCount !== 1 ? "s" : ""}` : "Cart"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {mounted && itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center text-white font-bold rounded-full"
                  style={{ fontSize: "0.6rem", background: "var(--leather-300)", color: "var(--leather-900)" }}
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* Shop CTA */}
            {cta?.text ? (
              <Link
                href={cta.link || "/shop"}
                className="hidden md:inline-block px-4 py-1.5 rounded text-sm font-semibold tracking-wide transition-all"
                style={{ background: "var(--leather-500)", color: "#fff" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--leather-700)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--leather-500)")}
              >
                {cta.text}
              </Link>
            ) : (
              <Link
                href="/shop"
                className="hidden md:inline-block px-4 py-1.5 rounded text-sm font-semibold tracking-wide"
                style={{ background: "var(--leather-500)", color: "#fff" }}
              >
                Shop Now
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              className="lg:hidden p-1"
              style={{ color: "var(--leather-700)" }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div
            className="lg:hidden border-t py-3"
            style={{ borderColor: "var(--leather-100)" }}
          >
            {nav.map((item, i) => (
              <div key={i}>
                <Link
                  href={item.link}
                  target={item.open_new_tab ? "_blank" : undefined}
                  className="block px-4 py-2.5 font-medium text-sm tracking-wide transition-colors"
                  style={{ color: item.highlight ? "var(--leather-500)" : "var(--leather-800)" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child, ci) => (
                  <Link
                    key={ci}
                    href={child.link}
                    className="block px-8 py-2 text-xs"
                    style={{ color: "var(--leather-600)" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    — {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="px-4 pt-3 pb-1">
              <Link
                href="/shop"
                className="block w-full text-center py-2.5 rounded font-semibold text-sm tracking-wide"
                style={{ background: "var(--leather-500)", color: "#fff" }}
                onClick={() => setMobileOpen(false)}
              >
                Shop Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
