import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-heading", weight: ["400","600","700","800"] });
const lato = Lato({ subsets: ["latin"], display: "swap", variable: "--font-body", weight: ["300","400","700"] });

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_SITE_NAME || "CraftLeather",
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME || "CraftLeather"}`,
  },
  description: "Handcrafted leather goods by master artisans. Bags, wallets, belts — made to last a lifetime.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lato.variable} flex flex-col min-h-screen`} style={{ fontFamily: "var(--font-body, Lato, sans-serif)", background: "var(--background)" }}>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<div className="h-16 bg-white shadow-sm" />}>
              <Header />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
