"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";

const CLICK_SELECTOR = "a, button, [role='button'], [data-track], [data-analytics-event]";
const SCROLL_DEPTHS = [25, 50, 75, 90] as const;

function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim().slice(0, 80) || undefined;
}

function safeHref(value?: string | null) {
  if (!value) return undefined;

  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin ? `${url.pathname}${url.hash}` : url.hostname;
  } catch {
    return undefined;
  }
}

function getArea(element: Element) {
  const area = element.closest("header, nav, main, aside, footer, section");
  return area?.tagName.toLowerCase() ?? "page";
}

export function VercelInteractionTracker() {
  const pathname = usePathname();
  const trackedDepthsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    trackedDepthsRef.current = new Set();
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest(CLICK_SELECTOR) : null;
      if (!target) return;

      const element = target as HTMLElement;
      const eventName = element.dataset.analyticsEvent || "UI Click";
      const label = cleanText(
        element.dataset.analyticsLabel ||
          element.getAttribute("aria-label") ||
          element.getAttribute("title") ||
          element.textContent,
      );

      track(eventName, {
        path: pathname,
        element: element.tagName.toLowerCase(),
        area: getArea(element),
        ...(label ? { label } : {}),
        ...(element instanceof HTMLAnchorElement ? { href: safeHref(element.getAttribute("href")) } : {}),
      });
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname]);

  useEffect(() => {
    let raf = 0;

    function onScroll() {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const doc = document.documentElement;
        const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
        const depth = Math.round((window.scrollY / scrollable) * 100);

        for (const marker of SCROLL_DEPTHS) {
          if (depth >= marker && !trackedDepthsRef.current.has(marker)) {
            trackedDepthsRef.current.add(marker);
            track("Scroll Depth", { path: pathname, depth: marker });
          }
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
