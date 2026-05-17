import { graphql } from "@/lib/graphql";
import { storefront } from "@/lib/storefront";
import { invariant } from "@esmate/utils";
import { truncate } from "@esmate/utils/lodash";
import { titleize } from "@esmate/utils/string";

export async function getSiblingProducts(handle: string, productType: string | null | undefined) {
  // Pull a batch of products and let the component filter — Storefront API doesn't
  // support a clean "siblings by type" query without extra metafields.
  const SiblingsQuery = graphql(`
    query SiblingProducts($first: Int!, $query: String) {
      products(first: $first, query: $query) {
        nodes {
          id
          handle
          title
          productType
          featuredImage {
            url(transform: { maxWidth: 200 })
            altText
          }
        }
      }
    }
  `);

  const queryStr = productType ? `product_type:'${productType.replace(/'/g, "")}'` : undefined;
  const { data } = await storefront.query(SiblingsQuery, { first: 16, query: queryStr ?? null });
  const nodes = (data?.products?.nodes ?? []).filter((n) => n?.handle && n.handle !== handle);
  return nodes;
}

export async function getProductSingle(handle: string) {
  const ProductSingleQuery = graphql(`
    query ProductSingle($handle: String!) {
      product(handle: $handle) {
        id
        handle
        title
        description(truncateAt: 600)
        productType
        vendor
        tags
        seo {
          title
          description
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 250) {
          nodes {
            id
            url(transform: { maxHeight: 1200 })
            altText
            width
            height
          }
        }
        options(first: 250) {
          id
          name
          values
        }
        variants(first: 250) {
          nodes {
            id
            availableForSale
            priceV2 {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            image {
              id
            }
          }
        }
      }
    }
  `);

  const { data } = await storefront.query(ProductSingleQuery, {
    handle,
  });

  invariant(data?.product, "product is not available");

  const { seo, title, description } = data.product;

  return {
    ...data.product,
    seo: {
      title: titleize(seo.title || title),
      description: seo.description || truncate(description, { length: 256 }),
    },
  };
}
