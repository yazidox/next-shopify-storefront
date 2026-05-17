"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AddToCartButton, Money, ProductProvider } from "@shopify/hydrogen-react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Share2,
  Star,
  Truck,
  RotateCcw,
  Shield,
  Gift,
  Package,
} from "@esmate/shadcn/pkgs/lucide-react";
import { useVariantSelector } from "@/hooks/use-variant-selector";
import { getProductSingle, getSiblingProducts } from "./service";
import { analytics } from "@/lib/analytics";
import { titleize } from "@esmate/utils/string";
import { ProductProof } from "../../product-proof";
import { Link } from "@/i18n/navigation";

interface Props {
  data: Awaited<ReturnType<typeof getProductSingle>>;
  siblings: Awaited<ReturnType<typeof getSiblingProducts>>;
}

type ProductMoney = Props["data"]["priceRange"]["minVariantPrice"];

// ╔═══════════════════════════════════════════════════════════════════╗
// ║ Swatch-style PDP — FULL WIDTH                                       ║
// ║ - Gallery: edge-to-edge left ~65%                                   ║
// ║ - Aside: fixed-ish right column ~35%, padded                        ║
// ║ - Bottom tabs: Description / Features / Specifications              ║
// ╚═══════════════════════════════════════════════════════════════════╝

