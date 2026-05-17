"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Globe } from "@esmate/shadcn/pkgs/lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@esmate/shadcn/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const LABELS: Record<Locale, { short: string; long: string }> = {
  en: { short: "EN", long: "English" },
  fr: { short: "FR", long: "Français" },
  de: { short: "DE", long: "Deutsch" },
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const [pending, startTransition] = useTransition();

  function change(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 items-center gap-1.5 rounded-full border border-ink/15 bg-white/60 px-3 text-[10px] font-extrabold tracking-[0.18em] text-ink uppercase transition-colors hover:bg-white disabled:opacity-50"
        aria-label={t("language")}
        disabled={pending}
      >
        <Globe className="h-3.5 w-3.5" strokeWidth={2} />
        {LABELS[locale].short}
        <ChevronDown className="h-3 w-3 opacity-60" strokeWidth={2.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {routing.locales.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => change(code)}
            className={`cursor-pointer text-sm ${code === locale ? "font-semibold text-ink" : "text-muted"}`}
          >
            <span className="mr-2 text-[10px] font-extrabold tracking-[0.18em] uppercase">
              {LABELS[code].short}
            </span>
            {LABELS[code].long}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
