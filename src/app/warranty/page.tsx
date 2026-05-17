import type { Metadata } from "next";
import { StoreContentShell } from "../store-content-shell";

export const metadata: Metadata = {
  title: "Warranty",
  description: "Limited warranty coverage for ChronoStrap watches and components.",
};

export default function WarrantyPage() {
  return (
    <StoreContentShell eyebrow="Care" title="Warranty">
      <p>
        ChronoStrap warrants that products will be free from defects in materials and workmanship under normal use for
        the period stated below from the date of purchase by the original retail customer.
      </p>
      <h2>Coverage</h2>
      <ul>
        <li>
          <strong>Watch cases & movements</strong> — refer to the warranty card included with your watch for the
          specific term (typically two years from purchase unless otherwise stated).
        </li>
        <li>
          <strong>Straps & finishing</strong> — straps are covered against manufacturing defects; normal wear, color
          change from use, and accidental damage are not covered.
        </li>
      </ul>
      <h2>What is not covered</h2>
      <ul>
        <li>Damage from impact, moisture intrusion beyond rated use, or unauthorized service</li>
        <li>Cosmetic wear from regular use, including scratches on crystals or coatings</li>
        <li>Loss, theft, or third-party modifications</li>
      </ul>
      <h2>Making a claim</h2>
      <p>
        Email{" "}
        <a href="mailto:support@chronostrap.com" className="text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop">
          support@chronostrap.com
        </a>{" "}
        with your order number, photos, and a short description. We will advise next steps, which may include service
        at an authorized center.
      </p>
    </StoreContentShell>
  );
}
