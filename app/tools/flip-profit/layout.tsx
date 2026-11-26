import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/tools/flip-profit",
  "Fix & Flip Profit Calculator — CADeed.com",
  "Estimate fix & flip profit, ROI, and margin from purchase, rehab, ARV, financing, and selling costs. Estimates only.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
