import type { Metadata } from "next";
import { Suspense } from "react";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import RecentProducts from "@/components/home/RecentProducts";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import TrendingSection from "@/components/home/TrendingSection";
import CraftsmanSection from "@/components/home/CraftsmanSection";
import { getFeaturedProducts } from "@/lib/woocommerce";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Handcrafted Leather Goods | CraftLeather",
  description: "Premium handmade leather bags, wallets, belts and accessories by master craftsmen. Full-grain leather, lifetime quality.",
};

function SectionSkeleton({ height = "h-64" }: { height?: string }) {
  return <div className={`w-full ${height} bg-gray-100 animate-pulse`} />;
}

export default async function HomePage() {
  const showcaseProducts = await getFeaturedProducts(6).catch(() => []);

  return (
    <main>
      <HeroBanner />

      <Suspense fallback={<SectionSkeleton height="h-48" />}>
        <CategoryGrid />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <RecentProducts />
      </Suspense>

      <CategoryShowcase products={showcaseProducts} />

      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <TrendingSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <CraftsmanSection />
      </Suspense>
    </main>
  );
}
