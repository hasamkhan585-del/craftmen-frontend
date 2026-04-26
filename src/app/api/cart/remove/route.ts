/**
 * Proxy: DELETE /wc/store/v1/cart/items/{key}  →  POST /api/cart/remove
 * Body: { key: string }
 */
import { NextRequest, NextResponse } from "next/server";

const WC_STORE = process.env.NEXT_PUBLIC_WC_STORE_API || "http://localhost:8080/craftmen/backend/wp-json/wc/store/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    const cookie = req.headers.get("cookie");
    if (cookie) headers["Cookie"] = cookie;

    // WC Store API expects "Nonce" header (not X-WC-Store-API-Nonce)
    const nonce = req.headers.get("x-cart-nonce");
    if (nonce) headers["Nonce"] = nonce;

    // Forward Cart-Token for stateless headless cart identification
    const cartToken = req.headers.get("x-cart-token");
    if (cartToken) headers["Cart-Token"] = cartToken;

    const wcRes = await fetch(`${WC_STORE}/cart/items/${body.key}`, {
      method: "DELETE",
      headers,
    });

    const data = await wcRes.json().catch(() => ({}));
    const res = NextResponse.json(data, { status: wcRes.status });

    const setCookie = wcRes.headers.get("set-cookie");
    if (setCookie) res.headers.set("set-cookie", setCookie);
    const newNonce = wcRes.headers.get("Nonce") || wcRes.headers.get("nonce") || wcRes.headers.get("x-wc-store-api-nonce");
    if (newNonce) res.headers.set("x-wc-nonce", newNonce);
    const newCartToken = wcRes.headers.get("Cart-Token") || wcRes.headers.get("cart-token");
    if (newCartToken) res.headers.set("x-cart-token", newCartToken);

    return res;
  } catch {
    return NextResponse.json({ error: "Failed to remove cart item" }, { status: 500 });
  }
}
