/**
 * Proxy: GET /wc/store/v1/cart  →  GET /api/cart
 * Proxy: DELETE all             →  DELETE /api/cart
 * Forwards WC session cookies both ways so the browser maintains the WooCommerce session.
 */
import { NextRequest, NextResponse } from "next/server";

const WC_STORE = process.env.NEXT_PUBLIC_WC_STORE_API || "http://localhost:8080/craftmen/backend/wp-json/wc/store/v1";

function forwardHeaders(req: NextRequest) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const cookie = req.headers.get("cookie");
  if (cookie) headers["Cookie"] = cookie;
  // Forward Cart-Token for stateless headless cart identification
  const cartToken = req.headers.get("x-cart-token");
  if (cartToken) headers["Cart-Token"] = cartToken;
  // Forward nonce for mutation requests
  const nonce = req.headers.get("x-cart-nonce");
  if (nonce) headers["Nonce"] = nonce;
  return headers;
}

function buildResponse(wcRes: Response, body: unknown): NextResponse {
  const res = NextResponse.json(body, { status: wcRes.status });
  // Forward WC session cookie to browser
  const setCookie = wcRes.headers.get("set-cookie");
  if (setCookie) res.headers.set("set-cookie", setCookie);
  // WC Store API returns "Nonce" header (not X-WC-Store-API-Nonce)
  const nonce = wcRes.headers.get("Nonce") || wcRes.headers.get("nonce") || wcRes.headers.get("x-wc-store-api-nonce");
  if (nonce) res.headers.set("x-wc-nonce", nonce);
  // Forward Cart-Token for stateless cart sessions
  const cartToken = wcRes.headers.get("Cart-Token") || wcRes.headers.get("cart-token");
  if (cartToken) res.headers.set("x-cart-token", cartToken);
  return res;
}

export async function GET(req: NextRequest) {
  try {
    const wcRes = await fetch(`${WC_STORE}/cart`, {
      headers: forwardHeaders(req),
      cache: "no-store",
    });
    return buildResponse(wcRes, await wcRes.json());
  } catch {
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const wcRes = await fetch(`${WC_STORE}/cart/items`, {
      method: "DELETE",
      headers: forwardHeaders(req),
    });
    return buildResponse(wcRes, await wcRes.json().catch(() => ({})));
  } catch {
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
