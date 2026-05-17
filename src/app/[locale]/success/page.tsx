import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, Mail, PackageCheck, Sparkles } from "@esmate/shadcn/pkgs/lucide-react";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your ChronoStrap order has been confirmed.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuccessPage() {
  return (
    <section className="min-h-[100svh] bg-cream px-5 pt-28 pb-16 text-ink lg:px-10 lg:pt-36">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/45 px-3 py-2 text-[10px] font-bold tracking-[0.2em] text-ink/55 uppercase">
            <CheckCircle2 className="h-4 w-4 text-pop" strokeWidth={2.2} />
            Payment received
          </div>

          <h1 className="max-w-[820px] font-display text-5xl leading-[0.9] tracking-normal text-ink uppercase sm:text-7xl lg:text-8xl">
            Order
            <br />
            confirmed.
          </h1>

          <p className="mt-7 max-w-[620px] text-base leading-7 text-ink/62 sm:text-lg">
            Thank you for choosing ChronoStrap. Shopify has confirmed your payment, and your order confirmation email is
            on its way.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-ink px-7 text-[11px] font-bold tracking-[0.22em] text-cream uppercase transition-colors hover:bg-pop"
            >
              Continue shopping
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </Link>
            <Link
              href="/custom-strap"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-ink/12 bg-white/45 px-7 text-[11px] font-bold tracking-[0.22em] text-ink uppercase transition-colors hover:border-ink/30 hover:bg-white"
            >
              Build another strap
            </Link>
          </div>
        </div>

        <div className="rounded-[12px] border border-ink/10 bg-white/55 p-5 shadow-[0_24px_70px_rgba(10,10,10,0.08)] backdrop-blur-xl sm:p-6">
          <p className="tracking-luxury text-[10px] font-bold text-ink/45 uppercase">What happens next</p>

          <div className="mt-5 grid gap-3">
            <SuccessStep
              icon={<Mail className="h-4 w-4" strokeWidth={2} />}
              title="Email confirmation"
              text="Your receipt and order details are sent by Shopify immediately after checkout."
            />
            <SuccessStep
              icon={<PackageCheck className="h-4 w-4" strokeWidth={2} />}
              title="Atelier preparation"
              text="We prepare your reference or custom strap and share tracking when it ships."
            />
            <SuccessStep
              icon={<Sparkles className="h-4 w-4" strokeWidth={2} />}
              title="Need help?"
              text="For edits or support, contact us before fulfillment starts."
            />
          </div>

          <a
            href="mailto:support@chronostrap.com"
            className="mt-6 inline-flex text-sm font-bold text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop"
          >
            support@chronostrap.com
          </a>
        </div>
      </div>
    </section>
  );
}

function SuccessStep({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 rounded-[8px] border border-ink/8 bg-cream/65 p-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream">{icon}</span>
      <span>
        <span className="block text-sm font-black text-ink uppercase">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-ink/55">{text}</span>
      </span>
    </div>
  );
}
