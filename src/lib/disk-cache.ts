/**
 * Two-layer cache: in-memory (instant) + disk (shared across all worker processes).
 *
 * Why two layers?
 * - Next.js dev mode runs multiple Node.js worker processes; globalThis is per-process.
 * - unstable_cache is cleared on every dev-mode request by design.
 * - A JSON file on disk is the only store ALL workers can share.
 *
 * The in-memory layer prevents 5+ readFileSync calls per page (each ~100 ms on
 * Windows). The disk layer is re-read every 10 s so workers pick up each other's
 * writes within a short window.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const CACHE_DIR  = join(process.cwd(), ".next", "server");
const CACHE_FILE = join(CACHE_DIR, "wp-api-cache.json");
const MEM_TTL_MS = 60_000; // re-sync from disk every 60 s

type CacheEntry = { data: unknown; expires: number };
type CacheStore = Record<string, CacheEntry>;

let _mem: CacheStore = {};
let _memAt = 0;

function readStore(): CacheStore {
  const now = Date.now();
  if (_memAt && now - _memAt < MEM_TTL_MS) return _mem;
  try {
    _mem = JSON.parse(readFileSync(CACHE_FILE, "utf8")) as CacheStore;
  } catch {
    _mem = {};
  }
  _memAt = now;
  return _mem;
}

function writeStore(store: CacheStore): void {
  _mem = store;
  _memAt = Date.now();
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify(store));
  } catch { /* best-effort */ }
}

// ─── Public API ────────────────────────────────────────────────────────────

/** Returns undefined on cache miss, null or T on cache hit (null is a valid cached value). */
export function cacheGet<T>(key: string): T | null | undefined {
  const store = readStore();
  const entry = store[key];
  if (!entry) return undefined;
  if (Date.now() > entry.expires) return undefined;
  return entry.data as T | null;
}

/** Returns all non-expired cache keys. */
export function cacheKeys(): string[] {
  const store = readStore();
  const now = Date.now();
  return Object.keys(store).filter((k) => store[k].expires > now);
}

export function cacheSet(key: string, data: unknown, ttlSeconds: number): void {
  const store = readStore();
  const now = Date.now();
  // Evict expired entries while the file is open
  for (const k of Object.keys(store)) {
    if (store[k].expires < now) delete store[k];
  }
  store[key] = { data, expires: now + ttlSeconds * 1000 };
  writeStore(store);
}
