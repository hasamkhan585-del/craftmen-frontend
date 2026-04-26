import Link from "next/link";
import Image from "next/image";
import type { ReactElement } from "react";
import { getFooterOptions } from "@/lib/acf";
import { ACFFooterOptions } from "@/types/acf";

// ── Contact Icons ─────────────────────────────────────────────────────────────
const IconMapPin = () => (
  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconMail = () => (
  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconPhone = () => (
  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
  </svg>
);

const DEFAULT_FOOTER: ACFFooterOptions = {
  logo: {
    url: "https://craftmen.fr/demo/wp-content/uploads/2026/04/craft-man.png",
    alt: "Craft Men",
    width: 125,
    height: 60,
    sizes: {},
  },
  description: "Handcrafted leather goods made by master artisans. Every piece tells a story of tradition, skill, and timeless quality.",
  copyright: "© {year} CRAFT MEN. All rights reserved.",
  columns: [
    {
      title: "Quick Links",
      links: [
        { label: "Home",       url: "/" },
        { label: "Shop",       url: "/shop" },
        { label: "About Us",   url: "/about" },
        { label: "Blog",       url: "/blog" },
        { label: "Contact",    url: "/contact" },
      ],
    },
    {
      title: "Categories",
      links: [
        { label: "Bags",              url: "/shop/category/bags" },
        { label: "Role Top Bag",      url: "/shop/category/role-top-bag" },
        { label: "Duffle Bag",        url: "/shop/category/buffle-bag" },
        { label: "Leather Canvas Bag",url: "/shop/category/leather-canvas-bag" },
        { label: "Laptop Bag",        url: "/shop/category/laptop-bag" },
      ],
    },
  ],
  contact: {
    address: "123 Leather Lane, Artisan District\nNew York, NY 10001",
    email:   "hello@craftleather.com",
    phone:   "+1 (555) 234-5678",
  },
  social: { facebook: "", twitter: "", instagram: "", linkedin: "", youtube: "" },
  bottom_links: [
    { label: "Privacy Policy",   url: "/privacy-policy" },
    { label: "Terms of Service", url: "/terms-of-service" },
    { label: "Refund Policy",    url: "/refund-policy" },
  ],
};

const SOCIAL_ICONS: Record<string, ReactElement> = {
  facebook: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  ),
  twitter: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  ),
  instagram: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
    </svg>
  ),
  linkedin: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  youtube: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  ),
};

