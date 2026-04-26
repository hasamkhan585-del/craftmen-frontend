import Link from "next/link";
import Image from "next/image";

const PROCESS_STEPS = [
  {
    num: "01",
    icon: "🐂",
    title: "Premium Hides",
    desc: "We source only the finest full-grain and top-grain hides from certified ethical tanneries in Italy and England.",
  },
  {
    num: "02",
    icon: "✂️",
    title: "Hand Cutting",
    desc: "Each piece is hand-cut using traditional patterns refined over decades, ensuring perfect proportions every time.",
  },
  {
    num: "03",
    icon: null,
    title: "Saddle Stitching",
    desc: "We use the centuries-old saddle stitch technique with waxed linen thread — stronger and more durable than machine stitching.",
  },
  {
    num: "04",
    icon: "✨",
    title: "Hand Finishing",
    desc: "Edges are burnished by hand, hardware is fitted with care, and every piece is conditioned with beeswax before shipping.",
  },
];

export default function CraftsmanSection() {
  return (
    <>
      {/* Process section */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <span className="sec-label">Our Process</span>
            <h2 className="sec-title mt-1">From Hide to Hand</h2>
            <p className="sec-desc mx-auto mt-3">
              Four steps. Zero shortcuts. This is how every CraftLeather piece is made.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.num}
                className="relative p-6 rounded-xl border"
                style={{ borderColor: "var(--leather-100)", background: "var(--leather-50)" }}
              >
                <span
                  className="absolute top-4 right-4 font-extrabold text-5xl select-none"
                  style={{ color: "var(--leather-100)", fontFamily: "Georgia, serif" }}
                >
                  {step.num}
                </span>
                <div className="text-4xl mb-4">
                  {step.icon ?? (
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Needle body */}
                      <line x1="8" y1="32" x2="30" y2="10" stroke="var(--leather-600)" strokeWidth="3" strokeLinecap="round"/>
                      {/* Needle tip */}
                      <path d="M30 10 L34 6 L32 12 Z" fill="var(--leather-600)"/>
                      {/* Needle eye */}
                      <ellipse cx="10" cy="30" rx="3" ry="2" transform="rotate(-45 10 30)" stroke="var(--leather-400)" strokeWidth="1.5" fill="none"/>
                      {/* Thread loops */}
                      <path d="M6 36 Q12 28 18 32 Q24 36 30 28" stroke="var(--leather-400)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="2 2"/>
                    </svg>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "var(--leather-900)" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner CTA */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--leather-800) 0%, var(--leather-900) 100%)" }}
      >
        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }} />

        <div className="section-container relative z-10 text-center">
          <span className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: "var(--leather-300)" }}>
            Bespoke Service
          </span>
          <h2
            className="mt-3 mb-5"
            style={{ fontFamily: "Georgia,serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15 }}
          >
            Want Something<br />
            <span style={{ color: "var(--leather-300)" }}>Made Just for You?</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: "var(--leather-200)", lineHeight: 1.75 }}>
            We offer fully bespoke leather goods — choose your hide, hardware, stitching colour,
            and have your initials stamped in gold. No minimum order.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary">Start Custom Order</Link>
            <Link
              href="/about"
              className="inline-block border-2 font-semibold px-8 py-3 rounded text-sm uppercase tracking-widest text-center transition-all"
              style={{ borderColor: "var(--leather-300)", color: "var(--leather-300)" }}
            >
              Meet the Craftsmen
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" style={{ background: "var(--leather-50)" }}>
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="sec-label">Testimonials</span>
            <h2 className="sec-title mt-1">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "I've had my messenger bag for 5 years now. The leather has developed a beautiful dark patina and the stitching is still perfect. Worth every penny.",
                name: "James Hartley",
                role: "Architect, London",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
                stars: 5,
              },
              {
                quote: "Got a custom wallet with my initials for my husband's birthday. He carries it everywhere. The quality is absolutely unmatched.",
                name: "Sarah Mitchell",
                role: "Interior Designer",
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
                stars: 5,
              },
              {
                quote: "These bags age so gracefully. Started as a rich tan and now has a warm, dark brown patina that I get complimented on constantly.",
                name: "David Chen",
                role: "Photographer",
                img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
                stars: 5,
              },
            ].map((t) => (
              <div
                key={t.name}
                className="p-8 rounded-xl border"
                style={{ background: "#fff", borderColor: "var(--leather-100)" }}
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-5" style={{ color: "var(--leather-300)" }}>
                  {[...Array(t.stars)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed italic mb-6" style={{ color: "var(--color-text-muted)" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={t.img} alt={t.name} fill className="object-cover" unoptimized />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "var(--leather-900)" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
