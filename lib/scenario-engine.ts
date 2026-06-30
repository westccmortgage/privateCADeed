import {
  calculateARVLTV,
  calculateCLTV,
  calculateLTC,
  calculateLTV,
  deriveLenderMatchCriteria,
  determineCapitalPath,
  determinePrimaryMetric,
  findMissingInformation,
  getNextBestQuestion,
  getQuickReplies,
  getRestructureOptions,
  isConstructionDeal,
  isSecondPosition,
  meetsMinimumInfo,
  newMoneyAmount,
} from "./deal-calculator";
import { computeComplianceFlags, scrubForbiddenLanguage } from "./compliance-rules";
import { diffScenario, mergeScenario, normalizeScenario } from "./scenario-merger";
import {
  AnalyzeDealResponse,
  COMPLIANCE_NOTE,
  CalculatedScenario,
  ChatDealResponse,
  ExtractedScenario,
} from "./types";

/** Run the full deterministic calculator over an extracted scenario. */
export function buildCalculated(extracted: ExtractedScenario): CalculatedScenario {
  const valueBasis = extracted.estimatedValue ?? extracted.arv ?? extracted.purchasePrice ?? null;
  const effectiveLoan =
    extracted.requestedLoanAmount ??
    extracted.requestedCashOut ??
    extracted.constructionBudget ??
    ((extracted.purchasePrice ?? 0) + (extracted.rehabBudget ?? 0) || null);

  const estimatedLTV = calculateLTV(effectiveLoan, valueBasis);
  const estimatedCLTV = calculateCLTV(
    extracted.currentDebt,
    extracted.requestedCashOut,
    extracted.requestedLoanAmount,
    valueBasis,
  );
  const estimatedLTC = calculateLTC(
    effectiveLoan,
    extracted.purchasePrice,
    extracted.rehabBudget,
  );
  const estimatedARVLTV = calculateARVLTV(effectiveLoan, extracted.arv);

  const parts = { estimatedLTV, estimatedCLTV, estimatedLTC, estimatedARVLTV };

  // Safety net: if any leverage figure is wildly out of range (>1000%), the
  // inputs are inconsistent (e.g. tiny value vs. huge loan). Never render an
  // absurd number — ask the user to re-check instead.
  const inconsistent = [estimatedLTV, estimatedCLTV, estimatedLTC, estimatedARVLTV].some(
    (x) => x !== null && x > 1000,
  );
  if (inconsistent) {
    return {
      estimatedLTV: null,
      estimatedCLTV: null,
      estimatedLTC: null,
      estimatedARVLTV: null,
      totalDebtAfterLoan: null,
      equityRemaining: null,
      primaryMetric: { key: "CLTV", label: "Combined LTV (CLTV)", value: null },
      possibleCapitalPath: "Needs More Information",
      capitalPathDescription:
        "These figures look inconsistent — please re-check the property value and the requested amount.",
      scenarioStrength: "Needs More Info",
      riskNotes: [
        "The property value and the requested amount don't look consistent — please re-check them.",
      ],
    };
  }

  const path = determineCapitalPath(extracted, parts);
  const primaryMetric = determinePrimaryMetric(extracted, parts);

  const newMoney = newMoneyAmount(extracted);
  // Total debt does not depend on property value — compute it whenever there is
  // any debt or new money (avoid the `|| null` falsy-coercion footgun).
  const totalDebtAfterLoan =
    extracted.currentDebt != null || newMoney > 0
      ? (extracted.currentDebt ?? 0) + newMoney
      : null;
  const equityRemaining =
    valueBasis != null && totalDebtAfterLoan != null
      ? Math.max(valueBasis - totalDebtAfterLoan, 0)
      : null;

  return {
    estimatedLTV,
    estimatedCLTV,
    estimatedLTC,
    estimatedARVLTV,
    totalDebtAfterLoan,
    equityRemaining,
    primaryMetric,
    possibleCapitalPath: path.possibleCapitalPath,
    capitalPathDescription: scrubForbiddenLanguage(path.capitalPathDescription),
    scenarioStrength: path.scenarioStrength,
    riskNotes: path.riskNotes.map(scrubForbiddenLanguage),
  };
}

