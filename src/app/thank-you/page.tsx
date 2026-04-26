import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Message Sent — Thank You",
  description: "Thank you for contacting us. We will be in touch within one business day.",
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <main>
      <div className="min-h-[70vh] flex items-center justify-center section-container py-24">
        <div className="max-w-lg w-full text-center">

          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-8"
            style={{ background: "var(--leather-100)" }}
          >
            ✉️
          </div>

          {/* Heading */}
          <h1
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "Georgia, serif", color: "var(--leather-900)" }}
          >
            Message Received!
          </h1>

          {/* Body */}
          <p
            className="text-base leading-relaxed mb-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            Thank you for reaching out. We&rsquo;ve received your message and will
            be in touch within one business day.
          </p>
          <p className="text-sm mb-10" style={{ color: "var(--color-text-muted)" }}>
            In the meantime, feel free to browse our collection or check your order status.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="btn-primary">
              Browse Collection
            </Link>
            <Link href="/" className="btn-outline">
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
