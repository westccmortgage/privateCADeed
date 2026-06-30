"use client";

import PageShell from "@/components/PageShell";
import Calculator, { type CalcOutput } from "@/components/Calculator";
import { maxLoan } from "@/lib/calculators";
import { formatMoney, formatPercent } from "@/lib/format";

function compute(v: Record<string, number | null>): CalcOutput {
  const lien: "1st" | "2nd" = (v.existingDebt ?? 0) > 0 ? "2nd" : "1st";
  const r = maxLoan({
    value: v.value,
    existingDebt: v.existingDebt,
    targetPct: v.target,
    lien,
  });

  return {
    rows: [
      { label: "Max new money", value: formatMoney(r.maxNewMoney), primary: true },
      { label: "Resulting CLTV", value: formatPercent(r.resultingCLTV) },
      { label: "Resulting new-money LTV", value: formatPercent(r.resultingLTV) },
    ],
    note:
      r.maxNewMoney == null
        ? "Enter the property value and a target leverage. Add an existing first loan to solve for a 2nd."
        : lien === "2nd"
          ? `Solved as a 2nd behind the existing first, at a target combined LTV of ${formatPercent(v.target)}.`
          : `Solved as a new 1st at a target LTV of ${formatPercent(v.target)}.`,
    tone: "neutral",
  };
}

export default function MaxLoanCalculator() {
  return (
    <PageShell
      eyebrow="Max-Loan Solver"
      title="How much could you borrow?"
      intro="Work backward from a target leverage. With an existing first loan we solve for a 2nd at target combined LTV; otherwise for a new 1st at target LTV. Estimates only."
      back={{ href: "/tools", label: "All tools" }}
    >
      <Calculator
        fields={[
          { key: "value", label: "Property value", adorn: "$", placeholder: "6,000,000" },
          { key: "existingDebt", label: "Existing first loan (optional)", adorn: "$", placeholder: "3,000,000" },
          { key: "target", label: "Target leverage (LTV or CLTV)", adorn: "%", placeholder: "65" },
        ]}
        compute={compute}
      />
    </PageShell>
  );
}
