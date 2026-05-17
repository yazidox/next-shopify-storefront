"use client";

import { useCart } from "@shopify/hydrogen-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag } from "@esmate/shadcn/pkgs/lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@esmate/shadcn/components/ui/sheet";
import { CountryCurrencyPicker } from "./country-currency-picker";
import { SearchOverlay } from "./search-overlay";

const mainMenuItems: { text: string; href: string }[] = [
  { text: "Buy Watch", href: "/products" },
  { text: "Buy Strap", href: "/buy-strap" },
  { text: "Custom Strap", href: "/custom-strap" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { totalQuantity } = useCart();

  // Cmd/Ctrl+K to open search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isMenuItemActive(href: string) {
    const url = new URL(`https://x${href}`);
    return pathname === url.pathname;
  }

  return (
    <header
      className={`fixed top-3 right-3 left-3 z-50 rounded-full border backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 lg:top-4 lg:right-4 lg:left-4 ${
        scrolled ? "border-black/10 bg-cream/60" : "border-white/25 bg-cream/25"
      }`}
      style={{
        boxShadow: scrolled
          ? "inset 0 1px 0 0 rgba(255,255,255,0.55), 0 10px 32px rgba(0,0,0,0.08)"
          : "inset 0 1px 0 0 rgba(255,255,255,0.45), 0 4px 18px rgba(0,0,0,0.05)",
      }}
    >
      {/* glass sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-1/2 rounded-t-full"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0.22), rgba(255,255,255,0))",
        }}
      />
      <nav
        className="relative mx-auto flex max-w-[1800px] items-center justify-between px-4 py-2.5 lg:px-7 lg:py-3"
        aria-label="Global"
      >
        {/* LEFT — burger (mobile) / nav (desktop) */}
        <div className="flex flex-1 items-center gap-1">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger
              className="-ml-1 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </SheetTrigger>
            <SheetContent side="left" className="w-full border-r border-black/10 bg-cream sm:max-w-md">
              <div className="flex h-full flex-col justify-between p-8 pt-16">
                <div className="flex flex-col">
                  <span className="tracking-luxury mb-6 text-[10px] font-bold text-ink/40 uppercase">Maison</span>
                  {mainMenuItems.map(({ text, href }, i) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-baseline gap-4 border-b border-ink/10 py-5 font-display text-3xl uppercase transition-colors hover:text-pop ${
                        isMenuItemActive(href) ? "text-pop" : "text-ink"
                      }`}
                    >
                      <span className="tracking-luxury text-[10px] font-bold text-ink/30">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{text}</span>
                    </Link>
                  ))}
                </div>
                <div className="tracking-luxury flex flex-col gap-1 text-xs text-ink/40 uppercase">
                  <span>ChronoStrap · Geneva 2026</span>
                  <span>Manufacture & Atelier</span>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden items-center gap-8 lg:flex">
            {mainMenuItems.map(({ text, href }) => {
              const active = isMenuItemActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group relative text-[11px] font-medium tracking-[0.2em] uppercase transition-colors ${
                    active ? "text-ink" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  {text}
                  <span
                    className={`absolute -bottom-1 left-1/2 h-px -translate-x-1/2 bg-pop transition-all duration-300 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* CENTER — logo */}
        <Link
          href="/"
          aria-label="ChronoStrap"
          className="absolute left-1/2 flex -translate-x-1/2 items-center transition-opacity hover:opacity-70"
        >
          <img src="/logo.png" alt="ChronoStrap" className="h-9 w-auto brightness-0 lg:h-11" />
        </Link>

        {/* RIGHT — utility */}
        <div className="flex flex-1 items-center justify-end gap-1 lg:gap-2">
          <CountryCurrencyPicker />
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink/80 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <Search className="h-5 w-5 lg:h-4 lg:w-4" strokeWidth={2} />
          </button>
          <span className="mx-1 hidden h-4 w-px bg-ink/15 lg:inline-block" />
          <Link
            href="/cart"
            className="group relative -mr-1 flex h-11 items-center gap-2 rounded-full px-3 text-ink transition-colors hover:bg-ink/5 lg:mr-0"
            aria-label={totalQuantity ? `Cart, ${totalQuantity} items` : "Cart"}
          >
            <span className="relative">
              <ShoppingBag className="h-5 w-5 lg:h-4 lg:w-4" strokeWidth={2} />
              {!!totalQuantity && (
                <span className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-cream bg-pop px-1 text-[10px] font-extrabold leading-none text-white shadow-[0_2px_6px_rgba(194,24,91,0.4)]">
                  {totalQuantity}
                </span>
              )}
            </span>
            <span className="hidden text-[11px] font-medium tracking-[0.2em] uppercase lg:inline">Bag</span>
          </Link>
        </div>
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
