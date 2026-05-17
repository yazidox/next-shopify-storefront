import { Metadata } from "next";
import { cookies } from "next/headers";
import { ProductList } from "./product-list";
import { getProductList } from "./service";
import { COUNTRY_COOKIE, normalizeCountryCode } from "@/lib/localization";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Products",
  description: "All products on the store",
};

export default async function Page() {
  const cookieStore = await cookies();
  const countryCode = normalizeCountryCode(cookieStore.get(COUNTRY_COOKIE)?.value);
  const data = await getProductList(undefined, countryCode);

  return (
    <div className="mx-auto max-w-7xl px-6 pt-32 pb-20 lg:px-12">
      <ProductList data={data} />
    </div>
  );
}
