"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center section-container text-center py-24">
      <h2
        className="text-3xl font-bold mb-4"
        style={{ fontFamily: "Georgia,serif", color: "var(--leather-900)" }}
      >
        Something went wrong
      </h2>
      <p className="mb-8 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex gap-4">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Go home
        </Link>
      </div>
    </div>
  );
}
