"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Social-proof / lifestyle gallery shown at the bottom of every product page.
 * Two muted autoplay videos flanking a hero lifestyle photo.
 *
 * Videos only start playing once scrolled into view (saves bandwidth and CPU
 * on mobile, where 90% of our traffic is).
 */
export function ProductProof({ eyebrow = "In the wild" }: { eyebrow?: string }) {
  return (
    <section className="border-t border-line bg-cream/40 px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-3 lg:mb-12">
          <span className="text-[11px] font-extrabold tracking-[0.18em] text-muted uppercase">
            {eyebrow}
          </span>
          <h2 className="font-display text-3xl leading-[0.95] uppercase md:text-4xl lg:text-5xl">
            On wrists. On the move.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <Tile
            kind="video"
            src="/video1.MP4"
            aspect="aspect-[4/5]"
            className="sm:col-span-1"
          />
          <Tile
            kind="image"
            src="/lambo-product.jpg"
            alt="ChronoStrap watch lifestyle shot"
            aspect="aspect-[4/5]"
            className="sm:col-span-1 sm:row-span-1"
          />
          <Tile
            kind="video"
            src="/video2.MP4"
            aspect="aspect-[4/5]"
            className="sm:col-span-1"
          />
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
    <div
      ref={ref}
      className={`relative ${aspect} overflow-hidden rounded-md bg-ink/5 ${className}`}
    >
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
