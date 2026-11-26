import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";
import { COMPANY } from "@/lib/company";

const TITLE = "CADeed.com — California Private Capital Engine";
const DESCRIPTION =
  "Describe your California real estate deal in plain English. The engine calculates the private capital path.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#F3F8FF",
  width: "device-width",
  initialScale: 1,
};

const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: COMPANY.shortName,
  alternateName: "CADeed.com",
  url: SITE_URL,
  telephone: "+1-310-654-1577",
  email: COMPANY.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "150 E Olive Ave, Unit 112",
    addressLocality: "Burbank",
    addressRegion: "CA",
    postalCode: "91502",
    addressCountry: "US",
  },
  identifier: [
    { "@type": "PropertyValue", propertyID: "NMLS", value: COMPANY.nmls },
    { "@type": "PropertyValue", propertyID: "CA DRE", value: COMPANY.dreCorporationLicense },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-engine-field min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