export function ProductSingle({ data, siblings }: Props) {
  const t = useTranslations("Product");
  const tc = useTranslations("Common");
  const tcart = useTranslations("Cart");
  const { variantId, options, selectOption } = useVariantSelector(data);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"description" | "features" | "specifications">("description");

  const images = data.images.nodes.filter((n) => n?.url);
  const main = images[active] ?? images[0];

  const activeVariant = data.variants?.nodes?.find((v) => v?.id === variantId) ?? data.variants?.nodes?.[0];
  const price = activeVariant?.priceV2 ?? data.priceRange.minVariantPrice;
  const availableForSale = activeVariant?.availableForSale !== false;

  const colorOption = useMemo(() => options.find((o) => /col/i.test(o.name)), [options]);
  const otherOptions = useMemo(() => options.filter((o) => o !== colorOption), [options, colorOption]);

  useEffect(() => {
    analytics.viewContent({
      id: data.id,
      name: data.title,
      category: data.productType ?? undefined,
      price: { amount: price.amount, currencyCode: price.currencyCode },
    });
  }, [data, price]);

  const specs = buildSpecs(data);

  return (
    <ProductProvider data={data}>
      {/* ─── MAIN: full-width split ─────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_520px]">
        {/* GALLERY — edge-to-edge */}
        <div className="bg-white">
          <Gallery images={images} active={active} setActive={setActive} main={main} title={data.title} />
        </div>

        {/* ASIDE — padded panel */}
        <aside className="px-6 pt-10 pb-12 lg:px-10 lg:pt-12 lg:pb-16">
          <div className="flex flex-col gap-5 lg:sticky lg:top-28">
            {/* Brand badge + stock */}
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-ink px-3 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-cream uppercase">
                {data.vendor || "ChronoStrap"}
              </span>
              {availableForSale ? (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-line/40 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.18em] text-ink uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  {tc("inStock")}
                </span>
              ) : (
                <span className="rounded-sm bg-line/40 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.18em] text-muted uppercase">
                  {tc("soldOut")}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl leading-[0.95] uppercase md:text-4xl lg:text-5xl">
              {titleize(data.title)}
            </h1>

            {/* Reviews — placeholder until a review app is connected */}
            <Reviews rating={4.9} count={127} />

            {/* Price + payment plan */}
            <div className="flex flex-col gap-2">
              <p className="font-display text-3xl leading-none text-ink lg:text-4xl">
                <Money data={price} />
              </p>
              <PaymentPlan amount={parseFloat(String(price.amount))} currency={price.currencyCode} />
            </div>

            {/* Same-day dispatch urgency */}
            <DispatchCountdown />

            <div className="h-px w-full bg-line" />

            {/* Color swatches — only render when there's a real choice to make */}
            {colorOption && colorOption.values.length > 1 && (
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">
                  Color · <span className="text-ink">{colorOption.values.find((v) => v.selected)?.value}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {colorOption.values.map(({ value, selected, disabled }) => (
                    <button
                      key={value}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectOption(colorOption.name, value)}
                      aria-label={value}
                      title={value}
                      className={`relative h-11 w-11 rounded-full border-2 transition-all ${
                        selected ? "scale-110 border-ink" : "border-line opacity-80 hover:border-ink/40 hover:opacity-100"
                      } disabled:cursor-not-allowed disabled:opacity-30`}
                      style={{ backgroundColor: nameToHex(value) }}
                    >
                      {selected && <span className="absolute -inset-1 rounded-full border border-ink/30" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Other options — same rule: only show when >1 value */}
            {otherOptions
              .filter((o) => o.values.length > 1)
              .map(({ name, values }) => (
                <div key={name} className="flex flex-col gap-3">
                  <p className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">
                    {name} · <span className="text-ink">{values.find((v) => v.selected)?.value}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {values.map(({ value, selected, disabled }) => (
                      <button
                        type="button"
                        key={value}
                        disabled={disabled}
                        onClick={() => selectOption(name, value)}
                        className={`flex h-11 min-w-[64px] items-center justify-center rounded-md border px-4 text-sm font-medium transition-all ${
                          selected ? "border-ink bg-ink text-cream" : "border-line bg-surface text-ink hover:border-ink"
                        } disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            {/* Quantity */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">{tc("quantity")}</p>
              <div className="inline-flex items-center rounded-md border border-line bg-surface">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label={tc("quantity")}
                  className="flex h-12 w-12 items-center justify-center text-ink transition-colors hover:bg-line/30 disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" strokeWidth={2} />
                </button>
                <span className="w-12 text-center text-base font-semibold tabular-nums text-ink">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label={tc("quantity")}
                  className="flex h-12 w-12 items-center justify-center text-ink transition-colors hover:bg-line/30"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* PRIMARY CTA */}
            <AddToCartButton
              variantId={variantId}
              quantity={qty}
              disabled={!variantId || !availableForSale}
              onClick={() => {
                analytics.addToCart({
                  id: data.id,
                  name: data.title,
                  quantity: qty,
                  price: activeVariant?.priceV2
                    ? { amount: activeVariant.priceV2.amount, currencyCode: activeVariant.priceV2.currencyCode }
                    : undefined,
                });
              }}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-ink p-4 text-[11px] font-extrabold tracking-[0.18em] text-cream uppercase transition-colors hover:bg-pop disabled:cursor-not-allowed disabled:opacity-50"
            >
              {!availableForSale ? tc("soldOut") : tc("addToBag")}
              {availableForSale && <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />}
            </AddToCartButton>

            {/* Secondary actions — Wishlist + Share */}
            <SecondaryActions
              productId={data.id}
              title={data.title}
              price={price ? { amount: price.amount, currencyCode: price.currencyCode } : undefined}
            />

            {/* Quick value chips — gift box, dispatch */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ValueChip Icon={Gift} label={t("giftBox")} />
              <ValueChip Icon={Package} label={t("ships24h")} />
            </div>

            {/* Sibling carousel */}
            {siblings.length > 0 && (
              <SiblingCarousel siblings={siblings} currentHandle={data.handle ?? ""} />
            )}

            {/* Trust strip */}
            <ul className="grid grid-cols-1 gap-3 border-t border-line pt-5 sm:grid-cols-3">
              <Trust Icon={Truck} label={tcart("freeShipping")} sub={tcart("freeShippingSub")} />
              <Trust Icon={RotateCcw} label={tcart("returns")} sub={tcart("returnsSub")} />
              <Trust Icon={Shield} label={tcart("warranty")} sub={tcart("warrantySub")} />
            </ul>
          </div>
        </aside>
      </section>

      {/* Social proof — lifestyle videos + lambo (above the tabs) */}
      <ProductProof />

      {/* ─── BOTTOM TABS — Description / Features / Specifications ─── */}
      <section className="border-t border-line bg-cream/50 pb-24 lg:pb-0">
        <div className="mx-auto max-w-[900px] px-6 py-12 lg:px-10 lg:py-16">
          <nav className="flex items-center justify-center gap-4 border-b border-line sm:gap-8 lg:gap-12">
            <TabButton active={tab === "description"} onClick={() => setTab("description")}>
              {t("tabDescription")}
            </TabButton>
            <TabButton active={tab === "features"} onClick={() => setTab("features")}>
              {t("tabFeatures")}
            </TabButton>
            <TabButton active={tab === "specifications"} onClick={() => setTab("specifications")}>
              {t("tabSpecifications")}
            </TabButton>
          </nav>

          <div className="pt-10">
            {tab === "description" && (
              <div className="prose prose-sm max-w-none text-ink/85">
                <p className="text-[15px] leading-[1.7] whitespace-pre-line text-ink/85">
                  {data.description || t("descriptionNone")}
                </p>
              </div>
            )}

            {tab === "features" && (
              <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {(data.tags ?? [])
                  .filter((tag) => !tag.includes(":"))
                  .map((tag, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] text-ink/85">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pop" />
                      {titleize(tag.replace(/[-_]/g, " "))}
                    </li>
                  ))}
                {(data.tags ?? []).filter((tag) => !tag.includes(":")).length === 0 && (
                  <li className="text-[14px] text-muted">{t("featuresNone")}</li>
                )}
              </ul>
            )}

            {tab === "specifications" && (
              <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                {specs.map((s, i) => (
                  <div key={i} className="flex justify-between gap-4 border-b border-line py-3">
                    <dt className="text-[13px] text-muted">{s.label}</dt>
                    <dd className="text-[13px] font-medium text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <MobileStickyCTA
        title={data.title}
        price={price}
        available={availableForSale}
        variantId={variantId ?? undefined}
        qty={qty}
        onAdd={() => {
          analytics.addToCart({
            id: data.id,
            name: data.title,
            quantity: qty,
            price: activeVariant?.priceV2
              ? { amount: activeVariant.priceV2.amount, currencyCode: activeVariant.priceV2.currencyCode }
              : undefined,
          });
        }}
      />
    </ProductProvider>
  );
}

// ────────────────────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pb-4 text-[15px] font-medium transition-colors ${
        active ? "text-ink" : "text-muted hover:text-ink"
      }`}
    >
      {children}
      <span
        className={`absolute inset-x-0 -bottom-px h-0.5 transition-all ${
          active ? "bg-ink" : "bg-transparent"
        }`}
      />
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────
// GALLERY — thumbnails on the LEFT, edge-to-edge white image
// ────────────────────────────────────────────────────────────────────

function Gallery({
  images,
  active,
  setActive,
  main,
  title,
}: {
  images: Props["data"]["images"]["nodes"];
  active: number;
  setActive: (i: number) => void;
  main: Props["data"]["images"]["nodes"][number] | undefined;
  title: string;
}) {
  if (!main) return null;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4 lg:p-4">
      {/* Thumbnails — vertical LEFT on desktop, horizontal scroll on mobile */}
      <div className="order-2 flex shrink-0 gap-2 overflow-x-auto px-4 pb-2 lg:order-1 lg:flex-col lg:gap-2 lg:overflow-visible lg:px-0 lg:pb-0">
        {images.slice(0, 8).map((img, i) => {
          const isActive = i === active;
          return (
            <button
              key={img?.id ?? i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden bg-white transition-all ${
                isActive ? "border-2 border-ink" : "border border-line opacity-70 hover:opacity-100"
              }`}
              aria-label={`Show image ${i + 1}`}
            >
              <Image
                src={img!.url as string}
                alt={img!.altText || `${title} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          );
        })}
      </div>

      {/* Main image — edge-to-edge */}
      <div className="group relative order-1 flex-1 overflow-hidden bg-white lg:order-2">
        <div className="relative aspect-3/2 w-full">
          <Image
            src={main.url as string}
            alt={main.altText || title}
            fill
            sizes="(min-width: 1024px) 1000px, 100vw"
            className="object-contain"
            priority
          />
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setActive(active === 0 ? images.length - 1 : active - 1)}
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full border border-line bg-white/95 p-2 text-ink shadow-sm transition-all hover:scale-110 lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setActive((active + 1) % images.length)}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full border border-line bg-white/95 p-2 text-ink shadow-sm transition-all hover:scale-110 lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </>
        )}
        {images.length > 1 && (
          <span className="absolute top-4 right-4 rounded-sm bg-ink/85 px-2 py-1 text-[10px] font-medium tracking-[0.18em] text-cream uppercase backdrop-blur">
            {active + 1} / {images.length}
          </span>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────

function SiblingCarousel({
  siblings,
  currentHandle,
}: {
  siblings: Props["siblings"];
  currentHandle: string;
}) {
  const t = useTranslations("Product");
  if (!siblings.length) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-5">
      <p className="text-[13px] text-ink">{t("variationsAvailable", { count: siblings.length + 1 })}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <span
          className="relative flex h-14 w-14 shrink-0 items-center justify-center border-2 border-ink bg-white"
          aria-current="true"
          title={t("now")}
        >
          <span className="text-[9px] font-extrabold tracking-[0.18em] text-ink uppercase">{t("now")}</span>
        </span>
        {siblings
          .map((s) =>
            s?.handle ? (
              <Link
                key={s.id}
                href={`/products/${s.handle}`}
                title={s.title}
                className="relative h-14 w-14 shrink-0 overflow-hidden border border-line bg-white opacity-80 transition-all hover:border-ink hover:opacity-100"
              >
                {s.featuredImage?.url && (
                  <Image
                    src={s.featuredImage.url as string}
                    alt={s.featuredImage.altText || s.title}
                    fill
                    sizes="56px"
                    className="object-contain p-0.5"
                  />
                )}
              </Link>
            ) : null,
          )
          .filter(Boolean)}
      </div>
      {currentHandle && <span className="sr-only">Currently viewing {currentHandle}</span>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────
// CONVERSION HELPERS
// ────────────────────────────────────────────────────────────────────

function Reviews({ rating }: { rating: number; count?: number }) {
  const full = Math.floor(rating);
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 fill-current ${i < full ? "text-pop" : "text-ink/15"}`}
            strokeWidth={0}
          />
        ))}
      </div>
      <span className="font-medium text-ink">{rating.toFixed(1)}</span>
    </div>
  );
}

function PaymentPlan({ amount, currency }: { amount: number; currency: string }) {
  const t = useTranslations("Product");
  if (!amount) return null;
  const each = (amount / 4).toFixed(2);
  const sym = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "GBP" ? "£" : `${currency} `;
  return (
    <p className="text-[12px] text-muted">
      {t("klarnaPlan", { count: 4, amount: `${sym}${each}` })}{" "}
      <span className="font-bold text-ink">{t("klarnaProvider")}</span>
    </p>
  );
}

function DispatchCountdown() {
  const t = useTranslations("Product");
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    function compute() {
      const now = new Date();
      // Cut-off: 16:00 local for same-day dispatch
      const cutoff = new Date(now);
      cutoff.setHours(16, 0, 0, 0);
      if (now > cutoff) {
        setText(t("dispatchTomorrow"));
        return;
      }
      const ms = cutoff.getTime() - now.getTime();
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      const s = Math.floor((ms % 60_000) / 1000);
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      const ss = s.toString().padStart(2, "0");
      setText(t("dispatchSameDay", { time: `${hh}:${mm}:${ss}` }));
    }
    compute();
    // Tick every second for a true live countdown
    const id = window.setInterval(compute, 1000);
    return () => window.clearInterval(id);
  }, [t]);
  if (!text) return null;
  return (
    <div className="dispatch-pulse inline-flex items-center gap-2.5 self-start rounded-md border border-emerald-600/30 bg-emerald-50/60 px-3 py-2 text-[12px] font-semibold text-emerald-900 tabular-nums">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-75 animate-[ping_1.4s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
      </span>
      <span>{text}</span>
      <style>{`
        @keyframes dispatchGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          50%      { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); }
        }
        .dispatch-pulse { animation: dispatchGlow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function SecondaryActions({
  productId,
  title,
  price,
}: {
  productId: string;
  title: string;
  price?: { amount: string | number; currencyCode?: string };
}) {
  const t = useTranslations("Product");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem("cs_wishlist") || "[]") as string[];
      setSaved(list.includes(title));
    } catch {
      /* noop */
    }
  }, [title]);

  function toggleSave() {
    try {
      const list = new Set<string>(JSON.parse(localStorage.getItem("cs_wishlist") || "[]"));
      const willBeSaved = !list.has(title);
      if (willBeSaved) list.add(title);
      else list.delete(title);
      localStorage.setItem("cs_wishlist", JSON.stringify([...list]));
      setSaved(willBeSaved);
      if (willBeSaved) {
        analytics.addToWishlist({ id: productId, name: title, price });
      }
    } catch {
      /* noop */
    }
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* noop */
      }
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={toggleSave}
        aria-pressed={saved}
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-md border text-[11px] font-extrabold tracking-[0.18em] uppercase transition-colors ${
          saved
            ? "border-pop bg-pop/5 text-pop"
            : "border-line bg-surface text-ink hover:border-ink"
        }`}
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-pop" : ""}`} strokeWidth={1.75} />
        {saved ? t("saved") : t("wishlist")}
      </button>
      <button
        type="button"
        onClick={share}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface text-[11px] font-extrabold tracking-[0.18em] text-ink uppercase transition-colors hover:border-ink"
      >
        <Share2 className="h-4 w-4" strokeWidth={1.75} />
        {t("share")}
      </button>
    </div>
  );
}

function ValueChip({ Icon, label }: { Icon: typeof Truck; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-[12px] text-ink">
      <Icon className="h-3.5 w-3.5 text-pop" strokeWidth={1.75} />
      <span className="font-medium">{label}</span>
    </div>
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

function MobileStickyCTA({
  title,
  price,
  available,
  variantId,
  qty,
  onAdd,
}: {
  title: string;
  price: ProductMoney;
  available: boolean;
  variantId?: string;
  qty: number;
  onAdd: () => void;
}) {
  const tc = useTranslations("Common");
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 280);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-3 pt-3 backdrop-blur-xl transition-transform duration-300 lg:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">
            {titleize(title)}
          </span>
          <span className="font-display text-lg text-ink">
            <Money data={price} />
          </span>
        </div>
        <AddToCartButton
          variantId={variantId}
          quantity={qty}
          disabled={!variantId || !available}
          onClick={onAdd}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-ink px-5 text-[11px] font-extrabold tracking-[0.18em] text-cream uppercase transition-colors hover:bg-pop disabled:opacity-50"
        >
          {available ? tc("addToBag") : tc("soldOut")}
          {available && <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />}
        </AddToCartButton>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────

function buildSpecs(data: Props["data"]): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const tags = data.tags ?? [];
  for (const tag of tags) {
    const idx = tag.indexOf(":");
    if (idx <= 0) continue;
    const key = tag.slice(0, idx).trim();
    const value = tag.slice(idx + 1).trim();
    const lookup: Record<string, string> = {
      material: "Material",
      "case-material": "Case Material",
      "case-size": "Case size",
      diameter: "Diameter",
      waterproof: "Water resistant",
      water: "Water resistant",
      movement: "Movement",
      crystal: "Crystal",
      strap: "Strap",
      origin: "Origin",
    };
    const label = lookup[key.toLowerCase()] ?? titleize(key.replace(/[-_]/g, " "));
    out.push({ label, value });
  }
  if (out.length === 0) {
    out.push(
      { label: "Case Material", value: "Bioceramic" },
      { label: "Movement", value: "Mechanical" },
      { label: "Water resistant", value: "2 Bar" },
    );
  }
  return out;
}

function nameToHex(name: string): string {
  const n = name.toLowerCase();
  const map: Record<string, string> = {
    black: "#0a0a0a",
    "stealth black": "#0a0a0a",
    white: "#f4efe6",
    "arctic white": "#f4efe6",
    cream: "#f4efe6",
    ivory: "#f4efe6",
    grey: "#6c6a63",
    gray: "#6c6a63",
    silver: "#cfcfcf",
    pink: "#f15bb5",
    rose: "#f15bb5",
    "pink pop": "#f15bb5",
    purple: "#7a3aff",
    "royal purple": "#7a3aff",
    violet: "#7a3aff",
    red: "#cd3c30",
    wine: "#941843",
    bordeaux: "#941843",
    orange: "#ff7a1a",
    "orenji hachi": "#ff7a1a",
    "hyper yellow": "#fde047",
    yellow: "#fde047",
    "yellow sky": "#fde047",
    teal: "#0fa3a3",
    green: "#10b981",
    vert: "#10b981",
    blue: "#3b82f6",
    "sky blue": "#9bd0e8",
    "royal blue": "#1f4ea8",
  };
  return map[n] ?? "#cfcfcf";
}
