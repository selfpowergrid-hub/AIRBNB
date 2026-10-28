import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { SITE } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

const title = "Port Hill Guest and Accommodation | 600m from Eldoret Airport";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: title, template: "%s | Port Hill Guest" },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  keywords: [
    "Eldoret airport accommodation",
    "guest house near Eldoret International Airport",
    "Port Hill Guest",
    "Eldoret airport parking",
    "Airbnb Eldoret",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.name,
    title,
    description: SITE.description,
    locale: "en_KE",
  },
  twitter: { card: "summary_large_image", title, description: SITE.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#008080",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  image: `${SITE.url}/opengraph-image`,
  telephone: SITE.phoneIntl,
  email: SITE.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE.locality,
    addressCountry: SITE.country,
  },
  sameAs: [SITE.facebook],
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Secure parking", value: true },
    { "@type": "LocationFeatureSpecification", name: "24/7 security", value: true },
  ],
};

// Privacy-friendly analytics. Only loads when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is
// set (e.g. "porthillguest.co.ke"); Plausible uses no cookies, so no banner.
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} bg-background text-foreground antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-brand-dark focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main id="main-content" className="min-h-screen pt-20">
          {children}
        </main>
        {plausibleDomain && (
          <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
