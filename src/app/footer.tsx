import Link from "next/link";
import { Instagram, Youtube } from "@esmate/shadcn/pkgs/lucide-react";
import { NewsletterForm } from "./newsletter-form";

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
      <div className="mx-auto max-w-[1800px] px-6 pt-24 pb-10 lg:px-12 lg:pt-32">
        {/* TOP — newsletter + columns */}
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 text-ink/50">
              <span className="font-display text-[11px] tracking-[0.32em] uppercase">Newsletter</span>
              <span className="h-px w-12 bg-ink/20" />
            </div>
            <h2 className="font-display mt-6 text-5xl uppercase md:text-6xl lg:text-[5rem]">
              Get the
              <br />
              <span className="text-pop">pop.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/60">
              Drops, launches, and the occasional manifesto. No spam, ever.
            </p>
            <NewsletterForm source="footer" />
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:col-span-6 lg:grid-cols-4">
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

        {/* MIDDLE — big logo wordmark */}
        <div className="mt-24 mb-10 flex items-center justify-center border-y border-ink/10 py-12 lg:py-16">
          <img src="/logo.png" alt="ChronoStrap" className="h-20 w-auto brightness-0 lg:h-32" />
        </div>

        {/* BOTTOM — meta */}
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[10px] font-medium tracking-[0.3em] text-ink/50 uppercase">
            © {new Date().getFullYear()} ChronoStrap · Bioceramic & beyond
          </p>
          <div className="flex items-center gap-1">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="rounded-full p-2 text-ink/60 transition-colors hover:bg-ink/5 hover:text-pop"
            >
              <Instagram className="h-4 w-4" strokeWidth={1.75} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="rounded-full p-2 text-ink/60 transition-colors hover:bg-ink/5 hover:text-pop"
            >
              <Youtube className="h-4 w-4" strokeWidth={1.75} />
            </a>
          </div>
          <p className="text-[10px] font-medium tracking-[0.3em] text-ink/50 uppercase">Paris · Geneva · Tokyo</p>
        </div>
      </div>
    </footer>
  );
}
