import type { Metadata } from "next";
import { StoreContentShell } from "../store-content-shell";

export const metadata: Metadata = {
  title: "Maison",
  description: "ChronoStrap — bioceramic watches and interchangeable straps from our atelier.",
};

export default function AboutPage() {
  return (
    <StoreContentShell eyebrow="Maison" title="Manifesto">
      <p>
        ChronoStrap is built on a simple idea: one refined case, endless expression. We work in bioceramic and precision
        finishing so you can snap, swap, and style without compromise.
      </p>
      <h2>Craft</h2>
      <p>
        Each reference is considered as a system — case, dial, hardware, and straps are designed together so the whole
        feels intentional, not modular by accident.
      </p>
      <h2>Color</h2>
      <p>
        Color is a choice, not a default. The Custom Strap studio exists so your watch can follow your wardrobe, your
        city, your mood.
      </p>
      <h2>Points of presence</h2>
      <p className="text-ink/60">Paris · Geneva · Tokyo — atelier visits by appointment.</p>
      <p>
        Press:{" "}
        <a href="mailto:press@chronostrap.com" className="text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop">
          press@chronostrap.com
        </a>
      </p>
    </StoreContentShell>
  );
}
