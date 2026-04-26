import type React from "react";
import { getPost, getPosts } from "@/lib/wordpress";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { buildMetadata, ArticleJsonLd } from "@/components/seo/SEO";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPosts({ per_page: 50 }).catch(() => []);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) return {};
  return buildMetadata({
    title: post.title.rendered.replace(/<[^>]*>/g, ""),
    description: post.excerpt.rendered.replace(/<[^>]*>/g, "").slice(0, 160),
    image: post.featured_image_url,
    url: `/blog/${slug}`,
    type: "article",
    yoast: post.yoast_head_json,
  });
}

export default async function SinglePostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) notFound();

  const image =
    post.featured_image_url || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const author =
    post.author_name || post._embedded?.author?.[0]?.name || "Unknown";
  const categories = post._embedded?.["wp:term"]?.[0] || [];
  const tags = post._embedded?.["wp:term"]?.[1] || [];
  const date = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <>
      <ArticleJsonLd
        title={post.title.rendered.replace(/<[^>]*>/g, "")}
        description={post.excerpt.rendered.replace(/<[^>]*>/g, "").slice(0, 160)}
        image={image}
        datePublished={post.date}
        dateModified={post.modified}
        authorName={author}
        url={`${siteUrl}/blog/${slug}`}
      />

      {/* Banner */}
      <div className="page-banner">
        <div className="section-container">
          <nav className="breadcrumb mb-3">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span style={{ color: "var(--leather-200)" }} dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
          </nav>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Main article */}
          <article className="flex-1 min-w-0">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/blog/category/${cat.slug}`}>
                    <span className="blog-card-cat">{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1
              className="text-3xl md:text-4xl font-extrabold mb-5 leading-tight"
              style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Meta */}
            <div
              className="flex items-center gap-4 text-sm mb-8 pb-8"
              style={{ color: "var(--color-text-muted)", borderBottom: "1px solid var(--leather-100)" }}
            >
              <span>
                By <strong style={{ color: "var(--leather-800)" }}>{author}</strong>
              </span>
              <span style={{ color: "var(--leather-200)" }}>·</span>
              <time dateTime={post.date}>{date}</time>
            </div>

            {/* Featured Image */}
            {image && (
              <div className="relative w-full mb-10 rounded-xl overflow-hidden" style={{ height: "min(400px, 55vw)" }}>
                <Image
                  src={image}
                  alt={post.title.rendered.replace(/<[^>]*>/g, "")}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={image.includes("localhost")}
                />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-lg max-w-none prose-headings:font-bold prose-img:rounded-xl"
              style={{ "--tw-prose-headings": "var(--leather-900)", "--tw-prose-links": "var(--leather-500)" } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-8" style={{ borderTop: "1px solid var(--leather-100)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--leather-800)" }}>Tags:</span>
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className="text-xs px-3 py-1 rounded-full transition-colors"
                    style={{ background: "var(--leather-100)", color: "var(--leather-700)" }}
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Back */}
            <div className="mt-12">
              <Link
                href="/blog"
                className="font-semibold text-sm uppercase tracking-wide transition-colors"
                style={{ color: "var(--leather-500)" }}
              >
                ← Back to Blog
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </>
  );
}
