"use client";

import { useCart, type CartVariation } from "@/context/CartContext";

interface Props {
  productId:  number;
  quantity?:  number;
  inStock?:   boolean;
  label?:     string;
  className?: string;
  style?:     React.CSSProperties;
  variation?: CartVariation[];
}

export default function AddToCartButton({
  productId,
  quantity = 1,
  inStock = true,
  label = "Add to Cart",
  className = "btn-primary w-full text-center block",
  style,
  variation,
}: Props) {
  const { addItem, addingId } = useCart();

  const isAdding = addingId === productId;
  const disabled = !inStock || isAdding;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => addItem(productId, quantity, variation)}
      className={className}
      style={{ ...style, opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {isAdding ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 rounded-full animate-spin inline-block" style={{ borderColor: "rgba(255,255,255,0.4)", borderTopColor: "#fff" }} />
          Adding…
        </span>
      ) : inStock ? label : "Out of Stock"}
    </button>
  );
}
