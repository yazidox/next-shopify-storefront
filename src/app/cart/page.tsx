import { Metadata } from "next";
import { Cart } from "./cart";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your shopping cart",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-32 pb-20 lg:px-12">
      <Cart />
    </div>
  );
}
