import type { Metadata } from "next";
import { CustomStrapLoader } from "./custom-strap-loader";
import { graphql } from "@/lib/graphql";
import { storefront } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Custom Strap",
  description:
    "Design a custom ChronoStrap with live 3D preview, uploaded textures, finishes, hardware, and stitching.",
};

export const revalidate = 300; // refresh every 5 min in case the variant id changes

const CUSTOM_STRAP_HANDLE = "chronostrap-custom-strap";

async function getCustomStrapVariantId(): Promise<string | null> {
  const Query = graphql(`
    query CustomStrapVariant($handle: String!) {
      product(handle: $handle) {
        id
        variants(first: 1) {
          nodes {
            id
          }
        }
      }
    }
  `);
  try {
    const { data } = await storefront.query(Query, { handle: CUSTOM_STRAP_HANDLE });
    return data?.product?.variants?.nodes?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

export default async function Page() {
  const customStrapVariantId = await getCustomStrapVariantId();
  return <CustomStrapLoader customStrapVariantId={customStrapVariantId} />;
}
