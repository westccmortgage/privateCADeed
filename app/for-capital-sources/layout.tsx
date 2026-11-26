import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/for-capital-sources",
  "For Capital Sources — CADeed.com",
  "Receive structured California private-lending scenarios that match your lending box. Submit your buy-box to CADeed.com.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
