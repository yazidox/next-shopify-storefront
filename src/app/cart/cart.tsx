"use client";

import Link from "next/link";
import Image from "next/image";

import {
  CartCheckoutButton,
  CartCost,
  CartLineProvider,
  CartLineQuantityAdjustButton,
  Money,
  useCart,
  useCartLine,
} from "@shopify/hydrogen-react";

import {
  ArrowRight,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  ShoppingBag,
  Truck,
  X,
} from "@esmate/shadcn/pkgs/lucide-react";
import { titleize } from "@esmate/utils/string";

export function Cart() {
  const cart = useCart();
  const lines = cart.lines ?? [];
  const isCartEmpty = lines.length === 0;
  const itemCount = cart.totalQuantity ?? 0;

  if (isCartEmpty) {
    return <EmptyCart />;
  }

  return (
    <section className="mx-auto max-w-[1400px]">
      {/* HEADER */}
      <header className="mb-8 flex items-end justify-between gap-6 border-b border-line pb-6 lg:mb-12 lg:pb-8">
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
          <h1 className="font-display text-3xl leading-[0.95] uppercase md:text-4xl lg:text-5xl">
            Your Bag
          </h1>
        </div>
        <Link
          href="/products"
          className="hidden text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase transition-colors hover:text-ink sm:inline-flex sm:items-center sm:gap-2"
        >
          ← Continue shopping
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
        </div>

        {/* ─── SUMMARY ──────────────────────────────── */}
        <aside>
          <div className="flex flex-col gap-6 rounded-md border border-line bg-cream p-6 lg:sticky lg:top-28 lg:p-8">
            <h2 className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">
              Order Summary
            </h2>

            <dl className="flex flex-col gap-3 text-[14px]">
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-medium text-ink">
                  <CartCost amountType="subtotal" />
                </dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-medium text-ink">Calculated at checkout</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">Taxes</dt>
                <dd className="font-medium text-ink">Included where applicable</dd>
              </div>
            </dl>

            <div className="h-px w-full bg-line" />

            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-extrabold tracking-[0.18em] text-ink uppercase">
                Total
              </span>
              <span className="font-display text-2xl leading-none text-ink lg:text-3xl">
                <CartCost amountType="subtotal" />
              </span>
            </div>

            <CartCheckoutButton
              disabled={isCartEmpty}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-ink p-4 text-[11px] font-extrabold tracking-[0.18em] text-cream uppercase transition-colors hover:bg-pop disabled:cursor-not-allowed disabled:opacity-50"
            >
              Secure Checkout
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </CartCheckoutButton>

            <Link
              href="/products"
              className="-mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-line bg-surface text-[11px] font-extrabold tracking-[0.18em] text-ink uppercase transition-colors hover:border-ink sm:hidden"
            >
              Continue shopping
            </Link>

            {/* Trust strip */}
            <ul className="grid grid-cols-1 gap-3 border-t border-line pt-5">
              <Trust Icon={Truck} label="Free shipping" sub="Over $150" />
              <Trust Icon={RotateCcw} label="30-day returns" sub="No hassle" />
              <Trust Icon={Shield} label="2-year warranty" sub="Worldwide" />
            </ul>

            <p className="text-center text-[10px] font-medium tracking-[0.18em] text-muted uppercase">
              Secured by Shopify · SSL encrypted
            </p>
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
      <Link
        href={`/products/${handle}`}
        className="relative aspect-square overflow-hidden rounded-md bg-canvas"
      >
        {img?.url && (
          <Image
            src={img.url as string}
            alt={img.altText || title}
            fill
            sizes="(min-width: 640px) 140px, 112px"
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
            Remove
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
        className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-line/30 disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
      </CartLineQuantityAdjustButton>
      <span className="w-9 text-center text-sm font-semibold tabular-nums text-ink">{quantity}</span>
      <CartLineQuantityAdjustButton
        adjust="increase"
        className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-line/30"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
      </CartLineQuantityAdjustButton>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ────────────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-6 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-line bg-cream">
        <ShoppingBag className="h-7 w-7 text-ink" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl leading-[0.95] uppercase md:text-4xl">Your bag is empty</h1>
        <p className="text-[15px] leading-relaxed text-muted">
          Browse the collection or design your own strap from scratch.
        </p>
      </div>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/products"
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-8 text-[11px] font-extrabold tracking-[0.18em] text-cream uppercase transition-colors hover:bg-pop"
        >
          Shop the collection
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
        <Link
          href="/custom-strap"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-line bg-surface px-8 text-[11px] font-extrabold tracking-[0.18em] text-ink uppercase transition-colors hover:border-ink"
        >
          Design a strap
        </Link>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────

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
