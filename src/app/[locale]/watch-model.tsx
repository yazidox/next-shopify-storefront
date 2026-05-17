"use client";

import { createElement, useEffect, useRef, useState } from "react";

import type { ModelAnimation } from "./animations";
import { prefetchAllModels } from "@/lib/model-prefetch";
import { ensureModelViewerScript } from "@/lib/model-viewer-loader";

export interface WatchModelItem {
  src: string;
  color: string; // swatch dot color (strap colour)
  bg?: string; // hero background colour while this model is active
  name?: string;
  durationMs?: number; // override how long this model stays visible
  // Y-shift applied to the shared cameraTarget (in meters). Positive moves the
  // model DOWN in the viewport. Use to align models whose source mesh has a
  // different vertical origin than the rest of the lineup.
  targetOffsetY?: number;
}

interface Props {
  models: WatchModelItem[];
  alt?: string;
  intervalMs?: number;
  className?: string;
  animation?: ModelAnimation; // global camera animation applied to ALL models, continuous across switches
  onActiveChange?: (model: WatchModelItem, index: number) => void;
}

const TRANSITION_MS = 700;
const MOBILE_HERO_QUERY = "(max-width: 1023px)";
const DESKTOP_CAMERA_ORBIT = "0deg 80deg 110%";
const MOBILE_CAMERA_ORBIT = "71.7deg 90.0deg 2.027m";
const MOBILE_CAMERA_TARGET = "0.000m 0.000m -0.000m";
const MOBILE_FIELD_OF_VIEW = "38.7deg";

function isMobileHeroViewport() {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_HERO_QUERY).matches;
}

function useMobileHeroViewport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_HERO_QUERY);
    const update = () => setIsMobile(query.matches);

    update();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    }

    query.addListener(update);
    return () => query.removeListener(update);
  }, []);

  return isMobile;
}

type ModelViewerLike = HTMLElement & {
  getCameraOrbit?: () => { theta: number; phi: number; radius: number };
  getCameraTarget?: () => { x: number; y: number; z: number };
  getFieldOfView?: () => number;
  cameraOrbit?: string;
  cameraTarget?: string;
  fieldOfView?: string;
};

