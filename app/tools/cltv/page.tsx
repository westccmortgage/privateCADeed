"use client";

import PageShell from "@/components/PageShell";
import Calculator, { type CalcOutput } from "@/components/Calculator";
import { calculateCLTV, calculateLTV } from "@/lib/deal-calculator";
import { gradeLeverage } from "@/lib/private-capital-guidelines";
import { formatMoney, formatPercent } from "@/lib/format";

function compute(v: Record<string, number | null>): CalcOutput {
  const value = v.value;
  const debt = v.currentDebt;
  const loan = v.requestedLoan;
  const cltv = calculateCLTV(debt, null, loan, value);
  const ltv = calculateLTV(loan, value);
  const newMoney = loan ?? 0;
  const totalDebt =
    value != null && (debt ?? 0) + newMoney > 0 ? (debt ?? 0) + newMoney : null;
  const equity = value != null && totalDebt != null ? Math.max(value - totalDebt, 0) : null;
  const grade = gradeLeverage("2nd", cltv);

  return {
    rows: [
      { label: "Estimated CLTV", value: formatPercent(cltv), primary: true },
      { label: "New-money LTV", value: formatPercent(ltv) },
      { label: "Total debt after loan", value: formatMoney(totalDebt) },
      { label: "Equity remaining", value: formatMoney(equity) },
    ],
    note:
      cltv == null
        ? "Enter the property value, the existing first loan, and the requested new loan."
        : grade.notes[0],
    tone:
      cltv == null
        ? "neutral"
        : grade.strength === "Strong"
          ? "good"
          : grade.strength === "Needs Restructure"
            ? "warn"
            : "neutral",
  };
}

export default function CltvCalculator() {
  return (
    <PageShell
      eyebrow="CLTV Calculator"
      title="Combined loan-to-value."
      intro="For a 2nd position, CLTV is the metric that matters: (existing first loan + requested new loan) ÷ property value."
      back={{ href: "/tools", label: "All tools" }}
    >
      <Calculator
        fields={[
          { key: "value", label: "Property value", adorn: "$", placeholder: "1,200,000" },
          { key: "currentDebt", label: "Existing first loan", adorn: "$", placeholder: "520,000" },
          { key: "requestedLoan", label: "Requested new loan", adorn: "$", placeholder: "300,000" },
        ]}
        compute={compute}
      />
    </PageShell>
  );
}
