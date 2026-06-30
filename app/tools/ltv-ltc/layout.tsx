import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LTV / LTC Calculator — CADeed.com",
  description:
    "Loan-to-value and loan-to-cost for a new 1st, purchase, or refinance. Estimates only — not a quote.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
