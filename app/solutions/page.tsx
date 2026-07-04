import type { Metadata } from "next";
import SolutionsContent from "./SolutionsContent";

export const metadata: Metadata = {
  title: "Solutions — CADeed.com",
  description:
    "Plain-English explanations of the private-capital paths CADeed can map for California real estate: cash-out & refinance, fix & flip / bridge, construction completion, and 2nd deed of trust. Educational only — not a loan offer.",
};

export default function SolutionsPage() {
  return <SolutionsContent />;
}
