/**
 * PUT /api/account/address
 * Updates WooCommerce billing/shipping address for the authenticated user.
 *
 * Flow:
 *   1. Passes the Bearer JWT token through to /headless/v1/update-customer
 *   2. The WP endpoint validates the token (via JWT plugin OR manual JWT decode
 *      fallback), writes user meta, and returns the confirmed saved values.
 */
import { NextRequest, NextResponse } from "next/server";

const WP_API = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json";

export async function PUT(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await req.json();

    const res = await fetch(`${WP_API}/headless/v1/update-customer`, {
      method:  "PUT",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": auth,
      },
      body:  JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json() as { ok?: boolean; message?: string; billing?: unknown; shipping?: unknown };

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Address update failed." },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true, billing: data.billing, shipping: data.shipping });
  } catch {
    return NextResponse.json({ message: "Address update failed." }, { status: 500 });
  }
}
