import type { Metadata } from "next";
import { StoreContentShell } from "../store-content-shell";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How ChronoStrap collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <StoreContentShell eyebrow="Legal" title="Privacy policy">
      <p className="text-sm text-ink/50">Last updated: May 2026</p>
      <p>
        This policy describes how ChronoStrap (&quot;we&quot;, &quot;us&quot;) handles personal information when you
        visit our site, create an account, or purchase from us.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Contact and account details you provide (name, email, shipping address)</li>
        <li>Order history and payment information processed through our payment providers</li>
        <li>Technical data such as device, browser, and approximate location from standard server logs</li>
        <li>Marketing preferences when you subscribe to our newsletter</li>
      </ul>
      <h2>How we use information</h2>
      <ul>
        <li>Fulfill orders, payments, and customer support</li>
        <li>Send transactional messages (order confirmations, shipping updates)</li>
        <li>Send marketing only when you have opted in; you can unsubscribe anytime</li>
        <li>Improve our storefront, security, and analytics in aggregate form</li>
      </ul>
      <h2>Sharing</h2>
      <p>
        We share data with service providers who help us operate the store (e.g. e‑commerce platform, payment
        processing, shipping carriers) under strict instructions. We do not sell your personal information.
      </p>
      <h2>Retention</h2>
      <p>We keep order and legal records as needed for tax, accounting, and dispute resolution, then delete or anonymize where possible.</p>
      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, delete, or export your data, or to object
        to certain processing. Contact{" "}
        <a href="mailto:privacy@chronostrap.com" className="text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop">
          privacy@chronostrap.com
        </a>{" "}
        and we will respond within applicable timeframes.
      </p>
      <h2>Contact</h2>
      <p>
        Privacy questions:{" "}
        <a href="mailto:privacy@chronostrap.com" className="text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop">
          privacy@chronostrap.com
        </a>
      </p>
    </StoreContentShell>
  );
}
