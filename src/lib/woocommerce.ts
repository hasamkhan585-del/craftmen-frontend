/**
 * WooCommerce product helpers — uses a custom lightweight PHP endpoint
 * (/headless/v1/products) instead of the WC Store API, which is too slow
 * on XAMPP (10 s+ per request vs ~4-6 s for the headless endpoint).
 *
 * All responses are cached in a shared filesystem cache (disk-cache.ts) so
 * every worker process and every hot-reload benefits from prior fetches.
 */

import { cacheGet, cacheSet, cacheKeys } from "./disk-cache";
import type { WCProduct, WCProductCategory, WCProductsParams } from "@/types/woocommerce";

const HWP_API =
  (process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json") +
  "/headless/v1";

// ─── Fetch helpers ─────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, timeoutMs = 12000): Promise<Response> {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: { "Content-Type": "application/json" },
      next:    { revalidate: 300 },
      signal:  ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function hwpFetch<T>(endpoint: string, ttl = 60): Promise<T> {
  const key    = `hwp:${endpoint}`;
  const cached = cacheGet<T>(key);
  if (cached !== undefined) return cached as T;

  const url = `${HWP_API}${endpoint}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Headless API ${res.status}: ${url}`);

  const data: T = await res.json();
  cacheSet(key, data, ttl);

  // Pre-warm individual slug cache entries so product detail pages are instant.
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0] as Record<string, unknown>;
    if (typeof first.slug === "string" && typeof first.id === "number") {
      for (const p of data as WCProduct[]) {
        if (!p.slug) continue;
        const slugKey = `hwp:/products?slug=${p.slug}&per_page=1`;
        if (cacheGet(slugKey) === undefined) {
          cacheSet(slugKey, [p], Math.max(ttl, 600));
        }
      }
    }
  }

  return data;
}

// ─── Query-string builder ──────────────────────────────────────────────────

function buildQs(params: Record<string, string | number | boolean | undefined>): string {
  return new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(params: WCProductsParams = {}): Promise<WCProduct[]> {
  const qs = buildQs({ per_page: 12, orderby: "date", order: "desc", ...params });
  return hwpFetch<WCProduct[]>(`/products?${qs}`);
}

export async function getProduct(slug: string): Promise<WCProduct | null> {
  const slugKey = `hwp:/products?slug=${slug}&per_page=1`;

  // 1. Pre-warmed slug cache — populated whenever any listing is fetched.
  const prewarmed = cacheGet<WCProduct[]>(slugKey);
  if (prewarmed !== undefined) return prewarmed?.[0] ?? null;

  // 2. Scan every other cached product listing (instant — no network call).
  for (const key of cacheKeys()) {
    if (!key.startsWith("hwp:/products") || key.includes("slug=")) continue;
    const listing = cacheGet<WCProduct[]>(key);
    if (!Array.isArray(listing)) continue;
    const found = listing.find((p) => p.slug === slug);
    if (found) {
      cacheSet(slugKey, [found], 600);
      return found;
    }
  }

  // 3. Cold load: fetch the 50 most recent products then search within.
  //    A per-slug API call (?slug=X) is 3x slower on XAMPP so we avoid it.
  try {
    const products = await hwpFetch<WCProduct[]>(
      `/products?${buildQs({ per_page: 50, orderby: "date", order: "desc" })}`
    );
    return products.find((p) => p.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function getProductById(id: number): Promise<WCProduct | null> {
  // Scan listings cache first (avoids a separate API call)
  for (const key of cacheKeys()) {
    if (!key.startsWith("hwp:/products")) continue;
    const listing = cacheGet<WCProduct[]>(key);
    if (!Array.isArray(listing)) continue;
    const found = listing.find((p) => p.id === id);
    if (found) return found;
  }
  return null;
}

export async function getRecentProducts(count = 4): Promise<WCProduct[]> {
  return hwpFetch<WCProduct[]>(`/products?${buildQs({ per_page: count, orderby: "date", order: "desc" })}`);
}

export async function getTrendingProducts(count = 8): Promise<WCProduct[]> {
  return hwpFetch<WCProduct[]>(`/products?${buildQs({ per_page: count, orderby: "popularity", order: "desc" })}`);
}

export async function getFeaturedProducts(count = 6): Promise<WCProduct[]> {
  return hwpFetch<WCProduct[]>(`/products?${buildQs({ per_page: count, featured: true, orderby: "date", order: "desc" })}`);
}

export async function getProductsByCategory(
  categorySlug: string,
  params: WCProductsParams = {}
): Promise<WCProduct[]> {
  const qs = buildQs({ per_page: 12, ...params, category: categorySlug });
  return hwpFetch<WCProduct[]>(`/products?${qs}`);
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getProductCategories(hideEmpty = true): Promise<WCProductCategory[]> {
  return hwpFetch<WCProductCategory[]>(
    `/product-categories?${buildQs({ per_page: 50, hide_empty: hideEmpty, orderby: "count", order: "desc" })}`,
    600
  );
}

export async function getProductCategory(slug: string): Promise<WCProductCategory | null> {
  const cats = await hwpFetch<WCProductCategory[]>(
    `/product-categories?${buildQs({ slug, per_page: 1 })}`,
    600
  );
  return cats[0] ?? null;
}

// ─── Price / image helpers (re-exported from client-safe utils) ───────────────
export {
  formatPrice,
  formatRegularPrice,
  isOnSale,
  getProductImage,
  getProductThumbnail,
} from "./woocommerce-utils";
