"use client";

import { useEffect } from "react";
import { AddToCartButton, ProductPrice, ProductProvider } from "@shopify/hydrogen-react";
import { useVariantSelector } from "@/hooks/use-variant-selector";
import { getProductSingle } from "./service";
import Image from "next/image";
import { Button } from "@esmate/shadcn/components/ui/button";
import { Card, CardContent } from "@esmate/shadcn/components/ui/card";
import { Separator } from "@esmate/shadcn/components/ui/separator";
import { analytics } from "@/lib/analytics";

interface Props {
  data: Awaited<ReturnType<typeof getProductSingle>>;
}

export function ProductSingle(props: Props) {
  const { variantId, options, selectOption } = useVariantSelector(props.data);

  // Fire Meta Pixel ViewContent once per product page view.
  useEffect(() => {
    const variant = props.data.variants?.nodes?.[0];
    analytics.viewContent({
      id: props.data.id,
      name: props.data.title,
      category: props.data.productType ?? undefined,
      price: variant?.price ? { amount: variant.price.amount, currencyCode: variant.price.currencyCode } : undefined,
    });
  }, [props.data]);

  return (
    <ProductProvider data={props.data}>
      <section className="container mx-auto">
        <Card className="overflow-hidden border-0 p-0 shadow-lg">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Product Image */}
            <div className="relative overflow-hidden rounded-lg bg-muted">
              <Image
                src={props.data.images.nodes[0].url}
                alt={props.data.images.nodes[0].altText || ""}
                width={props.data.images.nodes[0].width as number}
                height={props.data.images.nodes[0].height as number}
                className="h-full w-full object-cover object-center transition-transform hover:scale-105"
                priority
              />
            </div>

            {/* Product Details */}
            <CardContent className="flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{props.data.title}</h1>
                <p className="leading-relaxed text-muted-foreground">{props.data.description}</p>
              </div>

              <Separator />

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  <ProductPrice data={props.data} />
                </span>
              </div>

              {/* Product Options */}
              {options.length > 0 && (
                <div className="space-y-4">
                  {options.map(({ name, values }) => (
                    <div key={name} className="space-y-3">
                      <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {values.map(({ value, selected, disabled }) => (
                          <Button
                            key={value}
                            variant={selected ? "default" : "outline"}
                            size="sm"
                            disabled={disabled}
                            onClick={() => selectOption(name, value)}
                            className="min-w-[60px]"
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Add to Cart */}
              <AddToCartButton
                variantId={variantId}
                disabled={!variantId}
                onClick={() => {
                  const variant = props.data.variants?.nodes?.find((v) => v?.id === variantId) ?? props.data.variants?.nodes?.[0];
                  analytics.addToCart({
                    id: props.data.id,
                    name: props.data.title,
                    quantity: 1,
                    price: variant?.price ? { amount: variant.price.amount, currencyCode: variant.price.currencyCode } : undefined,
                  });
                }}
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-8 text-base font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                Add to Cart
              </AddToCartButton>
            </CardContent>
          </div>
        </Card>
      </section>
    </ProductProvider>
  );
}
