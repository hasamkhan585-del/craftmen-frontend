"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import ProductGallery from "./ProductGallery";
import ProductActions from "./ProductActions";
import ProductShare   from "./ProductShare";
import type { WCProduct, WCImage } from "@/types/woocommerce";
import type { CartVariation } from "@/context/CartContext";

interface Props {
  product:      WCProduct;
  price:        string;
  regularPrice: string | null;
  onSale:       boolean;
}

export default function ProductDetailSection({ product, price, regularPrice, onSale }: Props) {
  const [galleryImages, setGalleryImages] = useState<WCImage[]>(product.images);

  const handleVariationChange = useCallback(async (attrs: CartVariation[]) => {
    if (!attrs.length) {
      setGalleryImages(product.images);
      return;
    }
    try {
      const attrStr = attrs.map((a) => `${a.attribute}:${a.value}`).join(",");
      const res = await fetch(
        `/api/variation-gallery?product_id=${product.id}&attrs=${encodeURIComponent(attrStr)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.images) && data.images.length > 0) {
          setGalleryImages(data.images);
        } else {
          setGalleryImages(product.images);
        }
      }
    } catch {
      // fall back to default images silently
    }
  }, [product.id, product.images]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

      {/* LEFT: gallery */}
      <ProductGallery
        images={galleryImages}
        productName={product.name}
        onSale={onSale}
      />

      {/* RIGHT: product info */}
      <div>
        <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "Georgia, serif", color: "var(--leather-900)" }}>
          {product.name}
        </h1>

        {/* Rating */}
        {parseFloat(product.average_rating) > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5" style={{ color: "var(--leather-300)" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  className={`w-4 h-4 ${s <= Math.round(parseFloat(product.average_rating)) ? "fill-current" : "fill-none stroke-current"}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth={1.5} />
                </svg>
              ))}
            </div>
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {product.average_rating} ({product.review_count} reviews)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-5">
          <span className="text-3xl font-bold" style={{ color: "var(--leather-500)" }}>{price}</span>
          {regularPrice && <span className="text-xl line-through text-gray-400">{regularPrice}</span>}
        </div>

        {/* Short description */}
        {product.short_description && (
          <div
            className="prose prose-sm prose-gray mb-6 leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />
        )}

        {/* Stock */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full" style={{ background: product.is_in_stock ? "#22c55e" : "#ef4444" }} />
          <span className="text-sm font-medium" style={{ color: "var(--leather-800)" }}>
            {product.is_in_stock ? "In Stock" : "Out of Stock"}
            {product.low_stock_remaining && ` — Only ${product.low_stock_remaining} left`}
          </span>
        </div>

        {/* Qty + variation selectors + Add to Cart */}
        <ProductActions
          productId={product.id}
          inStock={product.is_in_stock}
          label={product.add_to_cart?.text || "Add to Cart"}
          hasOptions={product.has_options}
          attributes={product.attributes}
          onVariationChange={handleVariationChange}
        />

        {/* Meta: SKU → Category → Tags */}
        <div className="mt-5 space-y-2.5">
          {product.sku && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>SKU:</span>
              <span className="text-sm font-medium" style={{ color: "var(--leather-700)" }}>{product.sku}</span>
            </div>
          )}

          {product.categories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                {product.categories.length === 1 ? "Category:" : "Categories:"}
              </span>
              {product.categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop/category/${c.slug}`}
                  className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
                  style={{ background: "var(--leather-100)", color: "var(--leather-700)" }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {product.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Tags:</span>
              {product.tags.map((t) => (
                <span
                  key={t.id}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "var(--leather-50)", color: "var(--leather-600)", border: "1px solid var(--leather-100)" }}
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Social share */}
        <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--leather-100)" }}>
          <ProductShare title={product.name} />
        </div>

        {/* Guarantees */}
        <div className="mt-5 p-4 rounded-xl" style={{ background: "var(--leather-50)", border: "1px solid var(--leather-100)" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--leather-700)" }}>Our Promise</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M2 8h12M2 12h12" stroke="var(--leather-500)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1.5 1.5" />
                  </svg>
                ),
                text: "Full-grain leather",
              },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 3h5M9 3h5" stroke="var(--leather-500)" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M2 6h5M9 6h5" stroke="var(--leather-500)" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M2 9h5M9 9h5" stroke="var(--leather-500)" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M2 12h5M9 12h5" stroke="var(--leather-500)" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M8 1v14" stroke="var(--leather-400)" strokeWidth="0.8" strokeDasharray="1.5 1.5" strokeLinecap="round" />
                    <path d="M7.2 0.5 Q8 0 8.8 0.5 L8.4 2.5 L7.6 2.5Z" fill="var(--leather-500)" />
                  </svg>
                ),
                text: "Saddle stitched",
              },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--leather-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                text: "Lifetime warranty",
              },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--leather-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                ),
                text: "Free returns",
              },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                {item.icon}{item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
