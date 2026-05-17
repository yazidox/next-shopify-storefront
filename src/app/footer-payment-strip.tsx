const METHODS: { src: string; label: string }[] = [
  { src: "/payments/visa.svg", label: "Visa" },
  { src: "/payments/mastercard.svg", label: "Mastercard" },
  { src: "/payments/amex.svg", label: "American Express" },
  { src: "/payments/apple-pay.svg", label: "Apple Pay" },
  { src: "/payments/google-pay.svg", label: "Google Pay" },
  { src: "/payments/shop-pay.svg", label: "Shop Pay" },
];

/**
 * Compact payment marks — logos only, for the footer base.
 */
export function FooterPaymentStrip() {
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-4">
      <ul className="flex list-none flex-wrap items-center justify-center gap-x-4 gap-y-3 pl-0">
        {METHODS.map((m) => (
          <li key={m.src}>
            <img
              src={m.src}
              alt={m.label}
              width={72}
              height={16}
              className="h-[13px] w-auto max-w-[68px] opacity-[0.88] saturate-[0.85] sm:h-3.5"
            />
          </li>
        ))}
      </ul>
      <a
        href="https://www.shopify.com"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 opacity-[0.42] transition-opacity hover:opacity-[0.72]"
        aria-label="Shopify"
      >
        <img src="/payments/shopify.svg" alt="" width={72} height={20} className="h-[18px] w-auto sm:h-5" />
      </a>
    </div>
  );
}
