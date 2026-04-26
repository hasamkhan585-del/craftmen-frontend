import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with our craftsmen team. Custom orders, repairs, wholesale enquiries — we're here to help.",
};

export interface CF7Field {
  name:        string;
  type:        string;
  required:    boolean;
  placeholder: string;
  options:     string[];
}

async function getCF7Fields(): Promise<CF7Field[]> {
  const WP_API =
    process.env.NEXT_PUBLIC_REST_API_URL ||
    "http://localhost:8080/craftmen/backend/wp-json";
  try {
    const res = await fetch(`${WP_API}/headless/v1/contact/fields`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json() as { fields: CF7Field[] };
    return data.fields ?? [];
  } catch {
    return [];
  }
}

export default async function ContactPage() {
  const fields = await getCF7Fields();

  return (
    <main>
      {/* Banner */}
      <div className="page-banner">
        <div className="section-container">
          <h1 className="page-banner-title">Get in Touch</h1>
          <p className="page-banner-sub">We&rsquo;d love to hear from you</p>
        </div>
      </div>

      <div className="section-container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left — Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>
              Send Us a Message
            </h2>
            <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
              Whether you have a question about an order, want a custom piece, or simply
              want to say hello — fill in the form below and we&rsquo;ll be in touch within one business day.
            </p>
            <ContactForm fields={fields} />
          </div>

          {/* Right — Company details */}
          <div>
            <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}>
              Find Us
            </h2>

            <div className="space-y-6">
              {/* Address */}
              <div
                className="flex gap-5 p-6 rounded-xl border"
                style={{ borderColor: "var(--leather-100)", background: "var(--leather-50)" }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "var(--leather-100)" }}
                >
                  📍
                </div>
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: "var(--leather-900)" }}>Workshop & Showroom</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    12 Tanner&rsquo;s Lane<br />
                    Harrogate, HG1 4AB<br />
                    North Yorkshire, England
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div
                className="flex gap-5 p-6 rounded-xl border"
                style={{ borderColor: "var(--leather-100)", background: "var(--leather-50)" }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "var(--leather-100)" }}
                >
                  📞
                </div>
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: "var(--leather-900)" }}>Phone</p>
                  <a
                    href="tel:+441423456789"
                    className="text-sm transition-colors"
                    style={{ color: "var(--leather-500)" }}
                  >
                    +44 (0)1423 456 789
                  </a>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                    Mon–Fri 9am–5pm GMT
                  </p>
                </div>
              </div>

              {/* Email */}
              <div
                className="flex gap-5 p-6 rounded-xl border"
                style={{ borderColor: "var(--leather-100)", background: "var(--leather-50)" }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "var(--leather-100)" }}
                >
                  ✉️
                </div>
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: "var(--leather-900)" }}>Email</p>
                  <a
                    href="mailto:hello@craftleather.co.uk"
                    className="text-sm block mb-0.5 transition-colors"
                    style={{ color: "var(--leather-500)" }}
                  >
                    hello@craftleather.co.uk
                  </a>
                  <a
                    href="mailto:orders@craftleather.co.uk"
                    className="text-sm block transition-colors"
                    style={{ color: "var(--leather-500)" }}
                  >
                    orders@craftleather.co.uk
                  </a>
                </div>
              </div>

            </div>

            {/* Custom order note */}
            <div
              className="mt-8 p-6 rounded-xl"
              style={{ background: "var(--leather-900)", color: "var(--leather-200)" }}
            >
              <p className="font-bold text-sm mb-2" style={{ color: "var(--leather-300)" }}>
                🎨 Interested in a Custom Order?
              </p>
              <p className="text-sm leading-relaxed">
                We make fully bespoke pieces — choose your leather, hardware, stitching colour, and have
                your initials stamped. Lead time is typically 3–4 weeks. Email us for a free quote.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
