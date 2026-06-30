"use client";

import PageShell from "@/components/PageShell";
import Calculator, { type CalcOutput } from "@/components/Calculator";
import { flipProfit } from "@/lib/calculators";
import { formatMoney, formatPercent } from "@/lib/format";

function compute(v: Record<string, number | null>): CalcOutput {
  const r = flipProfit({
    arv: v.arv,
    purchase: v.purchase,
    rehab: v.rehab,
    financingCost: v.financing,
    sellingPct: v.sellingPct,
  });

  return {
    rows: [
      { label: "Estimated profit", value: formatMoney(r.profit), primary: true },
      { label: "Return on cost (ROI)", value: formatPercent(r.roiPct) },
      { label: "Profit margin (of ARV)", value: formatPercent(r.marginPct) },
      { label: "Total cost (purchase + rehab + financing)", value: formatMoney(r.totalCost) },
      { label: "Selling costs", value: formatMoney(r.sellingCosts) },
    ],
    note:
      r.profit == null
        ? "Enter at least the ARV and purchase price. Selling costs default to 7% of ARV."
        : r.profit > 0
          ? "Positive projected profit — bridge sources still size against cost and ARV, subject to review."
          : "Projected loss as entered — this may require restructuring (lower basis, lower rehab, or higher ARV).",
    tone: r.profit == null ? "neutral" : r.profit > 0 ? "good" : "warn",
  };
}

export default function FlipProfitCalculator() {
  return (
    <PageShell
      eyebrow="Fix & Flip Profit"
      title="Will the flip pencil?"
      intro="Estimate profit, ROI, and margin from purchase, rehab, ARV, financing, and selling costs. Estimates only."
      back={{ href: "/tools", label: "All tools" }}
    >
      <Calculator
        fields={[
          { key: "arv", label: "After-repair value (ARV)", adorn: "$", placeholder: "1,350,000" },
          { key: "purchase", label: "Purchase price", adorn: "$", placeholder: "900,000" },
          { key: "rehab", label: "Rehab budget", adorn: "$", placeholder: "150,000" },
          { key: "financing", label: "Financing / holding cost", adorn: "$", placeholder: "60,000" },
          { key: "sellingPct", label: "Selling costs (% of ARV)", adorn: "%", placeholder: "7" },
        ]}
        compute={compute}
      />
    </PageShell>
  );
}
