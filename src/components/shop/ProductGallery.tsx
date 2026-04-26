"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { WCImage } from "@/types/woocommerce";

interface Props {
  images: WCImage[];
  productName: string;
  onSale?: boolean;
}

export default function ProductGallery({ images, productName, onSale }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox,  setLightbox]  = useState(false);
  const [lbIdx,     setLbIdx]     = useState(0);

  // Reset to first image whenever the images array changes (e.g. variation switch)
  useEffect(() => {
    setActiveIdx(0);
  }, [images[0]?.id]);

  const active = images[activeIdx] ?? images[0];

  const openLightbox = (idx: number) => { setLbIdx(idx); setLightbox(true); };
  const closeLightbox = () => setLightbox(false);

  const prev = useCallback(() => setLbIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setLbIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")      closeLightbox();
      if (e.key === "ArrowLeft")   prev();
      if (e.key === "ArrowRight")  next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  // Prevent body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  return (
    <div>
      {/* ── Featured image ── */}
      <div
        className="relative w-full rounded-xl overflow-hidden mb-3 group cursor-zoom-in"
        style={{ aspectRatio: "1", background: "var(--leather-50)" }}
        onClick={() => openLightbox(activeIdx)}
      >
        {active && (
          <Image
            src={active.src}
            alt={active.alt || productName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
            unoptimized={active.src.includes("localhost")}
          />
        )}
        {onSale && (
          <span className="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded" style={{ background: "var(--leather-500)" }}>
            Sale
          </span>
        )}
        <span className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          Enlarge
        </span>
      </div>

      {/* ── Thumbnails ── */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.slice(0, 10).map((img, i) => (
            <button
              key={`${img.id}-${i}`}
              onClick={() => setActiveIdx(i)}
              className="relative rounded-lg overflow-hidden transition-all duration-200"
              style={{
                aspectRatio: "1",
                background: "var(--leather-50)",
                border: activeIdx === i
                  ? "2.5px solid var(--leather-500)"
                  : "2px solid var(--leather-100)",
                opacity: activeIdx === i ? 1 : 0.65,
                transform: activeIdx === i ? "scale(1)" : "scale(0.96)",
              }}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.thumbnail || img.src}
                alt={img.alt || productName}
                fill
                className="object-cover"
                unoptimized={img.src.includes("localhost")}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl leading-none z-10"
            style={{ background: "rgba(255,255,255,0.15)" }}
            onClick={closeLightbox}
            aria-label="Close"
          >
            ×
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <span className="absolute top-5 left-5 text-white text-sm font-medium" style={{ opacity: 0.8 }}>
              {lbIdx + 1} / {images.length}
            </span>
          )}

          {/* Prev */}
          {images.length > 1 && (
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl z-10"
              style={{ background: "rgba(255,255,255,0.15)" }}
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
            >
              ‹
            </button>
          )}

          {/* Main lightbox image */}
          <div
            className="relative mx-16 my-16 w-full max-w-3xl"
            style={{ aspectRatio: "1" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lbIdx]?.src || ""}
              alt={images[lbIdx]?.alt || productName}
              fill
              className="object-contain"
              unoptimized={(images[lbIdx]?.src || "").includes("localhost")}
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl z-10"
              style={{ background: "rgba(255,255,255,0.15)" }}
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next"
            >
              ›
            </button>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 flex-wrap justify-center max-w-lg px-4">
              {images.slice(0, 8).map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLbIdx(i); }}
                  className="relative w-12 h-12 rounded-lg overflow-hidden transition-all flex-shrink-0"
                  style={{
                    border: lbIdx === i ? "2px solid #fff" : "2px solid rgba(255,255,255,0.25)",
                    opacity: lbIdx === i ? 1 : 0.55,
                  }}
                >
                  <Image src={img.thumbnail || img.src} alt="" fill className="object-cover" unoptimized={img.src.includes("localhost")} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
