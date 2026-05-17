"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import {
  CartCheckoutButton,
  CartCost,
  CartLineProvider,
  CartLineQuantityAdjustButton,
  Money,
  useCart,
  useCartLine,
  useShop,
} from "@shopify/hydrogen-react";

import {
  ArrowRight,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  X,
} from "@esmate/shadcn/pkgs/lucide-react";
import { titleize } from "@esmate/utils/string";
import { Link } from "@/i18n/navigation";
import { analytics } from "@/lib/analytics";
import { FomoOfferBlock } from "../fomo-offer";

const STRAP_HANDLE = "chronostrap-custom-strap";
const CART_ID_STORAGE_KEY = "shopifyCartId";

type CrossSell = "watch" | "strap" | null;
type CartLike = ReturnType<typeof useCart>;
type ShopLike = ReturnType<typeof useShop>;
type CartLineInput = {
  merchandiseId: string;
  quantity: number;
  attributes?: { key: string; value: string }[];
};

const CART_REPAIR_MUTATION = /* GraphQL */ `
  mutation RepairCart($input: CartInput!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    cartCreate(input: $input) {
      userErrors {
        field
        message
        code
      }
      cart {
        id
      }
    }
  }
`;

function detectMissing(lines: CartLike["lines"]): CrossSell {
  if (!lines || lines.length === 0) return null;
  let hasStrap = false;
  let hasWatch = false;
  for (const line of lines) {
    const handle = line?.merchandise?.product?.handle;
    if (!handle) continue;
    if (handle === STRAP_HANDLE) hasStrap = true;
    else hasWatch = true;
  }
  if (hasStrap && !hasWatch) return "watch";
  if (hasWatch && !hasStrap) return "strap";
  return null;
}

function readAmount(money: unknown): number | null {
  const amount = (money as { amount?: string | number | null } | null | undefined)?.amount;
  if (amount === null || amount === undefined || amount === "") return null;
  const value = Number(amount);
  return Number.isFinite(value) ? value : null;
}

function hasBrokenCartPricing(cart: CartLike): boolean {
  const lines = cart.lines ?? [];
  if (lines.length === 0) return false;

  // Respect an explicit 100% discount code if one is ever used.
  const hasApplicableDiscountCode = cart.discountCodes?.some((discount) => discount?.applicable);
  if (hasApplicableDiscountCode) return false;

  const hasBrokenLine = lines.some((line) => {
    const quantity = Number(line?.quantity ?? 0);
    const lineAmount = readAmount(line?.cost?.totalAmount);

    return quantity <= 0 || (lineAmount !== null && lineAmount <= 0);
  });

  const subtotal = readAmount(cart.cost?.subtotalAmount);
  return hasBrokenLine || (subtotal !== null && subtotal <= 0);
}

async function repairCart(cart: CartLike, shop: ShopLike) {
  const lines: CartLineInput[] = (cart.lines ?? [])
    .map((line) => {
      const merchandiseId = line?.merchandise?.id;
      if (!merchandiseId) return null;

      const attributes = (line.attributes ?? []).filter((attribute): attribute is { key: string; value: string } =>
        Boolean(attribute?.key && attribute?.value),
      );

      return {
        merchandiseId,
        quantity: Math.max(1, Number(line.quantity ?? 1)),
        ...(attributes.length > 0 ? { attributes } : {}),
      };
    })
    .filter((line): line is CartLineInput => Boolean(line));

  if (lines.length === 0) {
    window.localStorage.removeItem(CART_ID_STORAGE_KEY);
    window.location.reload();
    return;
  }

  const countryCode = (cart.buyerIdentity?.countryCode ?? shop.countryIsoCode ?? "US").toUpperCase();
  const languageCode = (shop.languageIsoCode ?? "EN").toUpperCase();
  const response = await fetch(shop.getStorefrontApiUrl(), {
    method: "POST",
    headers: shop.getPublicTokenHeaders({ contentType: "json" }),
    body: JSON.stringify({
      query: CART_REPAIR_MUTATION,
      variables: {
        country: countryCode,
        language: languageCode,
        input: {
          lines,
          buyerIdentity: { countryCode },
        },
      },
    }),
  });

  const json = await response.json();
  const userErrors = json.data?.cartCreate?.userErrors ?? [];
  const cartId = json.data?.cartCreate?.cart?.id;

  if (!response.ok || json.errors?.length || userErrors.length || !cartId) {
    throw new Error("Shopify cart repair failed");
  }

  window.localStorage.setItem(CART_ID_STORAGE_KEY, cartId);
  window.location.reload();
}

