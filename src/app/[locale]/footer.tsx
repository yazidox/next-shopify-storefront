import Link from "next/link";
import { Instagram } from "@esmate/shadcn/pkgs/lucide-react";
import { FooterPaymentStrip } from "./footer-payment-strip";

const columns: { title: string; links: { text: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { text: "All watches", href: "/products" },
      { text: "Custom strap", href: "/custom-strap" },
      { text: "Cart", href: "/cart" },
    ],
  },
  {
    title: "Maison",
    links: [
      { text: "Manifesto", href: "/about" },
      { text: "Press", href: "mailto:press@chronostrap.com" },
    ],
  },
  {
    title: "Care",
    links: [
      { text: "Shipping", href: "/shipping" },
      { text: "Returns", href: "/returns" },
      { text: "Warranty", href: "/warranty" },
      { text: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { text: "Privacy", href: "/privacy" },
      { text: "Terms", href: "/terms" },
      { text: "Cookies", href: "/cookies" },
      { text: "Legal notice", href: "/legal" },
    ],
  },
];

function FooterLink({ text, href }: { text: string; href: string }) {
  const isMailto = href.startsWith("mailto:");
  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  const className =
    "group inline-flex items-center gap-2 text-sm text-ink/70 transition-colors hover:text-ink";

  if (isMailto || isExternal) {
    return (
      <a href={href} className={className} {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}>
        <span className="h-px w-0 bg-pop transition-all duration-300 group-hover:w-3" />
        {text}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      <span className="h-px w-0 bg-pop transition-all duration-300 group-hover:w-3" />
      {text}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-cream text-ink">
      <div className="mx-auto max-w-[1800px] px-6 pt-20 pb-8 lg:px-12 lg:pt-28 lg:pb-10">
        {/* Brand + link columns */}
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="flex justify-center lg:col-span-5 lg:justify-start lg:pt-1">
            <Link href="/" className="block opacity-90 transition-opacity hover:opacity-100" aria-label="ChronoStrap home">
              <img src="/logo.png" alt="" className="h-16 w-auto brightness-0 lg:h-30" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-6 text-[10px] font-medium tracking-[0.3em] text-ink/40 uppercase">{col.title}</h3>
                <ul className="space-y-3.5">
                  {col.links.map((link) => (
                    <li key={`${col.title}-${link.href}-${link.text}`}>
                      <FooterLink text={link.text} href={link.href} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Base */}
        <div className="mt-14 flex flex-col gap-10 lg:mt-16">
          <FooterPaymentStrip />
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <p className="text-center text-[10px] font-medium tracking-[0.3em] text-ink/50 uppercase sm:text-left">
              © {new Date().getFullYear()} ChronoStrap · Bioceramic &amp; beyond
            </p>
            <div className="flex items-center gap-0.5">
              <a
                href="https://www.instagram.com/strap.chrono?igsh=MWQyNDU1eWN4bWFhZg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full p-2.5 text-ink/55 transition-colors hover:bg-ink/6 hover:text-pop"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.75} />
              </a>
            </div>
            <p className="text-center text-[10px] font-medium tracking-[0.3em] text-ink/50 uppercase sm:text-right">
              Paris · Geneva · Tokyo
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
