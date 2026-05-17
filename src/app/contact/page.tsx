import type { Metadata } from "next";
import { StoreContentShell } from "../store-content-shell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact ChronoStrap for orders, press, and customer support.",
};

export default function ContactPage() {
  return (
    <StoreContentShell eyebrow="Care" title="Contact">
      <h2>Customer support</h2>
      <p>
        Orders, returns, warranty, and product questions:{" "}
        <a href="mailto:support@chronostrap.com" className="text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop">
          support@chronostrap.com
        </a>
      </p>
      <h2>Press & partnerships</h2>
      <p>
        <a href="mailto:press@chronostrap.com" className="text-pop underline decoration-pop/30 underline-offset-4 hover:decoration-pop">
          press@chronostrap.com
        </a>
      </p>
      <h2>Response time</h2>
      <p>We aim to reply within 1–2 business days. During launches, it may take a little longer — thank you for your patience.</p>
      <h2>Atelier</h2>
      <p className="text-ink/60">
        Paris · Geneva · Tokyo
        <br />
        Showroom visits by appointment only.
      </p>
    </StoreContentShell>
  );
}
