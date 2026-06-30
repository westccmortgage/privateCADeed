"use client";

import PageShell from "@/components/PageShell";
import Calculator, { type CalcOutput } from "@/components/Calculator";
import { dscr } from "@/lib/calculators";
import { formatMoney, formatNumber } from "@/lib/format";

function compute(v: Record<string, number | null>): CalcOutput {
  const r = dscr(v.rent, v.expenses, v.debt);
  return {
    rows: [
      { label: "DSCR", value: r.ratio == null ? "—" : `${formatNumber(r.ratio, 2)}×`, primary: true },
      { label: "Monthly NOI", value: formatMoney(r.noi) },
    ],
    note: r.verdict,
    tone:
      r.ratio == null
        ? "neutral"
        : r.ratio >= 1.25
          ? "good"
          : r.ratio >= 1.0
            ? "neutral"
            : "warn",
  };
}

export default function DscrCalculator() {
  return (
    <PageShell
      eyebrow="DSCR Calculator"
      title="Does the rent cover the payment?"
      intro="Debt-service coverage = monthly net operating income ÷ monthly loan payment. Estimates only."
      back={{ href: "/tools", label: "All tools" }}
    >
      <Calculator
        fields={[
          { key: "rent", label: "Monthly rent / income", adorn: "$", placeholder: "6,500" },
          { key: "expenses", label: "Monthly operating expenses", adorn: "$", placeholder: "1,500" },
          { key: "debt", label: "Monthly loan payment", adorn: "$", placeholder: "4,200" },
        ]}
        compute={compute}
      />
    </PageShell>
  );
}
