"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowRight, RotateCw } from "@esmate/shadcn/pkgs/lucide-react";
import { Link } from "@/i18n/navigation";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");
  useEffect(() => {
    if (typeof console !== "undefined") {
      console.error("[ChronoStrap route error]", error);
    }
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-cream">
        <AlertTriangle className="h-7 w-7 text-pop" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl leading-[0.95] uppercase md:text-4xl">{t("title")}</h1>
        <p className="text-[15px] leading-relaxed text-muted">{t("subtitle")}</p>
        {error.digest && (
          <p className="text-[10px] tracking-[0.18em] text-muted/70 uppercase">
            {t("reference")}: {error.digest}
          </p>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-8 text-[11px] font-extrabold tracking-[0.18em] text-cream uppercase transition-colors hover:bg-pop"
        >
          <RotateCw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" strokeWidth={2.5} />
          {t("tryAgain")}
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-line bg-surface px-8 text-[11px] font-extrabold tracking-[0.18em] text-ink uppercase transition-colors hover:border-ink"
        >
          {t("goHome")}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </section>
  );
}
