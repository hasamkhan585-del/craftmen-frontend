/**
 * WordPress REST API helpers
 * Uses unstable_cache to persist responses across dev-mode requests
 */

import { unstable_cache } from "next/cache";

const WP_API = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json";
const WORDPRESS_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_URL || "http://localhost:8080/craftmen/backend";

function toRestRouteUrl(endpoint: string): string {
  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const [route, query = ""] = normalized.split("?");
  return `${WORDPRESS_URL}/?rest_route=${route}${query ? `&${query}` : ""}`;
}

async function wpFetch<T>(endpoint: string): Promise<T> {
  const primaryUrl = `${WP_API}${endpoint}`;
  let res = await fetch(primaryUrl, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  // Some local WordPress setups do not serve /wp-json routes, but do serve ?rest_route=.
  if (!res.ok && res.status === 404) {
    const fallbackUrl = toRestRouteUrl(endpoint);
    res = await fetch(fallbackUrl, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
  }

  if (!res.ok) throw new Error(`WP API error: ${res.status} ${endpoint}`);
  return res.json();
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export const getPosts = unstable_cache(
  async (params?: Record<string, string | number>) => {
    const query = new URLSearchParams(
      Object.entries(params || { per_page: 12, _embed: 1 }).map(([k, v]) => [k, String(v)])
    ).toString();
    return wpFetch<WPPost[]>(`/wp/v2/posts?${query}`);
  },
  ["wp-posts"],
  { revalidate: 60, tags: ["posts"] }
);

export const getPost = unstable_cache(
  async (slug: string) => {
    const posts = await wpFetch<WPPost[]>(`/wp/v2/posts?slug=${slug}&_embed=1`);
    return posts[0] ?? null;
  },
  ["wp-post"],
  { revalidate: 60, tags: ["posts"] }
);

// ─── Pages ───────────────────────────────────────────────────────────────────

export const getPages = unstable_cache(
  async () => wpFetch<WPPage[]>("/wp/v2/pages?per_page=100"),
  ["wp-pages"],
  { revalidate: 300, tags: ["pages"] }
);

export const getPage = unstable_cache(
  async (slug: string) => {
    const pages = await wpFetch<WPPage[]>(`/wp/v2/pages?slug=${slug}`);
    return pages[0] ?? null;
  },
  ["wp-page"],
  { revalidate: 120, tags: ["pages"] }
);

// ─── Categories ──────────────────────────────────────────────────────────────

export const getCategories = unstable_cache(
  async () => wpFetch<WPCategory[]>("/wp/v2/categories?per_page=100"),
  ["wp-categories"],
  { revalidate: 300, tags: ["categories"] }
);

// ─── Search ──────────────────────────────────────────────────────────────────

export async function searchContent(query: string) {
  // Search is never cached — always fresh
  return wpFetch<WPSearchResult[]>(`/wp/v2/search?search=${encodeURIComponent(query)}&per_page=20`);
}

// ─── ACF Page Sections ────────────────────────────────────────────────────────

export const getPageSections = unstable_cache(
  async (slug: string) =>
    wpFetch<import("@/types/acf").ACFPageResponse>(`/headless/v1/page-sections/${slug}`),
  ["page-sections"],
  { revalidate: 60, tags: ["page-sections"] }
);

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WPPost {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  featured_image_url?: string;
  author_name?: string;
  categories: number[];
  yoast_head_json?: YoastSEO;
  _embedded?: {
    "wp:featuredmedia"?: [{ source_url: string; alt_text: string }];
    author?: [{ name: string; avatar_urls: Record<string, string> }];
    "wp:term"?: WPCategory[][];
  };
}

export interface WPPage {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  featured_image_url?: string;
  yoast_head_json?: YoastSEO;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  description: string;
}

export interface YoastOGImage { url: string; width?: number; height?: number; }

export interface YoastSEO {
  title?: string;
  description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: YoastOGImage[] | string;
  canonical?: string;
}

export interface WPSearchResult {
  id: number;
  title: string;
  url: string;
  type: string;
  subtype: string;
}
