"use client";

import Link from "next/link";
import Image from "next/image";
import type { MoneyV2 } from "@shopify/hydrogen-react/storefront-api-types";

import {
  CartCheckoutButton,
  CartCost,
  CartLineProvider,
  CartLineQuantity,
  CartLineQuantityAdjustButton,
  Money,
  useCart,
} from "@shopify/hydrogen-react";
import { analytics } from "@/lib/analytics";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@esmate/shadcn/components/ui/card";
import { Button } from "@esmate/shadcn/components/ui/button";
import { Separator } from "@esmate/shadcn/components/ui/separator";
import { Badge } from "@esmate/shadcn/components/ui/badge";

export function Cart() {
  const cart = useCart();
  const isCartEmpty = (cart?.totalQuantity ?? 0) === 0;

  return (
    <section className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {cart.lines?.map((line) => (
            <CartLineProvider key={line?.id} line={line!}>
              <div className="flex gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                  <Image
                    src={line?.merchandise?.image?.url as string}
                    alt={line?.merchandise?.image?.altText || ""}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <Link
                        href={`/products/${line?.merchandise?.product?.handle}`}
                        className="leading-tight font-medium hover:underline"
                      >
                        {line?.merchandise?.product?.title}
                      </Link>

                      <Money data={line?.cost?.totalAmount as MoneyV2} className="text-sm font-semibold" />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {line?.merchandise?.selectedOptions?.map((option) => (
                        <Badge key={option?.name} variant="secondary">
                          {option?.value}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Qty <CartLineQuantity />
                    </span>

                    <CartLineQuantityAdjustButton
                      adjust="remove"
                      className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                    >
                      Remove
                    </CartLineQuantityAdjustButton>
                  </div>
                </div>
              </div>

              <Separator />
            </CartLineProvider>
          ))}

          {isCartEmpty && <p className="text-sm text-muted-foreground">Your cart is empty.</p>}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="flex w-full justify-between text-sm font-medium">
            <span>Subtotal</span>
            <CartCost amountType="subtotal" />
          </div>

          <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>

          <CartCheckoutButton
            disabled={isCartEmpty}
            onClick={() => {
              analytics.initiateCheckout({
                ids: (cart.lines ?? []).map((l) => l?.merchandise?.product?.id ?? "").filter(Boolean),
                quantity: cart.totalQuantity ?? 0,
                subtotal: cart.cost?.subtotalAmount
                  ? {
                      amount: cart.cost.subtotalAmount.amount,
                      currencyCode: cart.cost.subtotalAmount.currencyCode,
                    }
                  : undefined,
              });
            }}
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            Checkout
          </CartCheckoutButton>

          <Button variant="link" asChild className="text-sm">
            <Link href="/products">Continue shopping →</Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
