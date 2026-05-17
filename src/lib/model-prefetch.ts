/**
 * Warms ALL 3D model files into the browser HTTP cache after the hero's first
 * model finishes loading. By the time the user scrolls to a HowItWorks card,
 * navigates to /buy-strap, or opens /custom-strap, the GLBs are served from
 * cache and model-viewer skips its loading indicator entirely.
 *
 * The prefetch runs in requestIdleCallback so it never competes with the hero
 * model's bytes for bandwidth, and uses `cache: "force-cache"` so the browser
 * fully respects existing cache entries.
 */

const MODEL_URLS = [
  // Hero + buy-strap colourways
  "/wristwatch.opt.glb",
  "/huit-blanc.opt.glb",
  "/orenji-hachi.opt.glb",
  "/black.opt.glb",
  "/green.opt.glb",
  "/yellow-sky.opt.glb",
  // HowItWorks / supporting models
  "/ap-watch.opt.glb",
  "/blue-ap.opt.glb",
  "/white-ap.opt.glb",
  "/yellow-ap.opt.glb",
  "/watchonly.opt.glb",
  "/custom-strap.glb",
];

let started = false;

export function prefetchAllModels(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  const run = () => {
    for (const url of MODEL_URLS) {
      fetch(url, {
        cache: "force-cache",
        priority: "low",
      }).catch(() => {
        /* swallow — best-effort prefetch */
      });
    }
  };

  const idle = (window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
  }).requestIdleCallback;
  if (typeof idle === "function") {
    idle(run, { timeout: 3000 });
  } else {
    window.setTimeout(run, 1500);
  }
}
