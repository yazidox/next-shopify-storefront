import type { Metadata } from "next";
import { StoreContentShell } from "../store-content-shell";

export const metadata: Metadata = {
  title: "Shipping",
  description: "Shipping regions, timeframes, and fees for ChronoStrap orders.",
};

export default function ShippingPage() {
  return (
    <StoreContentShell eyebrow="Care" title="Shipping">
      <p>
        We ship to the countries available at checkout. Delivery times are estimates from dispatch and may vary during
        launches or holidays.
      </p>
      <h2>Processing</h2>
      <p>
        Orders are typically processed within 1–3 business days. You will receive a confirmation email with tracking
        when your parcel ships.
      </p>
      <h2>Delivery</h2>
      <ul>
        <li>
          <strong>Standard</strong> — usually 3–7 business days domestically, 5–14 business days internationally.
        </li>
        <li>
          <strong>Express</strong> — where offered at checkout, usually 1–3 business days after dispatch.
        </li>
      </ul>
      <h2>Duties & taxes</h2>
      <p>
        International orders may be subject to import duties, taxes, or brokerage fees collected by the carrier on
        delivery. These are the buyer&apos;s responsibility where applicable.
      </p>
      <h2>Questions</h2>
      <p>
        For shipment issues or address changes before dispatch, contact us via{" "}
        <a href="mailto:support@chronostrap.com" className="text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop">
          support@chronostrap.com
        </a>
        .
      </p>
    </StoreContentShell>
  );
}
