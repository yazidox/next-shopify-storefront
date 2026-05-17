"use client";

import { createElement, useEffect, useRef, useState } from "react";

type BreatheConfig = boolean | { amplitudeDeg?: number; periodMs?: number; phaseDeg?: number };

interface Props {
  srcs: string[];
  alt?: string;
  intervalMs?: number;
  cameraOrbit?: string;
  cameraTarget?: string;
  rotationPerSecond?: string;
  autoRotate?: boolean;
  /** Subtle sine-wave sway around the base camera orbit so users see it's a 3D model. */
  breathe?: BreatheConfig;
  className?: string;
}

type ModelViewerLike = HTMLElement & {
  getCameraOrbit?: () => { theta: number; phi: number; radius: number };
  getCameraTarget?: () => { x: number; y: number; z: number };
  cameraOrbit?: string;
  cameraTarget?: string;
};

/**
 * Lightweight model-viewer wrapper for showcase cards.
 *
 * Performance strategy when cycling between multiple srcs:
 * - When the card scrolls into view, ALL srcs are mounted in parallel as stacked viewers.
 * - Only the active one is visible (opacity 1) — the others are hidden but already loaded.
 * - This eliminates the loader appearing on every cycle: once loaded, swaps are instant.
 * - For single-src usage, only one viewer is ever mounted.
 */
export function StepModel({
  srcs,
  alt = "Watch 3D",
  intervalMs = 2500,
  cameraOrbit = "0deg 80deg 110%",
  cameraTarget,
  rotationPerSecond = "18deg",
  autoRotate = true,
  breathe,
  className,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).get("debug") === "1");
  }, []);

  // Mount only when scrolled into view
  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  // Background-prefetch ALL srcs into the browser cache as soon as the card mounts in view.
  // This way model-viewer's later fetches are served from cache instantly, even for srcs
  // that haven't been rendered yet.
  useEffect(() => {
    if (!inView) return;
    srcs.forEach((src) => {
      fetch(src, { cache: "force-cache" }).catch(() => {});
    });
  }, [inView, srcs]);

  // Cycle (paused in debug)
  useEffect(() => {
    if (!inView || srcs.length < 2 || debug) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % srcs.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [inView, srcs.length, intervalMs, debug]);

  const activeViewerRef = useRef<ModelViewerLike | null>(null);
  const viewerRefs = useRef<Map<string, ModelViewerLike>>(new Map());
  const activeIdxRef = useRef(0);
  const anyLoaded = loaded.size > 0;

  useEffect(() => {
    activeIdxRef.current = active;
  }, [active]);

  // Subtle "breathe" — sine wave around the base camera orbit.
  // Disabled in debug so you can still pose.
  useEffect(() => {
    if (!breathe || !inView || debug) return;
    const match = cameraOrbit.match(/(-?\d*\.?\d+)\s*deg\s+(-?\d*\.?\d+)\s*deg\s+(-?\d*\.?\d+)\s*(m|%)/);
    if (!match) return;
    const baseTheta = parseFloat(match[1]);
    const basePhi = parseFloat(match[2]);
    const baseRadius = parseFloat(match[3]);
    const unit = match[4];

    const cfg = breathe === true ? {} : breathe;
    const amplitude = cfg.amplitudeDeg ?? 5;
    const period = cfg.periodMs ?? 6000;
    const phase = ((cfg.phaseDeg ?? 0) * Math.PI) / 180;

    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      const theta = baseTheta + Math.sin((elapsed / period) * Math.PI * 2 + phase) * amplitude;
      const orbit = `${theta.toFixed(3)}deg ${basePhi}deg ${baseRadius}${unit}`;
      const el = viewerRefs.current.get(srcs[activeIdxRef.current]);
      if (el) el.cameraOrbit = orbit;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [breathe, cameraOrbit, inView, srcs, debug]);

  return (
    <div ref={wrapRef} className={`relative h-full w-full ${className ?? ""}`}>
      {/* Mount ALL srcs at once so swaps are instant after their first load */}
      {inView &&
        srcs.map((src, i) => (
          <ModelMount
            key={src}
            src={src}
            alt={alt}
            cameraOrbit={cameraOrbit}
            cameraTarget={cameraTarget}
            rotationPerSecond={rotationPerSecond}
            visible={i === active && loaded.has(src)}
            autoRotate={!debug && autoRotate && !breathe}
            cameraControls={debug && i === active}
            onLoaded={() =>
              setLoaded((prev) => {
                if (prev.has(src)) return prev;
                const next = new Set(prev);
                next.add(src);
                return next;
              })
            }
            onElRef={(el) => {
              if (el) {
                viewerRefs.current.set(src, el);
                if (i === active) activeViewerRef.current = el;
              } else {
                viewerRefs.current.delete(src);
              }
            }}
          />
        ))}

      {/* Loader — only shown until the VERY FIRST model loads.
          Subsequent cycle swaps reveal already-loaded models so the loader never reappears. */}
      {!anyLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-10 w-10">
            <span className="absolute inset-0 rounded-full border border-ink/10" />
            <span
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-pop"
              style={{ animation: "spin 1s linear infinite" }}
            />
          </div>
        </div>
      )}

      {debug && <DebugPosition viewerRef={activeViewerRef} />}
    </div>
  );
}

