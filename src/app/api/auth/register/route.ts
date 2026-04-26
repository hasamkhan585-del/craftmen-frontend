/**
 * POST /api/auth/register
 * Creates a WordPress user with WooCommerce "customer" role via the custom
 * headless/v1/register endpoint (bypasses WC REST API permission checks).
 * The user appears in WP Admin → Users AND WC Admin → Customers.
 */
import { NextRequest, NextResponse } from "next/server";

const WP_API = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost/headlesswpnextjs/backend/wp-json";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, first_name, last_name } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Username, email, and password are required." }, { status: 400 });
    }

    const res  = await fetch(`${WP_API}/headless/v1/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password,
        first_name: first_name || "",
        last_name:  last_name  || "",
      }),
    });

    const data = await res.json() as { id?: number; message?: string; code?: string };

    if (!res.ok) {
      const msg   = data.message || "Registration failed.";
      const clean = msg.replace(/<[^>]*>/g, "");
      return NextResponse.json({ message: clean }, { status: res.status });
    }

    return NextResponse.json({ id: data.id, email }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Registration failed. Please try again." }, { status: 500 });
  }
}
