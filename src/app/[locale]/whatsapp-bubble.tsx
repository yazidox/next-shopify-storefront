"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const NUMBER = "14383370095";

const DISMISS_KEY = "cs_wa_tooltip_dismissed";

export function WhatsAppBubble() {
  const t = useTranslations("WhatsApp");
  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = window.sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* noop */
    }
    if (dismissed) return;
    const id = window.setTimeout(() => setTooltipOpen(true), 4500);
    return () => window.clearTimeout(id);
  }, []);

  function closeTooltip() {
    setTooltipOpen(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* noop */
    }
  }

  const href = `https://wa.me/${NUMBER}?text=${encodeURIComponent(t("prefill"))}`;

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-20 z-[55] flex flex-col items-end gap-2 lg:right-6 lg:bottom-6"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tooltipOpen && (
        <div className="pointer-events-auto relative max-w-[260px] rounded-2xl rounded-br-sm border border-line bg-cream px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          <button
            type="button"
            onClick={closeTooltip}
            aria-label={t("closeTooltip")}
            className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-line bg-cream text-ink/60 transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            </svg>
          </button>
          <p className="text-[11px] font-extrabold tracking-[0.18em] text-pop uppercase">{t("eyebrow")}</p>
          <p className="mt-1 text-[13px] leading-snug font-medium text-ink">{t("headline")}</p>
          <p className="mt-0.5 text-[12px] leading-snug text-ink/60">{t("subline")}</p>
        </div>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("ariaLabel")}
        onClick={closeTooltip}
        className="pointer-events-auto group relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 active:scale-95 lg:h-[60px] lg:w-[60px]"
      >
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-full bg-[#25d366] opacity-40 [animation-duration:2.4s]"
        />
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-cream bg-pop px-1.5 text-[10px] font-extrabold leading-none text-white shadow-[0_2px_6px_rgba(194,24,91,0.4)]">
          1
        </span>
        <WhatsAppIcon className="relative h-7 w-7 lg:h-8 lg:w-8" />
      </a>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d="M16.003 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.257.59 4.464 1.71 6.408L3.2 28.8l6.55-1.715a12.74 12.74 0 0 0 6.252 1.595h.005c7.066 0 12.798-5.73 12.798-12.8 0-3.42-1.33-6.633-3.748-9.052A12.717 12.717 0 0 0 16.003 3.2zm0 23.32h-.004a10.62 10.62 0 0 1-5.41-1.482l-.388-.23-4.04 1.058 1.078-3.937-.253-.404a10.59 10.59 0 0 1-1.624-5.625c0-5.857 4.768-10.625 10.643-10.625a10.54 10.54 0 0 1 7.51 3.116 10.55 10.55 0 0 1 3.108 7.518c0 5.857-4.768 10.61-10.62 10.61zm5.83-7.952c-.32-.16-1.894-.935-2.187-1.042-.293-.107-.506-.16-.72.16-.213.32-.825 1.042-1.012 1.256-.187.213-.373.24-.693.08-.32-.16-1.35-.498-2.572-1.588-.95-.847-1.59-1.893-1.778-2.213-.187-.32-.02-.493.14-.652.143-.142.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.738-.987-2.378-.26-.624-.527-.54-.72-.55l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.094-1.12 2.668 0 1.574 1.146 3.094 1.306 3.307.16.213 2.255 3.443 5.467 4.83.764.33 1.36.527 1.825.674.766.244 1.464.21 2.015.128.615-.092 1.894-.774 2.16-1.522.267-.748.267-1.388.187-1.522-.08-.133-.293-.213-.613-.373z" />
    </svg>
  );
}
