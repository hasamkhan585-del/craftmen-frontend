import Link from "next/link";
import Image from "next/image";
import { getCategories, getPosts } from "@/lib/wordpress";
import type { WPCategory } from "@/lib/wordpress";

export default async function BlogSidebar({ activeCategory }: { activeCategory?: string }) {
  const [categories, recentPosts] = await Promise.allSettled([
    getCategories(),
    getPosts({ per_page: 4, _embed: 1 }),
  ]);

  const cats  = categories.status  === "fulfilled" ? categories.value.filter((c: WPCategory) => c.count > 0) : [];
  const posts = recentPosts.status === "fulfilled" ? recentPosts.value : [];

  return (
    <aside className="space-y-6">
      {/* Categories */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--leather-100)" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "var(--leather-100)", background: "var(--leather-50)" }}
        >
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: "var(--leather-800)" }}>
            Categories
          </h3>
        </div>
        <div className="bg-white p-3">
          <Link
            href="/blog"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
            style={!activeCategory ? { background: "var(--leather-100)", color: "var(--leather-800)", fontWeight: 600 } : { color: "var(--color-text-muted)" }}
          >
            <span>All Posts</span>
          </Link>
          {cats.map((cat: WPCategory) => (
            <Link
              key={cat.id}
              href={`/blog/category/${cat.slug}`}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
              style={activeCategory === cat.slug
                ? { background: "var(--leather-100)", color: "var(--leather-800)", fontWeight: 600 }
                : { color: "var(--color-text-muted)" }
              }
            >
              <span>{cat.name}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--leather-100)", color: "var(--leather-600)" }}
              >
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      {posts.length > 0 && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--leather-100)" }}
        >
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: "var(--leather-100)", background: "var(--leather-50)" }}
          >
            <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: "var(--leather-800)" }}>
              Recent Posts
            </h3>
          </div>
          <div className="bg-white divide-y" style={{ borderColor: "var(--leather-50)" }}>
            {posts.map((post) => {
              const img = post.featured_image_url || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="flex gap-3 p-4 transition-colors hover:bg-[var(--leather-50)]"
                >
                  {img ? (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--leather-100)" }}>
                      <Image src={img} alt={post.title.rendered} fill className="object-cover" unoptimized={img.includes("localhost")} />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-xl" style={{ background: "var(--leather-100)" }}>
                      📰
                    </div>
                  )}
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold leading-snug line-clamp-2"
                      style={{ color: "var(--leather-900)" }}
                      dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                    <p className="text-xs mt-1" style={{ color: "var(--leather-400)" }}>
                      {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: "var(--leather-900)" }}
      >
        <p className="text-xs font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "var(--leather-300)" }}>
          Newsletter
        </p>
        <h3 className="font-bold text-lg mb-3" style={{ color: "#fff", fontFamily: "Georgia,serif" }}>
          Leather Care Tips & Stories
        </h3>
        <p className="text-xs mb-5" style={{ color: "var(--leather-300)", lineHeight: 1.6 }}>
          Monthly tips on caring for your leather goods, plus workshop stories and new arrivals.
        </p>
        <input
          type="email"
          placeholder="your@email.com"
          className="w-full px-4 py-2.5 rounded text-sm mb-3 outline-none"
          style={{ background: "var(--leather-800)", color: "var(--leather-100)", border: "1px solid var(--leather-600)" }}
        />
        <button className="btn-primary w-full text-sm">Subscribe</button>
      </div>
    </aside>
  );
}
