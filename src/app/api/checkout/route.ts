/**
 * POST /api/checkout
 * Places a WooCommerce order via the Store API, then links it to the
 * logged-in user's account (customer_id) using the WC REST API.
 *
 * Why NOT forward our JWT to the Store API:
 *   WC Store API uses cart session (Cart-Token + Nonce) for identity.
 *   Our custom JWT is unknown to WC — forwarding it can break cart validation
 *   and trigger "product can no longer be purchased" errors.
 *   We verify the JWT separately after placement and patch customer_id.
 */
import { NextRequest, NextResponse } from "next/server";

const WC_STORE = process.env.NEXT_PUBLIC_WC_STORE_API || "http://localhost:8080/craftmen/backend/wp-json/wc/store/v1";
const WP_API   = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json";
const APP_USER = process.env.WP_APP_USER              || "";
const APP_PASS = process.env.WP_APP_PASS              || "";

function wpAppAuth(): string {
  return "Basic " + Buffer.from(`${APP_USER}:${APP_PASS}`).toString("base64");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const cookie    = req.headers.get("cookie");
    const nonce     = req.headers.get("x-cart-nonce");
    const cartToken = req.headers.get("x-cart-token");
    const authJwt   = req.headers.get("authorization"); // our custom JWT — NOT forwarded to Store API

    // Build Store API headers — only cart session headers, no custom JWT
    const storeHeaders: Record<string, string> = { "Content-Type": "application/json" };
    if (cookie)    storeHeaders["Cookie"]     = cookie;
    if (nonce)     storeHeaders["Nonce"]      = nonce;
    if (cartToken) storeHeaders["Cart-Token"] = cartToken;

    // Place the order via WC Store API
    const wcRes = await fetch(`${WC_STORE}/checkout`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        billing_address:  body.billing_address,
        shipping_address: body.shipping_address ?? body.billing_address,
        payment_method:   body.payment_method,
        payment_data:     body.payment_data ?? [],
        customer_note:    body.customer_note ?? "",
      }),
    });

    const data = await wcRes.json() as { order_id?: number; id?: number; message?: string; status?: string };

    if (!wcRes.ok) {
      // Strip HTML tags from WC error messages
      const msg = typeof data.message === "string"
        ? data.message.replace(/<[^>]*>/g, "")
        : "Order could not be placed. Please try again.";
      return NextResponse.json({ ...data, message: msg }, { status: wcRes.status });
    }

    const orderId = data.order_id ?? data.id ?? 0;

    // Link order to the logged-in user (best-effort — order is already placed)
    if (orderId && authJwt?.startsWith("Bearer ")) {
      await linkOrderToUser(orderId, authJwt).catch(() => {});
    }

    const res = NextResponse.json(data, { status: wcRes.status });
    const setCookie = wcRes.headers.get("set-cookie");
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;

  } catch {
    return NextResponse.json({ message: "Checkout failed. Please try again." }, { status: 500 });
  }
}

async function linkOrderToUser(orderId: number, authHeader: string): Promise<void> {
  // Verify our custom JWT via headless endpoint to get the WP user ID
  const meRes = await fetch(`${WP_API}/headless/v1/me`, {
    headers: { Authorization: authHeader },
    cache: "no-store",
  });
  if (!meRes.ok) return;

  const me     = await meRes.json() as { id?: number };
  const userId = me.id;
  if (!userId) return;

  await fetch(`${WP_API}/wc/v3/orders/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": wpAppAuth(),
    },
    body:  JSON.stringify({ customer_id: userId }),
    cache: "no-store",
  });
}
