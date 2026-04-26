/**
 * GET /api/account/orders/[id]
 * Returns a single WooCommerce order. Ownership check via headless JWT.
 */
import { NextRequest, NextResponse } from "next/server";

const WP_API   = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json";
const APP_USER = process.env.WP_APP_USER              || "";
const APP_PASS = process.env.WP_APP_PASS              || "";

function wpAppAuth(): string {
  return "Basic " + Buffer.from(`${APP_USER}:${APP_PASS}`).toString("base64");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "Order ID is required." }, { status: 400 });
  }

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

    const res = await fetch(`${WP_API}/wc/v3/orders/${id}`, {
      headers: { Authorization: wpAppAuth() },
      cache:   "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ message: "Order not found." }, { status: res.status });
    }

    const order = await res.json() as { customer_id?: number };

    // Ownership check — admins (customer_id === 0) can see all
    if (order.customer_id !== 0 && order.customer_id !== userId) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ message: "Failed to fetch order." }, { status: 500 });
  }
}
