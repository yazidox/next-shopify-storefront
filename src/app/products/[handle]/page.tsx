import { Metadata } from "next";
import { ProductSingle } from "./product-single";
import { getProductSingle } from "./service";

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
  const data = await getProductSingle(handle);

  return (
    <div className="mx-auto max-w-7xl px-6 pt-32 pb-20 lg:px-12">
      <ProductSingle data={data} />
    </div>
  );
}
