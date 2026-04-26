import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — Our Story",
  description: "Meet the master craftsmen behind CraftLeather. 15 years of tradition, passion, and premium handmade leather goods.",
};

const TEAM = [
  {
    name: "Thomas Hargreaves",
    role: "Master Craftsman & Founder",
    bio: "Thomas learned leatherworking from his father in rural England. With 30 years of experience, he oversees all product design and quality control.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
  },
  {
    name: "Elena Moretti",
    role: "Head Artisan",
    bio: "Trained in Florence, Elena specialises in saddle stitching and edge finishing. Her work is characterised by flawless precision.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
  },
  {
    name: "Marcus Webb",
    role: "Hardware & Materials Specialist",
    bio: "Marcus sources every hide and piece of brass hardware personally, visiting tanneries across England and Italy each year.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
  },
];

const VALUES = [
  { icon: "🐂",  svgIcon: null, title: "Premium Materials",     desc: "We use only full-grain and top-grain hides from certified ethical tanneries. No split leather, no shortcuts." },
  { icon: null,  svgIcon: true, title: "Traditional Techniques", desc: "Every piece is saddle-stitched by hand using techniques unchanged for centuries — two needles, one thread, zero machines." },
  { icon: "🌿", svgIcon: null, title: "Sustainable Craft",       desc: "We minimise waste, use vegetable tanning processes, and ensure every supplier meets our ethical sourcing standards." },
  { icon: "🛡️", svgIcon: null, title: "Lifetime Guarantee",     desc: "We stand behind every stitch. If anything ever fails, we'll repair or replace it — no questions asked." },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative py-28 overflow-hidden" style={{ background: "var(--leather-900)" }}>
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1614179818749-84aaa16be1b1?w=1400&q=80"
            alt="Leather workshop"
            fill
            className="object-cover opacity-25"
            unoptimized
          />
        </div>
        <div className="section-container relative z-10 text-center">
          <span className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: "var(--leather-300)" }}>
            Est. 2010
          </span>
          <h1
            className="mt-4 mb-6"
            style={{ fontFamily: "Georgia,serif", fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}
          >
            Crafted with Passion.<br />
            <span style={{ color: "var(--leather-300)" }}>Built to Last.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: "var(--leather-200)", lineHeight: 1.75 }}>
            For over 15 years, we have been making leather goods the old-fashioned way — by hand,
            with care, using the finest materials. Every piece leaves our workshop ready to become
            a lifetime companion.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="sec-label">Our Story</span>
              <h2 className="sec-title mt-1 mb-6">From a Small Workshop to a Worldwide Community</h2>
              <div className="space-y-5 text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                <p>
                  CraftLeather started in a small shed in Yorkshire, England. Founder Thomas Hargreaves,
                  a third-generation leather worker, grew up watching his father and grandfather turn raw
                  hides into objects of lasting beauty.
                </p>
                <p>
                  After years of learning the craft — first at the family bench, then in workshops across
                  Florence and Madrid — Thomas founded CraftLeather in 2010 with a simple vision: to make
                  leather goods as good as the classics, available to anyone who appreciated lasting quality.
                </p>
                <p>
                  Today, our small team of eight craftspeople makes every product by hand in our Harrogate
                  workshop. We ship to customers in over 40 countries who share our love of things made
                  properly, once, to last forever.
                </p>
              </div>
              <div className="flex gap-4 mt-8">
                <Link href="/shop" className="btn-primary">Explore Our Work</Link>
                <Link href="/contact" className="btn-outline">Get in Touch</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "3/4" }}>
                <Image
                  src="https://craftmen.fr/demo/wp-content/uploads/2026/04/ChatGPT-Image-Feb-8-2026-02_37_39-PM-1.png"
                  alt="Leather canvas bag"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="relative rounded-xl overflow-hidden mt-8" style={{ aspectRatio: "3/4" }}>
                <Image
                  src="https://craftmen.fr/demo/wp-content/uploads/2026/04/ChatGPT-Image-Feb-7-2026-09_43_23-PM-1-1.png"
                  alt="Duffle bag"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20" style={{ background: "var(--leather-50)" }}>
        <div className="section-container">
          <div className="text-center mb-14">
            <span className="sec-label">Our Values</span>
            <h2 className="sec-title mt-1">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="p-7 rounded-xl border text-center"
                style={{ background: "#fff", borderColor: "var(--leather-100)" }}
              >
                <div className="flex items-center justify-center mb-4">
                  {v.svgIcon ? (
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="10" y1="38" x2="36" y2="12" stroke="#8b4513" strokeWidth="3.5" strokeLinecap="round"/>
                      <path d="M36 12 L41 7 L39 14 Z" fill="#8b4513"/>
                      <ellipse cx="12" cy="36" rx="3.5" ry="2.5" transform="rotate(-45 12 36)" stroke="#c8973e" strokeWidth="2" fill="none"/>
                      <path d="M8 44 Q15 34 22 39 Q29 44 36 34" stroke="#c8973e" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="3 3"/>
                    </svg>
                  ) : (
                    <span className="text-5xl">{v.icon}</span>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ color: "var(--leather-900)", fontFamily: "Georgia,serif" }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop images */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="sec-label">The Workshop</span>
            <h2 className="sec-title mt-1">Where the Magic Happens</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "https://craftmen.fr/wp-content/uploads/2026/04/Buffle-Bag-Category-slider-1.webp",
              "https://craftmen.fr/wp-content/uploads/2026/04/Role-Top-Bag-1.webp",
              "https://craftmen.fr/wp-content/uploads/2026/04/Camera-Bag-Category-slider-1.webp",
              "https://craftmen.fr/wp-content/uploads/2026/04/Leather-Canvas-Bag-category-slider-1.webp",
            ].map((src, i) => (
              <div
                key={i}
                className="relative rounded-xl overflow-hidden"
                style={{ aspectRatio: i === 0 || i === 3 ? "3/4" : "4/3" }}
              >
                <Image src={src} alt={`Workshop ${i + 1}`} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20" style={{ background: "var(--leather-50)" }}>
        <div className="section-container">
          <div className="text-center mb-14">
            <span className="sec-label">The Team</span>
            <h2 className="sec-title mt-1">Meet the Craftsmen</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map((member) => (
              <div key={member.name} className="text-center">
                <div className="relative w-36 h-36 rounded-full overflow-hidden mx-auto mb-5" style={{ border: "3px solid var(--leather-200)" }}>
                  <Image src={member.img} alt={member.name} fill className="object-cover" unoptimized />
                </div>
                <h3 className="font-bold text-lg" style={{ color: "var(--leather-900)", fontFamily: "Georgia,serif" }}>
                  {member.name}
                </h3>
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--leather-500)" }}>
                  {member.role}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16" style={{ background: "var(--leather-900)" }}>
        <div className="section-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { n: "15+", label: "Years of Craft" },
              { n: "5,200+", label: "Happy Customers" },
              { n: "40+", label: "Countries Served" },
              { n: "8", label: "Master Craftspeople" },
            ].map(({ n, label }) => (
              <div key={label}>
                <p className="text-4xl font-extrabold mb-1" style={{ color: "var(--leather-300)", fontFamily: "Georgia,serif" }}>{n}</p>
                <p className="text-xs tracking-widest uppercase" style={{ color: "var(--leather-400)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
