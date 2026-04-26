"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import type { WCProductAttribute } from "@/types/woocommerce";
import type { CartVariation } from "@/context/CartContext";

interface Props {
  productId:  number;
  inStock:    boolean;
  label?:     string;
  hasOptions?: boolean;
  attributes?: WCProductAttribute[];
  onVariationChange?: (attrs: CartVariation[]) => void;
}

export default function ProductActions({ productId, inStock, label, hasOptions, attributes, onVariationChange }: Props) {
  const [qty,           setQty]           = useState(1);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});

  // Only show selectors for attributes marked as variation-driving
  const variationAttrs = (attributes ?? []).filter((a) => a.has_variations);

  // All variation attrs must have a value selected before Add to Cart is enabled
  const allSelected = variationAttrs.every((a) => {
    const key = a.taxonomy || a.name;
    return !!selectedAttrs[key];
  });

  // Build variation array for the cart API
  const variationPayload = variationAttrs
    .map((a) => {
      const key = a.taxonomy || a.name;
      return { attribute: key, value: selectedAttrs[key] ?? "" };
    })
    .filter((v) => !!v.value);

  // Notify parent when variation selection changes
  useEffect(() => {
    if (!onVariationChange) return;
    onVariationChange(allSelected ? variationPayload : []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSelected, JSON.stringify(variationPayload)]);

  const canAdd = inStock && (!hasOptions || allSelected);

  function handleAttrChange(attr: WCProductAttribute, value: string) {
    const key = attr.taxonomy || attr.name;
    setSelectedAttrs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      {/* ── Variation selectors (variable products only) ── */}
      {hasOptions && variationAttrs.length > 0 && (
        <div className="mb-5 space-y-4">
          {variationAttrs.map((attr) => {
            const key       = attr.taxonomy || attr.name;
            const selected  = selectedAttrs[key] ?? "";
            return (
              <div key={attr.id}>
                <label
                  className="block text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "var(--leather-700)" }}
                >
                  {attr.name}
                  {selected && (
                    <span className="normal-case font-normal tracking-normal ml-2" style={{ color: "var(--color-text-muted)" }}>
                      — {attr.terms.find((t) => t.slug === selected)?.name ?? selected}
                    </span>
                  )}
                </label>

                {/* Swatch-style buttons */}
                <div className="flex flex-wrap gap-2">
                  {attr.terms.map((term) => (
                    <button
                      key={term.id}
                      type="button"
                      onClick={() => handleAttrChange(attr, term.slug)}
                      className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        border: selected === term.slug
                          ? "2px solid var(--leather-500)"
                          : "1.5px solid var(--leather-200)",
                        background: selected === term.slug ? "var(--leather-50)" : "#fff",
                        color: selected === term.slug
                          ? "var(--leather-700)"
                          : "var(--color-text-muted)",
                        fontWeight: selected === term.slug ? 700 : 500,
                      }}
                    >
                      {term.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Prompt if not all selected */}
          {!allSelected && (
            <p className="text-xs" style={{ color: "var(--leather-400)" }}>
              Please select {variationAttrs.filter((a) => !selectedAttrs[a.taxonomy || a.name]).map((a) => a.name).join(", ")} to continue.
            </p>
          )}
        </div>
      )}

      {/* ── Quantity + Add to Cart ── */}
      <div className="flex gap-3 mb-3">
        {/* Qty stepper */}
        <div
          className="flex items-center rounded-lg overflow-hidden flex-shrink-0"
          style={{ border: "1.5px solid var(--leather-200)", height: "44px" }}
        >
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1 || !inStock}
            className="w-10 h-full flex items-center justify-center text-lg font-medium"
            style={{
              background: "var(--leather-50)",
              color:      qty <= 1 ? "var(--leather-200)" : "var(--leather-700)",
              cursor:     qty <= 1 ? "not-allowed" : "pointer",
            }}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span
            className="w-10 text-center text-sm font-bold select-none"
            style={{
              color:       "var(--leather-900)",
              borderLeft:  "1px solid var(--leather-200)",
              borderRight: "1px solid var(--leather-200)",
              lineHeight:  "44px",
            }}
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            disabled={!inStock}
            className="w-10 h-full flex items-center justify-center text-lg font-medium"
            style={{
              background: "var(--leather-50)",
              color:  inStock ? "var(--leather-700)" : "var(--leather-200)",
              cursor: inStock ? "pointer" : "not-allowed",
            }}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Add to Cart */}
        <div className="flex-1">
          <AddToCartButton
            productId={productId}
            quantity={qty}
            inStock={canAdd}
            variation={variationPayload.length ? variationPayload : undefined}
            label={canAdd ? (label || "Add to Cart") : "Select Options"}
            style={{ height: "44px", padding: "0 1.25rem", fontSize: "0.8125rem" }}
          />
        </div>
      </div>

      {/* View Cart */}
      <Link
        href="/cart"
        className="btn-outline w-full text-center block"
        style={{ fontSize: "0.8125rem" }}
      >
        View Cart
      </Link>
    </div>
  );
}
