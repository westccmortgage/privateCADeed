import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DSCR Calculator — CADeed.com",
  description:
    "Debt-service coverage for a rental: monthly net operating income ÷ monthly loan payment. Estimates only.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
