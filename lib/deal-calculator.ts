import type {
  CalculatedScenario,
  ExtractedScenario,
  ScenarioStrength,
} from "./types";

/** Round a ratio to a whole-number percentage. */
function toPercent(value: number): number {
  return Math.round(value * 1000) / 10;
}

/**
 * Loan-to-Value of the requested new money against property value.
 */
export function calculateLTV(
  requestedLoanAmount: number | null,
  estimatedValue: number | null
): number | null {
  if (!requestedLoanAmount || !estimatedValue || estimatedValue <= 0) {
    return null;
  }
  return toPercent(requestedLoanAmount / estimatedValue);
}

/**
 * Combined Loan-to-Value. Existing debt plus the new money being requested.
 * Cash-out and a stated new loan amount are not double counted: the larger of
 * the two requested figures is treated as the new money.
 */
export function calculateCLTV(
  currentDebt: number | null,
  requestedCashOut: number | null,
  requestedLoanAmount: number | null,
  estimatedValue: number | null
): number | null {
  if (!estimatedValue || estimatedValue <= 0) {
    return null;
  }
  const newMoney = Math.max(requestedCashOut ?? 0, requestedLoanAmount ?? 0);
  const existing = currentDebt ?? 0;
  if (newMoney <= 0 && existing <= 0) {
    return null;
  }
  return toPercent((existing + newMoney) / estimatedValue);
}

/**
 * Loan-to-Cost for purchase + rehab scenarios.
 */
export function calculateLTC(
  requestedLoanAmount: number | null,
  purchasePrice: number | null,
  rehabBudget: number | null
): number | null {
  const totalCost = (purchasePrice ?? 0) + (rehabBudget ?? 0);
  if (!requestedLoanAmount || totalCost <= 0) {
    return null;
  }
  return toPercent(requestedLoanAmount / totalCost);
}

/**
 * Loan amount as a percentage of After-Repair Value.
 */
export function calculateARVLTV(
  requestedLoanAmount: number | null,
  arv: number | null
): number | null {
  if (!requestedLoanAmount || !arv || arv <= 0) {
    return null;
  }
  return toPercent(requestedLoanAmount / arv);
}

const CASH_OUT_CLTV_CEILING = 70;
const HIGH_LEVERAGE_CLTV = 75;
const HIGH_LEVERAGE_LTC = 85;
const HIGH_ARV_LTV = 70;

interface PathResult {
  possibleCapitalPath: string;
  capitalPathDescription: string;
  scenarioStrength: ScenarioStrength;
  riskNotes: string[];
}

/**
 * Deterministic capital-path decision. The AI never decides this — it only
 * supplies the extracted inputs.
 */
