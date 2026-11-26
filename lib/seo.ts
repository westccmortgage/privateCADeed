import type { Metadata } from "next";

export const SITE_URL = "https://cadeed.com";
export const SITE_NAME = "CADeed.com";

export const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "CADeed.com — California Private Capital Engine",
};

/** Per-page metadata: canonical, Open Graph and Twitter all set from the page itself. */
export function pageMeta(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