export function WatchModel({
  models,
  alt = "3D Watch",
  intervalMs = 4000,
  className,
  animation,
  onActiveChange,
}: Props) {
  const [active, setActive] = useState(0);
  const [outgoing, setOutgoing] = useState<{ src: string; color: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [modelRuntimeReady, setModelRuntimeReady] = useState(false);
  const cachedRef = useRef<Set<string>>(new Set());
  const activeViewerRef = useRef<ModelViewerLike | null>(null);
  const firstReadyFiredRef = useRef(false);
  const mobileAutoMotionPaused = useMobileHeroViewport();
  const useLightweightFallback = false;
  // Mirrors `active` so the continuous animation closure can read the latest
  // index without restarting on every model switch.
  const activeRef = useRef(0);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  function notifyHeroReady() {
    if (firstReadyFiredRef.current) return;
    firstReadyFiredRef.current = true;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("chronostrap:hero-ready"));
      if (!isMobileHeroViewport()) {
        // Warm every other GLB into HTTP cache on desktop. Mobile Safari is more
        // stable when extra GLBs load only after the user taps a swatch.
        prefetchAllModels();
      }
    }
  }

  // Debug mode
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).get("debug") === "1");
  }, []);

  useEffect(() => {
    if (useLightweightFallback) {
      setModelRuntimeReady(false);
      return;
    }

    let alive = true;
    setModelRuntimeReady(false);
    ensureModelViewerScript().then(() => {
      if (alive) setModelRuntimeReady(true);
    });

    return () => {
      alive = false;
    };
  }, [useLightweightFallback]);

  useEffect(() => {
    if (!useLightweightFallback) return;
    notifyHeroReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLightweightFallback]);

  // Notify parent of active model changes (for adaptive UI like text contrast)
  useEffect(() => {
    if (models[active]) onActiveChange?.(models[active], active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Continuous global camera animation — plays across ALL models, never restarts.
  // The active model picks up wherever the timeline currently is when it swaps in.
  useEffect(() => {
    if (
      debug ||
      useLightweightFallback ||
      mobileAutoMotionPaused ||
      isMobileHeroViewport() ||
      !animation ||
      animation.keyframes.length < 2
    )
      return;
    const frames = animation.keyframes;
    const total = animation.durationMs || frames[frames.length - 1].t || 1;
    const startedAt = performance.now();
    let raf = 0;

    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
    const parseTriple = (s: string) => s.split(/\s+/).map((token) => parseFloat(token));

    const tick = () => {
      const elapsed = (performance.now() - startedAt) % total;
      // find bracketing keyframes
      let i = 0;
      while (i < frames.length - 1 && frames[i + 1].t < elapsed) i++;
      const a = frames[i];
      const b = frames[Math.min(i + 1, frames.length - 1)];
      const span = Math.max(1, b.t - a.t);
      const k = Math.min(1, Math.max(0, (elapsed - a.t) / span));

      const el = activeViewerRef.current;
      if (el) {
        const oA = parseTriple(a.orbit);
        const oB = parseTriple(b.orbit);
        el.cameraOrbit = `${lerp(oA[0], oB[0], k).toFixed(3)}deg ${lerp(oA[1], oB[1], k).toFixed(3)}deg ${lerp(oA[2], oB[2], k).toFixed(4)}m`;

        if (a.target && b.target) {
          const tA = parseTriple(a.target);
          const tB = parseTriple(b.target);
          const offsetY = models[activeRef.current]?.targetOffsetY ?? 0;
          el.cameraTarget = `${lerp(tA[0], tB[0], k).toFixed(4)}m ${(lerp(tA[1], tB[1], k) + offsetY).toFixed(4)}m ${lerp(tA[2], tB[2], k).toFixed(4)}m`;
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animation, debug, mobileAutoMotionPaused, useLightweightFallback]);

  const currentSrc = models[active]?.src;
  const currentColor = models[active]?.color;
  const isCached = cachedRef.current.has(currentSrc);

  // Auto cycle — paused while in debug mode
  useEffect(() => {
    if (
      !isLoaded ||
      models.length < 2 ||
      debug ||
      useLightweightFallback ||
      mobileAutoMotionPaused ||
      isMobileHeroViewport()
    )
      return;
    const perModel = models[active]?.durationMs ?? intervalMs;
    const id = window.setTimeout(() => {
      goTo((active + 1) % models.length);
    }, perModel);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, active, models.length, intervalMs, debug, mobileAutoMotionPaused, useLightweightFallback]);

  // Drop outgoing after the crossfade completes
  useEffect(() => {
    if (!outgoing) return;
    const id = window.setTimeout(() => setOutgoing(null), TRANSITION_MS);
    return () => window.clearTimeout(id);
  }, [outgoing]);

  // Reset load state when src changes
  useEffect(() => {
    if (useLightweightFallback) {
      setOutgoing(null);
      setProgress(1);
      setIsLoaded(true);
      return;
    }

    if (cachedRef.current.has(currentSrc)) {
      setProgress(1);
      setIsLoaded(true);
    } else {
      setProgress(0);
      setIsLoaded(false);
    }
  }, [currentSrc, useLightweightFallback]);

  // Delay the loader so fast-loading (cached) models never flash one.
  const [loaderShown, setLoaderShown] = useState(false);
  useEffect(() => {
    if (isLoaded) {
      setLoaderShown(false);
      return;
    }
    const id = window.setTimeout(() => setLoaderShown(true), 350);
    return () => window.clearTimeout(id);
  }, [isLoaded, currentSrc]);

  function goTo(nextIdx: number) {
    if (nextIdx === active) return;
    if (!useLightweightFallback && !mobileAutoMotionPaused && !isMobileHeroViewport()) {
      setOutgoing({ src: models[active].src, color: models[active].color });
    }
    setActive(nextIdx);
  }

  const currentBg = models[active]?.bg;
  const modelVisible = isLoaded;
  const loaderHidden = useLightweightFallback || (modelRuntimeReady && isLoaded) || !loaderShown;
  const cameraOrbit = mobileAutoMotionPaused ? MOBILE_CAMERA_ORBIT : DESKTOP_CAMERA_ORBIT;
  const cameraTarget = mobileAutoMotionPaused ? MOBILE_CAMERA_TARGET : undefined;
  const fieldOfView = mobileAutoMotionPaused ? MOBILE_FIELD_OF_VIEW : undefined;

  return (
    <div className={`relative h-full w-full overflow-hidden ${className ?? ""}`}>
      {/* Solid background — morphs as we cycle */}
      {currentBg && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-[background-color] duration-1000 ease-out"
          style={{ backgroundColor: currentBg }}
        />
      )}
      {/* Soft strap-colored bloom on top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 transition-[background] duration-1000 ease-out"
        style={{
          background: `radial-gradient(60% 60% at 50% 50%, ${currentColor}66 0%, transparent 70%)`,
        }}
      />

      {!useLightweightFallback && modelRuntimeReady && (
        <>
          {outgoing && (
            <ModelSlot
              key={`out-${outgoing.src}`}
              src={outgoing.src}
              alt={alt}
              state="exiting"
              autoRotate={false}
              cameraOrbit={cameraOrbit}
              cameraTarget={cameraTarget}
              fieldOfView={fieldOfView}
            />
          )}

          <ModelSlot
            key={`in-${currentSrc}`}
            src={currentSrc}
            alt={alt}
            state={modelVisible ? "in" : "entering"}
            autoRotate={!debug && !animation && !mobileAutoMotionPaused}
            cameraOrbit={cameraOrbit}
            cameraTarget={cameraTarget}
            fieldOfView={fieldOfView}
            onRef={(el) => (activeViewerRef.current = el)}
            onProgress={(p) => {
              setProgress(p);
              if (p >= 1) {
                cachedRef.current.add(currentSrc);
                setTimeout(() => setIsLoaded(true), 80);
                notifyHeroReady();
              }
            }}
            onLoad={() => {
              setProgress(1);
              cachedRef.current.add(currentSrc);
              setTimeout(() => setIsLoaded(true), 80);
              notifyHeroReady();
            }}
          />
        </>
      )}

      <div
        aria-hidden={loaderHidden}
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          loaderHidden ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex flex-col items-center gap-5">
          <ThreeDLoader progress={modelRuntimeReady ? (isCached ? 1 : progress) : 0} />
          <div className="flex flex-col items-center gap-1">
            <span className="tracking-luxury text-[10px] font-bold text-ink/60 uppercase">Rendering Model</span>
            <span className="font-display text-2xl text-ink tabular-nums">
              {Math.round((isCached ? 1 : progress) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {models.length > 1 && (
        <div className="absolute right-4 bottom-8 z-20 flex items-center gap-2 rounded-full border border-ink/10 bg-white/40 px-2 py-1.5 backdrop-blur-xl sm:right-6 lg:right-auto lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2 lg:gap-3 lg:px-3 lg:py-2">
          {models.map((m, i) => {
            const isActive = i === active;
            return (
              <button
                key={m.src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={m.name ?? `Model ${i + 1}`}
                title={m.name ?? `Model ${i + 1}`}
                className="group block transition-all"
              >
                <span
                  className={`block rounded-full border border-ink/15 shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.65),0_2px_6px_rgba(0,0,0,0.15)] transition-all duration-500 ${
                    isActive
                      ? "h-4 w-4 lg:h-5 lg:w-5"
                      : "h-2.5 w-2.5 opacity-70 group-hover:opacity-100 lg:h-3.5 lg:w-3.5"
                  }`}
                  style={{ background: m.color }}
                />
              </button>
            );
          })}
        </div>
      )}

      {debug && <DebugRecorder viewerRef={activeViewerRef} modelName={models[active]?.name} />}
    </div>
  );
}

type SlotState = "entering" | "in" | "exiting";

function ModelSlot({
  src,
  alt,
  state,
  autoRotate,
  cameraOrbit,
  cameraTarget,
  fieldOfView,
  onProgress,
  onLoad,
  onRef,
}: {
  src: string;
  alt: string;
  state: SlotState;
  autoRotate: boolean;
  cameraOrbit: string;
  cameraTarget?: string;
  fieldOfView?: string;
  onProgress?: (p: number) => void;
  onLoad?: () => void;
  onRef?: (el: ModelViewerLike | null) => void;
}) {
  const ref = useRef<ModelViewerLike | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    onRef?.(el);

    const onProgressEvt = (e: Event) => {
      const p = (e as CustomEvent<{ totalProgress: number }>).detail?.totalProgress ?? 0;
      onProgress?.(p);
    };
    const onLoadEvt = () => onLoad?.();

    el.addEventListener("progress", onProgressEvt);
    el.addEventListener("load", onLoadEvt);
    return () => {
      el.removeEventListener("progress", onProgressEvt);
      el.removeEventListener("load", onLoadEvt);
      onRef?.(null);
    };
  }, [onProgress, onLoad, onRef]);

  const visualClass =
    state === "in"
      ? "opacity-100 scale-100 blur-0"
      : state === "entering"
        ? "opacity-0 scale-[1.06] blur-md"
        : "opacity-0 scale-95 blur-md";

  return (
    <div
      aria-hidden={state !== "in"}
      className={`absolute inset-0 transition-all ease-[cubic-bezier(0.2,0.7,0.2,1)] ${visualClass}`}
      style={{ transitionDuration: `${TRANSITION_MS}ms` }}
    >
      {createElement("model-viewer", {
        ref,
        src,
        alt,
        ...(autoRotate ? { "auto-rotate": "" } : {}),
        "camera-controls": "",
        "disable-zoom": "",
        "interaction-prompt": "none",
        "shadow-intensity": "1",
        "shadow-softness": "0.8",
        exposure: "1.1",
        "rotation-per-second": "22deg",
        "auto-rotate-delay": "0",
        loading: "eager",
        reveal: "auto",
        "camera-orbit": cameraOrbit,
        ...(cameraTarget ? { "camera-target": cameraTarget } : {}),
        ...(fieldOfView ? { "field-of-view": fieldOfView } : {}),
        style: {
          width: "100%",
          height: "100%",
          background: "transparent",
          "--poster-color": "transparent",
        },
      } as any)}
    </div>
  );
}

// ─── DEBUG RECORDER ───────────────────────────────────────────────────────

type Keyframe = {
  t: number; // ms since recording start
  orbit: string; // "{theta}deg {phi}deg {radius}m"
  target: string; // "{x}m {y}m {z}m"
  fov: string; // "{deg}deg"
};

function DebugRecorder({
  viewerRef,
  modelName,
}: {
  viewerRef: React.MutableRefObject<ModelViewerLike | null>;
  modelName?: string;
}) {
  const [recording, setRecording] = useState(false);
  const [frames, setFrames] = useState<Keyframe[]>([]);
  const [live, setLive] = useState<Keyframe | null>(null);
  const [sampleMs, setSampleMs] = useState(100);
  const [copied, setCopied] = useState(false);
  const startedAtRef = useRef<number>(0);
  const recordingFramesRef = useRef<Keyframe[]>([]);

  function readState(): Keyframe | null {
    const el = viewerRef.current;
    if (!el?.getCameraOrbit || !el.getCameraTarget || !el.getFieldOfView) return null;
    const o = el.getCameraOrbit();
    const tgt = el.getCameraTarget();
    const fov = el.getFieldOfView(); // already in degrees
    const r2d = (rad: number) => (rad * 180) / Math.PI;
    return {
      t: 0,
      orbit: `${r2d(o.theta).toFixed(1)}deg ${r2d(o.phi).toFixed(1)}deg ${o.radius.toFixed(3)}m`,
      target: `${tgt.x.toFixed(3)}m ${tgt.y.toFixed(3)}m ${tgt.z.toFixed(3)}m`,
      fov: `${fov.toFixed(1)}deg`,
    };
  }

  // Live readout (10fps) — even when not recording
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = readState();
      if (s) setLive(s);
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sampling tick while recording
  useEffect(() => {
    if (!recording) return;
    startedAtRef.current = performance.now();
    recordingFramesRef.current = [];
    const tick = () => {
      const s = readState();
      if (!s) return;
      const t = Math.round(performance.now() - startedAtRef.current);
      const kf: Keyframe = { ...s, t };
      // dedupe — skip if camera hasn't moved since last
      const last = recordingFramesRef.current[recordingFramesRef.current.length - 1];
      if (last && last.orbit === kf.orbit && last.target === kf.target && last.fov === kf.fov) return;
      recordingFramesRef.current.push(kf);
      setFrames([...recordingFramesRef.current]);
    };
    tick();
    const id = window.setInterval(tick, sampleMs);
    return () => window.clearInterval(id);
  }, [recording, sampleMs]);

  function toggle() {
    if (recording) {
      setRecording(false);
    } else {
      setFrames([]);
      setCopied(false);
      setRecording(true);
    }
  }

  function clear() {
    setFrames([]);
    setCopied(false);
  }

  function captureOne() {
    const s = readState();
    if (!s) return;
    const t = recording ? Math.round(performance.now() - startedAtRef.current) : (frames.at(-1)?.t ?? 0);
    const next = [...frames, { ...s, t }];
    setFrames(next);
    recordingFramesRef.current = next;
  }

  const output = JSON.stringify(
    {
      model: modelName ?? "unknown",
      durationMs: frames.length ? frames[frames.length - 1].t : 0,
      sampleMs,
      keyframes: frames,
    },
    null,
    2,
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  }

  return (
    <div className="absolute top-4 right-4 z-50 w-[320px] rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${recording ? "animate-pulse bg-pop" : "bg-ink/30"}`} />
          <span className="tracking-luxury text-[10px] font-bold text-ink uppercase">
            {recording ? "Recording" : "Debug"}
          </span>
        </div>
        <span className="text-[10px] font-medium text-ink/60">{modelName}</span>
      </div>

      {/* Live readout */}
      <div className="mb-3 space-y-1 rounded-lg bg-ink/4 p-3 font-mono text-[10px] leading-tight text-ink/80">
        <div>orbit&nbsp;&nbsp;{live?.orbit ?? "—"}</div>
        <div>target&nbsp;{live?.target ?? "—"}</div>
        <div>fov&nbsp;&nbsp;&nbsp;&nbsp;{live?.fov ?? "—"}</div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className={`tracking-luxury flex-1 rounded-full px-3 py-2 text-[10px] font-bold uppercase transition-colors ${
            recording ? "bg-pop text-white hover:bg-pop/90" : "bg-ink text-cream hover:bg-ink/90"
          }`}
        >
          {recording ? "Stop" : "Start"}
        </button>
        <button
          type="button"
          onClick={captureOne}
          className="tracking-luxury rounded-full border border-ink/20 px-3 py-2 text-[10px] font-bold text-ink uppercase transition-colors hover:bg-ink/5"
          title="Capture a single keyframe"
        >
          + Frame
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={frames.length === 0}
          className="tracking-luxury rounded-full border border-ink/20 px-3 py-2 text-[10px] font-bold text-ink uppercase transition-colors hover:bg-ink/5 disabled:opacity-40"
        >
          Clear
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <label className="text-[10px] font-medium text-ink/60">Sample</label>
        <select
          value={sampleMs}
          onChange={(e) => setSampleMs(Number(e.target.value))}
          className="flex-1 rounded-md border border-ink/15 bg-white px-2 py-1 text-[10px] text-ink"
        >
          <option value={50}>50 ms (20 fps)</option>
          <option value={100}>100 ms (10 fps)</option>
          <option value={200}>200 ms (5 fps)</option>
          <option value={500}>500 ms (2 fps)</option>
        </select>
        <span className="text-[10px] font-medium text-ink/60">{frames.length} frames</span>
      </div>

      <textarea
        readOnly
        value={output}
        rows={8}
        className="w-full resize-y rounded-md border border-ink/10 bg-ink/2 p-2 font-mono text-[10px] leading-tight text-ink/80 focus:outline-none"
      />

      <button
        type="button"
        onClick={copy}
        disabled={frames.length === 0}
        className="tracking-luxury mt-2 w-full rounded-full bg-ink px-3 py-2 text-[10px] font-bold text-cream uppercase transition-colors hover:bg-ink/90 disabled:opacity-40"
      >
        {copied ? "Copied ✓" : "Copy JSON"}
      </button>

      <p className="mt-3 text-[10px] leading-snug text-ink/50">
        Auto-rotate paused. Drag to position the model — frames are captured automatically.
      </p>
    </div>
  );
}

function ThreeDLoader({ progress }: { progress: number }) {
  const size = 88;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size, perspective: 600 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#0a0a0a"
          strokeOpacity="0.12"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#c2185b"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.25s linear" }}
        />
      </svg>

      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: 24,
          height: 24,
          transform: "translate(-50%, -50%)",
          transformStyle: "preserve-3d",
          animation: "spin3d 2.4s linear infinite",
        }}
      >
        <Face transform="translateZ(12px)" color="#0a0a0a" />
        <Face transform="rotateY(180deg) translateZ(12px)" color="#0a0a0a" />
        <Face transform="rotateY(90deg) translateZ(12px)" color="#c2185b" />
        <Face transform="rotateY(-90deg) translateZ(12px)" color="#c2185b" />
        <Face transform="rotateX(90deg) translateZ(12px)" color="#0a0a0a" />
        <Face transform="rotateX(-90deg) translateZ(12px)" color="#0a0a0a" />
      </div>

      <style>{`
        @keyframes spin3d {
          0%   { transform: translate(-50%, -50%) rotateX(0deg) rotateY(0deg); }
          100% { transform: translate(-50%, -50%) rotateX(360deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}

function Face({ transform, color }: { transform: string; color: string }) {
  return (
    <span
      className="absolute inset-0 block"
      style={{
        background: color,
        transform,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
      }}
    />
  );
}
