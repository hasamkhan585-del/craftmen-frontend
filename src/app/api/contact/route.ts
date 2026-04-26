/**
 * POST /api/contact
 * Proxies the contact form to the WordPress headless endpoint which runs CF7
 * form 272 server-side (spam bypassed, mail_failed → mail_sent override).
 *
 * Normalises the CF7 invalid_fields payload — PHP returns an object keyed by
 * field name; the frontend expects an array of { field, message } objects.
 */
import { NextRequest, NextResponse } from "next/server";

const WP_API =
  process.env.NEXT_PUBLIC_REST_API_URL ||
  "http://localhost:8080/craftmen/backend/wp-json";

type RawInvalidFields =
  | Array<{ field: string; message: string; idref?: string | null }>
  | Record<string, { reason: string; idref?: string | null }>;

function normaliseInvalidFields(
  raw: RawInvalidFields
): Array<{ field: string; message: string }> {
  if (Array.isArray(raw)) {
    return raw.map((f) => ({ field: f.field, message: f.message }));
  }
  return Object.entries(raw).map(([key, val]) => ({ field: key, message: val.reason }));
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, string>;

    const res = await fetch(`${WP_API}/headless/v1/contact`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
      cache:   "no-store",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();

    // Normalise invalid_fields to a consistent array shape
    if (data.invalid_fields && typeof data.invalid_fields === "object") {
      data.invalid_fields = normaliseInvalidFields(data.invalid_fields as RawInvalidFields);
    }

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
