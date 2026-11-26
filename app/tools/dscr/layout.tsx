import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/tools/dscr",
  "DSCR Calculator — CADeed.com",
  "Debt-service coverage for a rental: monthly net operating income ÷ monthly loan payment. Estimates only.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
