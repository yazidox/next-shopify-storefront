import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { graphql } from "@/lib/graphql";
import { CountryCode, CurrencyCode } from "@/lib/graphql/graphql";
import { COUNTRY_COOKIE, DEFAULT_COUNTRY_CODE, normalizeCountryCode } from "@/lib/localization";
import { storefront } from "@/lib/storefront";
import { findColourway } from "../colourways";
import { StrapDetail } from "./strap-detail";

export const revalidate = 300;

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const c = findColourway(handle);
  if (!c) return { title: "Strap" };
  return {
    title: `${c.name} — Official Strap`,
    description: `${c.name} — ${c.tagline}. Snap-fit bioceramic strap, Swiss-made. Fits any ChronoStrap watch.`,
  };
}

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

export default async function Page({ params }: Props) {
  const { handle } = await params;
  const colourway = findColourway(handle);
  if (!colourway) notFound();

  const { variantId, price } = await getCustomStrapInfo();

  return (
    <div className="pt-24 pb-20 lg:pt-28">
      <StrapDetail colourway={colourway} variantId={variantId} price={price} />
    </div>
  );
}
