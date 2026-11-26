import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/tools/cltv",
  "CLTV Calculator — CADeed.com",
  "Combined loan-to-value for a 2nd behind an existing first: (existing first loan + requested new loan) ÷ property value. Estimates only.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
