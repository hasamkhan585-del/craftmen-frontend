import Link from "next/link";
import Image from "next/image";
import { WPPost } from "@/lib/wordpress";

interface PostCardProps {
  post: WPPost;
}

export default function PostCard({ post }: PostCardProps) {
  const title   = post.title.rendered;
  const excerpt = post.excerpt.rendered.replace(/<[^>]*>/g, "").slice(0, 140) + "…";
  const image   = post.featured_image_url || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const author  = post.author_name || post._embedded?.author?.[0]?.name || "CraftLeather";
  const cats    = post._embedded?.["wp:term"]?.[0] || [];
  const date    = new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <article className="blog-card">
      {image && (
        <Link href={`/blog/${post.slug}`}>
          <div className="blog-card-img">
            <Image
              src={image}
              alt={title.replace(/<[^>]*>/g, "")}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={image.includes("localhost")}
            />
          </div>
        </Link>
      )}
      <div className="p-5">
        {cats.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cats.slice(0, 2).map((cat) => (
              <Link key={cat.id} href={`/blog/category/${cat.slug}`}>
                <span className="blog-card-cat">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
        <h2 className="blog-card-title">
          <Link href={`/blog/${post.slug}`}>
            <span dangerouslySetInnerHTML={{ __html: title }} />
          </Link>
        </h2>
        <p className="blog-card-excerpt">{excerpt}</p>
        <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--leather-100)" }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--leather-200)", color: "var(--leather-800)" }}
            >
              {author.charAt(0).toUpperCase()}
            </span>
            {author}
          </div>
          <time className="text-xs" style={{ color: "var(--leather-400)" }} dateTime={post.date}>{date}</time>
        </div>
      </div>
    </article>
  );
}
