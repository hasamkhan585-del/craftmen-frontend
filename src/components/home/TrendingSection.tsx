import Link from "next/link";
import Image from "next/image";
import { getTrendingProducts, formatPrice, getProductImage } from "@/lib/woocommerce";
import type { WCProduct } from "@/types/woocommerce";

const DEMO_TRENDING = [
  { id: 1, slug: "handcrafted-leather-tote",   name: "Artisan Tote Bag",       price: "$189", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80" },
  { id: 2, slug: "vintage-bifold-wallet",       name: "Vintage Bifold Wallet",  price: "$65",  img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80" },
  { id: 3, slug: "full-grain-messenger-bag",    name: "Messenger Classic",      price: "$225", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80" },
  { id: 4, slug: "braided-leather-belt",        name: "Braided Belt",           price: "$42",  img: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400&q=80" },
  { id: 5, slug: "leather-card-holder",         name: "Slim Card Holder",       price: "$38",  img: "https://images.unsplash.com/photo-1614179818749-84aaa16be1b1?w=400&q=80" },
  { id: 6, slug: "leather-journal-cover",       name: "Journal Cover",          price: "$79",  img: "https://images.unsplash.com/photo-1544816565-aa8c1166648f?w=400&q=80" },
  { id: 7, slug: "leather-watch-strap",         name: "Watch Strap — Tan",      price: "$55",  img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80" },
  { id: 8, slug: "leather-keychain",            name: "Personalised Keychain",  price: "$22",  img: "https://images.unsplash.com/photo-1619466273280-21448e99fd5d?w=400&q=80" },
];

export default async function TrendingSection() {
  let products: { id: number; slug: string; name: string; price: string; img: string }[] = DEMO_TRENDING;

  try {
    const live = await getTrendingProducts(8);
    if (live && live.length > 0) {
      products = live.map((p: WCProduct) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: formatPrice(p),
        img: getProductImage(p),
      }));
    }
  } catch {
    // WooCommerce not ready
  }

  return (
    <section className="py-20" style={{ background: "var(--leather-900)" }}>
      <div className="section-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "var(--leather-300)" }}>
              Most Loved
            </span>
            <h2
              className="mt-1"
              style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.75rem,3.5vw,2.5rem)", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}
            >
              Trending Now
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-semibold tracking-wide uppercase transition-colors"
            style={{ color: "var(--leather-300)" }}
          >
            Shop All →
          </Link>
        </div>

        {/* 4-col grid, 2 rows = 8 products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 8).map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className="group relative overflow-hidden rounded-lg block"
              style={{ aspectRatio: "3/4", background: "var(--leather-800)" }}
            >
              <Image
                src={p.img}
                alt={p.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
                unoptimized={p.img.includes("unsplash") || p.img.includes("localhost")}
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(44,24,16,0.85) 0%, transparent 50%)" }}
              />

              {/* Trending badge */}
              <div className="absolute top-2 left-2">
                <span className="trending-badge">Hot</span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-bold text-sm leading-snug" style={{ fontFamily: "Georgia, serif" }}>
                  {p.name}
                </p>
                <p className="text-sm font-bold mt-0.5" style={{ color: "var(--leather-300)" }}>
                  {p.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
