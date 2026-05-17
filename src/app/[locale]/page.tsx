import Image from "next/image";
import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { ArrowRight } from "@esmate/shadcn/pkgs/lucide-react";
import { HeroSplit } from "./hero-split";
import { StepModel } from "./step-model";
import { TrackedLink } from "./tracked-link";
import { Link } from "@/i18n/navigation";

// Returns true when the hex color is dark enough that we should use light text on top.
function isDarkHex(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.6;
}

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export default async function Page() {
  const t = await getTranslations("Seo");
  return (
    <>
      {/* Hidden H1 for SEO — visual h1 lives inside the hero */}
      <h1 className="sr-only">{t("homeH1")}</h1>
      <HeroSplit />
      <Marquee />
      <HowItWorks />
      <CollectionGrid />
    </>
  );
}

function SectionHeader({
  number,
  eyebrow,
  title,
  align = "left",
  tone = "dark",
}: {
  number: string;
  eyebrow: string;
  title: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
}) {
  const isLight = tone === "light";
  return (
    <div className={`flex flex-col gap-4 sm:gap-5 ${align === "center" ? "items-center text-center" : ""}`}>
      <div className={`flex items-center gap-3 ${isLight ? "text-cream/60" : "text-muted"}`}>
        <span className="font-display text-[11px] tracking-[0.32em] uppercase">{number}</span>
        <span className={`h-px w-10 sm:w-12 ${isLight ? "bg-cream/30" : "bg-line"}`} />
        <span className="text-[10px] font-medium tracking-[0.3em] uppercase">{eyebrow}</span>
      </div>
      <h2
        className={`font-display text-3xl leading-[0.95] uppercase sm:text-4xl md:text-5xl lg:text-6xl ${
          isLight ? "text-cream" : "text-ink"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}

function Marquee() {
  const t = useTranslations("Marquee");
  const items = [
    { headline: t("item1Headline"), whisper: t("item1Whisper") },
    { headline: t("item2Headline"), whisper: t("item2Whisper") },
    { headline: t("item3Headline"), whisper: t("item3Whisper") },
    { headline: t("item4Headline"), whisper: t("item4Whisper") },
    { headline: t("item5Headline"), whisper: t("item5Whisper") },
    { headline: t("item6Headline"), whisper: t("item6Whisper") },
  ];
  const repeated = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden border-y border-line bg-cream py-4 sm:py-6 lg:py-8">
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap sm:gap-14 lg:gap-20">
        {repeated.map((it, i) => (
          <span key={i} className="flex items-center gap-8 sm:gap-14 lg:gap-20">
            <span className="flex items-baseline gap-3 sm:gap-4 lg:gap-5">
              <span className="font-display text-lg tracking-tight text-ink uppercase sm:text-2xl lg:text-4xl">
                {it.headline}
              </span>
              <span className="font-display text-pop">→</span>
              <span className="text-sm text-ink/50 italic sm:text-base lg:text-xl">— {it.whisper}</span>
            </span>
            <span className="text-2xl text-pop/80 sm:text-3xl lg:text-5xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CollectionGrid() {
  const t = useTranslations("Collection");
  const pieces = [
    { name: "OTTO ROSSO", img: "/collection/otto-rosso.png" },
    { name: "HUIT BLANC", img: "/collection/huit-blanc.png" },
    { name: "GREEN EIGHT", img: "/collection/green-eight.png" },
    { name: "BLAUE ACHT", img: "/collection/blaue-acht.png" },
    { name: "LAN BA", img: "/collection/lan-ba.png" },
    { name: "OTG ROZ", img: "/collection/otg-roz.png" },
    { name: "OCHO NEGRO", img: "/collection/ocho-negro.png" },
    { name: "ORENJI HACHI", img: "/collection/orenji-hachi.png" },
  ];
  return (
    <section className="bg-white px-6 py-24 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-12 flex flex-col items-baseline justify-between gap-6 lg:mb-20 lg:flex-row">
          <SectionHeader
            number={t("number")}
            eyebrow={t("eyebrow")}
            title={
              <>
                {t("titleLine1")}
                <br />
                {t("titleLine2").split(" ")[0]} <span className="text-pop">{t("obsession")}</span>
              </>
            }
          />
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 text-[10px] font-medium tracking-[0.3em] text-muted uppercase transition-colors hover:text-ink"
          >
            <span className="h-px w-10 bg-line transition-all group-hover:w-16 group-hover:bg-ink" />
            {t("viewAll")}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
          {pieces.map((p, i) => (
            <Link key={i} href="/products" className="group relative block overflow-hidden rounded-3xl bg-ink/5">
              <div className="relative aspect-4/5 w-full overflow-hidden">
                <Image
                  src={p.img}
                  alt={p.name}
                  fill
                  sizes="(min-width: 1024px) 900px, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-6 lg:px-10 lg:pt-10">
                <span className="text-[10px] font-medium tracking-[0.3em] text-muted uppercase">
                  {t("refLabel")} {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 lg:p-10">
                <h3 className="font-display text-xl tracking-wide text-ink uppercase md:text-2xl">{p.name}</h3>
                <ArrowRight
                  className="h-4 w-4 text-ink/60 transition-all duration-500 group-hover:translate-x-1 group-hover:text-ink"
                  strokeWidth={1.75}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

type BreatheCfg = boolean | { amplitudeDeg?: number; periodMs?: number; phaseDeg?: number };
type Pose = {
  src: string;
  cameraOrbit?: string;
  cameraTarget?: string;
  scale?: number;
  breathe?: BreatheCfg;
};

function HowItWorks() {
  const t = useTranslations("HowItWorks");
  const steps: {
    n: string;
    tag: string;
    title: string;
    copy: string;
    bg: string;
    accent: string;
    srcs: string[];
    cameraOrbit?: string;
    cameraTarget?: string;
    scale?: number;
    autoRotate?: boolean;
    intervalMs?: number;
    breathe?: BreatheCfg;
    lineup?: Pose[];
  }[] = [
    {
      n: "01",
      tag: t("step1Tag"),
      title: t("step1Title"),
      copy: t("step1Copy"),
      bg: "#0a0a0a",
      accent: "#ffffff",
      srcs: ["/black.opt.glb"],
      lineup: [
        {
          src: "/huit-blanc.opt.glb",
          cameraOrbit: "129.5deg 85.3deg 2.042m",
          cameraTarget: "0m 0m 0m",
          scale: 1.45,
          breathe: { amplitudeDeg: 4, periodMs: 6500, phaseDeg: 0 },
        },
        {
          src: "/black.opt.glb",
          cameraOrbit: "95.7deg 94.6deg 2.042m",
          cameraTarget: "0m 0m 0m",
          scale: 1.6,
          breathe: { amplitudeDeg: 5, periodMs: 6000, phaseDeg: 120 },
        },
        {
          src: "/orenji-hachi.opt.glb",
          cameraOrbit: "62.5deg 90.2deg 2.042m",
          cameraTarget: "0m 0m 0m",
          scale: 1.45,
          breathe: { amplitudeDeg: 4, periodMs: 6500, phaseDeg: 240 },
        },
      ],
    },
    {
      n: "02",
      tag: t("step2Tag"),
      title: t("step2Title"),
      copy: t("step2Copy"),
      bg: "#941843",
      accent: "#f15bb5",
      srcs: ["/wristwatch.opt.glb"],
    },
    {
      n: "03",
      tag: t("step3Tag"),
      title: t("step3Title"),
      copy: t("step3Copy"),
      bg: "#ECF0C2",
      accent: "#10b981",
      srcs: ["/ap-watch.opt.glb", "/yellow-ap.opt.glb", "/white-ap.opt.glb", "/blue-ap.opt.glb"],
      cameraOrbit: "115.8deg 91.0deg 2.134m",
      cameraTarget: "0m 0.490m 0m",
      scale: 1.6,
      autoRotate: false,
      intervalMs: 2000,
      breathe: { amplitudeDeg: 6, periodMs: 5500 },
    },
  ];
  return (
    <section aria-labelledby="how-it-works-title" className="relative bg-cream px-6 py-20 sm:py-24 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            number={t("number")}
            eyebrow={t("eyebrow")}
            title={
              <>
                {t("titleLine1")}
                <br />
                <span className="text-pop">{t("titleLine2Highlight")}</span> {t("titleLine2Rest")}
              </>
            }
          />
          <p className="max-w-md text-[15px] leading-relaxed text-muted lg:text-base">{t("subtitle")}</p>
        </div>

        <ol className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {steps.map(
            ({
              n,
              tag,
              title,
              copy,
              bg,
              accent,
              srcs,
              cameraOrbit,
              cameraTarget,
              lineup,
              scale,
              autoRotate,
              intervalMs,
              breathe,
            }) => {
              const isDark = isDarkHex(bg);
              const fg = isDark ? "#f4efe6" : "#0a0a0a";
              const fgMuted = isDark ? "rgba(244,239,230,0.7)" : "rgba(10,10,10,0.65)";
              return (
                <li
                  key={n}
                  className="group relative flex aspect-3/4 flex-col overflow-hidden rounded-3xl transition-transform duration-500 hover:-translate-y-1"
                  style={{ backgroundColor: bg, color: fg }}
                >
                  {/* MODEL — fills the whole card */}
                  <div className="absolute inset-0">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-40"
                      style={{
                        background: `radial-gradient(60% 60% at 50% 45%, ${accent}55 0%, transparent 70%)`,
                      }}
                    />
                    {lineup ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {lineup.map((pose, i) => {
                          const isCenter = i === Math.floor(lineup.length / 2);
                          const shift = isCenter
                            ? "translateX(0)"
                            : i < lineup.length / 2
                              ? "translateX(40%)"
                              : "translateX(-40%)";
                          const mobileHidden = !isCenter;
                          return (
                            <div
                              key={i}
                              className={`relative h-full w-1/3 transition-transform duration-700 ${
                                mobileHidden ? "hidden sm:block" : ""
                              }`}
                              style={{
                                transform: `${shift} scale(${pose.scale ?? 1})`,
                                zIndex: isCenter ? 20 : 10,
                              }}
                            >
                              <StepModel
                                srcs={[pose.src]}
                                alt={`${title} — variant ${i + 1}`}
                                autoRotate={false}
                                cameraOrbit={pose.cameraOrbit}
                                cameraTarget={pose.cameraTarget}
                                breathe={pose.breathe}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="absolute inset-0" style={scale ? { transform: `scale(${scale})` } : undefined}>
                        <StepModel
                          srcs={srcs}
                          alt={title}
                          rotationPerSecond="18deg"
                          autoRotate={autoRotate ?? true}
                          cameraOrbit={cameraOrbit}
                          cameraTarget={cameraTarget}
                          intervalMs={intervalMs}
                          breathe={breathe}
                        />
                      </div>
                    )}
                  </div>

                  {/* TOP corner badges — float on top of model */}
                  <div className="relative z-30 flex items-start justify-between p-7 lg:p-9">
                    <span className="font-display text-[11px] tracking-[0.32em] uppercase" style={{ color: fgMuted }}>
                      {n}
                    </span>
                    <span
                      className="rounded-full border px-3 py-1 text-[9px] font-medium tracking-[0.3em] uppercase backdrop-blur-md"
                      style={{
                        borderColor: isDark ? "rgba(244,239,230,0.25)" : "rgba(10,10,10,0.15)",
                        backgroundColor: isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.35)",
                        color: fg,
                      }}
                    >
                      {tag}
                    </span>
                  </div>

                  {/* spacer so the text sits at the bottom */}
                  <div className="flex-1" />

                  {/* BOTTOM gradient + text overlay — floats over the model */}
                  <div className="relative z-30">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-[140%]"
                      style={{
                        background: `linear-gradient(to bottom, ${hexToRgba(bg, 0)} 0%, ${hexToRgba(
                          bg,
                          0.6,
                        )} 35%, ${hexToRgba(bg, 0.95)} 100%)`,
                      }}
                    />
                    <div className="relative flex flex-col gap-3 p-7 lg:p-9">
                      <h3
                        className="font-display text-2xl leading-tight uppercase md:text-3xl lg:text-[2rem]"
                        style={{ color: fg }}
                      >
                        {title}
                      </h3>
                      <p className="text-sm leading-relaxed lg:text-base" style={{ color: fgMuted }}>
                        {copy}
                      </p>
                    </div>
                  </div>

                  {/* fine accent line at the bottom */}
                  <span
                    className="relative z-30 block h-px w-full transition-all duration-500 group-hover:h-0.5"
                    style={{ backgroundColor: accent, opacity: 0.6 }}
                  />
                </li>
              );
            },
          )}
        </ol>

        <div className="mt-12 flex flex-col items-center gap-4 lg:mt-16">
          <TrackedLink
            href="/custom-strap"
            event="InitiateBuild"
            params={{ source: "how-it-works" }}
            className="group inline-flex w-full max-w-sm items-center justify-center gap-3 rounded-md bg-ink px-8 py-4 text-[11px] font-bold tracking-[0.28em] text-cream uppercase transition-colors hover:bg-pop sm:w-auto"
          >
            {t("startCustomizing")}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={2.5}
            />
          </TrackedLink>
          <p className="text-center text-[10px] font-medium tracking-[0.3em] text-muted uppercase">{t("footnote")}</p>
        </div>
      </div>
    </section>
  );
}
