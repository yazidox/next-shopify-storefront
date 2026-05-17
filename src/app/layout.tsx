import type { Metadata } from "next";
import { ReactNode } from "react";
import { Header } from "./header";
import { ConditionalFooter } from "./conditional-footer";
import TopLoader from "nextjs-toploader";
import Providers from "./providers";
import "./globals.css";

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
  icons: { icon: "/favicon.ico", apple: "/logo.png" },
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

export default function Layout(props: Props) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
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
        <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body className="min-h-screen bg-cream text-ink">
        <TopLoader color="#c2185b" showSpinner={false} />
        <Providers>
          <Header />
          <main>{props.children}</main>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
