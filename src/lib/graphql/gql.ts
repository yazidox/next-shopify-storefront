/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    query SiblingProducts($first: Int!, $query: String) {\n      products(first: $first, query: $query) {\n        nodes {\n          id\n          handle\n          title\n          productType\n          featuredImage {\n            url(transform: { maxWidth: 200 })\n            altText\n          }\n        }\n      }\n    }\n  ": typeof types.SiblingProductsDocument,
    "\n    query ProductSingle($handle: String!) {\n      product(handle: $handle) {\n        id\n        handle\n        title\n        description(truncateAt: 600)\n        productType\n        vendor\n        tags\n        seo {\n          title\n          description\n        }\n        priceRange {\n          minVariantPrice {\n            amount\n            currencyCode\n          }\n        }\n        images(first: 250) {\n          nodes {\n            id\n            url(transform: { maxHeight: 1200 })\n            altText\n            width\n            height\n          }\n        }\n        options(first: 250) {\n          id\n          name\n          values\n        }\n        variants(first: 250) {\n          nodes {\n            id\n            availableForSale\n            priceV2 {\n              amount\n              currencyCode\n            }\n            selectedOptions {\n              name\n              value\n            }\n            image {\n              id\n            }\n          }\n        }\n      }\n    }\n  ": typeof types.ProductSingleDocument,
    "\n    query ProductList($first: Int!, $after: String) {\n      products(first: $first, after: $after) {\n        pageInfo {\n          hasNextPage\n        }\n        edges {\n          cursor\n          node {\n            id\n            handle\n            title\n            productType\n            priceRange {\n              minVariantPrice {\n                amount\n                currencyCode\n              }\n            }\n            featuredImage {\n              url(transform: { maxWidth: 900 })\n              altText\n              width\n              height\n            }\n            variants(first: 1) {\n              nodes {\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  ": typeof types.ProductListDocument,
};
const documents: Documents = {
    "\n    query SiblingProducts($first: Int!, $query: String) {\n      products(first: $first, query: $query) {\n        nodes {\n          id\n          handle\n          title\n          productType\n          featuredImage {\n            url(transform: { maxWidth: 200 })\n            altText\n          }\n        }\n      }\n    }\n  ": types.SiblingProductsDocument,
    "\n    query ProductSingle($handle: String!) {\n      product(handle: $handle) {\n        id\n        handle\n        title\n        description(truncateAt: 600)\n        productType\n        vendor\n        tags\n        seo {\n          title\n          description\n        }\n        priceRange {\n          minVariantPrice {\n            amount\n            currencyCode\n          }\n        }\n        images(first: 250) {\n          nodes {\n            id\n            url(transform: { maxHeight: 1200 })\n            altText\n            width\n            height\n          }\n        }\n        options(first: 250) {\n          id\n          name\n          values\n        }\n        variants(first: 250) {\n          nodes {\n            id\n            availableForSale\n            priceV2 {\n              amount\n              currencyCode\n            }\n            selectedOptions {\n              name\n              value\n            }\n            image {\n              id\n            }\n          }\n        }\n      }\n    }\n  ": types.ProductSingleDocument,
    "\n    query ProductList($first: Int!, $after: String) {\n      products(first: $first, after: $after) {\n        pageInfo {\n          hasNextPage\n        }\n        edges {\n          cursor\n          node {\n            id\n            handle\n            title\n            productType\n            priceRange {\n              minVariantPrice {\n                amount\n                currencyCode\n              }\n            }\n            featuredImage {\n              url(transform: { maxWidth: 900 })\n              altText\n              width\n              height\n            }\n            variants(first: 1) {\n              nodes {\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  ": types.ProductListDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SiblingProducts($first: Int!, $query: String) {\n      products(first: $first, query: $query) {\n        nodes {\n          id\n          handle\n          title\n          productType\n          featuredImage {\n            url(transform: { maxWidth: 200 })\n            altText\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql').SiblingProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query ProductSingle($handle: String!) {\n      product(handle: $handle) {\n        id\n        handle\n        title\n        description(truncateAt: 600)\n        productType\n        vendor\n        tags\n        seo {\n          title\n          description\n        }\n        priceRange {\n          minVariantPrice {\n            amount\n            currencyCode\n          }\n        }\n        images(first: 250) {\n          nodes {\n            id\n            url(transform: { maxHeight: 1200 })\n            altText\n            width\n            height\n          }\n        }\n        options(first: 250) {\n          id\n          name\n          values\n        }\n        variants(first: 250) {\n          nodes {\n            id\n            availableForSale\n            priceV2 {\n              amount\n              currencyCode\n            }\n            selectedOptions {\n              name\n              value\n            }\n            image {\n              id\n            }\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql').ProductSingleDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query ProductList($first: Int!, $after: String) {\n      products(first: $first, after: $after) {\n        pageInfo {\n          hasNextPage\n        }\n        edges {\n          cursor\n          node {\n            id\n            handle\n            title\n            productType\n            priceRange {\n              minVariantPrice {\n                amount\n                currencyCode\n              }\n            }\n            featuredImage {\n              url(transform: { maxWidth: 900 })\n              altText\n              width\n              height\n            }\n            variants(first: 1) {\n              nodes {\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql').ProductListDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