export function determineCapitalPath(
  extracted: ExtractedScenario,
  partial: Pick<
    CalculatedScenario,
    "estimatedLTV" | "estimatedCLTV" | "estimatedLTC" | "estimatedARVLTV"
  >
): PathResult {
  const riskNotes: string[] = [];
  const { estimatedCLTV, estimatedLTC, estimatedARVLTV } = partial;

  const isPurchaseRehab =
    (extracted.purchasePrice ?? 0) > 0 || (extracted.rehabBudget ?? 0) > 0;
  const isConstruction =
    (extracted.constructionBudget ?? 0) > 0 ||
    /construction|finish|complete|build/i.test(
      extracted.loanPurpose ?? ""
    );
  const wantsCashOut =
    (extracted.requestedCashOut ?? 0) > 0 ||
    /cash[\s-]?out|refi|refinance|equity/i.test(extracted.loanPurpose ?? "");
  const hasExistingDebt = (extracted.currentDebt ?? 0) > 0;

  // ---- Construction completion ----
  if (isConstruction && !isPurchaseRehab) {
    if (estimatedARVLTV !== null && estimatedARVLTV > HIGH_ARV_LTV) {
      riskNotes.push(
        `Requested capital is ${estimatedARVLTV}% of completed value, which is on the higher side for completion financing.`
      );
    }
    return {
      possibleCapitalPath: "Construction Completion Capital",
      capitalPathDescription:
        "Based on the information provided, this scenario may fit a construction completion facility that funds the remaining project budget, subject to review of plans, budget, and completed work.",
      scenarioStrength: highLeverageStrength(
        riskNotes,
        estimatedCLTV,
        estimatedLTC,
        estimatedARVLTV
      ),
      riskNotes,
    };
  }

  // ---- Fix & Flip / Bridge (purchase + rehab) ----
  if (isPurchaseRehab) {
    if (estimatedLTC !== null && estimatedLTC > HIGH_LEVERAGE_LTC) {
      riskNotes.push(
        `Loan-to-cost is ${estimatedLTC}%, above a typical bridge comfort range. Additional equity or a stronger exit may be needed.`
      );
    }
    if (estimatedARVLTV !== null && estimatedARVLTV > HIGH_ARV_LTV) {
      riskNotes.push(
        `Loan is ${estimatedARVLTV}% of ARV; many bridge sources cap closer to 65–70% of ARV.`
      );
    }
    if (extracted.arv == null) {
      riskNotes.push(
        "After-Repair Value (ARV) was not provided, which limits how tightly this can be sized."
      );
    }
    return {
      possibleCapitalPath: "Fix & Flip / Bridge",
      capitalPathDescription:
        "Based on the information provided, this scenario may fit a short-term fix & flip or bridge facility sized against cost and after-repair value, subject to review.",
      scenarioStrength: highLeverageStrength(
        riskNotes,
        estimatedCLTV,
        estimatedLTC,
        estimatedARVLTV
      ),
      riskNotes,
    };
  }

  // ---- Cash-out / refinance against existing equity ----
  if (estimatedCLTV !== null) {
    if (estimatedCLTV <= CASH_OUT_CLTV_CEILING) {
      const path =
        hasExistingDebt && !wantsNew1st(extracted)
          ? "2nd Deed of Trust"
          : "New 1st Refinance";
      const description =
        path === "2nd Deed of Trust"
          ? "Based on the information provided, this scenario may fit as a 2nd position loan behind the existing first, subject to review."
          : "Based on the information provided, this scenario may fit a new 1st-position refinance that pays off the existing debt and delivers the requested proceeds, subject to review.";
      return {
        possibleCapitalPath: path,
        capitalPathDescription: description,
        scenarioStrength: estimatedCLTV <= 60 ? "Strong" : "Moderate",
        riskNotes,
      };
    }

    if (estimatedCLTV <= HIGH_LEVERAGE_CLTV) {
      riskNotes.push(
        `Combined leverage is ${estimatedCLTV}%, above the ~70% comfort range for many private sources.`
      );
      return {
        possibleCapitalPath: "New 1st Refinance",
        capitalPathDescription:
          "Combined leverage is elevated. A new 1st-position refinance may work better than stacking a 2nd, subject to review.",
        scenarioStrength: "Moderate",
        riskNotes,
      };
    }

    // High leverage — restructure rather than decline.
    riskNotes.push(
      `Combined leverage is ${estimatedCLTV}%, which is high. This scenario may need restructuring before it can be placed.`
    );
    return {
      possibleCapitalPath: "Needs Restructuring",
      capitalPathDescription:
        "This scenario may need restructuring. Combined leverage is above what most private capital sources will hold without changes to loan amount, collateral, or structure.",
      scenarioStrength: "Needs Restructure",
      riskNotes,
    };
  }

  // ---- Not enough to compute leverage ----
  return {
    possibleCapitalPath: "Pending More Information",
    capitalPathDescription:
      "A capital path can be identified once a few more details are provided. Add the property value and the amount you are looking to borrow to see likely options.",
    scenarioStrength: "Needs More Info",
    riskNotes,
  };
}

function wantsNew1st(extracted: ExtractedScenario): boolean {
  return /new\s*1st|first|refinance|refi|pay\s*off/i.test(
    `${extracted.loanPurpose ?? ""} ${extracted.lienPosition ?? ""}`
  );
}

