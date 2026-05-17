import type { Metadata } from "next";
import { StoreContentShell } from "../store-content-shell";

export const metadata: Metadata = {
  title: "Legal notice",
  description: "Legal notice and publisher information for ChronoStrap.",
};

export default function LegalNoticePage() {
  return (
    <StoreContentShell eyebrow="Legal" title="Legal notice">
      <p className="text-sm text-ink/50">May 2026</p>
      <h2>Publisher</h2>
      <p>
        ChronoStrap
        <br />
        <span className="text-ink/60">[Registered legal name and form — update for your jurisdiction]</span>
      </p>
      <h2>Head office</h2>
      <p className="text-ink/60">
        [Street, postal code, city, country]
        <br />
        Paris · Geneva · Tokyo — commercial representation only where indicated.
      </p>
      <h2>Contact</h2>
      <p>
        <a href="mailto:legal@chronostrap.com" className="text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop">
          legal@chronostrap.com
        </a>
      </p>
      <h2>Dispute resolution</h2>
      <p>
        The European Commission provides a platform for online dispute resolution:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noreferrer"
          className="text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop"
        >
          ODR
        </a>
        . We are not obliged to participate in consumer arbitration proceedings before a dispute resolution body, except
        where required by law.
      </p>
    </StoreContentShell>
  );
}
