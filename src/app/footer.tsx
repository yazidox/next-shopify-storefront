import Link from "next/link";
import { Instagram, Youtube, ArrowRight } from "@esmate/shadcn/pkgs/lucide-react";

const columns: { title: string; links: { text: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { text: "All Watches", href: "/products" },
      { text: "Custom Strap", href: "/custom-strap" },
      { text: "Limited", href: "/products?tag=limited" },
      { text: "Archive", href: "/archive" },
    ],
  },
  {
    title: "Maison",
    links: [
      { text: "Manifesto", href: "/about" },
      { text: "Journal", href: "/journal" },
      { text: "Stores", href: "/stores" },
      { text: "Press", href: "/press" },
    ],
  },
  {
    title: "Care",
    links: [
      { text: "Contact", href: "/contact" },
      { text: "Shipping", href: "/shipping" },
      { text: "Returns", href: "/returns" },
      { text: "Warranty", href: "/warranty" },
    ],
  },
];

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
            <form className="mt-10 flex max-w-md items-center border-b border-ink/25 pb-3 transition-colors focus-within:border-pop">
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 bg-transparent text-base tracking-wide text-ink placeholder:text-ink/30 focus:outline-none"
              />
              <button
                type="submit"
                className="group inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.3em] text-pop uppercase transition-opacity hover:opacity-70"
              >
                Subscribe
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-6 text-[10px] font-medium tracking-[0.3em] text-ink/40 uppercase">{col.title}</h3>
                <ul className="space-y-3.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-2 text-sm text-ink/70 transition-colors hover:text-ink"
                      >
                        <span className="h-px w-0 bg-pop transition-all duration-300 group-hover:w-3" />
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE — big logo wordmark */}
        <div className="mt-24 mb-10 flex items-center justify-center border-y border-ink/10 py-12 lg:py-16">
          <img
            src="/logo.png"
            alt="ChronoStrap"
            className="h-20 w-auto brightness-0 lg:h-32"
          />
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
          <p className="text-[10px] font-medium tracking-[0.3em] text-ink/50 uppercase">
            Paris · Geneva · Tokyo
          </p>
        </div>
      </div>
    </footer>
  );
}