function ModelMount({
  src,
  alt,
  cameraOrbit,
  cameraTarget,
  rotationPerSecond,
  visible,
  autoRotate,
  cameraControls,
  onLoaded,
  onElRef,
}: {
  src: string;
  alt: string;
  cameraOrbit: string;
  cameraTarget?: string;
  rotationPerSecond: string;
  visible: boolean;
  autoRotate: boolean;
  cameraControls: boolean;
  onLoaded: () => void;
  onElRef: (el: ModelViewerLike | null) => void;
}) {
  const ref = useRef<ModelViewerLike | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    onElRef(el);
    const onLoad = () => onLoaded();
    el.addEventListener("load", onLoad);
    return () => {
      el.removeEventListener("load", onLoad);
      onElRef(null);
    };
  }, [onLoaded, onElRef]);

  return (
    <div
      className={`absolute inset-0 transition-all duration-500 ease-out ${
        visible ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
      }`}
      aria-hidden={!visible}
    >
      {createElement("model-viewer", {
        ref,
        src,
        alt,
        ...(autoRotate ? { "auto-rotate": "" } : {}),
        ...(cameraControls ? { "camera-controls": "" } : {}),
        "interaction-prompt": "none",
        "shadow-intensity": "0.6",
        "shadow-softness": "0.8",
        exposure: "1.05",
        "rotation-per-second": rotationPerSecond,
        "auto-rotate-delay": "0",
        // Eager so all stacked viewers begin loading immediately, not just the visible one
        loading: "eager",
        "camera-orbit": cameraOrbit,
        ...(cameraTarget ? { "camera-target": cameraTarget } : {}),
        "disable-zoom": "",
        style: {
          width: "100%",
          height: "100%",
          background: "transparent",
          "--poster-color": "transparent",
        },
      } as Record<string, unknown>)}
    </div>
  );
}

// ─── DEBUG POSITION CAPTURE ────────────────────────────────
function DebugPosition({ viewerRef }: { viewerRef: React.MutableRefObject<ModelViewerLike | null> }) {
  const [state, setState] = useState<{ orbit: string; target: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      const el = viewerRef.current;
      if (!el?.getCameraOrbit || !el.getCameraTarget) return;
      const o = el.getCameraOrbit();
      const t = el.getCameraTarget();
      const r2d = (rad: number) => (rad * 180) / Math.PI;
      setState({
        orbit: `${r2d(o.theta).toFixed(1)}deg ${r2d(o.phi).toFixed(1)}deg ${o.radius.toFixed(3)}m`,
        target: `${t.x.toFixed(3)}m ${t.y.toFixed(3)}m ${t.z.toFixed(3)}m`,
      });
    }, 150);
    return () => window.clearInterval(id);
  }, [viewerRef]);

  async function copy() {
    if (!state) return;
    const json = JSON.stringify({ cameraOrbit: state.orbit, cameraTarget: state.target }, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="absolute right-3 bottom-3 z-10 flex flex-col gap-2 rounded-xl border border-white/20 bg-black/60 p-3 text-[10px] text-white backdrop-blur-md">
      <div className="font-mono leading-tight">
        <div>orbit&nbsp;&nbsp;{state?.orbit ?? "—"}</div>
        <div>target&nbsp;{state?.target ?? "—"}</div>
      </div>
      <button
        type="button"
        onClick={copy}
        className="rounded-md bg-white px-2 py-1 text-[10px] font-bold tracking-[0.2em] text-black uppercase transition-opacity hover:opacity-80"
      >
        {copied ? "Copied ✓" : "Copy JSON"}
      </button>
    </div>
  );
}
