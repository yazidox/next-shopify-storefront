"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Flame, X, Clock } from "@esmate/shadcn/pkgs/lucide-react";

const STORAGE_KEY = "cs_fomo_offer_deadline";
const DISMISS_KEY = "cs_fomo_offer_dismissed";
const WINDOW_MS = 2 * 60 * 60 * 1000;

function readDeadline(): number {
  if (typeof window === "undefined") return Date.now() + WINDOW_MS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? parseInt(raw, 10) : NaN;
    if (Number.isFinite(parsed) && parsed - Date.now() > 0 && parsed - Date.now() <= WINDOW_MS) {
      return parsed;
    }
  } catch {
    /* noop */
  }
  const next = Date.now() + WINDOW_MS;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    /* noop */
  }
  return next;
}

function format(ms: number) {
  const clamped = Math.max(0, ms);
  const h = Math.floor(clamped / 3_600_000);
  const m = Math.floor((clamped % 3_600_000) / 60_000);
  const s = Math.floor((clamped % 60_000) / 1000);
  return {
    hh: h.toString().padStart(2, "0"),
    mm: m.toString().padStart(2, "0"),
    ss: s.toString().padStart(2, "0"),
  };
}

function useFomoCountdown() {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(WINDOW_MS);

  useEffect(() => {
    const d = readDeadline();
    setDeadline(d);
    setRemaining(d - Date.now());
    const id = window.setInterval(() => {
      const next = d - Date.now();
      if (next <= 0) {
        // Roll the offer window so the urgency persists for repeat visitors.
        const refreshed = Date.now() + WINDOW_MS;
        try {
          window.localStorage.setItem(STORAGE_KEY, String(refreshed));
        } catch {
          /* noop */
        }
        setDeadline(refreshed);
        setRemaining(WINDOW_MS);
      } else {
        setRemaining(next);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return { ready: deadline !== null, remaining, ...format(remaining) };
}

// ────────────────────────────────────────────────────────────────────
// GLOBAL TOP BAR — sticky above the floating header, site-wide.
// ────────────────────────────────────────────────────────────────────

export function FomoTopBar() {
  const t = useTranslations("Fomo");
  const { ready, hh, mm, ss } = useFomoCountdown();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      /* noop */
    }
  }, []);

  if (!ready || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[60] flex h-9 items-center justify-center gap-2 overflow-hidden bg-ink px-3 text-cream lg:h-10"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2"
        style={{
          background: "linear-gradient(90deg, rgba(194,24,91,0.65) 0%, rgba(194,24,91,0) 100%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2"
        style={{
          background: "linear-gradient(270deg, rgba(194,24,91,0.65) 0%, rgba(194,24,91,0) 100%)",
        }}
      />
      <span className="relative flex shrink-0 items-center gap-1.5 text-[10px] font-extrabold tracking-[0.18em] uppercase lg:text-[11px]">
        <Flame className="h-3.5 w-3.5 text-pop" strokeWidth={2.5} />
        <span className="hidden sm:inline">{t("topEyebrow")}</span>
        <span className="sm:hidden">{t("topEyebrowShort")}</span>
      </span>
      <span className="relative hidden h-3 w-px bg-cream/20 sm:inline-block" />
      <span className="relative truncate text-[10px] font-medium tracking-[0.12em] uppercase lg:text-[11px]">
        {t("topMessage")}
      </span>
      <span className="relative hidden h-3 w-px bg-cream/20 sm:inline-block" />
      <span className="relative inline-flex items-center gap-1 rounded-sm bg-pop/20 px-1.5 py-0.5 text-[10px] font-extrabold tracking-[0.18em] text-cream tabular-nums lg:text-[11px]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-pop/80 opacity-80" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-pop" />
        </span>
        {hh}:{mm}:{ss}
      </span>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          try {
            window.sessionStorage.setItem(DISMISS_KEY, "1");
          } catch {
            /* noop */
          }
        }}
        aria-label={t("dismiss")}
        className="relative ml-1 hidden h-6 w-6 shrink-0 items-center justify-center rounded-full text-cream/60 transition-colors hover:bg-cream/10 hover:text-cream sm:inline-flex"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// INLINE BLOCK — drop into PDP / cart for a stronger urgency cue.
// ────────────────────────────────────────────────────────────────────

export function FomoOfferBlock({ variant = "card" }: { variant?: "card" | "compact" }) {
  const t = useTranslations("Fomo");
  const { ready, hh, mm, ss } = useFomoCountdown();
  if (!ready) return null;

  if (variant === "compact") {
    return (
      <div className="inline-flex items-center gap-2.5 self-start rounded-md border border-pop/30 bg-pop/5 px-3 py-2 text-[12px] font-semibold text-pop tabular-nums">
        <Clock className="h-3.5 w-3.5" strokeWidth={2.25} />
        <span className="font-extrabold tracking-[0.04em]">
          {t("inlineLabel")} {hh}:{mm}:{ss}
        </span>
        <span className="text-pop/75">— {t("inlineNote")}</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-pop/30 bg-gradient-to-br from-pop/10 via-pop/5 to-transparent p-4">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-pop/15 blur-2xl"
      />
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-pop text-cream">
            <Flame className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <span className="text-[11px] font-extrabold tracking-[0.18em] text-pop uppercase">
            {t("cardEyebrow")}
          </span>
        </div>
        <p className="text-[14px] leading-snug font-semibold text-ink">{t("cardHeadline")}</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-[12px] leading-snug text-ink/65">{t("cardSubline")}</p>
          <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-ink px-2.5 py-1.5 text-cream tabular-nums">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-pop opacity-80" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-pop" />
            </span>
            <span className="text-[12px] font-extrabold tracking-[0.08em]">
              {hh}:{mm}:{ss}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
