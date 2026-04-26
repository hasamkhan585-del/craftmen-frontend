import { getPosts } from "@/lib/wordpress";
import PostCard from "@/components/blog/PostCard";
import BlogSidebar from "@/components/blog/BlogSidebar";
import Link from "next/link";
import { buildMetadata } from "@/components/seo/SEO";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Leather Craft Blog",
  description: "Leather care guides, craft stories, product spotlights and news from our workshop.",
  url: "/blog",
});

export const revalidate = 60;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params  = await searchParams;
  const page    = parseInt(params.page || "1");
  const perPage = 9;

  const posts = await getPosts({ per_page: perPage, page, _embed: 1 }).catch(() => []);

  return (
    <main>
      {/* Banner */}
      <div className="page-banner">
        <div className="section-container">
          <h1 className="page-banner-title">Leather Craft Blog</h1>
          <p className="page-banner-sub">Care guides, craft stories &amp; news from our workshop</p>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Blog grid */}
          <div className="flex-1 min-w-0">
            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>

                <div className="flex justify-center gap-4 mt-12">
                  {page > 1 && (
                    <Link
                      href={`/blog?page=${page - 1}`}
                      className="px-6 py-2 rounded text-sm font-semibold border transition-all"
                      style={{ borderColor: "var(--leather-300)", color: "var(--leather-700)" }}
                    >
                      ← Previous
                    </Link>
                  )}
                  {posts.length === perPage && (
                    <Link
                      href={`/blog?page=${page + 1}`}
                      className="px-6 py-2 rounded text-sm font-semibold text-white"
                      style={{ background: "var(--leather-500)" }}
                    >
                      Next →
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "var(--leather-900)" }}>No posts yet</h2>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Add blog posts in your WordPress admin to see them here.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <BlogSidebar activeCategory={params.category} />
          </div>
        </div>
      </div>
    </main>
  );
}
