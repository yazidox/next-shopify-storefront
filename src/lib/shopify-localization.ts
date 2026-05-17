import { graphql } from "@/lib/graphql";
import { FALLBACK_LOCALIZATION_OPTIONS, type LocalizationOption } from "@/lib/localization";
import { storefront } from "@/lib/storefront";

interface ShopifyLocalization {
  options: LocalizationOption[];
  primaryCurrencyCode: string;
  enabledCurrencyCodes: string[];
}

const StoreLocalizationQuery = graphql(`
  query StoreLocalization {
    localization {
      availableCountries {
        isoCode
        name
        currency {
          isoCode
          name
          symbol
        }
      }
    }
    shop {
      paymentSettings {
        currencyCode
        enabledPresentmentCurrencies
      }
    }
  }
`);

export async function getShopifyLocalization(): Promise<ShopifyLocalization> {
  try {
    const { data } = await storefront.query(StoreLocalizationQuery);
    const primaryCurrencyCode =
      data?.shop?.paymentSettings?.currencyCode ?? FALLBACK_LOCALIZATION_OPTIONS[0].currencyCode;
    const enabledCurrencyCodes = data?.shop?.paymentSettings?.enabledPresentmentCurrencies ?? [primaryCurrencyCode];
    const enabled = new Set(enabledCurrencyCodes);

    const options = (data?.localization?.availableCountries ?? [])
      .filter((country) => country?.currency?.isoCode && enabled.has(country.currency.isoCode))
      .map((country): LocalizationOption => {
        const currencyCode = country.currency.isoCode;
        return {
          countryCode: country.isoCode,
          countryName: country.name,
          currencyCode,
          currencyName: country.currency.name,
          currencySymbol: country.currency.symbol,
          isPrimaryCurrency: currencyCode === primaryCurrencyCode,
        };
      })
      .sort((a, b) => {
        if (a.countryCode === "US") return -1;
        if (b.countryCode === "US") return 1;
        if (a.isPrimaryCurrency !== b.isPrimaryCurrency) return a.isPrimaryCurrency ? -1 : 1;
        return `${a.currencyCode} ${a.countryName}`.localeCompare(`${b.currencyCode} ${b.countryName}`);
      });

    return {
      options: options.length > 0 ? options : FALLBACK_LOCALIZATION_OPTIONS,
      primaryCurrencyCode,
      enabledCurrencyCodes,
    };
  } catch {
    return {
      options: FALLBACK_LOCALIZATION_OPTIONS,
      primaryCurrencyCode: FALLBACK_LOCALIZATION_OPTIONS[0].currencyCode,
      enabledCurrencyCodes: [FALLBACK_LOCALIZATION_OPTIONS[0].currencyCode],
    };
  }
}
