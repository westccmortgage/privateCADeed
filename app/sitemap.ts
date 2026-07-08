import type { MetadataRoute } from "next";

const BASE = "https://cadeed.com";

type ChangeFreq = MetadataRoute.Sitemap[number]["changeFrequency"];

interface RouteDef {
  path: string;
  priority: number;
  changeFrequency: ChangeFreq;
}

// Every public page, most important first. /api/* is excluded (see robots.ts).
const ROUTES: RouteDef[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/solutions", priority: 0.9, changeFrequency: "monthly" },
  { path: "/resources", priority: 0.8, changeFrequency: "monthly" },
  { path: "/tools", priority: 0.8, changeFrequency: "monthly" },
  { path: "/for-borrowers", priority: 0.7, changeFrequency: "monthly" },
  { path: "/for-brokers", priority: 0.7, changeFrequency: "monthly" },
  { path: "/for-capital-sources", priority: 0.7, changeFrequency: "monthly" },
  { path: "/tools/cltv", priority: 0.6, changeFrequency: "monthly" },
  { path: "/tools/ltv-ltc", priority: 0.6, changeFrequency: "monthly" },
  { path: "/tools/flip-profit", priority: 0.6, changeFrequency: "monthly" },
  { path: "/tools/dscr", priority: 0.6, changeFrequency: "monthly" },
  { path: "/tools/max-loan", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/company", priority: 0.5, changeFrequency: "yearly" },
  { path: "/legal", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
