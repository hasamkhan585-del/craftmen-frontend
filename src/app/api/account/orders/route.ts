/**
 * GET /api/account/orders?page={n}
 * Returns WooCommerce orders for the authenticated customer.
 */
import { NextRequest, NextResponse } from "next/server";

const WP_API   = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json";
const APP_USER = process.env.WP_APP_USER              || "";
const APP_PASS = process.env.WP_APP_PASS              || "";

function wpAppAuth(): string {
  return "Basic " + Buffer.from(`${APP_USER}:${APP_PASS}`).toString("base64");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";

  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  try {
    // Verify token via our custom headless endpoint
    const meRes = await fetch(`${WP_API}/headless/v1/me`, {
      headers: { Authorization: authHeader },
      cache:   "no-store",
    });
    if (!meRes.ok) {
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 401 });
    }
    const me     = await meRes.json() as { id?: number };
    const userId = me.id;
    if (!userId) {
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 401 });
    }

    const url = `${WP_API}/wc/v3/orders?customer=${userId}&per_page=10&page=${page}&orderby=date&order=desc`;
    const res = await fetch(url, {
      headers: { Authorization: wpAppAuth() },
      cache:   "no-store",
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return NextResponse.json(errBody, { status: res.status });
    }

    const orders = await res.json();
    const total  = res.headers.get("X-WP-Total")      || "0";
    const pages  = res.headers.get("X-WP-TotalPages") || "1";

    const result = NextResponse.json(orders);
    result.headers.set("X-WP-Total",      total);
    result.headers.set("X-WP-TotalPages", pages);
    return result;
  } catch {
    return NextResponse.json({ message: "Failed to fetch orders." }, { status: 500 });
  }
}
