"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItemImage {
  id: number;
  src: string;
  thumbnail: string;
  alt: string;
  name: string;
}

export interface CartItemPrices {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_prefix: string;
  currency_suffix: string;
  currency_minor_unit: number;
}

export interface CartItemTotals {
  line_subtotal: string;
  line_total: string;
  currency_prefix: string;
  currency_suffix: string;
  currency_minor_unit: number;
}

export interface CartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  short_description: string;
  permalink: string;
  images: CartItemImage[];
  prices: CartItemPrices;
  totals: CartItemTotals;
}

export interface CartTotals {
  total_items: string;
  total_items_tax: string;
  total_price: string;
  total_tax: string;
  total_shipping: string | null;
  currency_prefix: string;
  currency_suffix: string;
  currency_minor_unit: number;
  currency_code: string;
  currency_symbol: string;
}

export interface WCCart {
  items: CartItem[];
  totals: CartTotals;
  items_count: number;
  needs_payment: boolean;
  needs_shipping: boolean;
  has_calculated_shipping: boolean;
}

export interface CartVariation {
  attribute: string; // taxonomy (e.g. "pa_color") or attribute name
  value:     string; // term slug or plain value
}

interface CartContextValue {
  cart: WCCart | null;
  loading: boolean;
  addingId: number | null;
  error: string | null;
  itemCount: number;
  addItem: (productId: number, quantity?: number, variation?: CartVariation[]) => Promise<void>;
  updateItem: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  nonce: string;
  cartToken: string;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(amount: string, prefix: string, suffix: string, minorUnit: number): string {
  const val = parseInt(amount, 10) / Math.pow(10, minorUnit);
  return `${prefix}${val.toFixed(2)}${suffix}`;
}

export function formatCartPrice(
  amount: string,
  totals: CartTotals | CartItemPrices | CartItemTotals
): string {
  return fmtPrice(amount, totals.currency_prefix, totals.currency_suffix, totals.currency_minor_unit);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const CART_TOKEN_KEY = "wc_cart_token";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart,      setCart]      = useState<WCCart | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [addingId,  setAddingId]  = useState<number | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [nonce,     setNonce]     = useState("");
  const [cartToken, setCartToken] = useState("");
  const initialized = useRef(false);

  // Ref always holds latest token — fetchCart reads from here so it never goes stale
  const cartTokenRef = useRef("");

  // Sync state → ref and persist to localStorage
  useEffect(() => {
    cartTokenRef.current = cartToken;
    if (cartToken) {
      localStorage.setItem(CART_TOKEN_KEY, cartToken);
    }
  }, [cartToken]);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reqHeaders: Record<string, string> = {};
      // Re-send Cart-Token on subsequent fetches so WC identifies the same cart
      const storedToken = cartTokenRef.current;
      if (storedToken) reqHeaders["x-cart-token"] = storedToken;

      const res = await fetch("/api/cart", { credentials: "include", cache: "no-store", headers: reqHeaders });
      // Proxy now returns x-wc-nonce (mapped from WC's "Nonce" header)
      const newNonce = res.headers.get("x-wc-nonce");
      if (newNonce) setNonce(newNonce);
      const newToken = res.headers.get("x-cart-token");
      if (newToken) setCartToken(newToken);

      if (!res.ok) throw new Error("Cart unavailable");
      const data: WCCart = await res.json();
      setCart(data);
    } catch {
      // Cart not available (WC not installed yet) — set empty cart
      setCart({ items: [], totals: { total_items: "0", total_items_tax: "0", total_price: "0", total_tax: "0", total_shipping: null, currency_prefix: "$", currency_suffix: "", currency_minor_unit: 2, currency_code: "USD", currency_symbol: "$" }, items_count: 0, needs_payment: false, needs_shipping: false, has_calculated_shipping: false });
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: restore cart token from localStorage, then fetch cart with it
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const stored = localStorage.getItem(CART_TOKEN_KEY) ?? "";
    if (stored) {
      // Set both ref and state synchronously before the async fetchCart runs
      cartTokenRef.current = stored;
      setCartToken(stored);
    }
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (productId: number, quantity = 1, variation?: CartVariation[]) => {
    setAddingId(productId);
    setError(null);
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(nonce ? { "X-Cart-Nonce": nonce } : {}),
          ...(cartToken ? { "X-Cart-Token": cartToken } : {}),
        },
        body: JSON.stringify({
          id: productId,
          quantity,
          ...(variation?.length ? { variation } : {}),
        }),
      });

      const newNonce = res.headers.get("x-wc-nonce");
      if (newNonce) setNonce(newNonce);
      const newToken = res.headers.get("x-cart-token");
      if (newToken) setCartToken(newToken);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || "Failed to add item");
      }

      // Refresh full cart after add
      await fetchCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  }, [nonce, cartToken, fetchCart]);

  const updateItem = useCallback(async (key: string, quantity: number) => {
    setError(null);
    try {
      const res = await fetch("/api/cart/update", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(nonce ? { "X-Cart-Nonce": nonce } : {}),
          ...(cartToken ? { "X-Cart-Token": cartToken } : {}),
        },
        body: JSON.stringify({ key, quantity }),
      });

      const newNonce = res.headers.get("x-wc-nonce");
      if (newNonce) setNonce(newNonce);
      const newToken = res.headers.get("x-cart-token");
      if (newToken) setCartToken(newToken);

      if (!res.ok) throw new Error("Failed to update quantity");
      await fetchCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update cart");
    }
  }, [nonce, cartToken, fetchCart]);

  const removeItem = useCallback(async (key: string) => {
    setError(null);
    try {
      const res = await fetch("/api/cart/remove", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(nonce ? { "X-Cart-Nonce": nonce } : {}),
          ...(cartToken ? { "X-Cart-Token": cartToken } : {}),
        },
        body: JSON.stringify({ key }),
      });

      const newNonce = res.headers.get("x-wc-nonce");
      if (newNonce) setNonce(newNonce);
      const newToken = res.headers.get("x-cart-token");
      if (newToken) setCartToken(newToken);

      if (!res.ok) throw new Error("Failed to remove item");
      await fetchCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove item");
    }
  }, [nonce, cartToken, fetchCart]);

  const clearCart = useCallback(async () => {
    setError(null);
    // Optimistically clear cart state immediately so UI reflects empty cart at once
    setCart((prev) =>
      prev
        ? { ...prev, items: [], items_count: 0, needs_payment: false, needs_shipping: false }
        : null
    );
    // Remove stored token so a fresh cart session starts after order
    localStorage.removeItem(CART_TOKEN_KEY);
    cartTokenRef.current = "";
    setCartToken("");
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...(nonce ? { "X-Cart-Nonce": nonce } : {}),
          ...(cartToken ? { "X-Cart-Token": cartToken } : {}),
        },
      });
      await fetchCart();
    } catch {
      setError("Failed to clear cart");
    }
  }, [nonce, cartToken, fetchCart]);

  const itemCount = cart?.items_count ?? cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{
      cart, loading, addingId, error, itemCount,
      addItem, updateItem, removeItem, clearCart,
      refreshCart: fetchCart, nonce, cartToken,
    }}>
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
