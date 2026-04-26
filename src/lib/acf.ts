/**
 * ACF REST API helpers — fetches data from headless-wp-config plugin endpoints
 *
 * Uses shared filesystem cache so slow ACF endpoints (4–8 s on XAMPP) don't
 * block every page request. A timeout result is cached for 2 min so the 8 s
 * abort delay only happens once per worker restart.
 */

import { cacheGet, cacheSet } from "./disk-cache";
import { ACFPageResponse, ACFHeaderOptions, ACFFooterOptions } from "@/types/acf";

const WP_API = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json";

async function acfFetch<T>(endpoint: string, ttl = 300): Promise<T | null> {
  const key = `acf:${endpoint}`;
  const cached = cacheGet<T>(key);
  if (cached !== undefined) return cached;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${WP_API}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      next:   { revalidate: 300 },
      signal: ctrl.signal,
    });
    if (!res.ok) { cacheSet(key, null, 120); return null; }
    const data: T = await res.json();
    cacheSet(key, data, ttl);
    return data;
  } catch {
    cacheSet(key, null, 120);
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function getACFPage(slug: string): Promise<ACFPageResponse | null> {
  return acfFetch<ACFPageResponse>(`/headless/v1/acf/page/${slug}`);
}

export async function getHeaderOptions(): Promise<ACFHeaderOptions | null> {
  return acfFetch<ACFHeaderOptions>("/headless/v1/acf/options/header");
}

export async function getFooterOptions(): Promise<ACFFooterOptions | null> {
  return acfFetch<ACFFooterOptions>("/headless/v1/acf/options/footer");
}
