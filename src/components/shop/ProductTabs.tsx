"use client";

import { useState } from "react";
import type { WCProductAttribute } from "@/types/woocommerce";

interface Props {
  description:      string;
  shortDescription: string;
  attributes:       WCProductAttribute[];
  sku?:             string;
}

type Tab = "Description" | "Specifications";

export default function ProductTabs({ description, shortDescription, attributes, sku }: Props) {
  const hasDesc  = !!(description || shortDescription);
  const hasAttrs = attributes.length > 0 || !!sku;

  const tabs: Tab[] = [];
  if (hasDesc)  tabs.push("Description");
  if (hasAttrs) tabs.push("Specifications");

  const [active, setActive] = useState<Tab>(tabs[0] ?? "Description");

  if (tabs.length === 0) return null;

  return (
    <div>
      {/* ── Tab bar ── */}
      <div className="flex gap-1 border-b" style={{ borderColor: "var(--leather-200)" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className="relative px-6 py-3.5 text-sm font-semibold transition-colors"
            style={{
              color:      active === tab ? "var(--leather-800)" : "var(--color-text-muted)",
              background: "transparent",
            }}
          >
            {tab}
            {active === tab && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                style={{ background: "var(--leather-500)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="py-8">
        {active === "Description" && (
          <div
            className="prose prose-lg prose-gray max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: description || shortDescription || "<p>No description available.</p>",
            }}
          />
        )}

        {active === "Specifications" && (
          <div className="max-w-2xl">
            {attributes.length === 0 && !sku ? (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                No specifications available.
              </p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {sku && (
                    <tr
                      className="border-b"
                      style={{ borderColor: "var(--leather-100)" }}
                    >
                      <td
                        className="py-3 pr-8 font-semibold text-xs uppercase tracking-wider"
                        style={{ color: "var(--leather-700)", width: "35%" }}
                      >
                        SKU
                      </td>
                      <td className="py-3" style={{ color: "var(--color-text-muted)" }}>
                        {sku}
                      </td>
                    </tr>
                  )}
                  {attributes.map((attr) => (
                    <tr
                      key={attr.id}
                      className="border-b"
                      style={{ borderColor: "var(--leather-100)" }}
                    >
                      <td
                        className="py-3 pr-8 font-semibold text-xs uppercase tracking-wider"
                        style={{ color: "var(--leather-700)", width: "35%" }}
                      >
                        {attr.name}
                      </td>
                      <td className="py-3" style={{ color: "var(--color-text-muted)" }}>
                        {attr.terms.length > 0
                          ? attr.terms.map((t) => t.name).join(", ")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
