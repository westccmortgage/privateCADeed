import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fix & Flip Profit Calculator — CADeed.com",
  description:
    "Estimate fix & flip profit, ROI, and margin from purchase, rehab, ARV, financing, and selling costs. Estimates only.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
