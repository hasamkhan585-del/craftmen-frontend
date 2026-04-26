import { ACFSection } from "@/types/acf";
import Link from "next/link";
import Image from "next/image";

// ─── Helper: render ACFImage safely ──────────────────────────────────────────

function WPImage({
  image,
  alt,
  className,
  fill,
  priority,
}: {
  image: { url: string; alt: string; sizes?: Record<string, string> } | null;
  alt?: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}) {
  if (!image?.url) return null;
  const src = image.url;
  const unopt = src.startsWith("http://localhost");
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt || image.alt || ""}
        fill
        className={className}
        unoptimized={unopt}
        priority={priority}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt || image.alt || ""}
      width={image.sizes ? 800 : 600}
      height={image.sizes ? 600 : 450}
      className={className}
      unoptimized={unopt}
      priority={priority}
    />
  );
}

// ─── SectionRenderer ─────────────────────────────────────────────────────────

export default function SectionRenderer({ sections }: { sections: ACFSection[] }) {
  return (
    <>
      {sections.map((section, i) => {
        switch (section.layout) {
          case "hero":            return <HeroBlock          key={i} s={section} />;
          case "text_content":   return <TextContentBlock   key={i} s={section} />;
          case "image_text":     return <ImageTextBlock     key={i} s={section} />;
          case "services_grid":  return <ServicesGridBlock  key={i} s={section} />;
          case "process_steps":  return <ProcessStepsBlock  key={i} s={section} />;
          case "reasons_grid":   return <ReasonsGridBlock   key={i} s={section} />;
          case "testimonials":   return <TestimonialsBlock  key={i} s={section} />;
          case "case_studies":   return <CaseStudiesBlock   key={i} s={section} />;
          case "tech_stack":     return <TechStackBlock     key={i} s={section} />;
          case "stats":          return <StatsBlock         key={i} s={section} />;
          case "latest_posts":   return <LatestPostsBlock   key={i} s={section} />;
          case "data_power":     return <DataPowerBlock     key={i} s={section} />;
          case "cta_banner":     return <CTABannerBlock     key={i} s={section} />;
          case "video_embed":    return <VideoEmbedBlock    key={i} s={section} />;
          case "faq":            return <FAQBlock           key={i} s={section} />;
          default:               return null;
        }
      })}
    </>
  );
}

// ─── 1. Hero ─────────────────────────────────────────────────────────────────

