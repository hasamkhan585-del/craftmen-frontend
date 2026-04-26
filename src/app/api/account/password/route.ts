/**
 * POST /api/account/password
 * Changes the user's password via the custom headless endpoint.
 * Body: { password }
 */
import { NextRequest, NextResponse } from "next/server";

const WP_API = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  try {
    const { password } = await req.json();
    if (!password || password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    }

    const res = await fetch(`${WP_API}/headless/v1/change-password`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json() as { message?: string };
      return NextResponse.json({ message: data.message || "Password change failed." }, { status: res.status });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Password change failed." }, { status: 500 });
  }
}
