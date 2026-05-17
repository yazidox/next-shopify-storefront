"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Search, X, ArrowRight } from "@esmate/shadcn/pkgs/lucide-react";
import { graphql } from "@/lib/graphql";
import { CountryCode } from "@/lib/graphql/graphql";
import { storefront } from "@/lib/storefront";
import { analytics } from "@/lib/analytics";
import { useStoreLocalization } from "./store-localization";
import { Link } from "@/i18n/navigation";

interface Result {
  handle: string;
  title: string;
  vendor: string | null;
  productType: string | null;
  image: { url: string; altText: string | null } | null;
  price: { amount: string; currencyCode: string };
}

const SearchQuery = graphql(`
  query SearchProducts($query: String!, $first: Int!, $country: CountryCode) @inContext(country: $country) {
    products(first: $first, query: $query) {
      nodes {
        handle
        title
        vendor
        productType
        featuredImage {
          url(transform: { maxWidth: 200 })
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`);

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("Search");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { countryCode } = useStoreLocalization();

  // Focus input on open
  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open]);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setQ("");
      setResults([]);
    }
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Debounced query
  const trimmed = q.trim();
  useEffect(() => {
    if (!open || trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = window.setTimeout(async () => {
      try {
        const { data } = await storefront.query(SearchQuery, {
          query: trimmed,
          first: 8,
          country: countryCode as CountryCode,
        });
        const nodes = data?.products?.nodes ?? [];
        const next: Result[] = nodes
          .filter((n): n is NonNullable<typeof n> => Boolean(n?.handle))
          .map((n) => ({
            handle: n.handle,
            title: n.title,
            vendor: n.vendor ?? null,
            productType: n.productType ?? null,
            image: n.featuredImage?.url
              ? { url: n.featuredImage.url as string, altText: n.featuredImage.altText ?? null }
              : null,
            price: {
              amount: n.priceRange.minVariantPrice.amount as string,
              currencyCode: n.priceRange.minVariantPrice.currencyCode,
            },
          }));
        setResults(next);
        analytics.search(trimmed);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(id);
  }, [countryCode, trimmed, open]);

  const showHelp = trimmed.length < 2;
  const showEmpty = !showHelp && !loading && results.length === 0;

  // Suggested queries when nothing typed
  const suggestions = useMemo(() => ["Otto Rosso", "Huit Blanc", "Custom Strap", "Black", "Pink", "Limited"], []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex flex-col bg-cream">
      {/* Input row — large, sits at the top */}
      <div className="flex shrink-0 items-center gap-3 border-b border-line bg-cream px-6 py-5 lg:px-12 lg:py-8">
        <Search className="h-5 w-5 shrink-0 text-muted lg:h-6 lg:w-6" strokeWidth={1.75} />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("placeholder")}
          className="flex-1 bg-transparent text-lg text-ink placeholder:text-muted focus:outline-none lg:text-2xl"
          autoComplete="off"
          spellCheck={false}
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label={t("clearAria")}
            className="rounded-full p-2 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label={t("closeAria")}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-[10px] font-extrabold tracking-[0.18em] text-muted uppercase transition-colors hover:border-ink hover:text-ink"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
          {t("close")}
        </button>
      </div>

      {/* Body — fills the rest of the viewport */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-12 lg:py-14">
          {showHelp && (
            <div className="flex flex-col gap-6">
              <p className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">{t("trySearching")}</p>
              <ul className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => setQ(s)}
                      className="rounded-md border border-line bg-surface px-4 py-2.5 text-sm text-ink transition-colors hover:border-ink"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Quick links to top destinations */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <QuickLink
                  href="/products"
                  title={t("quickShopCollectionTitle")}
                  sub={t("quickShopCollectionSub")}
                  onNavigate={onClose}
                />
                <QuickLink
                  href="/custom-strap"
                  title={t("quickDesignTitle")}
                  sub={t("quickDesignSub")}
                  onNavigate={onClose}
                />
                <QuickLink
                  href="/cart"
                  title={t("quickBagTitle")}
                  sub={t("quickBagSub")}
                  onNavigate={onClose}
                />
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-sm text-muted">
              <span className="h-3 w-3 animate-pulse rounded-full bg-pop" />
              {t("searching")}
            </div>
          )}

          {showEmpty && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-lg text-ink">
                {t("noResultsFor")} <span className="font-semibold">&ldquo;{trimmed}&rdquo;</span>
              </p>
              <p className="text-sm text-muted">{t("noResultsHint")}</p>
              <Link
                href="/products"
                onClick={onClose}
                className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-6 text-[11px] font-extrabold tracking-[0.18em] text-cream uppercase transition-colors hover:bg-pop"
              >
                {t("viewAllProducts")}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </Link>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <p className="mb-4 text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">
                {results.length} {results.length === 1 ? t("result") : t("results")}
              </p>
              <ul className="flex flex-col">
                {results.map((r) => (
                  <li key={r.handle} className="border-b border-line/70 last:border-b-0">
                    <Link
                      href={`/products/${r.handle}`}
                      onClick={onClose}
                      className="group flex items-center gap-4 py-4 transition-colors hover:bg-ink/5"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-canvas">
                        {r.image?.url && (
                          <Image
                            src={r.image.url}
                            alt={r.image.altText || r.title}
                            fill
                            sizes="64px"
                            className="object-contain p-1"
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="font-display text-lg text-ink uppercase">{r.title}</p>
                        <p className="text-[12px] text-muted">
                          {[r.vendor, r.productType].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <p className="font-display text-lg text-ink">{formatPrice(r.price)}</p>
                      <ArrowRight
                        className="ml-2 h-4 w-4 shrink-0 text-muted transition-all group-hover:translate-x-1 group-hover:text-ink"
                        strokeWidth={1.75}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  sub,
  onNavigate,
}: {
  href: string;
  title: string;
  sub: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-4 py-4 transition-colors hover:border-ink"
    >
      <div className="flex flex-col">
        <span className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">{sub}</span>
        <span className="font-display text-lg text-ink uppercase">{title}</span>
      </div>
      <ArrowRight
        className="h-4 w-4 text-muted transition-all group-hover:translate-x-1 group-hover:text-ink"
        strokeWidth={1.75}
      />
    </Link>
  );
}

function formatPrice(p: { amount: string; currencyCode: string }) {
  const n = parseFloat(p.amount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: p.currencyCode,
      minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    }).format(n);
  } catch {
    return `${n} ${p.currencyCode}`;
  }
}
