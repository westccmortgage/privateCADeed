import {
  calculateARVLTV,
  calculateCLTV,
  calculateLTC,
  calculateLTV,
  determineCapitalPath,
  findMissingInformation,
  getNextBestQuestion,
  getRestructureOptions,
} from "./deal-calculator";
import {
  AnalyzeDealResponse,
  COMPLIANCE_NOTE,
  CalculatedScenario,
  ExtractedScenario,
} from "./types";

const EMPTY_EXTRACTED: ExtractedScenario = {
  propertyLocation: null,
  propertyState: null,
  estimatedValue: null,
  currentDebt: null,
  requestedLoanAmount: null,
  requestedCashOut: null,
  purchasePrice: null,
  rehabBudget: null,
  constructionBudget: null,
  arv: null,
  propertyType: null,
  loanPurpose: null,
  lienPosition: null,
  occupancy: null,
  businessPurpose: null,
  closingTimeline: null,
  exitStrategy: null,
  borrowerRole: null,
};

/** Coerce loosely-typed model output into a strict ExtractedScenario. */
export function normalizeExtracted(
  raw: Partial<ExtractedScenario> | null | undefined
): ExtractedScenario {
  const merged = { ...EMPTY_EXTRACTED, ...(raw ?? {}) };

  const num = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  return {
    ...merged,
    estimatedValue: num(merged.estimatedValue),
    currentDebt: num(merged.currentDebt),
    requestedLoanAmount: num(merged.requestedLoanAmount),
    requestedCashOut: num(merged.requestedCashOut),
    purchasePrice: num(merged.purchasePrice),
    rehabBudget: num(merged.rehabBudget),
    constructionBudget: num(merged.constructionBudget),
    arv: num(merged.arv),
    propertyState:
      merged.propertyState === "CA" ||
      /california|\bca\b/i.test(merged.propertyLocation ?? "")
        ? "CA"
        : merged.propertyState ?? null,
  };
}

/**
 * Runs the deterministic calculator over an extracted scenario and assembles
 * the full response. The AI never computes these numbers.
 */
export function buildScenario(
  rawUserInput: string,
  extractedInput: Partial<ExtractedScenario> | null | undefined
): AnalyzeDealResponse {
  const extracted = normalizeExtracted(extractedInput);

  // Effective new money: prefer an explicit loan amount, else cash-out, else
  // the project budget for purchase/rehab/construction deals.
  const effectiveLoan =
    extracted.requestedLoanAmount ??
    extracted.requestedCashOut ??
    extracted.constructionBudget ??
    ((extracted.purchasePrice ?? 0) + (extracted.rehabBudget ?? 0) || null);

  const valueBasis =
    extracted.estimatedValue ?? extracted.arv ?? extracted.purchasePrice ?? null;

  const estimatedLTV = calculateLTV(effectiveLoan, valueBasis);
  const estimatedCLTV = calculateCLTV(
    extracted.currentDebt,
    extracted.requestedCashOut,
    extracted.requestedLoanAmount,
    extracted.estimatedValue
  );
  const estimatedLTC = calculateLTC(
    effectiveLoan,
    extracted.purchasePrice,
    extracted.rehabBudget
  );
  const estimatedARVLTV = calculateARVLTV(effectiveLoan, extracted.arv);

  const path = determineCapitalPath(extracted, {
    estimatedLTV,
    estimatedCLTV,
    estimatedLTC,
    estimatedARVLTV,
  });

  const newMoney = Math.max(
    extracted.requestedCashOut ?? 0,
    extracted.requestedLoanAmount ?? 0
  );
  const totalDebtAfterLoan =
    extracted.estimatedValue != null
      ? (extracted.currentDebt ?? 0) + newMoney || null
      : null;
  const equityRemaining =
    extracted.estimatedValue != null && totalDebtAfterLoan != null
      ? Math.max(extracted.estimatedValue - totalDebtAfterLoan, 0)
      : null;

  const calculated: CalculatedScenario = {
    estimatedLTV,
    estimatedCLTV,
    estimatedLTC,
    estimatedARVLTV,
    totalDebtAfterLoan,
    equityRemaining,
    possibleCapitalPath: path.possibleCapitalPath,
    capitalPathDescription: path.capitalPathDescription,
    scenarioStrength: path.scenarioStrength,
    riskNotes: path.riskNotes,
  };

  const missingInformation = findMissingInformation(extracted);
  const nextBestQuestion = getNextBestQuestion(missingInformation);
  const restructureOptions = getRestructureOptions(extracted, {
    estimatedCLTV,
    estimatedLTC,
    estimatedARVLTV,
    scenarioStrength: calculated.scenarioStrength,
  });

  return {
    rawUserInput,
    extracted,
    calculated,
    missingInformation,
    nextBestQuestion,
    restructureOptions,
    complianceNote: COMPLIANCE_NOTE,
  };
}
