// Deterministic deal math. The AI never invents numbers — it only extracts
// facts. Everything quantitative lives here so results are reproducible and
// auditable.

import {
  CONSTRUCTION_REQUIREMENTS,
  LEVERAGE_GUIDELINES,
  gradeLeverage,
} from "./private-capital-guidelines";
import { COMPANY } from "./company";
import { scrubForbiddenLanguage } from "./compliance-rules";
import type {
  CalculatedScenario,
  ConventionalReferral,
  ExtractedScenario,
  LenderMatchCriteria,
  PrimaryMetric,
  ScenarioStrength,
} from "./types";

/** Round a ratio (0–1) to a one-decimal percentage. */
function toPercent(value: number): number {
  return Math.round(value * 1000) / 10;
}

function pos(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/** The new money this request introduces (loan amount or cash-out). */
export function newMoneyAmount(extracted: ExtractedScenario): number {
  return Math.max(
    extracted.requestedCashOut ?? 0,
    extracted.requestedLoanAmount ?? 0,
  );
}

/**
 * The senior position that sits AHEAD of the new (junior) money — this is what
 * CLTV and total debt are measured against. Priority:
 *   1. A stated existing first/senior LENDER loan balance (currentDebt).
 *   2. Otherwise, for a construction/build deal where the new money is junior
 *      (an explicit 2nd, or money already sunk into the project), the borrower's
 *      basis already in first position = land/purchase price + construction
 *      invested to date. A new 2nd sits behind that whole basis even when there
 *      is no separate lender first loan.
 *
 * This is why "bought the land for $2.5M, spent $1.2M building, need a $500K 2nd"
 * is a $3.7M senior position — NOT a $1.2M (or $2.5M) one. The land and the
 * construction already invested are COMBINED.
 */
export function seniorAheadAmount(extracted: ExtractedScenario): number | null {
  if (pos(extracted.currentDebt)) return extracted.currentDebt;
  if (
    isConstructionDeal(extracted) &&
    (isSecondPosition(extracted) || pos(extracted.rehabBudget))
  ) {
    const invested = (extracted.purchasePrice ?? 0) + (extracted.rehabBudget ?? 0);
    if (invested > 0) return invested;
  }
  return null;
}

/** Loan-to-Value of the requested new money against property value. */
export function calculateLTV(
  requestedLoanAmount: number | null,
  estimatedValue: number | null,
): number | null {
  if (!pos(requestedLoanAmount) || !pos(estimatedValue)) return null;
  return toPercent(requestedLoanAmount / estimatedValue);
}

/**
 * Combined Loan-to-Value. Existing senior debt PLUS the new money requested,
 * over the property value. This is the primary metric for 2nd-position loans:
 *   CLTV = (currentDebt + requestedNewMoney) / estimatedValue
 */
export function calculateCLTV(
  currentDebt: number | null,
  requestedCashOut: number | null,
  requestedLoanAmount: number | null,
  estimatedValue: number | null,
): number | null {
  if (!pos(estimatedValue)) return null;
  const newMoney = Math.max(requestedCashOut ?? 0, requestedLoanAmount ?? 0);
  const existing = currentDebt ?? 0;
  if (newMoney <= 0 && existing <= 0) return null;
  return toPercent((existing + newMoney) / estimatedValue);
}

/** Loan-to-Cost for purchase + rehab scenarios. */
export function calculateLTC(
  requestedLoanAmount: number | null,
  purchasePrice: number | null,
  rehabBudget: number | null,
): number | null {
  const totalCost = (purchasePrice ?? 0) + (rehabBudget ?? 0);
  if (!pos(requestedLoanAmount) || totalCost <= 0) return null;
  return toPercent(requestedLoanAmount / totalCost);
}

/** Loan amount as a percentage of After-Repair / as-complete value. */
export function calculateARVLTV(
  requestedLoanAmount: number | null,
  arv: number | null,
): number | null {
  if (!pos(requestedLoanAmount) || !pos(arv)) return null;
  return toPercent(requestedLoanAmount / arv);
}

// --- shape detection ---------------------------------------------------------

function purposeBlob(extracted: ExtractedScenario): string {
  return `${extracted.loanPurpose ?? ""} ${extracted.exitStrategy ?? ""} ${
    extracted.projectStatus ?? ""
  } ${extracted.lienPosition ?? ""}`.toLowerCase();
}

export function isConstructionDeal(extracted: ExtractedScenario): boolean {
  return (
    pos(extracted.constructionBudget) ||
    /construction|mid-?construction|finish|complete|completion|build-?out|stalled/.test(
      purposeBlob(extracted),
    )
  );
}

export function isPurchaseRehabDeal(extracted: ExtractedScenario): boolean {
  return (
    pos(extracted.purchasePrice) ||
    pos(extracted.rehabBudget) ||
    /flip|bridge|rehab|value-?add|brrrr/.test(purposeBlob(extracted))
  );
}

export function isSecondPosition(extracted: ExtractedScenario): boolean {
  return /2nd|second|junior/.test(
    `${extracted.lienPosition ?? ""} ${extracted.loanPurpose ?? ""}`.toLowerCase(),
  );
}

function wantsNew1st(extracted: ExtractedScenario): boolean {
  return /new\s*1st|new first|first position|refinance the first|payoff first/i.test(
    `${extracted.loanPurpose ?? ""} ${extracted.lienPosition ?? ""}`,
  );
}

interface LeverageParts {
  estimatedLTV: number | null;
  estimatedCLTV: number | null;
  estimatedLTC: number | null;
  estimatedARVLTV: number | null;
}

/**
 * Choose which leverage figure leads the dashboard.
 * - 2nd position or any existing senior debt → CLTV (primary)
 * - purchase + rehab → LTC (or ARV-LTV)
 * - otherwise (new 1st / refinance) → LTV
 */
export function determinePrimaryMetric(
  extracted: ExtractedScenario,
  parts: LeverageParts,
): PrimaryMetric {
  const second = isSecondPosition(extracted);
  const hasDebt = pos(extracted.currentDebt);
  const hasSenior = seniorAheadAmount(extracted) != null;

  // A 2nd position, any existing senior debt, or a construction deal with money
  // already invested ahead of the new loan is ALWAYS led by CLTV — even when the
  // deal text mentions "bridge" or "value-add".
  if (second || hasDebt || hasSenior) {
    return { key: "CLTV", label: "Combined LTV (CLTV)", value: parts.estimatedCLTV };
  }

  if (isPurchaseRehabDeal(extracted) && !isConstructionDeal(extracted)) {
    if (parts.estimatedLTC !== null)
      return { key: "LTC", label: "Loan-to-Cost", value: parts.estimatedLTC };
    if (parts.estimatedARVLTV !== null)
      return { key: "ARV-LTV", label: "Loan-to-ARV", value: parts.estimatedARVLTV };
  }

  return { key: "LTV", label: "Loan-to-Value", value: parts.estimatedLTV };
}

interface PathResult {
  possibleCapitalPath: string;
  capitalPathDescription: string;
  scenarioStrength: ScenarioStrength;
  riskNotes: string[];
}

function constructionGaps(extracted: ExtractedScenario): string[] {
  return CONSTRUCTION_REQUIREMENTS.filter((req) => {
    if (req.includes("Remaining budget")) return !pos(extracted.constructionBudget);
    if (req.includes("As-complete")) return !pos(extracted.arv);
    if (req.includes("As-is")) return !pos(extracted.estimatedValue);
    if (req.includes("stage")) return !extracted.projectStatus;
    if (req.includes("Exit")) return !extracted.exitStrategy;
    return false;
  }).map((r) => r.toLowerCase());
}

/**
 * Deterministic capital-path decision. The AI never decides this — it only
 * supplies extracted inputs. Never returns a decline; over-leveraged scenarios
 * route to "Needs Restructuring".
 */
export function determineCapitalPath(
  extracted: ExtractedScenario,
  parts: LeverageParts,
): PathResult {
  const riskNotes: string[] = [];
  const second = isSecondPosition(extracted);
  const hasDebt = pos(extracted.currentDebt);
  const hasSenior = seniorAheadAmount(extracted) != null;
  const construction = isConstructionDeal(extracted);
  // 2nd / existing-debt deals are routed by CLTV below, never as purchase-rehab,
  // so an over-leveraged 2nd can still reach "Needs Restructuring".
  const purchaseRehab =
    isPurchaseRehabDeal(extracted) && !construction && !second && !hasDebt;

  // ---- Construction completion (alone or stacked behind a senior position) ----
  if (construction) {
    // Junior when there's a senior position ahead (2nd, existing debt, or the
    // borrower's land + construction already invested). Then it's graded on CLTV.
    const junior = second || hasDebt || hasSenior;
    const verdict = gradeLeverage(
      junior ? "2nd" : "1st",
      junior ? parts.estimatedCLTV : parts.estimatedARVLTV ?? parts.estimatedLTV,
    );
    riskNotes.push(...verdict.notes);

    const gaps = constructionGaps(extracted);
    if (gaps.length > 0) {
      riskNotes.push(`Construction completion review still needs: ${gaps.join(", ")}.`);
    }

    const path = junior
      ? "2nd Deed of Trust / Construction Completion Capital"
      : "Construction Completion Capital";
    const description =
      "Based on the information provided, this scenario may fit a construction " +
      "completion facility that funds the remaining project budget, subject to " +
      "review of plans, budget, completed work, and exit.";

    const noLeverageYet = (junior ? parts.estimatedCLTV : parts.estimatedLTV) === null;

    return {
      possibleCapitalPath: path,
      capitalPathDescription: description,
      scenarioStrength: noLeverageYet ? "Needs More Info" : verdict.strength,
      riskNotes,
    };
  }

  // ---- Fix & Flip / Bridge (purchase + rehab) ----
  if (purchaseRehab) {
    if (parts.estimatedLTC !== null) {
      riskNotes.push(`Estimated loan-to-cost is ~${parts.estimatedLTC}%.`);
      if (parts.estimatedLTC > LEVERAGE_GUIDELINES.bridge.ltcCeiling)
        riskNotes.push(
          "Loan-to-cost is above a typical bridge comfort range; additional equity or a stronger exit may be needed.",
        );
    } else {
      riskNotes.push("Add the requested financing amount to size loan-to-cost.");
    }
    if (parts.estimatedARVLTV !== null) {
      riskNotes.push(`Loan against ARV is ~${parts.estimatedARVLTV}%.`);
      if (parts.estimatedARVLTV > LEVERAGE_GUIDELINES.bridge.arvCeiling)
        riskNotes.push("Many bridge sources cap closer to 65–70% of ARV.");
    } else if (!pos(extracted.arv)) {
      riskNotes.push("After-repair value (ARV) was not provided, which limits sizing.");
    }

    const grade = gradeLeverage("1st", parts.estimatedARVLTV ?? parts.estimatedLTC);
    return {
      possibleCapitalPath: "Fix & Flip / Bridge",
      capitalPathDescription:
        "Based on the information provided, this scenario may fit a short-term " +
        "fix & flip or bridge facility sized against cost and after-repair value, " +
        "subject to review.",
      scenarioStrength:
        parts.estimatedLTC === null && parts.estimatedARVLTV === null
          ? "Needs More Info"
          : grade.strength,
      riskNotes,
    };
  }

  // ---- Cash-out / equity / refinance ----
  if (second || hasDebt || pos(extracted.requestedCashOut)) {
    if (second || hasDebt) {
      const verdict = gradeLeverage("2nd", parts.estimatedCLTV);
      riskNotes.push(...verdict.notes);

      if (verdict.strength === "Needs Restructure") {
        return {
          possibleCapitalPath: "Needs Restructuring",
          capitalPathDescription:
            "Combined leverage is above what most private capital sources will " +
            "hold without changes to loan amount, collateral, or structure. This " +
            "scenario may require restructuring rather than a decline.",
          scenarioStrength: "Needs Restructure",
          riskNotes,
        };
      }

      const path =
        hasDebt && !wantsNew1st(extracted) ? "2nd Deed of Trust" : "New 1st Refinance";
      const description =
        path === "2nd Deed of Trust"
          ? "Based on the information provided, this scenario may fit as a 2nd " +
            "position loan behind the existing first, subject to review."
          : "Based on the information provided, this scenario may fit a new 1st-" +
            "position refinance that pays off the existing debt and delivers the " +
            "requested proceeds, subject to review.";
      return {
        possibleCapitalPath: path,
        capitalPathDescription: description,
        scenarioStrength: parts.estimatedCLTV === null ? "Needs More Info" : verdict.strength,
        riskNotes,
      };
    }

    const verdict = gradeLeverage("1st", parts.estimatedLTV);
    riskNotes.push(...verdict.notes);
    return {
      possibleCapitalPath:
        verdict.strength === "Needs Restructure" ? "Needs Restructuring" : "New 1st Refinance",
      capitalPathDescription:
        verdict.strength === "Needs Restructure"
          ? "Requested leverage is above the typical comfort range; this scenario " +
            "may require restructuring before it can be placed."
          : "Based on the information provided, this scenario may fit a new 1st-" +
            "position loan against the property, subject to review.",
      scenarioStrength: parts.estimatedLTV === null ? "Needs More Info" : verdict.strength,
      riskNotes,
    };
  }

  // ---- Not enough to compute leverage ----
  return {
    possibleCapitalPath: "Pending More Information",
    capitalPathDescription:
      "A capital path can be identified once a few more details are provided. " +
      "Add the property value and the amount you are looking to borrow to see " +
      "likely options.",
    scenarioStrength: "Needs More Info",
    riskNotes,
  };
}

// --- conventional / agency referral router ----------------------------------

/** A HELOC / home-equity line is a conventional product, not private capital. */
export function isHelocRequest(extracted: ExtractedScenario): boolean {
  return /heloc|home equity line|equity line of credit|home-equity line/i.test(
    `${extracted.loanPurpose ?? ""}`,
  );
}

interface ReferralParts {
  scenarioStrength: ScenarioStrength;
  estimatedLTV: number | null;
  estimatedCLTV: number | null;
}

// When leverage against value reaches this, it's conventional/agency territory.
const HIGH_REQUEST_PCT = 80;

/**
 * Decide whether to route the borrower to the conventional/agency channel
 * (West Coast Capital Mortgage) instead of dead-ending an over-leverage or
 * consumer scenario. Private capital is conservative (≈≤65% CLTV on a 2nd,
 * ≈70% LTV on a 1st); conventional can often reach higher LTV, do HELOCs, and
 * serve owner-occupied/consumer borrowers. We never lose the lead.
 */
export function determineConventionalReferral(
  extracted: ExtractedScenario,
  parts: ReferralParts,
): ConventionalReferral {
  const reasons: string[] = [];

  if (parts.scenarioStrength === "Needs Restructure") {
    reasons.push(
      "Combined leverage is above the typical private-capital range — conventional or agency programs often allow a higher loan-to-value.",
    );
  }

  const occ = (extracted.occupancy ?? "").toLowerCase();
  const ownerOccupied = /owner|primary|occupied|residence/.test(occ);
  const consumer = /consumer|personal/.test((extracted.businessPurpose ?? "").toLowerCase());
  if (ownerOccupied || consumer) {
    reasons.push(
      "Owner-occupied / consumer-purpose financing is usually better served through conventional options than private capital.",
    );
  }

  if (isHelocRequest(extracted)) {
    reasons.push(
      "A HELOC / home-equity line of credit is a conventional product rather than private capital.",
    );
  }

  const valueLeverage = Math.max(parts.estimatedCLTV ?? 0, parts.estimatedLTV ?? 0);
  if (valueLeverage >= HIGH_REQUEST_PCT) {
    reasons.push(
      `The requested amount is a high share of value (~${valueLeverage}%) — conventional / agency financing typically reaches a higher loan-to-value than private capital.`,
    );
  }

  const recommended = reasons.length > 0;
  return {
    recommended,
    reasons: reasons.map(scrubForbiddenLanguage),
    headline: recommended ? "A conventional loan option may fit better" : "",
    message: recommended
      ? scrubForbiddenLanguage(
          `Private capital is conservative on leverage, so this scenario may be a better fit for a conventional or agency loan. A licensed loan officer at ${COMPANY.legalName} (NMLS #${COMPANY.nmls}) can review options such as a conventional refinance, a HELOC, or higher loan-to-value programs. This is not an offer or a commitment to lend — a licensed professional will review your situation.`,
        )
      : "",
  };
}

// --- lender matching ---------------------------------------------------------

function ownerOccupiedBool(extracted: ExtractedScenario): boolean | null {
  const occ = (extracted.occupancy ?? "").toLowerCase();
  if (!occ) return null;
  return /owner|primary|occupied|residence/.test(occ);
}

function businessPurposeBool(extracted: ExtractedScenario): boolean | null {
  const bp = (extracted.businessPurpose ?? "").toLowerCase();
  if (!bp) return null;
  if (/business|investment|commercial/.test(bp)) return true;
  if (/consumer|personal/.test(bp)) return false;
  return null;
}

export function deriveLenderMatchCriteria(
  extracted: ExtractedScenario,
  calculated: Pick<CalculatedScenario, "estimatedLTV" | "estimatedCLTV">,
): LenderMatchCriteria {
  return {
    maxLTVNeeded: calculated.estimatedLTV,
    maxCLTVNeeded: calculated.estimatedCLTV,
    requestedLienPosition: isSecondPosition(extracted) ? "2nd" : extracted.lienPosition,
    propertyType: extracted.propertyType,
    location: extracted.propertyLocation,
    loanAmount:
      extracted.requestedLoanAmount ??
      extracted.requestedCashOut ??
      extracted.constructionBudget ??
      null,
    constructionNeeded: isConstructionDeal(extracted),
    ownerOccupied: ownerOccupiedBool(extracted),
    businessPurpose: businessPurposeBool(extracted),
    speedNeeded: extracted.closingTimeline,
    exitStrategy: extracted.exitStrategy,
  };
}

// --- missing info / questions / quick replies / gating ----------------------

const FIELD_LABELS = {
  value: "Estimated property value",
  loanAmount: "Requested loan amount",
  currentDebt: "Existing first loan balance",
  lienPosition: "Lien position (1st or 2nd)",
  purpose: "Loan purpose",
  occupancy: "Occupancy (owner-occupied, investment, or second home)",
  businessPurpose: "Business or consumer purpose",
  projectStatus: "Project stage / status",
  exitStrategy: "Exit strategy",
  timeline: "Closing timeline",
  location: "Property location / state",
  role: "Your role (borrower, broker, or investor)",
} as const;

function hasLoanAsk(extracted: ExtractedScenario): boolean {
  // The purchase price is NOT the requested loan — a purchase deal still needs
  // an explicit financing amount.
  return (
    pos(extracted.requestedLoanAmount) ||
    pos(extracted.requestedCashOut) ||
    pos(extracted.constructionBudget)
  );
}

/**
 * Decision-relevant missing fields, in priority order. Financial inputs come
 * first (so leverage can be computed), then the compliance-critical fields
 * (occupancy, business purpose), then the remaining intake fields.
 */
export function findMissingInformation(extracted: ExtractedScenario): string[] {
  const missing: string[] = [];

  if (!pos(extracted.estimatedValue) && !pos(extracted.purchasePrice))
    missing.push(FIELD_LABELS.value);
  if (!hasLoanAsk(extracted)) missing.push(FIELD_LABELS.loanAmount);
  // A 2nd needs the senior position quantified — but that can come from an
  // existing first loan OR (for construction) land + construction invested.
  if (isSecondPosition(extracted) && seniorAheadAmount(extracted) == null)
    missing.push(FIELD_LABELS.currentDebt);
  if (!extracted.lienPosition && !isSecondPosition(extracted))
    missing.push(FIELD_LABELS.lienPosition);
  if (!extracted.loanPurpose) missing.push(FIELD_LABELS.purpose);
  if (!extracted.occupancy) missing.push(FIELD_LABELS.occupancy);
  if (!extracted.businessPurpose) missing.push(FIELD_LABELS.businessPurpose);
  if (isConstructionDeal(extracted) && !extracted.projectStatus)
    missing.push(FIELD_LABELS.projectStatus);
  if (!extracted.exitStrategy) missing.push(FIELD_LABELS.exitStrategy);
  if (!extracted.closingTimeline) missing.push(FIELD_LABELS.timeline);
  if (!extracted.propertyLocation && extracted.propertyState !== "CA")
    missing.push(FIELD_LABELS.location);
  if (!extracted.borrowerRole) missing.push(FIELD_LABELS.role);

  return missing;
}

/** Map the first missing item to the ExtractedScenario field key it concerns. */
export function getPendingField(
  extracted: ExtractedScenario,
): keyof ExtractedScenario | null {
  const first = findMissingInformation(extracted)[0];
  if (!first) return null;
  const map: Record<string, keyof ExtractedScenario> = {
    [FIELD_LABELS.value]: "estimatedValue",
    [FIELD_LABELS.loanAmount]: "requestedLoanAmount",
    [FIELD_LABELS.currentDebt]: "currentDebt",
    [FIELD_LABELS.lienPosition]: "lienPosition",
    [FIELD_LABELS.purpose]: "loanPurpose",
    [FIELD_LABELS.occupancy]: "occupancy",
    [FIELD_LABELS.businessPurpose]: "businessPurpose",
    [FIELD_LABELS.projectStatus]: "projectStatus",
    [FIELD_LABELS.exitStrategy]: "exitStrategy",
    [FIELD_LABELS.timeline]: "closingTimeline",
    [FIELD_LABELS.location]: "propertyLocation",
    [FIELD_LABELS.role]: "borrowerRole",
  };
  return map[first] ?? null;
}

/** Minimum scenario facts required before "Ready for Broker Review". */
export function meetsMinimumInfo(extracted: ExtractedScenario): boolean {
  const hasLocation = !!extracted.propertyLocation || extracted.propertyState === "CA";
  const hasValue = pos(extracted.estimatedValue) || pos(extracted.purchasePrice);
  const hasLien = !!extracted.lienPosition || isSecondPosition(extracted);
  const secondHasDebt =
    !isSecondPosition(extracted) || seniorAheadAmount(extracted) != null;

  return (
    hasLocation &&
    hasValue &&
    hasLoanAsk(extracted) &&
    hasLien &&
    secondHasDebt &&
    !!extracted.loanPurpose &&
    !!extracted.occupancy &&
    !!extracted.businessPurpose &&
    !!extracted.exitStrategy &&
    !!extracted.closingTimeline &&
    !!extracted.borrowerRole
  );
}

/** The single most useful follow-up question given what's missing. */
export function getNextBestQuestion(
  missingInformation: string[],
  extracted: ExtractedScenario,
): string {
  if (missingInformation.length === 0) {
    return "This scenario looks ready for broker review. Add your contact details and consent below to send it in.";
  }
  const first = missingInformation[0];

  if (first === FIELD_LABELS.location)
    return "Where is the property located? (City and state)";
  if (first === FIELD_LABELS.value)
    return "What is the current estimated value of the property?";
  if (first === FIELD_LABELS.loanAmount)
    return "How much capital are you looking to raise on this deal?";
  if (first === FIELD_LABELS.currentDebt)
    return "What is the balance on the existing first loan?";
  if (first === FIELD_LABELS.lienPosition)
    return "Are you looking for a 1st-position loan or a 2nd behind an existing first?";
  if (first === FIELD_LABELS.purpose)
    return "What is the financing for — cash-out, purchase, bridge, or construction completion?";
  if (first === FIELD_LABELS.occupancy)
    return "Is this property owner-occupied, investment, or business-purpose collateral?";
  if (first === FIELD_LABELS.businessPurpose)
    return "Is this loan for business/investment purpose or personal/consumer purpose?";
  if (first === FIELD_LABELS.projectStatus)
    return "What stage is the construction at, and how much is left to complete?";
  if (first === FIELD_LABELS.exitStrategy)
    return "How do you plan to exit or pay off this loan?";
  if (first === FIELD_LABELS.timeline)
    return "What is your target closing timeline?";
  if (first === FIELD_LABELS.role)
    return "Are you the borrower, a broker, or an investor on this deal?";
  return `Can you share: ${first.toLowerCase()}?`;
}

/** Context-aware quick-reply chips for the current next-best-question. */
export function getQuickReplies(extracted: ExtractedScenario): string[] {
  const missing = findMissingInformation(extracted);
  if (missing.length === 0) return [];
  const first = missing[0];

  if (first === FIELD_LABELS.lienPosition)
    return ["1st position", "2nd position", "Not sure"];
  if (first === FIELD_LABELS.purpose)
    return ["Cash-out", "Purchase", "Fix & flip / bridge", "Construction completion"];
  if (first === FIELD_LABELS.occupancy)
    return ["Investment property", "Owner-occupied", "Second home", "Not sure"];
  if (first === FIELD_LABELS.businessPurpose)
    return ["Business / investment purpose", "Consumer / personal purpose", "Not sure"];
  if (first === FIELD_LABELS.projectStatus)
    return ["Foundation / framing", "Mid-construction", "Finishing stage", "Stalled"];
  if (first === FIELD_LABELS.exitStrategy)
    return ["Sell / flip", "Refinance out", "Long-term hold", "Pay off at term"];
  if (first === FIELD_LABELS.timeline)
    return ["ASAP", "2–3 weeks", "30 days", "Flexible"];
  if (first === FIELD_LABELS.role)
    return ["I'm the borrower", "I'm a broker", "I'm an investor"];
  return [];
}

/** Restructuring suggestions — never a decline, always a path forward. */
export function getRestructureOptions(
  extracted: ExtractedScenario,
  calculated: Pick<CalculatedScenario, "scenarioStrength">,
): string[] {
  if (calculated.scenarioStrength !== "Needs Restructure") return [];

  const options = [
    "Lower the requested loan amount to bring leverage into range",
    "Add additional collateral or a cross-collateralized property",
  ];
  if (pos(extracted.currentDebt))
    options.push("Structure as a new 1st position instead of a 2nd");
  options.push("Use staged or milestone-based funding");
  options.push("Provide a stronger, documented exit strategy");
  return options;
}
