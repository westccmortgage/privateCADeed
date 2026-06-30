import type { MetadataRoute } from "next";

const BASE = "https://cadeed.com";

const ROUTES = [
  "",
  "/tools",
  "/tools/cltv",
  "/tools/ltv-ltc",
  "/tools/flip-profit",
  "/tools/dscr",
  "/tools/max-loan",
  "/resources",
  "/faq",
  "/company",
  "/legal",
  "/for-borrowers",
  "/for-brokers",
  "/for-capital-sources",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
