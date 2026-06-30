// Pure, deterministic calculators for the public Tools pages. These reuse the
// same math the engine uses — numbers are never invented.

function round(n: number, places = 1): number {
  const f = Math.pow(10, places);
  return Math.round(n * f) / f;
}
function pos(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/** Debt-service coverage from monthly figures. */
export function dscr(
  monthlyRent: number | null,
  monthlyExpenses: number | null,
  monthlyDebt: number | null,
): { ratio: number | null; noi: number | null; verdict: string } {
  if (!pos(monthlyRent) || !pos(monthlyDebt)) {
    return { ratio: null, noi: null, verdict: "Add rent and the monthly loan payment." };
  }
  const noi = monthlyRent - (monthlyExpenses ?? 0);
  const ratio = round(noi / monthlyDebt, 2);
  let verdict: string;
  if (ratio >= 1.25) verdict = "Strong coverage — generally comfortable for private capital, subject to review.";
  else if (ratio >= 1.0) verdict = "Breaks even to modest coverage — reviewable, terms likely tighter.";
  else verdict = "Negative coverage — may require restructuring (lower loan, more equity, stronger exit).";
  return { ratio, noi: round(noi, 0), verdict };
}

/** Max new money at a target leverage, given value and any existing senior debt. */
export function maxLoan(args: {
  value: number | null;
  existingDebt: number | null;
  targetPct: number | null; // target LTV (1st) or CLTV (2nd)
  lien: "1st" | "2nd";
}): { maxNewMoney: number | null; resultingCLTV: number | null; resultingLTV: number | null } {
  const { value, existingDebt, targetPct, lien } = args;
  if (!pos(value) || !pos(targetPct)) {
    return { maxNewMoney: null, resultingCLTV: null, resultingLTV: null };
  }
  const target = targetPct / 100;
  const existing = existingDebt ?? 0;
  let maxNewMoney: number;
  if (lien === "2nd") {
    maxNewMoney = Math.max(target * value - existing, 0);
  } else {
    // New 1st replaces/sits as the only senior debt up to target LTV.
    maxNewMoney = Math.max(target * value, 0);
  }
  const resultingCLTV = round(((existing + maxNewMoney) / value) * 100, 1);
  const resultingLTV = round((maxNewMoney / value) * 100, 1);
  return { maxNewMoney: round(maxNewMoney, 0), resultingCLTV, resultingLTV };
}

/** Fix & flip profit / ROI from cost and ARV. */
export function flipProfit(args: {
  arv: number | null;
  purchase: number | null;
  rehab: number | null;
  financingCost: number | null;
  sellingPct: number | null; // % of ARV (default 7)
}): {
  totalCost: number | null;
  sellingCosts: number | null;
  profit: number | null;
  marginPct: number | null;
  roiPct: number | null;
} {
  const { arv, purchase, rehab } = args;
  if (!pos(arv) || !pos(purchase)) {
    return { totalCost: null, sellingCosts: null, profit: null, marginPct: null, roiPct: null };
  }
  const sellingPct = args.sellingPct ?? 7;
  const financing = args.financingCost ?? 0;
  const rehabAmt = args.rehab ?? 0;
  const cashCost = purchase + rehabAmt + financing;
  const sellingCosts = round((sellingPct / 100) * arv, 0);
  const profit = round(arv - cashCost - sellingCosts, 0);
  const marginPct = round((profit / arv) * 100, 1);
  const roiPct = cashCost > 0 ? round((profit / cashCost) * 100, 1) : null;
  return { totalCost: round(cashCost, 0), sellingCosts, profit, marginPct, roiPct };
}

/** Simple interest-only monthly payment estimate (estimate only — not a quote). */
export function interestOnlyPayment(
  loan: number | null,
  annualRatePct: number | null,
): number | null {
  if (!pos(loan) || !pos(annualRatePct)) return null;
  return round((loan * (annualRatePct / 100)) / 12, 0);
}
