import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Capital Sources — CADeed.com",
  description:
    "Receive structured California private-lending scenarios that match your lending box. Submit your buy-box to CADeed.com.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
