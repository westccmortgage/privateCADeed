import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLTV Calculator — CADeed.com",
  description:
    "Combined loan-to-value for a 2nd behind an existing first: (existing first loan + requested new loan) ÷ property value. Estimates only.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
