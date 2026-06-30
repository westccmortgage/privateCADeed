import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div id="top" className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-engine flex-col items-center px-5 py-28 text-center sm:px-8">
        <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
          404
        </span>
        <h1 className="mt-4 text-balance text-[30px] font-semibold tracking-tight text-navy sm:text-[40px]">
          This page took an exit.
        </h1>
        <p className="mt-4 max-w-md text-[16px] leading-relaxed text-navy-muted">
          The page you’re looking for isn’t here. Head back to the deal terminal and describe your
          California scenario.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-[15px] font-medium text-white/95 transition-colors hover:bg-navy-soft"
        >
          <ArrowLeft size={17} />
          Back to CADeed
        </Link>
      </main>
      <Footer />
    </div>
  );
}
