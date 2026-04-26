import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import {
  getProduct, getProducts, getProductsByCategory,
  formatPrice, isOnSale, getProductImage,
} from "@/lib/woocommerce";
import ProductDetailSection from "@/components/shop/ProductDetailSection";
import ProductTabs          from "@/components/shop/ProductTabs";
import ProductCard          from "@/components/shop/ProductCard";
import type { WCProduct }   from "@/types/woocommerce";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts({ per_page: 50 }).catch(() => []);
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug).catch(() => null);
  if (!p) return {};
  return {
    title: p.name,
    description: p.short_description?.replace(/<[^>]*>/g, "").slice(0, 160) || p.name,
    openGraph: { images: [{ url: getProductImage(p) }] },
  };
}

// Loads after main content via Suspense — doesn't block product info
async function RelatedProducts({ catSlug, excludeId }: { catSlug: string; excludeId: number }) {
  const relatedRaw = await getProductsByCategory(catSlug, { per_page: 5 }).catch(() => []);
  const related = relatedRaw.filter((p: WCProduct) => p.id !== excludeId).slice(0, 4);
  if (!related.length) return null;

  return (
    <section className="mt-16 pt-12" style={{ borderTop: "2px solid var(--leather-100)" }}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--leather-500)" }}>
            You May Also Like
          </p>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: "var(--leather-900)" }}>
            Related Products
          </h2>
        </div>
        <Link
          href={`/shop/category/${catSlug}`}
          className="text-sm font-semibold transition-colors hidden sm:block"
          style={{ color: "var(--leather-500)" }}
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map((rp: WCProduct) => <ProductCard key={rp.id} product={rp} />)}
      </div>
    </section>
  );
}

function RelatedSkeleton() {
  return (
    <section className="mt-16 pt-12" style={{ borderTop: "2px solid var(--leather-100)" }}>
      <div className="h-6 w-48 bg-gray-100 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Only fetch the product here — related products stream in separately via Suspense
  const product = await getProduct(slug).catch(() => null);
  if (!product) notFound();

  const price        = formatPrice(product);
  const onSale       = isOnSale(product);
  const regularPrice = onSale
    ? `${product.prices.currency_prefix}${(parseInt(product.prices.regular_price) / 100).toFixed(2)}${product.prices.currency_suffix}`
    : null;

  const catSlug = product.categories[0]?.slug;

  return (
    <main>
      {/* Breadcrumb */}
      <div className="py-4 border-b" style={{ borderColor: "var(--leather-100)" }}>
        <div className="section-container">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/shop">Shop</Link>
            <span>/</span>
            {product.categories[0] && (
              <>
                <Link href={`/shop/category/${product.categories[0].slug}`}>
                  {product.categories[0].name}
                </Link>
                <span>/</span>
              </>
            )}
            <span style={{ color: "var(--leather-900)" }}>{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="section-container py-12">

        {/* Product info — renders as soon as getProduct() resolves */}
        <ProductDetailSection
          product={product}
          price={price}
          regularPrice={regularPrice}
          onSale={onSale}
        />

        {/* Tabs — no API call, renders instantly */}
        <div className="mt-14 pt-10" style={{ borderTop: "2px solid var(--leather-100)" }}>
          <ProductTabs
            description={product.description}
            shortDescription={product.short_description}
            attributes={product.attributes}
            sku={product.sku || undefined}
          />
        </div>

        {/* Related products stream in after main content — never blocks product info */}
        {catSlug && (
          <Suspense fallback={<RelatedSkeleton />}>
            <RelatedProducts catSlug={catSlug} excludeId={product.id} />
          </Suspense>
        )}

      </div>
    </main>
  );
}
