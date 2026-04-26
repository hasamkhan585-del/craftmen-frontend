import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getProductsByCategory, getProductCategory, getProductCategories } from "@/lib/woocommerce";
import ProductCard from "@/components/shop/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import type { WCProductsParams } from "@/types/woocommerce";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getProductCategory(slug).catch(() => null);
  return {
    title: cat ? `${cat.name} — Leather Goods` : "Category",
    description: cat?.description || `Browse our ${cat?.name} collection`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const sortRaw = sp.sort || "date-desc";
  const [orderby, order] = sortRaw.split("-") as [WCProductsParams["orderby"], "asc" | "desc"];

  const [category, categoriesResult] = await Promise.allSettled([
    getProductCategory(slug),
    getProductCategories(true),
  ]);

  const cat        = category.status === "fulfilled" ? category.value : null;
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

  if (!cat) notFound();

  const params2: WCProductsParams = { per_page: 12, page, orderby, order };
  if (sp.min_price) params2.min_price = sp.min_price;
  if (sp.max_price) params2.max_price = sp.max_price;

  const products = await getProductsByCategory(slug, params2).catch(() => []);

  return (
    <main>
      {/* Banner */}
      <div className="page-banner">
        <div className="section-container">
          <nav className="breadcrumb mb-3">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/shop">Shop</Link>
            <span>/</span>
            <span style={{ color: "var(--leather-200)" }}>{cat.name}</span>
          </nav>
          <h1 className="page-banner-title">{cat.name}</h1>
          {cat.description && (
            <p className="page-banner-sub">{cat.description}</p>
          )}
        </div>
      </div>

      <div className="section-container py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar — 30% */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <Suspense fallback={<div className="filter-sidebar h-96 animate-pulse" />}>
              <FilterSidebar
                categories={categories}
                activeCategory={slug}
                activeSortBy={sp.sort}
                activeMinPrice={sp.min_price}
                activeMaxPrice={sp.max_price}
              />
            </Suspense>
          </div>

          {/* Products — 70% */}
          <div className="flex-1">
            <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
              {products.length} product{products.length !== 1 ? "s" : ""} in {cat.name}
            </p>

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                <div className="flex justify-center gap-3 mt-12">
                  {page > 1 && (
                    <Link
                      href={`/shop/category/${slug}?${new URLSearchParams({ ...sp, page: String(page - 1) }).toString()}`}
                      className="px-5 py-2 rounded text-sm font-semibold border"
                      style={{ borderColor: "var(--leather-300)", color: "var(--leather-700)" }}
                    >
                      ← Previous
                    </Link>
                  )}
                  {products.length === 12 && (
                    <Link
                      href={`/shop/category/${slug}?${new URLSearchParams({ ...sp, page: String(page + 1) }).toString()}`}
                      className="px-5 py-2 rounded text-sm font-semibold text-white"
                      style={{ background: "var(--leather-500)" }}
                    >
                      Next →
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-24">
                <p className="text-xl font-bold mb-2" style={{ color: "var(--leather-900)" }}>
                  No products in this category yet
                </p>
                <Link href="/shop" className="btn-primary mt-4 inline-block">
                  Browse All Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
