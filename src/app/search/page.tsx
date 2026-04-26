import { searchContent } from "@/lib/wordpress";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search our site",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";

  const results = query
    ? await searchContent(query).catch(() => [])
    : [];

  const getResultUrl = (item: { type: string; subtype: string; url: string }) => {
    if (item.subtype === "post") return item.url.replace(/.*\/(\w+)\/?$/, "/blog/$1");
    if (item.subtype === "page") return item.url.replace(/.*\/(\w+)\/?$/, "/$1");
    if (item.subtype === "product") return item.url.replace(/.*\/(\w+)\/?$/, "/shop/$1");
    return item.url;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Search</h1>

      <form method="GET" action="/search" className="mb-10">
        <div className="flex gap-3">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search posts, pages, products..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <>
          <p className="text-sm text-gray-500 mb-6">
            {results.length > 0
              ? `Found ${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`
              : `No results found for "${query}"`}
          </p>

          {results.length > 0 && (
            <ul className="space-y-4">
              {results.map((item) => (
                <li key={`${item.type}-${item.id}`} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <Link href={getResultUrl(item)} className="group">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 capitalize">
                          {item.subtype || item.type}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
