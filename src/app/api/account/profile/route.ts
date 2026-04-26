/**
 * PUT /api/account/profile
 * Updates WooCommerce customer profile (name, billing, shipping).
 * Body: { customer_id, first_name, last_name, billing, shipping }
 */
import { NextRequest, NextResponse } from "next/server";

const WP_API = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json";
const CK     = process.env.WC_CONSUMER_KEY          || "";
const CS     = process.env.WC_CONSUMER_SECRET       || "";

export async function PUT(req: NextRequest) {
  try {
    const body       = await req.json();
    const { customer_id, ...fields } = body;

    if (!customer_id) {
      return NextResponse.json({ message: "customer_id is required." }, { status: 400 });
    }

    const auth = Buffer.from(`${CK}:${CS}`).toString("base64");
    const res  = await fetch(`${WP_API}/wc/v3/customers/${customer_id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
      body:    JSON.stringify(fields),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = (data as { message?: string }).message || "Update failed.";
      return NextResponse.json({ message: msg }, { status: res.status });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Profile update failed." }, { status: 500 });
  }
}
