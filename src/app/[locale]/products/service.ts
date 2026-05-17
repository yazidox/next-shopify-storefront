import { graphql } from "@/lib/graphql";
import { CountryCode } from "@/lib/graphql/graphql";
import { DEFAULT_COUNTRY_CODE, normalizeCountryCode } from "@/lib/localization";
import { storefront } from "@/lib/storefront";
import { invariant } from "@esmate/utils";

export async function getProductList(cursor?: string, countryCode = DEFAULT_COUNTRY_CODE) {
  const ProductListQuery = graphql(`
    query ProductList($first: Int!, $after: String, $country: CountryCode) @inContext(country: $country) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            id
            handle
            title
            productType
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url(transform: { maxWidth: 900 })
              altText
              width
              height
            }
            variants(first: 1) {
              nodes {
                id
              }
            }
          }
        }
      }
    }
  `);

  const { data } = await storefront.query(ProductListQuery, {
    first: 12,
    after: cursor || null,
    country: normalizeCountryCode(countryCode) as CountryCode,
  });

  invariant(data?.products, "products are not available");

  return data.products;
}
