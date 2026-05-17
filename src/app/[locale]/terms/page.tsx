import type { Metadata } from "next";
import { StoreContentShell } from "../store-content-shell";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Terms and conditions for using the ChronoStrap website and purchasing products.",
};

export default function TermsPage() {
  return (
    <StoreContentShell eyebrow="Legal" title="Terms of service">
      <p className="text-sm text-ink/50">Last updated: May 2026</p>
      <p>
        By accessing chronostrap.com and placing an order, you agree to these terms. If you do not agree, please do not
        use the site.
      </p>
      <h2>Products & availability</h2>
      <p>
        Descriptions, images, and prices are presented as accurately as possible. We may correct errors, limit
        quantities, or cancel orders that we cannot fulfill — in which case you will receive a full refund for any
        amount charged.
      </p>
      <h2>Orders & payment</h2>
      <p>
        When you place an order, you offer to buy the items in your cart at the prices shown. We accept the payment
        methods shown at checkout. Title and risk of loss pass to you upon delivery to the carrier, except where local
        law requires otherwise.
      </p>
      <h2>Custom & pre-order</h2>
      <p>
        Custom strap studio or pre-order products may have extended lead times and different cancellation rules as
        stated on the product page at purchase.
      </p>
      <h2>Intellectual property</h2>
      <p>
        All content on this site (including text, graphics, logos, and photography) is owned by ChronoStrap or its
        licensors. You may not copy or exploit it without written permission.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we are not liable for indirect or consequential damages arising from your
        use of the site or products. Our total liability for any claim related to an order is limited to the amount you
        paid for that order.
      </p>
      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws applicable in our place of incorporation, without regard to conflict-of-law
        rules, subject to mandatory consumer protections where you reside.
      </p>
      <h2>Contact</h2>
      <p>
        <a href="mailto:legal@chronostrap.com" className="text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop">
          legal@chronostrap.com
        </a>
      </p>
    </StoreContentShell>
  );
}
