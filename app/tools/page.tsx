import type { Metadata } from "next";
import { Gauge, Percent, Hammer, Building2, Target, ArrowRight } from "lucide-react";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Tools & Calculators — CADeed.com",
  description:
    "Free California private-capital calculators: CLTV, LTV/LTC, fix & flip profit, DSCR, and a max-loan solver. Estimates only — not a quote.",
};

const TOOLS = [
  {
    href: "/tools/cltv",
    icon: Gauge,
    title: "CLTV Calculator",
    desc: "Combined loan-to-value for a 2nd behind an existing first — the metric that matters for subordinate financing.",
  },
  {
    href: "/tools/ltv-ltc",
    icon: Percent,
    title: "LTV / LTC Calculator",
    desc: "Loan-to-value and loan-to-cost for a new 1st, purchase, or refinance.",
  },
  {
    href: "/tools/flip-profit",
    icon: Hammer,
    title: "Fix & Flip Profit",
    desc: "Estimate profit, margin, and ROI from purchase, rehab, ARV, and selling costs.",
  },
  {
    href: "/tools/dscr",
    icon: Building2,
    title: "DSCR Calculator",
    desc: "Debt-service coverage for a rental — does the income cover the payment?",
  },
  {
    href: "/tools/max-loan",
    icon: Target,
    title: "Max-Loan Solver",
    desc: "Work backward: the most you could borrow at a target leverage.",
  },
];

export default function ToolsHub() {
  return (
    <PageShell
      eyebrow="Tools & Calculators"
      title="Run the numbers in seconds."
      intro="The same deterministic math the engine uses, as standalone calculators. Estimates only — every scenario is subject to review by a licensed professional and/or private capital source."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className="glass-card group flex gap-4 rounded-card p-6 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
              <t.icon size={20} />
            </span>
            <div className="flex-1">
              <h3 className="flex items-center gap-1.5 text-[17px] font-semibold tracking-tight text-navy">
                {t.title}
                <ArrowRight
                  size={15}
                  className="-translate-x-1 text-navy/0 transition-all group-hover:translate-x-0 group-hover:text-navy/40"
                />
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-navy-muted">{t.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </PageShell>
  );
}
