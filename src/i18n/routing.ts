import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr", "de"],
  defaultLocale: "en",
  // "/" stays English, "/fr/..." and "/de/..." get prefixes.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
