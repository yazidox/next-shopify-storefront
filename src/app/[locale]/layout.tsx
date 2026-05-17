import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Header } from "./header";
import { ConditionalFooter } from "./conditional-footer";
import { LoadingScreen } from "./loading-screen";
import { FomoTopBar } from "./fomo-offer";
import { VercelInteractionTracker } from "./vercel-interaction-tracker";
import TopLoader from "nextjs-toploader";
import Providers from "./providers";
import { routing } from "@/i18n/routing";
import { COUNTRY_COOKIE, resolveCountryCode } from "@/lib/localization";
import { getShopifyLocalization } from "@/lib/shopify-localization";

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const localization = await getShopifyLocalization();
  const cookieStore = await cookies();
  const countryCode = resolveCountryCode(cookieStore.get(COUNTRY_COOKIE)?.value, localization.options);

  return (
    <NextIntlClientProvider locale={locale}>
      <LoadingScreen />
      <TopLoader color="#c2185b" showSpinner={false} />
      <Providers countryCode={countryCode} localizationOptions={localization.options}>
        <VercelInteractionTracker />
        <FomoTopBar />
        <Header />
        <main>{children}</main>
        <ConditionalFooter />
      </Providers>
    </NextIntlClientProvider>
  );
}
