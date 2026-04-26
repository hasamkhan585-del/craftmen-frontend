/**
 * GET /api/account/addresses
 * Reads billing/shipping address directly from WordPress user meta —
 * bypasses WooCommerce REST API caching so values are always fresh after save.
 */
import { NextRequest, NextResponse } from "next/server";

const WP_API = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  try {
    const res = await fetch(`${WP_API}/headless/v1/customer-addresses`, {
      headers: { Authorization: auth },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to load addresses." },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Failed to load addresses." }, { status: 500 });
  }
}
