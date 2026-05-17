"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Social-proof / lifestyle gallery shown at the bottom of every product page.
 */
export function ProductProof({ eyebrow }: { eyebrow?: string }) {
  const t = useTranslations("Proof");
  return (
    <section className="border-t border-line bg-cream/40 px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-3 lg:mb-12">
          <span className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">
            {eyebrow ?? t("eyebrow")}
          </span>
          <h2 className="font-display text-3xl leading-[0.95] uppercase md:text-4xl lg:text-5xl">{t("title")}</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Tile kind="video" src="/video1.MP4" aspect="aspect-[4/5]" />
          <Tile kind="image" src="/lambo-product.jpg" alt={t("imageAlt")} aspect="aspect-[4/5]" />
          <Tile kind="video" src="/video2.MP4" aspect="aspect-[4/5]" />
          <Tile kind="image" src="/proof2.png" alt={t("imageAlt")} aspect="aspect-[4/5]" />
        </div>
      </div>
    </section>
  );
}

function Tile({
  kind,
  src,
  alt,
  aspect,
  className = "",
}: {
  kind: "video" | "image";
  src: string;
  alt?: string;
  aspect: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || kind !== "video") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [kind]);

  useEffect(() => {
    const el = ref.current;
    const vid = videoRef.current;
    if (!el || !vid) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) vid.play().catch(() => {});
        else vid.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  return (
    <div ref={ref} className={`relative ${aspect} overflow-hidden rounded-md bg-ink/5 ${className}`}>
      {kind === "image" ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes="(min-width: 640px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 hover:scale-[1.03]"
        />
      ) : mounted ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <div aria-hidden className="h-full w-full animate-pulse bg-ink/5" />
      )}
    </div>
  );
}
