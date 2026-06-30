import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Max-Loan Solver — CADeed.com",
  description:
    "Work backward from a target leverage to the most you could borrow on a 1st or a 2nd. Estimates only.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
