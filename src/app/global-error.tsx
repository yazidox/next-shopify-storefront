"use client";

import { useEffect } from "react";

/**
 * Fallback that replaces the entire <html> when the root layout itself throws.
 * Kept inline-styled and dependency-free so it can still render even if the
 * design system / providers fail.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof console !== "undefined") {
      console.error("[ChronoStrap fatal error]", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "radial-gradient(80% 60% at 50% 40%, #fff 0%, #f4efe6 60%, #ebe3d2 100%)",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          color: "#0a0a0a",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            textAlign: "center",
          }}
        >
          <div
            style={{
              height: 64,
              width: 64,
              borderRadius: "9999px",
              border: "1px solid #ddd6cb",
              background: "#f4efe6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
            aria-hidden
          >
            ⚠
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h1
              style={{
                margin: 0,
                fontFamily:
                  '"Archivo Black", Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 30,
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
              }}
            >
              Something glitched
            </h1>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#6c6a63" }}>
              We hit a snag loading the page. Tap retry or head home — we&apos;ll get you sorted.
            </p>
            {error.digest && (
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(108,106,99,0.7)",
                }}
              >
                Reference: {error.digest}
              </p>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                appearance: "none",
                cursor: "pointer",
                height: 48,
                padding: "0 32px",
                border: "none",
                borderRadius: 8,
                background: "#0a0a0a",
                color: "#f4efe6",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 48,
                padding: "0 32px",
                border: "1px solid #ddd6cb",
                borderRadius: 8,
                background: "#fff",
                color: "#0a0a0a",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
