"use client";

import PageShell from "@/components/PageShell";
import Calculator, { type CalcOutput } from "@/components/Calculator";
import { calculateLTC, calculateLTV } from "@/lib/deal-calculator";
import { gradeLeverage } from "@/lib/private-capital-guidelines";
import { formatPercent } from "@/lib/format";

function compute(v: Record<string, number | null>): CalcOutput {
  const ltv = calculateLTV(v.loan, v.value);
  const ltc = calculateLTC(v.loan, v.purchase, v.rehab);
  const grade = gradeLeverage("1st", ltv);

  return {
    rows: [
      { label: "Loan-to-Value (LTV)", value: formatPercent(ltv), primary: true },
      { label: "Loan-to-Cost (LTC)", value: formatPercent(ltc) },
    ],
    note:
      ltv == null
        ? "Enter the loan amount and property value. Add purchase + rehab to see loan-to-cost."
        : grade.notes[0],
    tone:
      ltv == null
        ? "neutral"
        : grade.strength === "Strong"
          ? "good"
          : grade.strength === "Needs Restructure"
            ? "warn"
            : "neutral",
  };
}

export default function LtvLtcCalculator() {
  return (
    <PageShell
      eyebrow="LTV / LTC Calculator"
      title="Loan-to-value & loan-to-cost."
      intro="LTV for a new 1st or refinance, and LTC for a purchase + rehab. Estimates only."
      back={{ href: "/tools", label: "All tools" }}
    >
      <Calculator
        fields={[
          { key: "loan", label: "Requested loan", adorn: "$", placeholder: "650,000" },
          { key: "value", label: "Property value (or ARV)", adorn: "$", placeholder: "1,000,000" },
          { key: "purchase", label: "Purchase price (optional)", adorn: "$", placeholder: "900,000" },
          { key: "rehab", label: "Rehab budget (optional)", adorn: "$", placeholder: "150,000" },
        ]}
        compute={compute}
      />
    </PageShell>
  );
}
