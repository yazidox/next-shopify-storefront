"use client";

import { CartProvider, ShopifyProvider } from "@shopify/hydrogen-react";
import { env } from "@/lib/env";
import { ReactNode } from "react";
import { DEFAULT_LANGUAGE_CODE, type LocalizationOption } from "@/lib/localization";
import { StoreLocalizationProvider, useStoreLocalization } from "./store-localization";

interface Props {
  children: ReactNode;
  countryCode: string;
  localizationOptions: LocalizationOption[];
}

export default function Layout(props: Props) {
  return (
    <StoreLocalizationProvider countryCode={props.countryCode} options={props.localizationOptions}>
      <ShopifyProviders>{props.children}</ShopifyProviders>
    </StoreLocalizationProvider>
  );
}

function ShopifyProviders({ children }: { children: ReactNode }) {
  const { countryCode } = useStoreLocalization();

  return (
    <ShopifyProvider
      languageIsoCode={DEFAULT_LANGUAGE_CODE as never}
      countryIsoCode={countryCode as never}
      storeDomain={env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}
      storefrontToken={env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN}
      storefrontApiVersion={env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION}
    >
      <CartProvider countryCode={countryCode as never} languageCode={DEFAULT_LANGUAGE_CODE as never}>
        {children}
      </CartProvider>
    </ShopifyProvider>
  );
}
