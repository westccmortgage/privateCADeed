import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/tools/ltv-ltc",
  "LTV / LTC Calculator — CADeed.com",
  "Loan-to-value and loan-to-cost for a new 1st, purchase, or refinance. Estimates only — not a quote.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