function HeroBlock({ s }: { s: Extract<ACFSection, { layout: "hero" }> }) {
  const bgClass = {
    white:    "bg-white",
    light:    "bg-gray-50",
    dark:     "bg-blue-950 text-white",
    gradient: "bg-gradient-to-br from-blue-700 to-indigo-800 text-white",
  }[s.bg_style] ?? "bg-white";

  const badgeColor = {
    pink:  "bg-pink-100 text-pink-600",
    blue:  "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
  }[s.badge_color] ?? "bg-pink-100 text-pink-600";

  const subtitleColor = (s.bg_style === "dark" || s.bg_style === "gradient") ? "text-blue-100" : "text-gray-500";

  return (
    <section className={`hero-section ${bgClass}`}>
      <div className="section-container px-4">
        <div className="hero-grid">
          <div>
            {s.badge_text && (
              <span className={`hero-badge ${badgeColor}`}>{s.badge_text}</span>
            )}
            <h1 className="hero-title">{s.title}</h1>
            {s.subtitle && (
              <p className={`hero-subtitle ${subtitleColor}`}>{s.subtitle}</p>
            )}
            <div className="hero-cta-group">
              {s.cta_text && s.cta_link && (
                <Link href={s.cta_link} className="hero-cta-primary">{s.cta_text}</Link>
              )}
              {s.secondary_cta_text && s.secondary_cta_link && (
                <Link href={s.secondary_cta_link} className="hero-cta-secondary">{s.secondary_cta_text}</Link>
              )}
            </div>
          </div>
          <div className="hero-image-side">
            {s.image?.url ? (
              <div className="hero-image-wrap">
                <WPImage image={s.image} fill className="object-contain" priority />
              </div>
            ) : (
              <div className="hero-placeholder">
                <span className="text-6xl">📊</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {(s.bg_style === "white" || s.bg_style === "light") && (
        <div className="hero-bg-accent" />
      )}
    </section>
  );
}

// ─── 2. Text Content ─────────────────────────────────────────────────────────

function TextContentBlock({ s }: { s: Extract<ACFSection, { layout: "text_content" }> }) {
  const maxW = s.width === "narrow" ? "section-container-sm" : "section-container";
  return (
    <section className="text-content-section">
      <div className={`${maxW} mx-auto`}>
        {s.title && <h2 className="text-content-title">{s.title}</h2>}
        <div className="text-content-prose" dangerouslySetInnerHTML={{ __html: s.content }} />
      </div>
    </section>
  );
}

// ─── 3. Image + Text ─────────────────────────────────────────────────────────

function ImageTextBlock({ s }: { s: Extract<ACFSection, { layout: "image_text" }> }) {
  const isLeft = s.image_position === "left";
  return (
    <section className="image-text-section">
      <div className="section-container mx-auto">
        <div className="image-text-grid">
          {isLeft && (
            <div className="image-text-img">
              <WPImage image={s.image} fill className="object-cover" />
            </div>
          )}
          <div>
            <h2 className="image-text-title">{s.title}</h2>
            <div className="image-text-prose" dangerouslySetInnerHTML={{ __html: s.content }} />
            {s.cta_text && s.cta_link && (
              <Link href={s.cta_link} className="image-text-cta">{s.cta_text}</Link>
            )}
          </div>
          {!isLeft && (
            <div className="image-text-img">
              <WPImage image={s.image} fill className="object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── 4. Services Grid ────────────────────────────────────────────────────────

function ServicesGridBlock({ s }: { s: Extract<ACFSection, { layout: "services_grid" }> }) {
  return (
    <section className="services-section">
      <div className="section-container mx-auto">
        <SectionHeader title={s.section_title} subtitle={s.section_subtitle} />
        <div className="services-grid">
          {s.services.map((svc, i) => (
            <div key={i} className="service-card">
              {svc.image?.url ? (
                <div className="service-img-wrap">
                  <WPImage image={svc.image} fill className="object-cover" />
                </div>
              ) : (
                <div className="service-icon-placeholder">
                  <span className="text-5xl">{svc.icon || "📌"}</span>
                </div>
              )}
              <h3 className="service-title">{svc.title}</h3>
              {svc.description && <p className="service-desc">{svc.description}</p>}
              {svc.link && (
                <Link href={svc.link} className="service-link">
                  {svc.link_text || "Learn More"} →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 5. Process Steps ────────────────────────────────────────────────────────

function ProcessStepsBlock({ s }: { s: Extract<ACFSection, { layout: "process_steps" }> }) {
  return (
    <section className="process-section">
      <div className="section-container mx-auto">
        <SectionHeader title={s.section_title} subtitle={s.section_subtitle} />
        <div className="process-grid">
          {s.steps.map((step, i) => (
            <div key={i} className="process-card">
              <span className="process-number">{step.step_number || String(i + 1).padStart(2, "0")}</span>
              <div className="process-icon">{step.icon || "📌"}</div>
              <h3 className="process-title">{step.title}</h3>
              {step.description && <p className="process-desc">{step.description}</p>}
              {step.image?.url && (
                <div className="process-img-wrap">
                  <WPImage image={step.image} fill className="object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 6. Reasons Grid ─────────────────────────────────────────────────────────

function ReasonsGridBlock({ s }: { s: Extract<ACFSection, { layout: "reasons_grid" }> }) {
  return (
    <section className="reasons-section">
      <div className="section-container mx-auto">
        <SectionHeader title={s.section_title} subtitle={s.section_subtitle} />
        <div className="reasons-grid">
          {s.reasons.map((r, i) => (
            <div key={i} className="reason-item">
              <div className="reason-icon-wrap">
                {r.icon ? <span className="text-xl">{r.icon}</span> : (
                  <span className="text-red-500 font-extrabold text-sm">{r.number || String(i + 1).padStart(2, "0")}</span>
                )}
              </div>
              <div>
                <h3 className="reason-title">{r.title}</h3>
                {r.description && <p className="reason-desc">{r.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 7. Testimonials ─────────────────────────────────────────────────────────

function TestimonialsBlock({ s }: { s: Extract<ACFSection, { layout: "testimonials" }> }) {
  return (
    <section className="testimonials-section">
      <div className="section-container mx-auto">
        <div className="testimonials-header">
          {s.section_label && <p className="testimonials-label">{s.section_label}</p>}
          {s.section_title && <h2 className="testimonials-title">{s.section_title}</h2>}
        </div>
        <div className="testimonials-grid">
          {s.items.map((t, i) => (
            <div key={i} className="testimonial-card">
              <Stars rating={t.rating} />
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                {t.avatar?.url ? (
                  <div className="testimonial-avatar">
                    <WPImage image={t.avatar} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="testimonial-avatar-placeholder">
                    {t.client_name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="testimonial-name">{t.client_name}</p>
                  <p className="testimonial-role">{[t.client_role, t.client_company].filter(Boolean).join(", ")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 8. Case Studies ─────────────────────────────────────────────────────────

function CaseStudiesBlock({ s }: { s: Extract<ACFSection, { layout: "case_studies" }> }) {
  return (
    <section className="case-studies-section">
      <div className="section-container mx-auto">
        <SectionHeader title={s.section_title} subtitle={s.section_subtitle} />
        <div className="case-studies-grid">
          {s.cases.map((c, i) => (
            <div key={i} className="case-card">
              {c.image?.url ? (
                <div className="case-img-wrap">
                  <WPImage image={c.image} fill className="object-cover" />
                  <div className="case-img-overlay" />
                  {c.industry && <span className="case-industry-badge">{c.industry}</span>}
                </div>
              ) : (
                <div className="case-no-img">
                  <span className="text-5xl">📊</span>
                </div>
              )}
              <div className="case-content">
                {!c.image?.url && c.industry && (
                  <span className="case-industry-tag">{c.industry}</span>
                )}
                <h3 className="case-title">{c.title}</h3>
                {c.excerpt && <p className="case-excerpt">{c.excerpt}</p>}
                {c.result && <p className="case-result">✓ {c.result}</p>}
                {c.link && <Link href={c.link} className="case-link">Read More →</Link>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 9. Tech Stack ───────────────────────────────────────────────────────────

function TechStackBlock({ s }: { s: Extract<ACFSection, { layout: "tech_stack" }> }) {
  return (
    <section className="tech-section">
      <div className="section-container mx-auto">
        {s.section_title && <h2 className="tech-title">{s.section_title}</h2>}
        <div className="tech-brands">
          {s.brands.map((b, i) =>
            b.logo?.url ? (
              <div key={i} className="tech-logo">
                <WPImage image={b.logo} fill className="object-contain" />
              </div>
            ) : (
              <span key={i} className="tech-name">{b.name}</span>
            )
          )}
        </div>
      </div>
    </section>
  );
}

// ─── 10. Stats ───────────────────────────────────────────────────────────────

function StatsBlock({ s }: { s: Extract<ACFSection, { layout: "stats" }> }) {
  const bgClass = { white: "bg-white", light: "bg-gray-50", dark: "bg-blue-950 text-white" }[s.background] ?? "bg-gray-50";
  const labelColor = s.background === "dark" ? "text-blue-200" : "text-gray-500";
  return (
    <section className={`stats-section ${bgClass}`}>
      <div className="section-container mx-auto">
        {s.section_title && <h2 className="stats-title">{s.section_title}</h2>}
        <div className="stats-grid">
          {s.stats.map((st, i) => (
            <div key={i}>
              {st.icon && <div className="stat-icon">{st.icon}</div>}
              <div className="stat-number">{st.number}</div>
              <div className={`stat-label ${labelColor}`}>{st.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 11. Latest Posts ────────────────────────────────────────────────────────

function PostDate({ date }: { date: string }) {
  if (!date) return null;
  const d = new Date(date);
  const formatted = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return <p className="post-date">{formatted}</p>;
}

function LatestPostsBlock({ s }: { s: Extract<ACFSection, { layout: "latest_posts" }> }) {
  const [featured, ...rest] = s.posts;

  return (
    <section className="posts-section">
      <div className="section-container mx-auto">
        <div className="posts-header">
          <h2 className="posts-heading">{s.section_title || "Latest Insights"}</h2>
          {s.show_view_all && (
            <Link href="/blog" className="posts-view-all">View All Insights</Link>
          )}
        </div>

        <div className="posts-grid">
          {/* Left: featured post — full background image with overlay */}
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="post-featured">
              {featured.image_url ? (
                <Image
                  src={featured.image_url}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  unoptimized={featured.image_url.startsWith("http://localhost")}
                />
              ) : (
                <div className="absolute inset-0 bg-gray-800" />
              )}
              <div className="post-featured-overlay" />
              <div className="post-featured-content">
                <PostDate date={featured.date} />
                <h3 className="post-featured-title">{featured.title}</h3>
                {featured.excerpt && <p className="post-featured-excerpt">{featured.excerpt}</p>}
                <span className="post-featured-link">Read More</span>
              </div>
            </Link>
          )}

          {/* Right: remaining posts stacked — each with image + date + title + excerpt */}
          <div className="posts-stack">
            {rest.map((p, i) => (
              <Link key={i} href={`/blog/${p.slug}`} className="post-item">
                {p.image_url && (
                  <div className="post-thumb">
                    <Image
                      src={p.image_url}
                      alt={p.title}
                      fill
                      className="object-cover"
                      unoptimized={p.image_url.startsWith("http://localhost")}
                    />
                  </div>
                )}
                <div className="post-body">
                  <PostDate date={p.date} />
                  <h3 className="post-item-title">{p.title}</h3>
                  {p.excerpt && <p className="post-item-excerpt">{p.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 12. Data / Power Banner ─────────────────────────────────────────────────

function DataPowerBlock({ s }: { s: Extract<ACFSection, { layout: "data_power" }> }) {
  return (
    <section className="data-power-section">
      <div className="data-power-inner">
        <h2 className="data-power-title">{s.title}</h2>
        {s.description && <p className="data-power-desc">{s.description}</p>}
        {s.cta_text && s.cta_link && (
          <Link href={s.cta_link} className="data-power-cta">{s.cta_text}</Link>
        )}
      </div>
    </section>
  );
}

// ─── 13. CTA Banner ──────────────────────────────────────────────────────────

function CTABannerBlock({ s }: { s: Extract<ACFSection, { layout: "cta_banner" }> }) {
  const bgClass = {
    "dark-navy": "bg-blue-950 text-white",
    "red":       "bg-red-600 text-white",
    "blue":      "bg-blue-600 text-white",
    "white":     "bg-white text-gray-900",
  }[s.bg_color] ?? "bg-blue-950 text-white";

  const isLight = s.bg_color === "white";

  return (
    <section className={`cta-section ${bgClass}`}>
      <div className="cta-inner">
        <h2 className="cta-title">{s.title}</h2>
        {s.description && (
          <p className={`cta-desc ${isLight ? "text-gray-500" : "opacity-80"}`}>{s.description}</p>
        )}
        {s.cta_text && s.cta_link && (
          <Link href={s.cta_link} className={isLight ? "cta-btn-light" : "cta-btn-dark"}>
            {s.cta_text}
          </Link>
        )}
      </div>
    </section>
  );
}

// ─── 14. Video Embed ─────────────────────────────────────────────────────────

function VideoEmbedBlock({ s }: { s: Extract<ACFSection, { layout: "video_embed" }> }) {
  const embedUrl = s.video_url
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "www.youtube.com/embed/")
    .replace("vimeo.com/", "player.vimeo.com/video/");

  return (
    <section className="video-section">
      <div className="section-container-md mx-auto">
        {s.title && <h2 className="video-title">{s.title}</h2>}
        <div className="video-wrap">
          <iframe
            src={embedUrl}
            className="video-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

// ─── 15. FAQ ─────────────────────────────────────────────────────────────────

function FAQBlock({ s }: { s: Extract<ACFSection, { layout: "faq" }> }) {
  return (
    <section className="faq-section">
      <div className="section-container-sm mx-auto">
        <SectionHeader title={s.section_title} subtitle={s.section_subtitle} />
        <div className="faq-list">
          {s.items.map((item, i) => (
            <details key={i} className="faq-item">
              <summary className="faq-summary">
                {item.question}
                <svg className="faq-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="faq-answer" dangerouslySetInnerHTML={{ __html: item.answer }} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  if (!title && !subtitle) return null;
  return (
    <div className="sec-header">
      {title && <h2 className="sec-header-title">{title}</h2>}
      {subtitle && <p className="sec-header-subtitle">{subtitle}</p>}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-4 h-4 ${s <= rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}
