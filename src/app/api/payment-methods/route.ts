/**
 * Fetch enabled WooCommerce payment gateways via WC REST API v3.
 * Uses consumer key/secret from env (no session cookie needed).
 */
import { NextResponse } from "next/server";

const WP_API  = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost/headlesswpnextjs/backend/wp-json";
const CK      = process.env.WC_CONSUMER_KEY    || "";
const CS      = process.env.WC_CONSUMER_SECRET || "";

export async function GET() {
  try {
    const auth = Buffer.from(`${CK}:${CS}`).toString("base64");
    const res  = await fetch(`${WP_API}/wc/v3/payment_gateways`, {
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type":  "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      // Fallback: return common default methods so checkout still works
      return NextResponse.json([
        { id: "cod",    title: "Cash on Delivery",  description: "Pay with cash upon delivery.", enabled: true },
        { id: "bacs",   title: "Bank Transfer",     description: "Direct bank transfer (BACS).", enabled: true },
        { id: "cheque", title: "Check Payment",     description: "Pay via cheque.", enabled: true },
      ]);
    }

    const gateways = await res.json();
    // Only return enabled gateways
    const enabled = (gateways as { id: string; title: string; description: string; enabled: boolean }[])
      .filter((g) => g.enabled)
      .map((g) => ({ id: g.id, title: g.title, description: g.description, enabled: g.enabled }));

    return NextResponse.json(enabled.length ? enabled : [
      { id: "cod", title: "Cash on Delivery", description: "Pay with cash upon delivery.", enabled: true },
    ]);
  } catch {
    return NextResponse.json([
      { id: "cod", title: "Cash on Delivery", description: "Pay with cash upon delivery.", enabled: true },
    ]);
  }
}
