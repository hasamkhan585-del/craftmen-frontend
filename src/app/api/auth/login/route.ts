/**
 * POST /api/auth/login
 * Proxies to custom headless login endpoint.
 */
import { NextRequest, NextResponse } from "next/server";

const WP_API = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8080/craftmen/backend/wp-json";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
    }

    const res  = await fetch(`${WP_API}/headless/v1/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      const msg   = (data as { message?: string }).message || "Invalid credentials.";
      const clean = msg.replace(/<[^>]*>/g, "");
      return NextResponse.json({ message: clean }, { status: 401 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Login failed. Please try again." }, { status: 500 });
  }
}
