"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { WCProductCategory } from "@/types/woocommerce";

interface Props {
  categories: WCProductCategory[];
  activeCategory?: string;
  activeSortBy?: string;
  activeMinPrice?: string;
  activeMaxPrice?: string;
}

const SORT_OPTIONS = [
  { label: "Newest First",      value: "date-desc" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Best Rating",       value: "rating-desc" },
  { label: "Most Popular",      value: "popularity-desc" },
];

const PRICE_RANGES = [
  { label: "Under $50",      min: "",   max: "50" },
  { label: "$50 – $100",     min: "50",  max: "100" },
  { label: "$100 – $200",    min: "100", max: "200" },
  { label: "$200 – $500",    min: "200", max: "500" },
  { label: "Over $500",      min: "500", max: "" },
];

export default function FilterSidebar({
  categories,
  activeCategory,
  activeSortBy,
  activeMinPrice,
  activeMaxPrice,
}: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  const update = useCallback(
    (updates: Record<string, string | undefined>) => {
      const sp = new URLSearchParams(params.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) sp.set(k, v); else sp.delete(k);
      });
      sp.delete("page"); // reset pagination on filter change
      router.push(`${pathname}?${sp.toString()}`);
    },
    [router, pathname, params]
  );

  const activeRange = PRICE_RANGES.find(
    (r) => r.min === (activeMinPrice || "") && r.max === (activeMaxPrice || "")
  );

  return (
    <aside className="filter-sidebar">
      {/* Sort */}
      <div className="filter-group">
        <p className="filter-group-title">Sort By</p>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="filter-checkbox">
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={activeSortBy === opt.value || (!activeSortBy && opt.value === "date-desc")}
                onChange={() => update({ sort: opt.value })}
                style={{ accentColor: "var(--leather-500)" }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="filter-group">
          <p className="filter-group-title">Categories</p>
          <div className="space-y-1">
            <label className="filter-checkbox">
              <input
                type="radio"
                name="category"
                value=""
                checked={!activeCategory}
                onChange={() => update({ category: undefined })}
                style={{ accentColor: "var(--leather-500)" }}
              />
              All Products
            </label>
            {categories.map((cat) => (
              <label key={cat.id} className="filter-checkbox">
                <input
                  type="radio"
                  name="category"
                  value={cat.slug}
                  checked={activeCategory === cat.slug}
                  onChange={() => update({ category: cat.slug })}
                  style={{ accentColor: "var(--leather-500)" }}
                />
                {cat.name}
                <span className="ml-auto text-xs" style={{ color: "var(--leather-300)" }}>
                  {cat.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="filter-group">
        <p className="filter-group-title">Price Range</p>
        <div className="space-y-1">
          <label className="filter-checkbox">
            <input
              type="radio"
              name="price"
              value="all"
              checked={!activeRange}
              onChange={() => update({ min_price: undefined, max_price: undefined })}
              style={{ accentColor: "var(--leather-500)" }}
            />
            Any Price
          </label>
          {PRICE_RANGES.map((r) => (
            <label key={r.label} className="filter-checkbox">
              <input
                type="radio"
                name="price"
                value={r.label}
                checked={activeRange?.label === r.label}
                onChange={() => update({ min_price: r.min || undefined, max_price: r.max || undefined })}
                style={{ accentColor: "var(--leather-500)" }}
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      {/* In stock only */}
      <div className="filter-group">
        <p className="filter-group-title">Availability</p>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={params.get("in_stock") === "true"}
            onChange={(e) => update({ in_stock: e.target.checked ? "true" : undefined })}
            style={{ accentColor: "var(--leather-500)" }}
          />
          In Stock Only
        </label>
      </div>

      {/* Clear */}
      <div className="p-4">
        <button
          onClick={() => router.push(pathname)}
          className="w-full text-sm font-semibold py-2 rounded transition-all border"
          style={{ borderColor: "var(--leather-200)", color: "var(--leather-600)" }}
        >
          Clear All Filters
        </button>
      </div>
    </aside>
  );
}
