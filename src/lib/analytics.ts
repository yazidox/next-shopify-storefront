/**
 * Marketing event tracking — Meta Pixel + (optionally) other vendors.
 *
 * Implemented standard events (per Meta's spec):
 *   PageView           — every route, automatic from layout.tsx
 *   ViewContent        — product detail page view
 *   AddToCart          — item added to cart
 *   AddToWishlist      — heart/save button on PDP
 *   CustomizeProduct   — user changes config in /custom-strap
 *   Search             — search query submitted
 *   Lead               — newsletter signup (top of funnel)
 *   CompleteRegistration — customer account created
 *   Contact            — contact form submitted
 *   InitiateCheckout   — Shopify Customer Events (NOT here, lives on checkout.shopify.com)
 *   AddPaymentInfo     — Shopify Customer Events
 *   Purchase           — Shopify Customer Events
 *
 * All functions are safe to call before the pixel script has finished loading —
 * fbq queues events. They're also safe on the server (no-op).
 */

type Money = { amount: string | number; currencyCode?: string };

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  window.fbq(...args);
}

const money = (m?: Money) => ({
  value: m ? parseFloat(String(m.amount)) : undefined,
  currency: m?.currencyCode ?? "USD",
});

export const analytics = {
  /** Product detail page viewed. */
  viewContent({
    id,
    name,
    category,
    price,
  }: {
    id: string;
    name: string;
    category?: string;
    price?: Money;
  }) {
    const { value, currency } = money(price);
    fbq("track", "ViewContent", {
      content_ids: [id],
      content_name: name,
      content_type: "product",
      content_category: category,
      value,
      currency,
    });
  },

  /** Item added to cart. */
  addToCart({
    id,
    name,
    quantity = 1,
    price,
  }: {
    id: string;
    name: string;
    quantity?: number;
    price?: Money;
  }) {
    const { value, currency } = money(price);
    fbq("track", "AddToCart", {
      content_ids: [id],
      content_name: name,
      content_type: "product",
      contents: [{ id, quantity }],
      value: value !== undefined ? value * quantity : undefined,
      currency,
    });
  },

  /** Product saved to wishlist. */
  addToWishlist({
    id,
    name,
    price,
  }: {
    id: string;
    name: string;
    price?: Money;
  }) {
    const { value, currency } = money(price);
    fbq("track", "AddToWishlist", {
      content_ids: [id],
      content_name: name,
      content_type: "product",
      value,
      currency,
    });
  },

  /** User changed a config option in the strap customizer. Debounce in caller. */
  customizeProduct({
    id,
    detail,
  }: {
    id: string;
    detail?: string;
  }) {
    fbq("track", "CustomizeProduct", {
      content_ids: [id],
      content_name: detail,
      content_type: "product",
    });
  },

  /** Checkout button clicked. NOTE: Shopify Customer Events also fires this on
   * the hosted checkout page. Don't call from both places to avoid double-count. */
  initiateCheckout({
    ids,
    quantity,
    subtotal,
  }: {
    ids: string[];
    quantity: number;
    subtotal?: Money;
  }) {
    const { value, currency } = money(subtotal);
    fbq("track", "InitiateCheckout", {
      content_ids: ids,
      content_type: "product",
      num_items: quantity,
      value,
      currency,
    });
  },

  /** Newsletter form submitted. */
  lead(source: string) {
    fbq("track", "Lead", { content_name: source });
  },

  /** Customer account created (Shopify account / sign-up). */
  completeRegistration({ method }: { method?: string } = {}) {
    fbq("track", "CompleteRegistration", {
      content_name: method ?? "account",
      status: true,
    });
  },

  /** Contact form submitted / email-to-team event. */
  contact({ source }: { source?: string } = {}) {
    fbq("track", "Contact", { content_name: source ?? "contact-form" });
  },

  /** Search bar query submitted. */
  search(query: string) {
    fbq("track", "Search", { search_string: query });
  },

  /** Free-form custom event for anything else (e.g. "InitiateBuild"). */
  custom(name: string, params?: Record<string, unknown>) {
    fbq("trackCustom", name, params);
  },
};