export default async function Footer() {
  const options = (((await getFooterOptions()) ?? DEFAULT_FOOTER) as ACFFooterOptions);
  const { logo, description, contact, social } = options;

  // Use ACF columns only when they have real links; otherwise fall back to defaults
  const hasRealColumns = options.columns?.some(c => c.links?.length > 0);
  const columns = hasRealColumns ? options.columns : DEFAULT_FOOTER.columns;

  const copyright = options.copyright || DEFAULT_FOOTER.copyright;
  const bottom_links = options.bottom_links?.length ? options.bottom_links : DEFAULT_FOOTER.bottom_links;
  const contactInfo = contact ?? DEFAULT_FOOTER.contact;
  const year = new Date().getFullYear();
  const copyrightText = copyright.replace("{year}", String(year));
  // Exclude social URLs that point to the frontend URL (misconfigured) or are empty
  const socialLinks = Object.entries(social).filter(([, url]) => {
    if (!url) return false;
    try { const h = new URL(url).hostname; return !h.includes("vercel.app"); } catch { return false; }
  }) as [string, string][];

  return (
    <footer style={{ background: "var(--leather-950)", color: "var(--leather-200)" }}>
      {/* Craft tagline strip */}
      <div
        className="text-center py-3 text-xs tracking-[0.25em] uppercase font-medium"
        style={{ background: "var(--leather-900)", color: "var(--leather-300)", borderBottom: "1px solid var(--leather-800)" }}
      >
        Handcrafted with passion · Made to last a lifetime · Est. 2010
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-5">
              {logo?.url ? (
                <div
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2"
                  style={{ background: "#fff" }}
                >
                  <Image
                    src={logo.url}
                    alt={logo.alt || "Logo"}
                    width={125}
                    height={60}
                    className="object-contain"
                    style={{ width: "125px", height: "auto" }}
                    unoptimized={logo.url.startsWith("http://localhost")}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  {/* Saddle stitching icon */}
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect width="36" height="36" rx="5" fill="#C8973E" />
                    <path d="M7 10h9M20 10h9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M7 15h9M20 15h9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M7 20h9M20 20h9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M7 25h9M20 25h9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M18 8v20" stroke="#fff" strokeWidth="1" strokeDasharray="2.5 2.5" strokeLinecap="round" />
                    <path d="M17 6 Q18 5 19 6 L18.5 9 L17.5 9 Z" fill="#fff" />
                  </svg>
                  <div className="flex flex-col leading-none">
                    <span className="font-black tracking-[0.18em] text-sm" style={{ color: "var(--leather-100)", fontFamily: "Georgia, serif" }}>
                      CRAFT
                    </span>
                    <span className="font-black tracking-[0.25em] text-sm" style={{ color: "var(--leather-400)", fontFamily: "Georgia, serif" }}>
                      MEN
                    </span>
                  </div>
                </div>
              )}
            </Link>

            {description && (
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--leather-300)" }}>
                {description}
              </p>
            )}

            {/* Craft stamps */}
            <div className="flex gap-3 mt-6">
              {["100% Genuine", "Handmade", "Lifetime Warranty"].map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-1 rounded border"
                  style={{ borderColor: "var(--leather-700)", color: "var(--leather-400)" }}
                >
                  {t}
                </span>
              ))}
            </div>

            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-6">
                {socialLinks.map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                    style={{ background: "var(--leather-800)", color: "var(--leather-300)" }}
                  >
                    {SOCIAL_ICONS[platform]}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic columns */}
          {columns.map((col, ci) => (
            <div key={ci}>
              <h4
                className="font-bold mb-5 text-sm tracking-widest uppercase"
                style={{ color: "var(--leather-100)" }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link, li) => {
                  const href = Array.isArray(link.url) ? link.url[0] : link.url;
                  return (
                    <li key={li}>
                      <Link
                        href={href || "/"}
                        className="footer-col-link transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          <div>
            <h4
              className="font-bold mb-5 text-sm tracking-widest uppercase"
              style={{ color: "var(--leather-100)" }}
            >
              Contact Us
            </h4>
            <ul className="space-y-4 text-sm" style={{ color: "var(--leather-300)" }}>
              {contactInfo.address && (
                <li className="flex items-start gap-2.5">
                  <span style={{ color: "var(--leather-400)" }}><IconMapPin /></span>
                  <span className="leading-relaxed whitespace-pre-line">{contactInfo.address}</span>
                </li>
              )}
              {contactInfo.email && (
                <li className="flex items-start gap-2.5">
                  <span style={{ color: "var(--leather-400)" }}><IconMail /></span>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="transition-colors hover:text-[var(--leather-100)]"
                  >
                    {contactInfo.email}
                  </a>
                </li>
              )}
              {contactInfo.phone && (
                <li className="flex items-start gap-2.5">
                  <span style={{ color: "var(--leather-400)" }}><IconPhone /></span>
                  <a
                    href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                    className="transition-colors hover:text-[var(--leather-100)]"
                  >
                    {contactInfo.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t"
        style={{ borderColor: "var(--leather-800)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-xs flex flex-col sm:flex-row justify-between items-center gap-3"
          style={{ color: "var(--leather-600)" }}
        >
          <p>{copyrightText}</p>
          {bottom_links && bottom_links.length > 0 && (
            <div className="flex flex-wrap gap-5">
              {bottom_links.map((link, i) => {
                const href = Array.isArray(link.url) ? link.url[0] : link.url;
                return (
                  <Link
                    key={i}
                    href={href || "/"}
                    className="transition-colors hover:text-[#C8973E]"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
