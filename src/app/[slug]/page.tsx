import { getPage, getPages } from "@/lib/wordpress";
import { getACFPage } from "@/lib/acf";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buildMetadata } from "@/components/seo/SEO";
import SectionRenderer from "@/components/sections/SectionRenderer";
import type { Metadata } from "next";

export const revalidate = 120;

export async function generateStaticParams() {
  const pages = await getPages().catch(() => []);
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug).catch(() => null);
  if (!page) return {};
  return buildMetadata({
    title: page.title.rendered.replace(/<[^>]*>/g, ""),
    url: `/${slug}`,
    yoast: page.yoast_head_json,
  });
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try to load ACF page data (flexible content sections)
  const [acfPage, wpPage] = await Promise.all([
    getACFPage(slug).catch(() => null),
    getPage(slug).catch(() => null),
  ]);

  if (!wpPage && !acfPage) notFound();

  // If ACF page has sections, render with SectionRenderer
  if (acfPage && acfPage.sections && acfPage.sections.length > 0) {
    return (
      <>
        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <span className="text-gray-600">{acfPage.title}</span>
        </nav>
        <SectionRenderer sections={acfPage.sections} />
      </>
    );
  }

  // Fallback: render classic WordPress page content
  const page = wpPage!;
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span>/</span>
        <span
          className="text-gray-600"
          dangerouslySetInnerHTML={{ __html: page.title.rendered }}
        />
      </nav>

      <h1
        className="text-4xl font-extrabold text-gray-900 mb-8"
        dangerouslySetInnerHTML={{ __html: page.title.rendered }}
      />

      <div
        className="prose prose-lg prose-gray max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: page.content.rendered }}
      />
    </div>
  );
}
