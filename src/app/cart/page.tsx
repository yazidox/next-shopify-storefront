import { Metadata } from "next";
import { Cart } from "./cart";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your shopping cart",
};

export default function Page() {
  return (
    <div className="px-6 pt-24 pb-20 lg:px-10 lg:pt-28">
      <Cart />
    </div>
  );
}
