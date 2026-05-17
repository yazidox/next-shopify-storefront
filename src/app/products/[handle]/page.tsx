import { Metadata } from "next";
import { cookies } from "next/headers";
import { ProductSingle } from "./product-single";
import { getProductSingle, getSiblingProducts } from "./service";
import { COUNTRY_COOKIE, normalizeCountryCode } from "@/lib/localization";

export const revalidate = 60;

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductSingle(handle);

  return {
    title: product.seo.title,
    description: product.seo.description,
  };
}

export default async function Page({ params }: Props) {
  const { handle } = await params;
  const cookieStore = await cookies();
  const countryCode = normalizeCountryCode(cookieStore.get(COUNTRY_COOKIE)?.value);
  const data = await getProductSingle(handle, countryCode);
  const siblings = await getSiblingProducts(handle, data.productType);

  return (
    <div className="pt-24 pb-20 lg:pt-28">
      <ProductSingle data={data} siblings={siblings} />
    </div>
  );
}
