"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  if (pathname === "/custom-strap" || pathname.startsWith("/custom-strap/")) {
    return null;
  }

  return <Footer />;
}
