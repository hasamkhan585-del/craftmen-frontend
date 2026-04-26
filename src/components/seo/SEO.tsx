import { Metadata } from "next";
import { YoastSEO } from "@/lib/wordpress";
// YoastSEO.og_image can be YoastOGImage[] — handled in buildMetadata

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  yoast?: YoastSEO;
  noIndex?: boolean;
}

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "HeadlessWP";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function buildMetadata({
  title,
  description,
  image,
  url,
  type = "website",
  yoast,
  noIndex,
}: SEOProps): Metadata {
  const resolvedTitle = yoast?.title || title || SITE_NAME;
  const resolvedDescription = yoast?.description || description || "";
  // Yoast returns og_image as array of objects — extract the first URL
  const yoastImage = Array.isArray(yoast?.og_image)
    ? yoast.og_image[0]?.url
    : yoast?.og_image;
  const resolvedImage = yoastImage || image;
  const resolvedUrl = yoast?.canonical || (url ? `${SITE_URL}${url}` : SITE_URL);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    robots: noIndex ? "noindex, nofollow" : "index, follow",
    alternates: { canonical: resolvedUrl },
    openGraph: {
      title: yoast?.og_title || resolvedTitle,
      description: yoast?.og_description || resolvedDescription,
      url: resolvedUrl,
      siteName: SITE_NAME,
      type,
      ...(resolvedImage ? { images: [{ url: resolvedImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: yoast?.og_title || resolvedTitle,
      description: yoast?.og_description || resolvedDescription,
      ...(resolvedImage ? { images: [resolvedImage] } : {}),
    },
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
  url,
}: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        image,
        datePublished,
        dateModified: dateModified || datePublished,
        author: { "@type": "Person", name: authorName },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
        url,
      }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency = "USD",
  availability,
  url,
}: {
  name: string;
  description: string;
  image?: string;
  price: string;
  currency?: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
  url: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        image,
        offers: {
          "@type": "Offer",
          price,
          priceCurrency: currency,
          availability: `https://schema.org/${availability}`,
          url,
        },
      }}
    />
  );
}
