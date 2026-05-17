import type { Metadata } from "next";
import Link from "next/link";
import { StoreContentShell } from "../store-content-shell";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "How ChronoStrap uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <StoreContentShell eyebrow="Legal" title="Cookie policy">
      <p className="text-sm text-ink/50">Last updated: May 2026</p>
      <p>
        We use cookies and similar technologies to run the storefront, remember your preferences, measure performance,
        and support marketing when allowed.
      </p>
      <h2>Essential cookies</h2>
      <p>Required for checkout, cart, security, and load balancing. These cannot be disabled if you use the site to shop.</p>
      <h2>Analytics & performance</h2>
      <p>
        We may use privacy-respecting analytics to understand how visitors use the site. Where required, we ask for
        your consent before enabling non-essential analytics or marketing pixels.
      </p>
      <h2>Your choices</h2>
      <p>
        You can control cookies through your browser settings. Blocking certain cookies may limit cart or checkout
        functionality.
      </p>
      <h2>More detail</h2>
      <p>
        See our{" "}
        <Link href="/privacy" className="text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop">
          privacy policy
        </Link>{" "}
        for how we process personal data.
      </p>
      <p>
        Questions:{" "}
        <a href="mailto:privacy@chronostrap.com" className="text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop">
          privacy@chronostrap.com
        </a>
      </p>
    </StoreContentShell>
  );
}
