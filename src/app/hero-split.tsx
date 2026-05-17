"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { ArrowRight } from "@esmate/shadcn/pkgs/lucide-react";
import { WatchModel, type WatchModelItem } from "./watch-model";
import { pinkPopAnimation } from "./animations";
import { analytics } from "@/lib/analytics";

const models: WatchModelItem[] = [
  { src: "/wristwatch.opt.glb", color: "#f15bb5", bg: "#941843", name: "Pink Pop" },
  { src: "/huit-blanc.opt.glb", color: "#f4efe6", bg: "#E5E2E5", name: "Huit Blanc" },
  { src: "/orenji-hachi.opt.glb", color: "#ff7a1a", bg: "#CD3C30", name: "Orenji Hachi" },
  { src: "/black.opt.glb", color: "#0a0a0a", bg: "#ffffff", name: "Noir" },
  { src: "/green.opt.glb", color: "#10b981", bg: "#ECF0C2", name: "Vert" },
  { src: "/yellow-sky.opt.glb", color: "#fde047", bg: "#DAE8EA", name: "Yellow Sky" },
];

// Relative luminance — returns a light or dark text color that contrasts the bg.
function pickTextColor(hex?: string): { primary: string; muted: string; isLight: boolean } {
  if (!hex) return { primary: "#0a0a0a", muted: "rgba(10,10,10,0.5)", isLight: false };
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // perceived luminance (Rec. 601)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isLight = lum > 0.6;
  return isLight
    ? { primary: "#0a0a0a", muted: "rgba(10,10,10,0.55)", isLight: true }
    : { primary: "#f4efe6", muted: "rgba(244,239,230,0.7)", isLight: false };
}

export function HeroSplit() {
  const [activeBg, setActiveBg] = useState<string | undefined>(models[0]?.bg);
  const { primary, muted, isLight } = pickTextColor(activeBg);

  return (
    <section className="relative grid min-h-screen w-full grid-cols-1 overflow-x-hidden lg:grid-cols-2">
      {/* LEFT — watch + strap (3D model) */}
      <div className="relative flex min-h-[70vh] items-end overflow-hidden bg-[#e9d5ff] lg:min-h-screen">
        <div className="absolute inset-0">
          <WatchModel
            models={models}
            alt="ChronoStrap 3D"
            intervalMs={5000}
            animation={pinkPopAnimation}
            onActiveChange={(m) => setActiveBg(m.bg)}
          />
        </div>

        <div className="anim-fade-up relative z-10 flex w-full min-w-0 flex-col items-start gap-4 px-5 pt-10 pb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:px-8 sm:pb-14 lg:px-14 lg:pt-14 lg:pb-19">
          <div className="min-w-0">
            <span
              className="tracking-luxury text-[10px] font-bold uppercase transition-colors duration-700"
              style={{ color: muted }}
            >
              01 / Bundle
            </span>
            <h2
              className="mt-3 max-w-[11ch] font-display text-3xl leading-[0.95] uppercase transition-colors duration-700 sm:max-w-none sm:text-4xl sm:whitespace-nowrap md:text-5xl"
              style={{ color: primary }}
            >
              Watch <span style={{ color: "#c2185b" }}>+</span> Strap
            </h2>
          </div>
          <GlassButton
            href="/custom-strap"
            tone={isLight ? "dark" : "light"}
            onClick={() => analytics.custom("InitiateBuild", { source: "hero-left" })}
          >
            Build Yours
          </GlassButton>
        </div>
      </div>

      {/* RIGHT — just the watch (video) */}
      <div className="relative flex min-h-[70vh] items-end justify-center overflow-hidden bg-ink text-cream lg:min-h-screen">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          aria-label="Royal Pop"
        >
          <source media="(max-width: 768px)" src="/videos/hero-mobile.mp4" type="video/mp4" />
          <source src="/videos/hero-desktop.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/30" />

        <div className="anim-fade-up anim-delay-2 relative z-10 flex w-full min-w-0 flex-col items-start gap-4 px-5 pt-10 pb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:px-8 sm:pb-14 lg:px-14 lg:pt-14 lg:pb-19">
          <div className="min-w-0">
            <span className="tracking-luxury text-[10px] font-bold text-cream/60 uppercase">02 / Watch only</span>
            <h2 className="mt-3 max-w-[11ch] font-display text-3xl leading-[0.95] uppercase sm:max-w-none sm:text-4xl sm:whitespace-nowrap md:text-5xl">
              Just the <span className="text-pop">Watch</span>
            </h2>
          </div>
          <GlassButton
            href="/products"
            tone="light"
            onClick={() => analytics.custom("ShopWatchClick", { source: "hero-right" })}
          >
            Shop Watch
          </GlassButton>
        </div>
      </div>
    </section>
  );
}

export function GlassButton({
  href,
  children,
  tone = "light",
  onClick,
}: {
  href: string;
  children: ReactNode;
  tone?: "light" | "dark";
  onClick?: () => void;
}) {
  const isDark = tone === "dark";
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group tracking-luxury relative inline-flex max-w-full items-center justify-center gap-2 overflow-hidden rounded-full border px-4 py-3 text-[10px] font-bold uppercase backdrop-blur-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] sm:shrink-0 sm:px-5 sm:text-[11px] ${
        isDark
          ? "border-ink/15 bg-ink/10 text-ink hover:bg-ink/20"
          : "border-white/25 bg-white/15 text-cream hover:bg-white/25"
      }`}
      style={{
        boxShadow: isDark
          ? "inset 0 1px 0 0 rgba(255,255,255,0.55), inset 0 -1px 0 0 rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.08)"
          : "inset 0 1px 0 0 rgba(255,255,255,0.35), inset 0 -1px 0 0 rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full"
        style={{
          background: isDark
            ? "linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0))"
            : "linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0))",
        }}
      />
      <span className="relative">{children}</span>
      <ArrowRight
        className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
        strokeWidth={2.5}
      />
    </Link>
  );
}