export function Cart() {
  const t = useTranslations("Cart");
  const cart = useCart();
  const shop = useShop();
  const lines = cart.lines ?? [];
  const isCartEmpty = lines.length === 0;
  const itemCount = cart.totalQuantity ?? 0;
  const missing = detectMissing(cart.lines);
  const [repairingCart, setRepairingCart] = useState(false);
  const repairStartedRef = useRef(false);

  const cartNeedsRepair = cart.status === "idle" && hasBrokenCartPricing(cart);

  useEffect(() => {
    if (!cartNeedsRepair || repairStartedRef.current) return;

    repairStartedRef.current = true;
    setRepairingCart(true);

    repairCart(cart, shop).catch((error) => {
      console.error("Failed to repair cart pricing", error);
      try {
        window.localStorage.removeItem(CART_ID_STORAGE_KEY);
      } finally {
        window.location.reload();
      }
    });
  }, [cart, cartNeedsRepair, shop]);

  if (repairingCart) {
    return <RepairingCart />;
  }

  if (isCartEmpty) {
    return <EmptyCart />;
  }

  return (
    <section className="mx-auto max-w-[1400px] pb-24 lg:pb-0">
      {/* HEADER */}
      <header className="mb-8 flex items-end justify-between gap-6 border-b border-line pb-6 lg:mb-12 lg:pb-8">
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">
            {itemCount} {itemCount === 1 ? t("item") : t("items")}
          </span>
          <h1 className="font-display text-3xl leading-[0.95] uppercase md:text-4xl lg:text-5xl">{t("title")}</h1>
        </div>
        <Link
          href="/products"
          className="hidden text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase transition-colors hover:text-ink sm:inline-flex sm:items-center sm:gap-2"
        >
          ← {t("continueShopping")}
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_440px]">
        {/* ─── LINES ────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {lines.map((line) => (
            <CartLineProvider key={line?.id} line={line!}>
              <CartLineCard />
            </CartLineProvider>
          ))}
          {missing && <CrossSellCard missing={missing} />}
        </div>

        {/* Mobile sticky checkout — always visible on phones */}
        <MobileStickyCheckout itemCount={itemCount} />

        {/* ─── SUMMARY ──────────────────────────────── */}
        <aside>
          <div className="flex flex-col gap-6 rounded-md border border-line bg-cream p-6 lg:sticky lg:top-28 lg:p-8">
            <h2 className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">{t("orderSummary")}</h2>

            <dl className="flex flex-col gap-3 text-[14px]">
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">{t("subtotal")}</dt>
                <dd className="font-medium text-ink">
                  <CartCost amountType="subtotal" />
                </dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">{t("shipping")}</dt>
                <dd className="font-medium text-ink">{t("shippingValue")}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">{t("taxes")}</dt>
                <dd className="font-medium text-ink">{t("taxesValue")}</dd>
              </div>
            </dl>

            <div className="h-px w-full bg-line" />

            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-extrabold tracking-[0.18em] text-ink uppercase">{t("total")}</span>
              <span className="font-display text-2xl leading-none text-ink lg:text-3xl">
                <CartCost amountType="subtotal" />
              </span>
            </div>

            <DiscountCodeForm />

            <FomoOfferBlock />

            <CartCheckoutButton
              disabled={isCartEmpty}
              onPointerDown={() => trackInitiateCheckout(cart)}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-ink p-4 text-[11px] font-extrabold tracking-[0.18em] text-cream uppercase transition-colors hover:bg-pop disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("checkout")}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </CartCheckoutButton>

            <Link
              href="/products"
              className="-mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-line bg-surface text-[11px] font-extrabold tracking-[0.18em] text-ink uppercase transition-colors hover:border-ink sm:hidden"
            >
              {t("continueShopping")}
            </Link>

            {/* Trust strip */}
            <ul className="grid grid-cols-1 gap-3 border-t border-line pt-5">
              <Trust Icon={Truck} label={t("freeShipping")} sub={t("freeShippingSub")} />
              <Trust Icon={RotateCcw} label={t("returns")} sub={t("returnsSub")} />
              <Trust Icon={Shield} label={t("warranty")} sub={t("warrantySub")} />
            </ul>

            <p className="text-center text-[10px] font-medium tracking-[0.18em] text-muted uppercase">{t("secured")}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────
