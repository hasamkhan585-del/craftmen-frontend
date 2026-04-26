import Link from "next/link";
import Image from "next/image";
import type { WCProduct } from "@/types/woocommerce";
import { formatPrice, isOnSale, getProductImage } from "@/lib/woocommerce-utils";
import AddToCartButton from "@/components/shop/AddToCartButton";

interface Props {
  product: WCProduct;
}

function Stars({ rating }: { rating: string }) {
  const r = Math.round(parseFloat(rating || "0"));
  return (
    <div className="flex gap-0.5" style={{ color: "var(--leather-300)" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3 h-3 ${s <= r ? "fill-current" : "fill-none stroke-current"}`}
          viewBox="0 0 24 24"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            strokeWidth={1.5}
          />
        </svg>
      ))}
    </div>
  );
}

export default function ProductCard({ product }: Props) {
  const price = formatPrice(product);
  const onSale = isOnSale(product);
  const img = getProductImage(product);
  const regularPrice = onSale
    ? `$${(parseInt(product.prices.regular_price) / 100).toFixed(2)}`
    : null;
  const isVariable = product.type === "variable" || product.has_options || product.variations?.length > 0;

  return (
    <div className="product-card flex flex-col">
      {/* Clickable image + info */}
      <Link href={`/shop/${product.slug}`} className="block flex-1">
        <div className="product-card-img">
          {img ? (
            <Image
              src={img}
              alt={product.images[0]?.alt || product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized={img.includes("localhost")}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-4xl"
              style={{ background: "var(--leather-100)" }}
            >
              🧳
            </div>
          )}
          {onSale && <span className="product-card-badge">Sale</span>}
          {!product.is_in_stock && (
            <span
              className="absolute inset-0 flex items-center justify-center text-sm font-bold"
              style={{ background: "rgba(44,24,16,0.6)", color: "#fff" }}
            >
              Out of Stock
            </span>
          )}
        </div>

        <div className="product-card-body">
          <p className="product-card-name">{product.name}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="product-card-price">{price}</span>
            {regularPrice && (
              <span className="product-card-price-old">{regularPrice}</span>
            )}
          </div>
          {parseFloat(product.average_rating) > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Stars rating={product.average_rating} />
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                ({product.review_count})
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Action button */}
      <div className="px-4 pb-4 pt-1">
        {isVariable ? (
          <Link
            href={`/shop/${product.slug}`}
            className="product-card-btn w-full text-center block"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Product
          </Link>
        ) : (
          <AddToCartButton
            productId={product.id}
            inStock={product.is_in_stock}
            className="product-card-btn w-full text-center block"
          />
        )}
      </div>
    </div>
  );
}
