import Link from "next/link";
import Image from "next/image";
import { getProductCategories } from "@/lib/woocommerce";

const TARGET_SLUGS = ["role-top-bag", "buffle-bag", "leather-canvas-bag"];

const FALLBACK_NAMES: Record<string, string> = {
  "role-top-bag":      "Role Top Bag",
  "buffle-bag":        "Duffle Bag",
  "leather-canvas-bag":"Leather Canvas Bag",
};

// Static fallback images shown when WP category has no image
const FALLBACK_IMAGES: Record<string, string> = {
  "role-top-bag":       "https://craftmen.fr/demo/wp-content/uploads/2026/04/01-1.png",
  "buffle-bag":         "https://craftmen.fr/demo/wp-content/uploads/2026/04/ChatGPT-Image-Feb-7-2026-09_43_23-PM-1-1.png",
  "leather-canvas-bag": "https://craftmen.fr/demo/wp-content/uploads/2026/04/ChatGPT-Image-Feb-8-2026-02_37_39-PM-1.png",
};

const GRADIENTS = [
  "linear-gradient(135deg, var(--leather-700), var(--leather-500))",
  "linear-gradient(135deg, var(--leather-600), var(--leather-400))",
  "linear-gradient(135deg, var(--leather-800), var(--leather-600))",
];

interface CatItem {
  slug: string;
  name: string;
  count: number;
  image: { src: string; alt: string } | null;
}

export default async function CategoryGrid() {
  // Build the 3 items, filling in fallbacks for missing categories
  const items: CatItem[] = TARGET_SLUGS.map((slug) => ({
    slug,
    name: FALLBACK_NAMES[slug],
    count: 0,
    image: null,
  }));

  try {
    const wpCats = await getProductCategories(false);
    for (const item of items) {
      const match = wpCats.find((c) => c.slug === item.slug);
      if (match) {
        item.name  = match.name;
        item.count = match.count;
        item.image = match.image ? { src: match.image.src, alt: match.image.alt || match.name } : null;
      }
    }
  } catch {
    // WooCommerce unavailable — show fallback names with gradient backgrounds
  }

  return (
    <section className="py-20" style={{ background: "var(--leather-50)" }}>
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="sec-label">Collections</span>
          <h2 className="sec-title mt-1">Shop by Category</h2>
          <p className="sec-desc mx-auto mt-3">
            Explore our handcrafted leather collections, each piece made with meticulous
            attention to detail and quality materials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((cat, idx) => (
            <Link
              key={cat.slug}
              href={`/shop/category/${cat.slug}`}
              className="cat-card group"
              style={{ height: "320px" }}
            >
              {(() => {
                const imgSrc = cat.image?.src || FALLBACK_IMAGES[cat.slug];
                const imgAlt = cat.image?.alt || cat.name;
                return imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={imgAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0" style={{ background: GRADIENTS[idx] }} />
                );
              })()}
              <div className="cat-card-overlay" />
              <div className="cat-card-arrow">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <div className="cat-card-body">
                <p className="cat-card-name">{cat.name}</p>
                {cat.count > 0 && (
                  <p className="cat-card-count">{cat.count} products</p>
                )}
                <p className="text-xs mt-2 font-medium" style={{ color: "var(--leather-200)" }}>
                  View Category →
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/shop" className="btn-outline">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
