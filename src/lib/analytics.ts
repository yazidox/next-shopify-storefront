/**
 * Marketing event tracking — Meta Pixel + (optionally) other vendors.
 *
 * Standard Meta events ad platforms use to optimize for sales:
 *   PageView           — every route (fires automatically from layout.tsx)
 *   ViewContent        — product detail page view
 *   AddToCart          — user adds product to cart
 *   InitiateCheckout   — user clicks Checkout
 *   Lead               — newsletter signup
 *   Search             — search query submitted
 *   Purchase           — fires on Shopify's hosted checkout (configure in
 *                        Shopify admin → Settings → Customer events)
 *
 * All functions are safe to call before the pixel script has finished loading —
 * fbq queues events automatically. They're also safe on the server (no-op).
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

  /** Checkout button clicked. */
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

  /** Search bar query submitted. */
  search(query: string) {
    fbq("track", "Search", { search_string: query });
  },

  /** Free-form custom event for anything else (e.g. "InitiateBuild"). */
  custom(name: string, params?: Record<string, unknown>) {
    fbq("trackCustom", name, params);
  },
};
