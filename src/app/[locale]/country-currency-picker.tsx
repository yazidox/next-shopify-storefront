"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Globe2, Search, X } from "@esmate/shadcn/pkgs/lucide-react";
import { useStoreLocalization } from "./store-localization";

export function CountryCurrencyPicker() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { activeOption, countryCode, options, setCountryCode } = useStoreLocalization();

  const filteredOptions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;

    return options.filter((option) =>
      [option.countryName, option.countryCode, option.currencyCode, option.currencyName]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [options, query]);

  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const id = window.setTimeout(() => searchRef.current?.focus(), 40);

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(id);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function chooseCountry(nextCountryCode: string) {
    setCountryCode(nextCountryCode);
    setOpen(false);
    setQuery("");
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/10 bg-white/25 px-2 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-colors hover:border-ink/25 hover:bg-white/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/35 sm:gap-2 sm:px-3"
        title={`${activeOption.currencyCode} · ${activeOption.countryName}`}
      >
        <span className="text-base leading-none">{countryFlag(activeOption.countryCode)}</span>
        <span className="tracking-luxury hidden text-[10px] font-bold uppercase sm:inline">
          {activeOption.currencyCode}
        </span>
        <span className="hidden max-w-[92px] truncate text-xs font-medium text-ink/65 xl:inline">
          {activeOption.countryName}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-ink/50 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Select country and currency"
          className="fixed top-[4.75rem] right-3 left-3 z-[70] overflow-hidden rounded-[14px] border border-ink/10 bg-cream shadow-[0_24px_70px_rgba(10,10,10,0.18)] backdrop-blur-xl sm:absolute sm:top-[calc(100%+0.75rem)] sm:right-0 sm:left-auto sm:w-[min(92vw,390px)]"
        >
          <div className="border-b border-ink/10 bg-white/45 p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="tracking-luxury text-[9px] font-bold text-ink/45 uppercase">Market</p>
                <p className="mt-1 text-sm font-black tracking-normal text-ink uppercase">Country & currency</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
                aria-label="Close country selector"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <label className="relative block">
              <span className="sr-only">Search country or currency</span>
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink/40"
                strokeWidth={2}
              />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search country or currency"
                className="h-11 w-full rounded-[10px] border border-ink/10 bg-cream px-10 text-sm font-medium text-ink transition-colors outline-none placeholder:text-ink/35 focus:border-ink/35"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute top-1/2 right-2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink/45 transition-colors hover:bg-ink/5 hover:text-ink"
                  aria-label="Clear country search"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
            </label>
          </div>

          <div className="max-h-[min(62svh,430px)] overflow-y-auto p-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected = option.countryCode === countryCode;
                return (
                  <button
                    key={option.countryCode}
                    type="button"
                    onClick={() => chooseCountry(option.countryCode)}
                    className={`grid w-full grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors ${
                      selected ? "bg-ink text-cream" : "text-ink hover:bg-white/65"
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg leading-none shadow-[inset_0_0_0_1px_rgba(10,10,10,0.08)]">
                      {countryFlag(option.countryCode)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{option.countryName}</span>
                      <span className={`block text-xs ${selected ? "text-cream/65" : "text-ink/45"}`}>
                        {option.currencyName}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span
                        className={`tracking-luxury rounded-full px-2 py-1 text-[9px] font-bold uppercase ${
                          selected ? "bg-cream/12 text-cream" : "bg-ink/5 text-ink/60"
                        }`}
                      >
                        {option.currencyCode}
                      </span>
                      {selected && <Check className="h-4 w-4" strokeWidth={2.4} />}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <Globe2 className="h-5 w-5 text-ink/35" strokeWidth={1.8} />
                <p className="text-sm font-bold text-ink">No country found</p>
                <p className="text-xs leading-relaxed text-ink/45">
                  Try a country name, currency code, or region code.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function countryFlag(countryCode: string) {
  const code = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "🏳";

  return Array.from(code)
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}
