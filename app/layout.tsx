import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";

export const metadata: Metadata = {
  title: "CADeed.com — California Private Capital Engine",
  description:
    "Describe your California real estate deal in plain English. The engine calculates the private capital path.",
  metadataBase: new URL("https://cadeed.com"),
  openGraph: {
    title: "CADeed.com — California Private Capital Engine",
    description:
      "Describe your California real estate deal in plain English. The engine calculates the private capital path.",
    url: "https://cadeed.com",
    siteName: "CADeed.com",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#F3F8FF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-engine-field min-h-screen antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