function highLeverageStrength(
  riskNotes: string[],
  cltv: number | null,
  ltc: number | null,
  arvLtv: number | null
): ScenarioStrength {
  const tooHigh =
    (cltv !== null && cltv > HIGH_LEVERAGE_CLTV) ||
    (ltc !== null && ltc > HIGH_LEVERAGE_LTC) ||
    (arvLtv !== null && arvLtv > HIGH_ARV_LTV + 5);
  if (tooHigh) return "Needs Restructure";
  if (riskNotes.length >= 2) return "Moderate";
  if (riskNotes.length === 1) return "Moderate";
  return "Strong";
}

const FIELD_LABELS: Record<string, string> = {
  propertyLocation: "Property location",
  estimatedValue: "Estimated property value",
  occupancy: "Occupancy (owner-occupied, investment, or second home)",
  businessPurpose: "Loan purpose (business or consumer)",
  loanPurpose: "What the financing is for",
  exitStrategy: "Exit strategy (how the loan gets paid off)",
};

/**
 * Identify the most decision-relevant missing fields, in priority order.
 */
export function findMissingInformation(
  extracted: ExtractedScenario
): string[] {
  const missing: string[] = [];

  if (!extracted.propertyLocation) missing.push(FIELD_LABELS.propertyLocation);
  if (!extracted.estimatedValue && !extracted.purchasePrice) {
    missing.push(FIELD_LABELS.estimatedValue);
  }

  const isPurchaseRehab =
    (extracted.purchasePrice ?? 0) > 0 || (extracted.rehabBudget ?? 0) > 0;

  if (
    !extracted.requestedLoanAmount &&
    !extracted.requestedCashOut &&
    !isPurchaseRehab &&
    !extracted.constructionBudget
  ) {
    missing.push("How much capital you are looking for");
  }

  if (!extracted.occupancy) missing.push(FIELD_LABELS.occupancy);
  if (!extracted.businessPurpose) missing.push(FIELD_LABELS.businessPurpose);
  if (!extracted.exitStrategy) missing.push(FIELD_LABELS.exitStrategy);

  return missing;
}

/**
 * The single most useful follow-up question based on what's missing.
 */
export function getNextBestQuestion(missingInformation: string[]): string {
  if (missingInformation.length === 0) {
    return "Would you like to send this scenario for a deal review?";
  }

  const first = missingInformation[0];

  if (first.startsWith("Occupancy")) {
    return "Is this property owner-occupied, investment, or second home?";
  }
  if (first.startsWith("Loan purpose")) {
    return "Is the loan for business or consumer purpose?";
  }
  if (first.startsWith("Property location")) {
    return "Where is the property located? (City and state)";
  }
  if (first.startsWith("Estimated property value")) {
    return "What is the current estimated value of the property?";
  }
  if (first.startsWith("How much capital")) {
    return "How much capital are you looking to raise on this deal?";
  }
  if (first.startsWith("Exit strategy")) {
    return "How do you plan to pay off or exit this loan?";
  }
  return `Can you share: ${first.toLowerCase()}?`;
}

/**
 * Restructuring suggestions for high-leverage or weak scenarios. Never a
 * decline — always a path toward something fundable.
 */
export function getRestructureOptions(
  extracted: ExtractedScenario,
  calculated: Pick<
    CalculatedScenario,
    "estimatedCLTV" | "estimatedLTC" | "estimatedARVLTV" | "scenarioStrength"
  >
): string[] {
  if (
    calculated.scenarioStrength !== "Needs Restructure" &&
    (calculated.estimatedCLTV ?? 0) <= HIGH_LEVERAGE_CLTV &&
    (calculated.estimatedLTC ?? 0) <= HIGH_LEVERAGE_LTC
  ) {
    return [];
  }

  const options = [
    "Lower the requested loan amount to bring leverage into range",
    "Add additional collateral or a cross-collateralized property",
    "Structure as a new 1st position instead of a 2nd",
    "Use staged or milestone-based funding",
    "Provide a stronger, documented exit strategy",
  ];

  return options;
}