// LINE ITEM — matches PDP card aesthetic
// ────────────────────────────────────────────────────────────────────

function CartLineCard() {
  const t = useTranslations("Cart");
  const line = useCartLine();

  const img = line.merchandise?.image;
  const title = line.merchandise?.product?.title ?? "";
  const handle = line.merchandise?.product?.handle ?? "";
  const opts = line.merchandise?.selectedOptions ?? [];
  const attrs = (line.attributes ?? []).filter((a): a is { key: string; value: string } =>
    Boolean(a?.key && a?.value && a.value !== ""),
  );

  return (
    <article className="grid grid-cols-[112px_1fr] gap-4 rounded-md border border-line bg-surface p-4 sm:grid-cols-[140px_1fr] sm:gap-6 sm:p-5">
      {/* Image */}
      <Link href={`/products/${handle}`} className="relative aspect-square overflow-hidden rounded-md bg-canvas">
        {img?.url && (
          <Image
            src={img.url as string}
            alt={img.altText || title}
            fill
            sizes="(min-width: 640px) 140px, 112px"
            quality={75}
            className="object-contain p-2"
          />
        )}
      </Link>

      {/* Content */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/products/${handle}`}
              className="font-display text-lg leading-tight text-ink uppercase transition-colors hover:text-pop sm:text-xl"
            >
              {titleize(title)}
            </Link>

            {/* Variant options */}
            {opts.filter((o) => o?.value && o.value !== "Default Title").length > 0 && (
              <p className="mt-1 text-[12px] text-muted">
                {opts
                  .filter((o) => o?.value && o.value !== "Default Title")
                  .map((o) => `${o?.name}: ${o?.value}`)
                  .join(" · ")}
              </p>
            )}
          </div>

          <p className="font-display text-lg whitespace-nowrap text-ink sm:text-xl">
            {line.cost?.totalAmount && <Money data={line.cost.totalAmount} />}
          </p>
        </div>

        {/* Custom attributes — e.g. Custom Strap details */}
        {attrs.length > 0 && (
          <dl className="grid gap-1.5 rounded-md bg-cream/80 p-3 text-[11px]">
            {attrs.map((a) => (
              <div key={a.key} className="flex items-baseline justify-between gap-4">
                <dt className="font-medium tracking-wide text-muted uppercase">{a.key}</dt>
                <dd className="text-right font-medium text-ink">{a.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Quantity + remove */}
        <div className="mt-auto flex items-center justify-between gap-3">
          <QtyControl />
          <CartLineQuantityAdjustButton
            adjust="remove"
            className="group inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.18em] text-muted uppercase transition-colors hover:text-pop"
          >
            <X className="h-3 w-3" strokeWidth={2.5} />
            {t("remove")}
          </CartLineQuantityAdjustButton>
        </div>
      </div>
    </article>
  );
}

// Quantity stepper — Hydrogen's adjust buttons + manual qty display
function QtyControl() {
  const { quantity = 1 } = useCartLine();
  return (
    <div className="inline-flex items-center rounded-md border border-line bg-surface">
      <CartLineQuantityAdjustButton
        adjust="decrease"
        className="flex h-11 w-11 items-center justify-center text-ink transition-colors hover:bg-line/30 disabled:opacity-30"
      >
        <Minus className="h-4 w-4" strokeWidth={2} />
      </CartLineQuantityAdjustButton>
      <span className="w-11 text-center text-base font-semibold text-ink tabular-nums">{quantity}</span>
      <CartLineQuantityAdjustButton
        adjust="increase"
        className="flex h-11 w-11 items-center justify-center text-ink transition-colors hover:bg-line/30"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
      </CartLineQuantityAdjustButton>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// MOBILE STICKY CHECKOUT — always visible on phones
// ────────────────────────────────────────────────────────────────────

function MobileStickyCheckout({ itemCount }: { itemCount: number }) {
  const t = useTranslations("Cart");
  const cart = useCart();
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-3 pt-3 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">
            {itemCount} {itemCount === 1 ? t("item") : t("items")}
          </span>
          <span className="font-display text-lg text-ink">
            <CartCost amountType="subtotal" />
          </span>
          <span className="text-[10px] text-muted">{t("taxesValue")}</span>
        </div>
        <CartCheckoutButton
          onPointerDown={() => trackInitiateCheckout(cart)}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-ink px-5 text-[11px] font-extrabold tracking-[0.18em] text-cream uppercase transition-colors hover:bg-pop disabled:opacity-50"
        >
          {t("checkoutShort")}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </CartCheckoutButton>
      </div>
    </div>
  );
}

function trackInitiateCheckout(cart: CartLike) {
  const lines = cart.lines ?? [];
  const ids = lines.map((line) => line?.merchandise?.product?.id).filter((id): id is string => Boolean(id));
  if (ids.length === 0) return;

  const quantity = lines.reduce((sum, line) => sum + Number(line?.quantity ?? 0), 0);
  const subtotal = cart.cost?.subtotalAmount;

  analytics.initiateCheckout({
    ids,
    quantity,
    subtotal:
      subtotal && subtotal.amount !== undefined && subtotal.amount !== null
        ? { amount: String(subtotal.amount), currencyCode: subtotal.currencyCode }
        : undefined,
  });
}

function DiscountCodeForm() {
  const t = useTranslations("Cart");
  const cart = useCart();
  const applied = (cart.discountCodes ?? []).filter((d): d is { code: string; applicable: boolean } =>
    Boolean(d?.code),
  );
  const hasApplied = applied.length > 0;
  const hasInapplicable = applied.some((d) => !d.applicable);
  const [open, setOpen] = useState(hasApplied);
  const [code, setCode] = useState("");
  const [dismissedError, setDismissedError] = useState(false);
  const busy = cart.status === "creating" || cart.status === "updating";
  const error = hasInapplicable && !dismissedError ? t("discountInvalid") : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = code.trim();
    if (!next) return;
    setDismissedError(false);
    const merged = Array.from(new Set([...applied.map((d) => d.code), next]));
    cart.discountCodesUpdate(merged);
    setCode("");
  }

  function remove(target: string) {
    setDismissedError(true);
    cart.discountCodesUpdate(applied.map((d) => d.code).filter((c) => c !== target));
  }

  if (!open && !hasApplied) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="-mt-1 inline-flex items-center gap-2 self-start text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase transition-colors hover:text-ink"
      >
        <Tag className="h-3.5 w-3.5" strokeWidth={2} />
        {t("discountLabel")}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="cart-discount-code"
        className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase"
      >
        {t("discountLabel")}
      </label>
      <form onSubmit={submit} className="flex items-stretch gap-2">
        <input
          id="cart-discount-code"
          type="text"
          autoComplete="off"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (hasInapplicable) setDismissedError(true);
          }}
          placeholder={t("discountPlaceholder")}
          className="flex-1 rounded-md border border-line bg-surface px-3 text-[13px] text-ink uppercase placeholder:text-muted/70 focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={!code.trim() || busy}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-[11px] font-extrabold tracking-[0.18em] text-cream uppercase transition-colors hover:bg-pop disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} /> : t("discountApply")}
        </button>
      </form>
      {error && <p className="text-[11px] text-pop">{error}</p>}
      {applied.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {applied.map((d) => (
            <li
              key={d.code}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase ${
                d.applicable
                  ? "border-emerald-600/40 bg-emerald-50/70 text-emerald-900"
                  : "border-pop/40 bg-pop/10 text-pop"
              }`}
            >
              <Tag className="h-3 w-3" strokeWidth={2.5} />
              {d.code}
              <button
                type="button"
                onClick={() => remove(d.code)}
                aria-label={`${t("discountRemove")} ${d.code}`}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full transition-opacity hover:opacity-70"
              >
                <X className="h-3 w-3" strokeWidth={2.5} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// CROSS-SELL — "Complete your set" presale card
// ────────────────────────────────────────────────────────────────────

function CrossSellCard({ missing }: { missing: "watch" | "strap" }) {
  const t = useTranslations("Cart");
  const cfg =
    missing === "watch"
      ? {
          eyebrow: t("completeSet"),
          headline: t("needWatch"),
          subline: t("watchUpsellSub"),
          image: "/collection/otto-rosso.png",
          imageAlt: "ChronoStrap watch",
          cta: t("shopWatches"),
          href: "/products",
        }
      : {
          eyebrow: t("completeSet"),
          headline: t("needStrap"),
          subline: t("strapUpsellSub"),
          image: "/collection/orenji-hachi.png",
          imageAlt: "ChronoStrap strap",
          cta: t("shopStraps"),
          href: "/buy-strap",
        };

  return (
    <article className="relative overflow-hidden rounded-md border border-ink/15 bg-ink text-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: "radial-gradient(60% 80% at 90% 50%, rgba(194,24,91,0.5) 0%, transparent 70%)",
        }}
      />
      <div className="relative grid grid-cols-[112px_1fr] gap-4 p-4 sm:grid-cols-[140px_1fr] sm:gap-6 sm:p-5">
        <div className="relative aspect-square overflow-hidden rounded-md bg-cream/10">
          <Image
            src={cfg.image}
            alt={cfg.imageAlt}
            fill
            sizes="(min-width: 640px) 140px, 112px"
            quality={75}
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-3">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-pop/20 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.18em] text-cream uppercase">
              <Sparkles className="h-3 w-3" strokeWidth={2.5} />
              {cfg.eyebrow}
            </span>
            <h3 className="font-display text-xl leading-tight uppercase sm:text-2xl">{cfg.headline}</h3>
            <p className="text-[12px] leading-relaxed text-cream/70 sm:text-[13px]">{cfg.subline}</p>
          </div>

          <Link
            href={cfg.href}
            className="group inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-cream px-4 text-[10px] font-extrabold tracking-[0.18em] text-ink uppercase transition-colors hover:bg-pop hover:text-cream sm:h-11 sm:px-5 sm:text-[11px]"
          >
            {cfg.cta}
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ────────────────────────────────────────────────────────────────────

function RepairingCart() {
  const t = useTranslations("Cart");
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-6 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-line bg-cream">
        <LoaderIcon />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl leading-[0.95] uppercase md:text-4xl">{t("repairTitle")}</h1>
        <p className="text-[15px] leading-relaxed text-muted">{t("repairSubtitle")}</p>
      </div>
    </section>
  );
}

function EmptyCart() {
  const t = useTranslations("Cart");
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-6 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-line bg-cream">
        <ShoppingBag className="h-7 w-7 text-ink" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl leading-[0.95] uppercase md:text-4xl">{t("emptyTitle")}</h1>
        <p className="text-[15px] leading-relaxed text-muted">{t("emptySubtitle")}</p>
      </div>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/products"
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-8 text-[11px] font-extrabold tracking-[0.18em] text-cream uppercase transition-colors hover:bg-pop"
        >
          {t("shopCollection")}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
        <Link
          href="/custom-strap"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-line bg-surface px-8 text-[11px] font-extrabold tracking-[0.18em] text-ink uppercase transition-colors hover:border-ink"
        >
          {t("designStrap")}
        </Link>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────

function LoaderIcon() {
  return <span className="h-7 w-7 animate-spin rounded-full border-2 border-ink/15 border-t-ink" aria-hidden />;
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
