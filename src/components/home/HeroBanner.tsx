import Link from "next/link";
import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden" style={{ height: "700px", background: "#f5f0eb" }}>
      {/* Full-width background — object-center so bag + camera below display fully */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://craftmen.fr/wp-content/uploads/2026/04/Home-Bnner-Desktop-1.webp"
          alt="Handcrafted leather bag"
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
      </div>

      {/* Text card pinned to the RIGHT */}
      <div className="relative z-10 flex items-center justify-end h-full px-4 sm:px-8 lg:px-16">
        <div
          className="w-full rounded-2xl"
          style={{
            maxWidth: "650px",
            padding: "2rem",
            background: "rgba(240, 234, 224, 0.92)",
            backdropFilter: "blur(2px)",
          }}
        >
          <span
            className="text-xs font-bold tracking-[0.25em] uppercase mb-5 block"
            style={{ color: "var(--leather-600)" }}
          >
            Handmade by Master Craftsmen
          </span>

          <h1
            className="font-black leading-tight mb-6"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
              color: "var(--leather-900)",
            }}
          >
            Leather Goods<br />
            <span style={{ color: "var(--leather-600)" }}>Crafted to Last</span><br />
            a Lifetime
          </h1>

          <p
            className="text-base leading-relaxed mb-10"
            style={{ color: "var(--leather-700)", maxWidth: "400px" }}
          >
            Each piece is individually hand-stitched using only the finest full-grain leather,
            aged brass hardware, and waxed linen thread. Products that improve with age —
            just like the traditions behind them.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/shop"
              className="inline-block text-center font-bold text-sm uppercase tracking-widest px-8 py-4 rounded transition-all"
              style={{ background: "var(--leather-800)", color: "#fff" }}
            >
              Explore Collection
            </Link>
            <Link
              href="/about"
              className="inline-block text-center font-semibold text-sm uppercase tracking-widest px-8 py-4 rounded border-2 transition-all"
              style={{ borderColor: "var(--leather-700)", color: "var(--leather-800)" }}
            >
              Our Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
