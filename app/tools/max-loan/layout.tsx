import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/tools/max-loan",
  "Max-Loan Solver — CADeed.com",
  "Work backward from a target leverage to the most you could borrow on a 1st or a 2nd. Estimates only.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
