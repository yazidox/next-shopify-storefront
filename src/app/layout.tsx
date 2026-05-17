import type { Metadata } from "next";
import { ReactNode } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const FB_PIXEL_ID = "2435361760266906";

export const metadata: Metadata = {
  metadataBase: new URL("https://chronostrap.com"),
  title: {
    default: "ChronoStrap — The First Customizable Bioceramic Watch",
    template: "%s • ChronoStrap",
  },
  description:
    "The first-ever modular bioceramic watch you customize yourself. One Swiss-made case, eight interchangeable straps, infinite combinations. Snap, swap, and style your watch in seconds.",
  keywords: [
    "custom watch",
    "customizable watch",
    "modular watch",
    "build your own watch",
    "bioceramic watch",
    "Swiss made watch",
    "interchangeable strap",
    "designer watch",
    "ChronoStrap",
    "luxury watch",
  ],
  authors: [{ name: "ChronoStrap" }],
  creator: "ChronoStrap",
  publisher: "ChronoStrap",
  applicationName: "ChronoStrap",
  category: "fashion",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chronostrap.com",
    siteName: "ChronoStrap",
    title: "ChronoStrap — The First Customizable Bioceramic Watch",
    description:
      "One Swiss-made bioceramic case. Eight straps. Customize your watch in three seconds. The first modular watch designed to be made yours.",
    images: [
      {
        url: "/logo.png",
        width: 841,
        height: 308,
        alt: "ChronoStrap",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChronoStrap — Custom Your Strap",
    description: "The first-ever customizable bioceramic watch. Eight straps, one case, infinite combinations.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favico.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/favico.png",
    shortcut: "/favico.png",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://chronostrap.com/#organization",
      name: "ChronoStrap",
      url: "https://chronostrap.com",
      logo: "https://chronostrap.com/logo.png",
      description: "Swiss-made customizable bioceramic watches with interchangeable straps.",
      sameAs: ["https://instagram.com/chronostrap", "https://youtube.com/chronostrap"],
    },
    {
      "@type": "WebSite",
      "@id": "https://chronostrap.com/#website",
      url: "https://chronostrap.com",
      name: "ChronoStrap",
      publisher: { "@id": "https://chronostrap.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://chronostrap.com/products?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Product",
      name: "ChronoStrap — The Modular Watch",
      description: "The first customizable bioceramic watch. One Swiss-made case, eight interchangeable straps.",
      brand: { "@type": "Brand", name: "ChronoStrap" },
      image: "https://chronostrap.com/logo.png",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "EUR",
        lowPrice: "280",
        highPrice: "280",
        offerCount: "8",
      },
    },
  ],
};

interface Props {
  children: ReactNode;
}

/**
 * Root layout — owns <html>, <head>, <body> + global scripts. Per-locale
 * providers (NextIntlClientProvider, Shopify provider, Header, Footer) live
 * in `src/app/[locale]/layout.tsx`.
 */
export default function Layout(props: Props) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://ajax.googleapis.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800;900&display=swap"
        />
        {/* Preload only the FIRST 3D model — the rest load on-demand as we cycle. */}
        <link
          rel="preload"
          href="/wristwatch.opt.glb"
          as="fetch"
          type="model/gltf-binary"
          crossOrigin="anonymous"
          // @ts-expect-error -- fetchpriority is valid HTML but not yet in React types
          fetchpriority="high"
        />
        {/* Module preload for model-viewer itself */}
        <link rel="modulepreload" href="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js" />
        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
          async
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body className="min-h-screen bg-cream text-ink">
        {/* Meta (Facebook) Pixel */}
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        {props.children}
        <Analytics />
      </body>
    </html>
  );
}
