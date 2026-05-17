"use client";

import Link from "next/link";
import { useState } from "react";
import { Money, useCart } from "@shopify/hydrogen-react";
import { ArrowRight, Check, Loader2 } from "@esmate/shadcn/pkgs/lucide-react";
import { analytics } from "@/lib/analytics";
import { CurrencyCode } from "@/lib/graphql/graphql";
import { StepModel } from "../step-model";
import { STRAP_COLOURWAYS, type Colourway } from "./colourways";

type StrapMoney = { amount: string; currencyCode: CurrencyCode };

interface Props {
  variantId: string | null;
  price: StrapMoney | null;
}

export function BuyStrapList({ variantId, price }: Props) {
  return (
    <section className="mx-auto max-w-[1800px]">
      <h1 className="sr-only">Official ChronoStrap colourways</h1>

      {/* Section header */}
      <div className="mb-12 flex flex-col items-baseline justify-between gap-6 lg:mb-20 lg:flex-row">
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="flex items-center gap-3 text-muted">
            <span className="font-display text-[11px] tracking-[0.32em] uppercase">01</span>
            <span className="h-px w-10 bg-line sm:w-12" />
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase">Official Straps</span>
          </div>
          <h2 className="font-display text-3xl leading-[0.95] text-ink uppercase sm:text-4xl md:text-5xl lg:text-6xl">
            Eight colourways.
            <br />
            One <span className="text-pop">snap.</span>
          </h2>
        </div>
        <Link
          href="/custom-strap"
          className="group inline-flex items-center gap-3 text-[10px] font-medium tracking-[0.3em] text-muted uppercase transition-colors hover:text-ink"
        >
          <span className="h-px w-10 bg-line transition-all group-hover:w-16 group-hover:bg-ink" />
          Or design your own
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {STRAP_COLOURWAYS.map((s) => (
          <StrapCard key={s.id} colourway={s} variantId={variantId} price={price} />
        ))}
      </div>

      {!variantId && (
        <p className="mt-10 text-center text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
          Custom Strap product not yet imported in Shopify — Add to Bag is disabled.
        </p>
      )}
    </section>
  );
}

function StrapCard({
  colourway,
  variantId,
  price,
}: {
  colourway: Colourway;
  variantId: string | null;
  price: StrapMoney | null;
}) {
  const { linesAdd, status } = useCart();
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  function add(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!variantId || adding) return;
    setAdding(true);
    try {
      linesAdd([
        {
          merchandiseId: variantId,
          quantity: 1,
          attributes: [
            { key: "Build", value: "Official Strap" },
            { key: "Colourway", value: colourway.name },
            { key: "Tone", value: colourway.tagline },
          ],
        },
      ]);
      analytics.addToCart({
        id: variantId,
        name: `Custom Strap — ${colourway.name}`,
        quantity: 1,
        price: price ? { amount: price.amount, currencyCode: price.currencyCode } : undefined,
      });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    } finally {
      window.setTimeout(() => setAdding(false), 600);
    }
  }

  const busy = adding || status === "creating" || status === "updating";
  const isDark = isDarkHex(colourway.bg);
  const fg = isDark ? "#f4efe6" : "#0a0a0a";
  const fgMuted = isDark ? "rgba(244,239,230,0.7)" : "rgba(10,10,10,0.6)";

  return (
    <article
      className="group relative aspect-3/4 overflow-hidden rounded-3xl transition-transform duration-500 hover:-translate-y-1"
      style={{ backgroundColor: colourway.bg }}
    >
      {/* 3D model — interactive (drag to orbit). Title + View button below navigate to detail. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(60% 60% at 50% 45%, ${colourway.swatch}55 0%, transparent 70%)`,
        }}
      />
      <div className="absolute inset-0">
        <StepModel
          srcs={[colourway.src]}
          alt={colourway.name}
          autoRotate={false}
          interactive
          cameraOrbit={colourway.cameraOrbit}
          cameraTarget={colourway.cameraTarget}
        />
      </div>

      {/* Top — tagline pill + swatch */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-6 lg:px-8 lg:pt-8">
        <span
          className="rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.3em] uppercase backdrop-blur-md"
          style={{
            borderColor: isDark ? "rgba(244,239,230,0.25)" : "rgba(10,10,10,0.15)",
            backgroundColor: isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.45)",
            color: fg,
          }}
        >
          {colourway.tagline}
        </span>
        <span
          className="h-7 w-7 rounded-full border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          style={{ backgroundColor: colourway.swatch }}
          aria-hidden
        />
      </div>

      {/* Bottom — name + price + add to cart */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[200%]"
          style={{
            background: `linear-gradient(to bottom, ${hexToRgba(colourway.bg, 0)} 0%, ${hexToRgba(
              colourway.bg,
              0.6,
            )} 40%, ${hexToRgba(colourway.bg, 0.95)} 100%)`,
          }}
        />
        <div className="relative flex flex-col gap-5 p-6 lg:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <Link
              href={`/buy-strap/${colourway.id}`}
              className="pointer-events-auto font-display text-2xl leading-none tracking-wide uppercase transition-opacity hover:opacity-70 md:text-3xl"
              style={{ color: fg }}
            >
              {colourway.name}
            </Link>
            {price && (
              <span
                className="font-display shrink-0 text-2xl leading-none whitespace-nowrap md:text-3xl"
                style={{ color: fg }}
              >
                <Money data={price} />
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={add}
              disabled={!variantId || busy}
              className="pointer-events-auto inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-ink px-6 text-[11px] font-bold tracking-[0.28em] text-cream uppercase transition-all duration-300 hover:bg-pop disabled:opacity-50"
              aria-label={`Add ${colourway.name} strap to bag`}
            >
              {busy ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Adding…
                </>
              ) : added ? (
                <>
                  Added
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </>
              ) : (
                <>
                  Add to Bag
                  <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                </>
              )}
            </button>
            <Link
              href={`/buy-strap/${colourway.id}`}
              className="pointer-events-auto inline-flex h-12 items-center justify-center gap-2 rounded-md border px-5 text-[11px] font-bold tracking-[0.28em] uppercase transition-colors hover:opacity-80"
              style={{ borderColor: fgMuted, color: fg }}
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function isDarkHex(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.6;
}

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
