"use client";
import { Money, useCart } from "@shopify/hydrogen-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, Loader2, Check } from "@esmate/shadcn/pkgs/lucide-react";
import { useEffect, useState } from "react";
import { getProductList } from "./service";
import { useRequest } from "@esmate/react/ahooks";
import { titleize } from "@esmate/utils/string";
import { analytics } from "@/lib/analytics";
import { useStoreLocalization } from "../store-localization";
import { Link } from "@/i18n/navigation";

interface Props {
  data: Awaited<ReturnType<typeof getProductList>>;
}

export function ProductList(props: Props) {
  const t = useTranslations("Product");
  const { countryCode } = useStoreLocalization();
  const [pages, setPages] = useState([props.data]);
  const lastPage = pages[pages.length - 1];
  const lastCursor = lastPage.edges[lastPage.edges.length - 1].cursor;
  const hasNextPage = lastPage.pageInfo.hasNextPage;

  useEffect(() => {
    setPages([props.data]);
  }, [countryCode, props.data]);

  const request = useRequest(
    async () => {
      setPages([...pages, await getProductList(lastCursor, countryCode)]);
    },
    { manual: true },
  );

  const allEdges = pages.flatMap(({ edges }) => edges);

  return (
    <section className="mx-auto max-w-[1800px]">
      <h1 className="sr-only">{t("listSrTitle")}</h1>

      {/* Section header — matches landing page */}
      <div className="mb-12 flex flex-col items-baseline justify-between gap-6 lg:mb-20 lg:flex-row">
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="flex items-center gap-3 text-muted">
            <span className="font-display text-[11px] tracking-[0.32em] uppercase">{t("listSectionNumber")}</span>
            <span className="h-px w-10 bg-line sm:w-12" />
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase">{t("listSectionEyebrow")}</span>
          </div>
          <h2 className="font-display text-3xl leading-[0.95] text-ink uppercase sm:text-4xl md:text-5xl lg:text-6xl">
            {allEdges.length} {t("listTitleSuffix")}
            <br />
            {t("listTitleObsessionLine")} <span className="text-pop">{t("listObsession")}</span>
          </h2>
        </div>
        <Link
          href="/custom-strap"
          className="group inline-flex items-center gap-3 text-[10px] font-medium tracking-[0.3em] text-muted uppercase transition-colors hover:text-ink"
        >
          <span className="h-px w-10 bg-line transition-all group-hover:w-16 group-hover:bg-ink" />
          {t("buildYourOwn")}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
        {allEdges.map(({ node }, i) => (
          <ProductCard key={node.handle} node={node} index={i} />
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-16 flex justify-center">
          <button
            type="button"
            onClick={request.run}
            disabled={request.loading}
            className="group inline-flex items-center gap-3 rounded-md border border-ink px-8 py-4 text-[11px] font-bold tracking-[0.28em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream disabled:opacity-50"
          >
            {request.loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {request.loading ? t("loading") : request.error ? t("tryAgain") : t("loadMore")}
          </button>
        </div>
      )}
    </section>
  );
}

function ProductCard({ node, index }: { node: Props["data"]["edges"][number]["node"]; index: number }) {
  const t = useTranslations("Product");
  const cart = useCart();
  const { checkoutUrl, linesAdd, status, totalQuantity } = cart;
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [payingNow, setPayingNow] = useState(false);
  const [checkoutStartQuantity, setCheckoutStartQuantity] = useState<number | null>(null);
  const variantId = node.variants?.nodes?.[0]?.id;
  const price = node.priceRange?.minVariantPrice;
  const cartBusy = status === "creating" || status === "updating";
  const busy = adding || payingNow || cartBusy;

  useEffect(() => {
    if (!payingNow || !checkoutUrl) return;
    if (status !== "idle") return;

    const before = checkoutStartQuantity ?? 0;
    const after = totalQuantity ?? 0;
    if (after <= before) return;

    window.location.href = checkoutUrl;
  }, [checkoutStartQuantity, checkoutUrl, payingNow, status, totalQuantity]);

  async function add(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!variantId || busy) return;
    setAdding(true);
    try {
      linesAdd([{ merchandiseId: variantId, quantity: 1 }]);
      analytics.addToCart({
        id: node.id,
        name: node.title,
        quantity: 1,
        price: price ? { amount: price.amount, currencyCode: price.currencyCode } : undefined,
      });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    } finally {
      window.setTimeout(() => setAdding(false), 600);
    }
  }

  function payNow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!variantId || busy) return;

    setCheckoutStartQuantity(totalQuantity ?? 0);
    setPayingNow(true);
    linesAdd([{ merchandiseId: variantId, quantity: 1 }]);
    analytics.addToCart({
      id: node.id,
      name: node.title,
      quantity: 1,
      price: price ? { amount: price.amount, currencyCode: price.currencyCode } : undefined,
    });
  }

  return (
    <article className="group relative aspect-3/4 overflow-hidden rounded-3xl bg-ink/5">
      {/* Whole card is a link to product detail */}
      <Link href={`/products/${node.handle}`} className="absolute inset-0">
        {node.featuredImage?.url && (
          <Image
            src={node.featuredImage.url as string}
            alt={node.featuredImage.altText || node.title}
            fill
            sizes="(min-width: 1024px) 800px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
            priority={index < 4}
          />
        )}
      </Link>

      {/* Top — ref label */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-6 lg:px-8 lg:pt-8">
        <span className="rounded-full bg-cream/70 px-3 py-1 text-[10px] font-medium tracking-[0.3em] text-ink uppercase backdrop-blur-md">
          {t("refLabel")} {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Bottom — name + price + add to cart */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        {/* gradient backdrop for legibility */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[200%]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(244,239,230,0) 0%, rgba(244,239,230,0.55) 40%, rgba(244,239,230,0.95) 100%)",
          }}
        />
        <div className="relative flex flex-col gap-5 p-6 lg:p-8">
          {/* Title + price — both display weight, equal hierarchy */}
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-2xl leading-none tracking-wide text-ink uppercase md:text-3xl">
              {titleize(node.title)}
            </h3>
            {price && (
              <span className="shrink-0 font-display text-2xl leading-none whitespace-nowrap text-ink md:text-3xl">
                <Money data={price} />
              </span>
            )}
          </div>

          {/* Purchase actions — fade in on hover (desktop), always visible on touch */}
          <div className="pointer-events-auto grid grid-cols-2 gap-2 opacity-100 transition-all duration-300 md:opacity-0 md:group-hover:opacity-100">
            <button
              type="button"
              onClick={add}
              disabled={!variantId || busy}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-3 text-[10px] font-bold tracking-[0.22em] text-cream uppercase transition-colors hover:bg-pop disabled:opacity-50"
              aria-label={t("ariaAddBag", { name: node.title })}
            >
              {adding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : added ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
              )}
              {added ? t("addedShort") : t("addBag")}
            </button>

            <button
              type="button"
              onClick={payNow}
              disabled={!variantId || busy}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#ff3b30] px-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-colors hover:bg-[#e03127] disabled:opacity-50"
              aria-label={t("ariaPayNow", { name: node.title })}
            >
              {payingNow ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
              )}
              {t("payNow")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
