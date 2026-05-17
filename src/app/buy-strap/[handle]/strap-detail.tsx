"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Money, useCart } from "@shopify/hydrogen-react";
import { ArrowRight, Check, Loader2, RotateCcw, Shield, Truck } from "@esmate/shadcn/pkgs/lucide-react";
import { analytics } from "@/lib/analytics";
import { CurrencyCode } from "@/lib/graphql/graphql";
import { StepModel } from "../../step-model";
import { STRAP_COLOURWAYS, type Colourway } from "../colourways";

type StrapMoney = { amount: string; currencyCode: CurrencyCode };

export function StrapDetail({
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
  const [qty, setQty] = useState(1);

  const isDark = isDarkHex(colourway.bg);

  // Fire ViewContent
  useEffect(() => {
    analytics.viewContent({
      id: variantId ?? `colourway:${colourway.id}`,
      name: `Custom Strap — ${colourway.name}`,
      category: "Strap",
      price: price ? { amount: price.amount, currencyCode: price.currencyCode } : undefined,
    });
  }, [colourway, variantId, price]);

  function add() {
    if (!variantId || adding) return;
    setAdding(true);
    try {
      linesAdd([
        {
          merchandiseId: variantId,
          quantity: qty,
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
        quantity: qty,
        price: price ? { amount: price.amount, currencyCode: price.currencyCode } : undefined,
      });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    } finally {
      window.setTimeout(() => setAdding(false), 600);
    }
  }

  const busy = adding || status === "creating" || status === "updating";

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_520px]">
      {/* ─── 3D VIEWPORT — edge to edge ─────────────── */}
      <div
        className="relative aspect-square min-h-[60vh] overflow-hidden lg:aspect-auto lg:min-h-[calc(100vh-7rem)]"
        style={{ backgroundColor: colourway.bg }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(60% 60% at 50% 45%, ${colourway.swatch}55 0%, transparent 70%)`,
          }}
        />
        <StepModel
          srcs={[colourway.src]}
          alt={colourway.name}
          autoRotate={false}
          interactive
          cameraOrbit={colourway.cameraOrbit}
          cameraTarget={colourway.cameraTarget}
        />

        {/* Colourway sibling strip — small thumbnails of the OTHER colourways */}
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-2 px-6 lg:bottom-10">
          <div
            className="flex gap-2 rounded-full border px-3 py-2 backdrop-blur-md"
            style={{
              borderColor: isDark ? "rgba(244,239,230,0.2)" : "rgba(10,10,10,0.12)",
              backgroundColor: isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.45)",
            }}
          >
            {STRAP_COLOURWAYS.map((c) => {
              const active = c.id === colourway.id;
              return (
                <Link
                  key={c.id}
                  href={`/buy-strap/${c.id}`}
                  title={c.name}
                  aria-label={c.name}
                  className={`block rounded-full border-2 transition-all ${
                    active ? "h-6 w-6 border-white" : "h-4 w-4 border-white/40 hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.swatch }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── INFO ASIDE ──────────────────────────────── */}
      <aside className="px-6 pt-10 pb-12 lg:px-10 lg:pt-12 lg:pb-16">
        <div className="flex flex-col gap-5 lg:sticky lg:top-28">
          {/* Brand badge */}
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-ink px-3 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-cream uppercase">
              ChronoStrap
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-line/40 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.18em] text-ink uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              In stock
            </span>
          </div>

          {/* Tagline */}
          <p className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">{colourway.tagline}</p>

          {/* Title */}
          <h1 className="font-display text-3xl leading-[0.95] uppercase md:text-4xl lg:text-5xl">{colourway.name}</h1>

          {/* Price */}
          {price && (
            <p className="font-display text-3xl leading-none text-ink lg:text-4xl">
              <Money data={price} />
            </p>
          )}

          <div className="h-px w-full bg-line" />

          {/* Swatch — non-interactive (this IS the colour you're on) */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">
              Colour · <span className="text-ink">{colourway.name}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="relative h-9 w-9 scale-110 rounded-full border-2 border-ink"
                style={{ backgroundColor: colourway.swatch }}
                aria-hidden
              />
              <span className="text-[12px] text-muted">More colourways below the viewer</span>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">Quantity</p>
            <div className="inline-flex items-center rounded-md border border-line bg-surface">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
                className="flex h-10 w-10 items-center justify-center text-ink transition-colors hover:bg-line/30 disabled:opacity-30"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums text-ink">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
                className="flex h-10 w-10 items-center justify-center text-ink transition-colors hover:bg-line/30"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Bag */}
          <button
            type="button"
            onClick={add}
            disabled={!variantId || busy}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-ink p-4 text-[11px] font-extrabold tracking-[0.18em] text-cream uppercase transition-colors hover:bg-pop disabled:cursor-not-allowed disabled:opacity-50"
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
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </>
            )}
          </button>

          {/* Back to list */}
          <Link
            href="/buy-strap"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-line bg-surface text-[11px] font-extrabold tracking-[0.18em] text-ink uppercase transition-colors hover:border-ink"
          >
            ← All colourways
          </Link>

          {/* Trust strip */}
          <ul className="grid grid-cols-1 gap-3 border-t border-line pt-5 sm:grid-cols-3">
            <Trust Icon={Truck} label="Free shipping" sub="Over $150" />
            <Trust Icon={RotateCcw} label="30-day returns" sub="No hassle" />
            <Trust Icon={Shield} label="2-year warranty" sub="Worldwide" />
          </ul>

          {/* Description */}
          <div className="border-t border-line pt-5">
            <p className="text-[14px] leading-normal text-muted">
              The {colourway.name} strap — a {colourway.tagline.toLowerCase()} bioceramic snap-fit strap, hand-finished
              in Switzerland. Fits every ChronoStrap watch and swaps in three seconds.
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
}

function Trust({ Icon, label, sub }: { Icon: typeof Truck; label: string; sub: string }) {
  return (
    <li className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink" strokeWidth={1.5} />
      <div className="flex flex-col leading-tight">
        <span className="text-[12px] font-semibold text-ink">{label}</span>
        <span className="text-[11px] text-muted">{sub}</span>
      </div>
    </li>
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
