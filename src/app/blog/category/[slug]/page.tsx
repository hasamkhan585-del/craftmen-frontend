import { getPosts, getCategories } from "@/lib/wordpress";
import PostCard from "@/components/blog/PostCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const cats = await getCategories().catch(() => []);
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cats = await getCategories().catch(() => []);
  const cat = cats.find((c) => c.slug === slug);
  return {
    title: cat ? `${cat.name} — Blog` : "Category",
    description: cat?.description || `Posts in ${slug}`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategories().catch(() => []);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const posts = await getPosts({ categories: category.id, per_page: 12, _embed: 1 }).catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/blog" className="hover:text-gray-600">Blog</Link>
        <span>/</span>
        <span className="text-gray-600">{category.name}</span>
      </nav>

      <h1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-gray-500 mb-10">{category.description}</p>
      )}

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-20">No posts in this category yet.</p>
      )}
    </div>
  );
}
