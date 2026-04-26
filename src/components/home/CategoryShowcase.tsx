"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { WCProduct } from "@/types/woocommerce";
import { formatPrice, getProductImage } from "@/lib/woocommerce-utils";

interface Props {
  products: WCProduct[];
}

function ProductSlider({ products }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (products.length < 2) return;
    const t = setInterval(() => setActive((p) => (p + 1) % products.length), 3200);
    return () => clearInterval(t);
  }, [products.length]);

  if (products.length === 0) return null;

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-xl">
      {products.map((p, i) => {
        const img = getProductImage(p);
        const price = formatPrice(p);
        return (
          <div
            key={p.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            {/* Full-slide link — covers the entire image area */}
            <Link href={`/shop/${p.slug}`} className="absolute inset-0 z-0" aria-label={p.name} />

            <Image
              src={img}
              alt={p.images[0]?.alt || p.name}
              fill
              className="object-cover"
              unoptimized={img.includes("localhost")}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(44,24,16,0.8) 0%, transparent 55%)" }} />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 relative">
              <p className="font-bold text-lg line-clamp-1" style={{ color: "var(--leather-700)" }}>{p.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold" style={{ color: "var(--leather-300)" }}>{price}</span>
                <Link
                  href={`/shop/${p.slug}`}
                  className="text-xs uppercase tracking-widest font-semibold px-3 py-1.5 rounded transition-all"
                  style={{ background: "var(--leather-500)", color: "#fff" }}
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Dots */}
      {products.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: i === active ? "var(--leather-300)" : "rgba(255,255,255,0.4)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryShowcase({ products }: Props) {
  return (
    <section className="py-20" style={{ background: "var(--leather-50)" }}>
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left: text content */}
          <div>
            <span className="sec-label">Featured</span>
            <h2 className="sec-title mt-1 mb-5" style={{ color: "#8b4513" }}>
              Every Stitch Tells<br />
              <span>a Story</span>
            </h2>
            <p className="sec-desc mb-8">
              Our craftsmen have been perfecting the art of leatherwork for over 15 years.
              Using only premium full-grain hides sourced from trusted tanneries,
              each product is built to develop a rich patina over time — becoming
              uniquely yours with every use.
            </p>

            <ul className="space-y-3 mb-10">
              {[
                "Full-grain vegetable-tanned leather",
                "Hand-stitched with waxed linen thread",
                "Solid brass hardware — no zinc alloys",
                "Free personalisation on all orders",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--leather-500)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex gap-4">
              <Link href="/shop" className="btn-primary">Shop Now</Link>
              <Link href="/about" className="btn-outline">Our Story</Link>
            </div>
          </div>

          {/* Right: live product slider */}
          <ProductSlider products={products} />
        </div>
      </div>
    </section>
  );
}
