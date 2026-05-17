import type { Metadata } from "next";
import { StoreContentShell } from "../store-content-shell";

export const metadata: Metadata = {
  title: "Returns",
  description: "Returns and exchanges policy for ChronoStrap purchases.",
};

export default function ReturnsPage() {
  return (
    <StoreContentShell eyebrow="Care" title="Returns & exchanges">
      <h2>Returns</h2>
      <p>
        If your piece is unworn, in original condition, and in its original packaging, you may request a return within{" "}
        <strong>14 days</strong> of delivery. Customized or made-to-order straps may be excluded where noted at
        purchase.
      </p>
      <h2>How to start a return</h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Email support with your order number and reason for return.</li>
        <li>We will confirm eligibility and share return instructions.</li>
        <li>Ship the item back using a trackable service; keep your receipt.</li>
      </ol>
      <h2>Refunds</h2>
      <p>
        Approved refunds are issued to the original payment method after we receive and inspect the return. Shipping
        charges are non-refundable unless the return is due to our error or a defective product.
      </p>
      <h2>Exchanges</h2>
      <p>
        For a different size or reference, contact us; we will help subject to stock availability. You may be asked to
        return the original item first.
      </p>
      <p>
        <a href="mailto:support@chronostrap.com" className="text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop">
          support@chronostrap.com
        </a>
      </p>
    </StoreContentShell>
  );
}
