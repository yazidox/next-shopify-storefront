import type { Metadata } from "next";
import { cookies } from "next/headers";
import { BuyStrapList } from "./buy-strap-list";
import { graphql } from "@/lib/graphql";
import { CountryCode, CurrencyCode } from "@/lib/graphql/graphql";
import { COUNTRY_COOKIE, DEFAULT_COUNTRY_CODE, normalizeCountryCode } from "@/lib/localization";
import { storefront } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Buy Strap",
  description:
    "Official ChronoStrap colourways — pre-designed straps, ready to ship. Pick your favourite and snap it onto any ChronoStrap watch.",
};

export const revalidate = 300;

async function getCustomStrapInfo(): Promise<{
  variantId: string | null;
  price: { amount: string; currencyCode: CurrencyCode } | null;
}> {
  const Query = graphql(`
    query CustomStrapInfo($handle: String!, $country: CountryCode) @inContext(country: $country) {
      product(handle: $handle) {
        id
        variants(first: 1) {
          nodes {
            id
            priceV2 {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `);
  try {
    const cookieStore = await cookies();
    const countryCode = normalizeCountryCode(cookieStore.get(COUNTRY_COOKIE)?.value ?? DEFAULT_COUNTRY_CODE);
    const { data } = await storefront.query(Query, {
      handle: "chronostrap-custom-strap",
      country: countryCode as CountryCode,
    });
    const variant = data?.product?.variants?.nodes?.[0];
    return {
      variantId: variant?.id ?? null,
      price: variant?.priceV2
        ? { amount: variant.priceV2.amount as string, currencyCode: variant.priceV2.currencyCode }
        : null,
    };
  } catch {
    return { variantId: null, price: null };
  }
}

export default async function Page() {
  const { variantId, price } = await getCustomStrapInfo();
  return (
    <div className="px-6 pt-24 pb-20 lg:px-10 lg:pt-28">
      <BuyStrapList variantId={variantId} price={price} />
    </div>
  );
}
