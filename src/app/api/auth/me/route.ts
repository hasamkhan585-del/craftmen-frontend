/**
 * GET /api/auth/me
 * Returns current user profile by validating the custom headless token.
 */
import { NextRequest, NextResponse } from "next/server";

const WP_API = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  try {
    const res = await fetch(`${WP_API}/headless/v1/me`, {
      headers: { Authorization: auth },
      cache:   "no-store",
    });

    if (!res.ok) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Failed to fetch user." }, { status: 500 });
  }
}