/** Backward-compatible single-shot builder used by /api/analyze-deal. */
export function buildScenario(
  rawUserInput: string,
  extractedInput: Partial<ExtractedScenario> | null | undefined,
): AnalyzeDealResponse {
  const extracted = normalizeScenario(extractedInput);
  const calculated = buildCalculated(extracted);
  const missingInformation = findMissingInformation(extracted);
  const nextBestQuestion = getNextBestQuestion(missingInformation, extracted);
  const restructureOptions = getRestructureOptions(extracted, {
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

function money(n: number | null): string {
  if (n == null) return "an unspecified amount";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Deterministic, compliance-safe natural-language summary of what the engine
 * understood. We do NOT let the model phrase this — the numbers and tone are
 * controlled here so the math is never invented and no forbidden language slips
 * through.
 */
export function composeAssistantMessage(
  extracted: ExtractedScenario,
  calculated: CalculatedScenario,
): string {
  const parts: string[] = [];

  const ask =
    extracted.requestedLoanAmount ??
    extracted.requestedCashOut ??
    extracted.constructionBudget ??
    null;
  const lien = isSecondPosition(extracted)
    ? "second-position"
    : extracted.lienPosition === "1st"
      ? "first-position"
      : "";
  const purpose = extracted.loanPurpose ? ` ${extracted.loanPurpose.toLowerCase()}` : "";
  const where = extracted.propertyLocation
    ? ` ${extracted.propertyLocation}`
    : extracted.propertyState === "CA"
      ? " California"
      : "";

  if (ask) {
    parts.push(
      `I understand this as a ${money(ask)}${lien ? ` ${lien}` : ""} request` +
        `${purpose ? ` for${purpose}` : ""}${where ? ` on a${where} property` : ""}.`,
    );
  } else {
    parts.push("Here is what I have so far on your California scenario.");
  }

  const known: string[] = [];
  if (extracted.estimatedValue != null)
    known.push(`an estimated value of approximately ${money(extracted.estimatedValue)}`);
  if (extracted.currentDebt != null)
    known.push(`an existing first loan of approximately ${money(extracted.currentDebt)}`);
  if (known.length > 0) {
    parts.push(`You indicated ${known.join(" and ")}.`);
  }

  const pm = calculated.primaryMetric;
  if (pm.value != null) {
    parts.push(
      `That places the estimated ${pm.label} at about ${pm.value}%, which may be ` +
        `within a reviewable private capital range, subject to occupancy, business ` +
        `purpose, project status, title, and exit strategy.`,
    );
  }

  if (calculated.scenarioStrength === "Needs Restructure") {
    parts.push(
      "As stated, leverage looks elevated, so this may require restructuring rather " +
        "than placement as-is — I can suggest options.",
    );
  }

  return scrubForbiddenLanguage(parts.join(" "));
}

/**
 * Multi-turn response: merge the latest patch into the running scenario,
 * recalculate, and assemble everything the UI needs.
 */
export function buildChatResponse(
  currentScenario: Partial<ExtractedScenario> | null | undefined,
  patch: Partial<ExtractedScenario> | null | undefined,
): ChatDealResponse {
  const before = normalizeScenario(currentScenario);
  const merged = mergeScenario(before, patch);
  const calculated = buildCalculated(merged);
  const missingInformation = findMissingInformation(merged);
  const nextBestQuestion = getNextBestQuestion(missingInformation, merged);
  const quickReplies = getQuickReplies(merged);
  const restructureOptions = getRestructureOptions(merged, {
    scenarioStrength: calculated.scenarioStrength,
  });
  const compliance = computeComplianceFlags(merged);
  const lenderMatchCriteria = deriveLenderMatchCriteria(merged, calculated);
  const assistantMessage = composeAssistantMessage(merged, calculated);

  return {
    assistantMessage,
    scenarioPatch: diffScenario(before, merged),
    mergedScenario: merged,
    calculated,
    missingInformation,
    nextBestQuestion,
    quickReplies,
    restructureOptions,
    compliance,
    recommendedCapitalPath: calculated.possibleCapitalPath,
    lenderMatchCriteria,
    canSubmit: meetsMinimumInfo(merged),
    complianceNote: COMPLIANCE_NOTE,
  };
}

export { isConstructionDeal };
