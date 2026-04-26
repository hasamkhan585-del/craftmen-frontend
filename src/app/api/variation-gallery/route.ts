/**
 * Proxy: GET /headless/v1/variation-gallery  →  GET /api/variation-gallery
 * Query params: product_id=X&attrs=pa_color:brown,pa_size:medium-55cm
 */
import { NextRequest, NextResponse } from "next/server";

const WP_API = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const productId = searchParams.get("product_id");
    const attrs     = searchParams.get("attrs");

    if (!productId) {
      return NextResponse.json({ error: "product_id required" }, { status: 400 });
    }

    const qs = new URLSearchParams({ product_id: productId });
    if (attrs) qs.set("attrs", attrs);

    const wpRes = await fetch(`${WP_API}/headless/v1/variation-gallery?${qs.toString()}`, {
      cache: "no-store",
    });

    const data = await wpRes.json();
    return NextResponse.json(data, { status: wpRes.status });
  } catch {
    return NextResponse.json({ error: "Failed to fetch variation gallery" }, { status: 500 });
  }
}
