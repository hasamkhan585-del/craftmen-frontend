/**
 * Pure client-safe WooCommerce helpers — no Node.js imports.
 * Import these in both server and client components.
 * Use woocommerce.ts (server-only) for data-fetching functions.
 */

import type { WCProduct } from "@/types/woocommerce";

export function formatPrice(product: WCProduct): string {
  const { currency_prefix, currency_suffix, price } = product.prices;
  return `${currency_prefix}${(parseInt(price) / 100).toFixed(2)}${currency_suffix}`;
}

export function formatRegularPrice(product: WCProduct): string {
  const { currency_prefix, currency_suffix, regular_price } = product.prices;
  if (!regular_price) return "";
  return `${currency_prefix}${(parseInt(regular_price) / 100).toFixed(2)}${currency_suffix}`;
}

export function isOnSale(product: WCProduct): boolean {
  return product.on_sale && !!product.prices.sale_price &&
    product.prices.sale_price !== product.prices.regular_price;
}

export function getProductImage(product: WCProduct, index = 0): string {
  return product.images?.[index]?.src || "/images/product-placeholder.jpg";
}

export function getProductThumbnail(product: WCProduct, index = 0): string {
  return product.images?.[index]?.thumbnail ||
    product.images?.[index]?.src ||
    "/images/product-placeholder.jpg";
}
