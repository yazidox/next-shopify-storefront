"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { analytics } from "@/lib/analytics";

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
  event: string;
  params?: Record<string, unknown>;
}

/** Drop-in <Link> that fires a Meta Pixel custom event when clicked. */
export function TrackedLink({ href, children, className, event, params }: Props) {
  return (
    <Link href={href} onClick={() => analytics.custom(event, params)} className={className}>
      {children}
    </Link>
  );
}
