import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import FilterSidebar from "@/components/shop/FilterSidebar";
import ProductCard from "@/components/shop/ProductCard";
import { getProducts, getProductCategories } from "@/lib/woocommerce";
import type { WCProductsParams } from "@/types/woocommerce";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop Leather Goods",
  description: "Browse our full collection of handcrafted leather bags, wallets, belts and accessories.",
};

const DEMO_PRODUCTS = [
  { id: 1, slug: "handcrafted-leather-tote", name: "Artisan Tote Bag", on_sale: false, prices: { price: "18900", regular_price: "18900", sale_price: "", currency_prefix: "$", currency_suffix: "", currency_minor_unit: 2, currency_decimal_separator: ".", currency_thousand_separator: ",", currency_code: "USD", currency_symbol: "$", price_range: null }, images: [{ id: 1, src: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", thumbnail: "", srcset: "", sizes: "", name: "", alt: "Leather tote" }], average_rating: "4.8", review_count: 32, is_in_stock: true, is_on_backorder: false, is_purchasable: true, categories: [], tags: [], attributes: [], variations: [], has_options: false, sold_individually: false, quantity_limit: 10, low_stock_remaining: null, type: "simple", variation: "", sku: "", parent: 0, permalink: "", short_description: "", description: "", price_html: "", add_to_cart: { text: "Add to cart", description: "", url: "", minimum: 1, maximum: 9999, multiple_of: 1 } },
  { id: 2, slug: "vintage-bifold-wallet", name: "Vintage Bifold Wallet", on_sale: true, prices: { price: "6500", regular_price: "8900", sale_price: "6500", currency_prefix: "$", currency_suffix: "", currency_minor_unit: 2, currency_decimal_separator: ".", currency_thousand_separator: ",", currency_code: "USD", currency_symbol: "$", price_range: null }, images: [{ id: 2, src: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80", thumbnail: "", srcset: "", sizes: "", name: "", alt: "Bifold wallet" }], average_rating: "4.9", review_count: 57, is_in_stock: true, is_on_backorder: false, is_purchasable: true, categories: [], tags: [], attributes: [], variations: [], has_options: false, sold_individually: false, quantity_limit: 10, low_stock_remaining: null, type: "simple", variation: "", sku: "", parent: 0, permalink: "", short_description: "", description: "", price_html: "", add_to_cart: { text: "Add to cart", description: "", url: "", minimum: 1, maximum: 9999, multiple_of: 1 } },
  { id: 3, slug: "full-grain-messenger-bag", name: "Full-Grain Messenger Bag", on_sale: false, prices: { price: "22500", regular_price: "22500", sale_price: "", currency_prefix: "$", currency_suffix: "", currency_minor_unit: 2, currency_decimal_separator: ".", currency_thousand_separator: ",", currency_code: "USD", currency_symbol: "$", price_range: null }, images: [{ id: 3, src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80", thumbnail: "", srcset: "", sizes: "", name: "", alt: "Messenger bag" }], average_rating: "5.0", review_count: 19, is_in_stock: true, is_on_backorder: false, is_purchasable: true, categories: [], tags: [], attributes: [], variations: [], has_options: false, sold_individually: false, quantity_limit: 10, low_stock_remaining: null, type: "simple", variation: "", sku: "", parent: 0, permalink: "", short_description: "", description: "", price_html: "", add_to_cart: { text: "Add to cart", description: "", url: "", minimum: 1, maximum: 9999, multiple_of: 1 } },
  { id: 4, slug: "braided-leather-belt", name: "Braided Leather Belt", on_sale: true, prices: { price: "4200", regular_price: "5500", sale_price: "4200", currency_prefix: "$", currency_suffix: "", currency_minor_unit: 2, currency_decimal_separator: ".", currency_thousand_separator: ",", currency_code: "USD", currency_symbol: "$", price_range: null }, images: [{ id: 4, src: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400&q=80", thumbnail: "", srcset: "", sizes: "", name: "", alt: "Leather belt" }], average_rating: "4.7", review_count: 24, is_in_stock: true, is_on_backorder: false, is_purchasable: true, categories: [], tags: [], attributes: [], variations: [], has_options: false, sold_individually: false, quantity_limit: 10, low_stock_remaining: null, type: "simple", variation: "", sku: "", parent: 0, permalink: "", short_description: "", description: "", price_html: "", add_to_cart: { text: "Add to cart", description: "", url: "", minimum: 1, maximum: 9999, multiple_of: 1 } },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp         = await searchParams;
  const page       = parseInt(sp.page || "1");
  const perPage    = 12;
  const sortRaw    = sp.sort || "date-desc";
  const [orderby, order] = sortRaw.split("-") as [WCProductsParams["orderby"], "asc" | "desc"];

  const params: WCProductsParams = {
    per_page: perPage,
    page,
    orderby: orderby || "date",
    order:   order   || "desc",
  };
  if (sp.category)  params.category  = sp.category;
  if (sp.min_price) params.min_price = sp.min_price;
  if (sp.max_price) params.max_price = sp.max_price;
  if (sp.search)    params.search    = sp.search;
  if (sp.on_sale)   params.on_sale   = true;

  const [productsResult, categoriesResult] = await Promise.allSettled([
    getProducts(params),
    getProductCategories(true),
  ]);

  const liveProducts   = productsResult.status   === "fulfilled" ? productsResult.value   : null;
  const liveCategories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

  // Use demo products if WooCommerce not connected
  const products   = (liveProducts && liveProducts.length > 0) ? liveProducts   : DEMO_PRODUCTS as never[];
  const categories = liveCategories;
  const isDemo     = !liveProducts || liveProducts.length === 0;

  return (
    <main>
      {/* Page Banner */}
      <div className="page-banner">
        <div className="section-container">
          <nav className="breadcrumb mb-3">
            <Link href="/">Home</Link>
            <span>/</span>
            <span style={{ color: "var(--leather-200)" }}>Shop</span>
          </nav>
          <h1 className="page-banner-title">Our Collection</h1>
          <p className="page-banner-sub">Handcrafted leather goods — made to last a lifetime</p>
        </div>
      </div>

      <div className="section-container py-10">
        {/* Mobile filter toggle note */}
        {sp.search && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ background: "var(--leather-100)", color: "var(--leather-800)" }}>
            Showing results for: <strong>&ldquo;{sp.search}&rdquo;</strong>
          </div>
        )}

        {/* 30 / 70 layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar — 30% */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <Suspense fallback={<div className="filter-sidebar h-96 animate-pulse" />}>
              <FilterSidebar
                categories={categories}
                activeCategory={sp.category}
                activeSortBy={sp.sort}
                activeMinPrice={sp.min_price}
                activeMaxPrice={sp.max_price}
              />
            </Suspense>
          </div>

          {/* Product grid — 70% */}
          <div className="flex-1 min-w-0">
            {/* Results info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {isDemo ? "Showing demo products" : `${products.length} products`}
                {sp.category && ` in "${sp.category}"`}
              </p>
            </div>

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {!isDemo && (
                  <div className="flex justify-center gap-3 mt-12">
                    {page > 1 && (
                      <Link
                        href={`/shop?${new URLSearchParams({ ...sp, page: String(page - 1) }).toString()}`}
                        className="px-5 py-2 rounded text-sm font-semibold border transition-all"
                        style={{ borderColor: "var(--leather-300)", color: "var(--leather-700)" }}
                      >
                        ← Previous
                      </Link>
                    )}
                    {products.length === perPage && (
                      <Link
                        href={`/shop?${new URLSearchParams({ ...sp, page: String(page + 1) }).toString()}`}
                        className="px-5 py-2 rounded text-sm font-semibold text-white transition-all"
                        style={{ background: "var(--leather-500)" }}
                      >
                        Next →
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🧳</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--leather-900)" }}>
                  No products found
                </h3>
                <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                  Try adjusting your filters or browse all categories.
                </p>
                <Link href="/shop" className="btn-primary">View All Products</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
