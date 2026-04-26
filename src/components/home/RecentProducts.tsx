import Link from "next/link";
import Image from "next/image";
import { getRecentProducts, formatPrice, isOnSale, getProductImage } from "@/lib/woocommerce";
import type { WCProduct } from "@/types/woocommerce";

// Demo products fallback
const DEMO_PRODUCTS: Partial<WCProduct>[] = [
  {
    id: 1, slug: "handcrafted-leather-tote", name: "Handcrafted Leather Tote Bag",
    on_sale: false,
    prices: { price: "18900", regular_price: "18900", sale_price: "", currency_prefix: "$", currency_suffix: "", currency_minor_unit: 2, currency_decimal_separator: ".", currency_thousand_separator: ",", currency_code: "USD", currency_symbol: "$", price_range: null },
    images: [{ id: 1, src: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80", thumbnail: "", srcset: "", sizes: "", name: "", alt: "Leather tote" }],
    average_rating: "4.8", review_count: 32,
  },
  {
    id: 2, slug: "vintage-bifold-wallet", name: "Vintage Bifold Wallet",
    on_sale: true,
    prices: { price: "6500", regular_price: "8900", sale_price: "6500", currency_prefix: "$", currency_suffix: "", currency_minor_unit: 2, currency_decimal_separator: ".", currency_thousand_separator: ",", currency_code: "USD", currency_symbol: "$", price_range: null },
    images: [{ id: 2, src: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80", thumbnail: "", srcset: "", sizes: "", name: "", alt: "Bifold wallet" }],
    average_rating: "4.9", review_count: 57,
  },
  {
    id: 3, slug: "full-grain-messenger-bag", name: "Full-Grain Messenger Bag",
    on_sale: false,
    prices: { price: "22500", regular_price: "22500", sale_price: "", currency_prefix: "$", currency_suffix: "", currency_minor_unit: 2, currency_decimal_separator: ".", currency_thousand_separator: ",", currency_code: "USD", currency_symbol: "$", price_range: null },
    images: [{ id: 3, src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80", thumbnail: "", srcset: "", sizes: "", name: "", alt: "Messenger bag" }],
    average_rating: "5.0", review_count: 19,
  },
  {
    id: 4, slug: "braided-leather-belt", name: "Braided Leather Belt",
    on_sale: true,
    prices: { price: "4200", regular_price: "5500", sale_price: "4200", currency_prefix: "$", currency_suffix: "", currency_minor_unit: 2, currency_decimal_separator: ".", currency_thousand_separator: ",", currency_code: "USD", currency_symbol: "$", price_range: null },
    images: [{ id: 4, src: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500&q=80", thumbnail: "", srcset: "", sizes: "", name: "", alt: "Leather belt" }],
    average_rating: "4.7", review_count: 24,
  },
];

function StarRating({ rating }: { rating: string }) {
  const r = parseFloat(rating || "0");
  return (
    <div className="product-card-rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(r) ? "fill-current" : "fill-none stroke-current"}`} viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth={1.5} />
        </svg>
      ))}
      <span className="ml-1 text-gray-500">({rating})</span>
    </div>
  );
}

function priceFromDemo(p: Partial<WCProduct>): string {
  const px = p.prices!;
  const val = parseInt(px.price) / 100;
  return `${px.currency_prefix}${val.toFixed(2)}`;
}

function regularPriceFromDemo(p: Partial<WCProduct>): string {
  const px = p.prices!;
  if (!px.regular_price || px.regular_price === px.price) return "";
  const val = parseInt(px.regular_price) / 100;
  return `${px.currency_prefix}${val.toFixed(2)}`;
}

export default async function RecentProducts() {
  let products: Partial<WCProduct>[] = DEMO_PRODUCTS;
  let isLive = false;

  try {
    const live = await getRecentProducts(4);
    if (live && live.length > 0) { products = live; isLive = true; }
  } catch {
    // WooCommerce not yet installed
  }

  return (
    <section className="py-20" style={{ background: "var(--leather-900)" }}>
      <div className="section-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="sec-label" style={{ color: "var(--leather-300)" }}>New Arrivals</span>
            <h2 className="sec-title mt-1" style={{ color: "#fff" }}>Recently Added</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold tracking-wide uppercase transition-colors" style={{ color: "var(--leather-300)" }}>
            View All →
          </Link>
        </div>

        {/* Product grid — 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const price   = isLive ? formatPrice(p as WCProduct)     : priceFromDemo(p);
            const imgSrc  = isLive ? getProductImage(p as WCProduct) : (p.images?.[0]?.src || "");
            const onSale  = isLive ? isOnSale(p as WCProduct)           : !!p.on_sale;

            return (
              <Link key={p.id} href={`/shop/${p.slug}`} className="product-card block">
                <div className="product-card-img">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={p.name || "Product"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 25vw"
                      unoptimized={imgSrc.includes("unsplash") || imgSrc.includes("localhost")}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--leather-100)" }}>
                      <span className="text-3xl">🧳</span>
                    </div>
                  )}
                  {onSale && <span className="product-card-badge">Sale</span>}
                </div>
                <div className="product-card-body">
                  <p className="product-card-name">{p.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="product-card-price">{price}</span>
                    {(isLive ? (p as WCProduct).prices.regular_price !== (p as WCProduct).prices.price : !!regularPriceFromDemo(p)) && (
                      <span className="product-card-price-old">
                        {isLive ? `$${(parseInt((p as WCProduct).prices.regular_price) / 100).toFixed(2)}` : regularPriceFromDemo(p)}
                      </span>
                    )}
                  </div>
                  <span className="product-card-btn">View Product</span>
                </div>
              </Link>
            );
          })}
        </div>

        {!isLive && (
          <p className="text-center text-xs mt-8" style={{ color: "var(--leather-400)" }}>
            Showing demo products — connect WooCommerce to display real products
          </p>
        )}
      </div>
    </section>
  );
}
