/**
 * Deterministic scenario tests for CADeed.
 * Run with: npm test   (uses tsx)
 *
 * These exercise the pure calculation/extraction/compliance logic — no network,
 * no OpenAI, no Next.js runtime.
 */
import { mockExtract } from "../lib/mock-extractor";
import { buildChatResponse } from "../lib/scenario-engine";
import {
  findMissingInformation,
  getNextBestQuestion,
  meetsMinimumInfo,
} from "../lib/deal-calculator";
import {
  BUSINESS_PURPOSE_QUESTION,
  computeComplianceFlags,
  consentSatisfied,
} from "../lib/compliance-rules";
import { sendScenarioToGRCRM } from "../lib/grcrm-client";
import { EMPTY_SCENARIO, type ExtractedScenario } from "../lib/types";

let passed = 0;
let failed = 0;

function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function analyze(text: string) {
  // Single-shot: extract from text, merge into empty, calculate.
  return buildChatResponse(EMPTY_SCENARIO, mockExtract(text));
}

console.log("\nCADeed scenario tests\n");

// 1. 500k 2nd position, 3M first, 6M value => 58.3% CLTV (NOT 8.3%).
{
  const r = analyze(
    "Need a 500k loan for second position mid construction current first loan 3mil value is 6 mil",
  );
  console.log("Test 1 — 2nd position mid-construction");
  check("currentDebt = 3,000,000", r.mergedScenario.currentDebt === 3_000_000, `got ${r.mergedScenario.currentDebt}`);
  check("estimatedValue = 6,000,000", r.mergedScenario.estimatedValue === 6_000_000, `got ${r.mergedScenario.estimatedValue}`);
  check("requestedLoanAmount = 500,000", r.mergedScenario.requestedLoanAmount === 500_000, `got ${r.mergedScenario.requestedLoanAmount}`);
  check("lienPosition = 2nd", r.mergedScenario.lienPosition === "2nd", `got ${r.mergedScenario.lienPosition}`);
  check("CLTV = 58.3 (not 8.3)", r.calculated.estimatedCLTV === 58.3, `got ${r.calculated.estimatedCLTV}`);
  check("primary metric is CLTV", r.calculated.primaryMetric.key === "CLTV", `got ${r.calculated.primaryMetric.key}`);
  check("totalDebtAfterLoan = 3,500,000", r.calculated.totalDebtAfterLoan === 3_500_000, `got ${r.calculated.totalDebtAfterLoan}`);
  check("equityRemaining = 2,500,000", r.calculated.equityRemaining === 2_500_000, `got ${r.calculated.equityRemaining}`);
  check("path mentions Construction Completion", /Construction Completion/i.test(r.calculated.possibleCapitalPath), r.calculated.possibleCapitalPath);
}

// 2. 300k cash-out, 520k owed, 1.2M value => 68.3% CLTV, 820k total debt.
{
  const r = analyze("I need $300K cash-out on a Los Angeles property worth $1.2M. I owe $520K.");
  console.log("Test 2 — cash-out");
  check("currentDebt = 520,000", r.mergedScenario.currentDebt === 520_000, `got ${r.mergedScenario.currentDebt}`);
  check("estimatedValue = 1,200,000", r.mergedScenario.estimatedValue === 1_200_000, `got ${r.mergedScenario.estimatedValue}`);
  check("requestedCashOut = 300,000", r.mergedScenario.requestedCashOut === 300_000, `got ${r.mergedScenario.requestedCashOut}`);
  check("totalDebtAfterLoan = 820,000", r.calculated.totalDebtAfterLoan === 820_000, `got ${r.calculated.totalDebtAfterLoan}`);
  check("CLTV = 68.3", r.calculated.estimatedCLTV === 68.3, `got ${r.calculated.estimatedCLTV}`);
  check("location is Los Angeles, CA", r.mergedScenario.propertyLocation === "Los Angeles, CA", `got ${r.mergedScenario.propertyLocation}`);
}

// 3. Fix and flip purchase + rehab + ARV. Loan amount unknown => ask financing.
{
  const r = analyze("Buying a fix and flip for 900k with 150k rehab and ARV 1.35M.");
  console.log("Test 3 — fix & flip");
  check("purchasePrice = 900,000", r.mergedScenario.purchasePrice === 900_000, `got ${r.mergedScenario.purchasePrice}`);
  check("rehabBudget = 150,000", r.mergedScenario.rehabBudget === 150_000, `got ${r.mergedScenario.rehabBudget}`);
  check("arv = 1,350,000", r.mergedScenario.arv === 1_350_000, `got ${r.mergedScenario.arv}`);
  check("purpose is fix & flip / bridge", /flip|bridge/i.test(r.mergedScenario.loanPurpose ?? ""), r.mergedScenario.loanPurpose ?? "null");
  check(
    "asks for financing amount",
    r.missingInformation.some((m) => /requested loan amount/i.test(m)),
    r.missingInformation.join(", "),
  );
}

// 4. Construction completion missing current debt/value.
{
  const r = analyze("My bank declined my construction loan. Need 600k to finish a project in San Diego.");
  console.log("Test 4 — construction completion");
  check("requestedLoanAmount = 600,000", r.mergedScenario.requestedLoanAmount === 600_000, `got ${r.mergedScenario.requestedLoanAmount}`);
  check("location is San Diego, CA", r.mergedScenario.propertyLocation === "San Diego, CA", `got ${r.mergedScenario.propertyLocation}`);
  check("path is Construction Completion Capital", /Construction Completion Capital/i.test(r.calculated.possibleCapitalPath), r.calculated.possibleCapitalPath);
  check("missing includes property value", r.missingInformation.some((m) => /value/i.test(m)), r.missingInformation.join(", "));
  check("never says declined in path desc", !/\bdeclined\b/i.test(r.calculated.capitalPathDescription), r.calculated.capitalPathDescription);
}

// 5. Owner-occupied caution.
{
  const scenario: ExtractedScenario = {
    ...EMPTY_SCENARIO,
    propertyState: "CA",
    estimatedValue: 1_000_000,
    currentDebt: 400_000,
    requestedLoanAmount: 200_000,
    occupancy: "Owner-occupied",
  };
  const flags = computeComplianceFlags(scenario);
  console.log("Test 5 — owner-occupied caution");
  check("ownerOccupiedFlag is true", flags.ownerOccupiedFlag === true);
  check("compliance flags include owner-occupied", flags.complianceFlags.some((f) => /OWNER_OCCUPIED/.test(f)));
}

// 6. Business-purpose follow-up.
{
  const scenario: ExtractedScenario = {
    ...EMPTY_SCENARIO,
    propertyLocation: "Irvine, CA",
    propertyState: "CA",
    estimatedValue: 2_000_000,
    requestedLoanAmount: 250_000,
    currentDebt: 900_000,
    lienPosition: "2nd",
    loanPurpose: "Cash-out",
    occupancy: "Owner-occupied", // set so the next gap is business purpose
    exitStrategy: "Refinance out",
    closingTimeline: "30 days",
    borrowerRole: "Broker",
  };
  const missing = findMissingInformation(scenario);
  const q = getNextBestQuestion(missing, scenario);
  console.log("Test 6 — business-purpose follow-up");
  check("next question is the business-purpose question", q === BUSINESS_PURPOSE_QUESTION, q);
}

// 7. Scenario cannot be sent without consent.
{
  console.log("Test 7 — consent required");
  check("consentSatisfied(false) is false", consentSatisfied(false) === false);
  check("consentSatisfied(undefined) is false", consentSatisfied(undefined) === false);
  check("consentSatisfied(true) is true", consentSatisfied(true) === true);

  const complete: ExtractedScenario = {
    ...EMPTY_SCENARIO,
    propertyLocation: "San Diego, CA",
    propertyState: "CA",
    estimatedValue: 1_000_000,
    requestedLoanAmount: 300_000,
    lienPosition: "1st",
    loanPurpose: "Cash-out",
    occupancy: "Investment",
    businessPurpose: "Business",
    exitStrategy: "Refinance out",
    closingTimeline: "30 days",
    borrowerRole: "Borrower",
  };
  check("minimum info met for a complete scenario", meetsMinimumInfo(complete) === true);
  // The send rule is: minimum info AND consent. Without consent it must not send.
  check("complete scenario without consent cannot send", (meetsMinimumInfo(complete) && consentSatisfied(false)) === false);
}

// 8. GRCRM webhook missing should not break the app.
{
  console.log("Test 8 — GRCRM not configured is graceful");
  const prevUrl = process.env.GRCRM_WEBHOOK_URL;
  delete process.env.GRCRM_WEBHOOK_URL;
  const result = await sendScenarioToGRCRM({
    sourceDomain: "CADeed.com",
    scenarioId: "test_1",
    rawConversation: [],
    rawUserInput: "test",
    extractedScenario: EMPTY_SCENARIO,
    calculatedScenario: buildChatResponse(EMPTY_SCENARIO, {}).calculated,
    missingInformation: [],
    nextBestQuestion: "",
    consentGiven: true,
    consentText: "",
    timestamp: "2026-01-01T00:00:00.000Z",
    userContact: {},
    routingStatus: "new",
    complianceFlags: [],
    ownerOccupiedFlag: false,
    businessPurposeFlag: false,
    recommendedCapitalPath: "Private Capital Review",
    lenderMatchCriteria: {
      maxLTVNeeded: null,
      maxCLTVNeeded: null,
      requestedLienPosition: null,
      propertyType: null,
      location: null,
      loanAmount: null,
      constructionNeeded: false,
      ownerOccupied: null,
      businessPurpose: null,
      speedNeeded: null,
      exitStrategy: null,
    },
  });
  check("returns configured=false, does not throw", result.configured === false && result.sent === false);
  check("returns a friendly message", /not configured yet/i.test(result.message), result.message);
  if (prevUrl !== undefined) process.env.GRCRM_WEBHOOK_URL = prevUrl;
}

// 9. Review regressions.
{
  console.log("Test 9 — review regressions");

  // (a) 2nd position described as "bridge value-add" must still lead with CLTV.
  const r = analyze(
    "Second position bridge value-add, current first loan 3mil, value 6 mil, need 500k",
  );
  check("2nd + bridge => primary metric is CLTV", r.calculated.primaryMetric.key === "CLTV", r.calculated.primaryMetric.key);
  check("2nd + bridge => CLTV 58.3", r.calculated.estimatedCLTV === 58.3, `got ${r.calculated.estimatedCLTV}`);

  // (b) "Not sure" must advance the flow (no infinite re-ask loop).
  const notSure = mockExtract("Not sure", { pendingField: "occupancy" });
  check('"Not sure" sets a review sentinel for occupancy', typeof notSure.occupancy === "string" && /needs review/i.test(notSure.occupancy as string), String(notSure.occupancy));
  const afterNotSure = buildChatResponse(
    { ...EMPTY_SCENARIO, estimatedValue: 1_000_000, requestedLoanAmount: 200_000, lienPosition: "1st", loanPurpose: "Cash-out" },
    notSure,
  );
  check('occupancy no longer "missing" after "Not sure"', !afterNotSure.missingInformation.some((m) => /occupancy/i.test(m)), afterNotSure.missingInformation.join(", "));

  // (c) Merging a new answer must not erase prior values.
  const withValue: ExtractedScenario = { ...EMPTY_SCENARIO, propertyState: "CA", estimatedValue: 1_200_000, currentDebt: 520_000 };
  const merged = buildChatResponse(withValue, mockExtract("Investment property"));
  check("merge keeps estimatedValue", merged.mergedScenario.estimatedValue === 1_200_000, `got ${merged.mergedScenario.estimatedValue}`);
  check("merge keeps currentDebt", merged.mergedScenario.currentDebt === 520_000, `got ${merged.mergedScenario.currentDebt}`);
  check("merge adds occupancy", merged.mergedScenario.occupancy === "Investment", `got ${merged.mergedScenario.occupancy}`);

  // (d) Forbidden language in an AI-extracted field is scrubbed before display.
  const scrubbed = buildChatResponse(EMPTY_SCENARIO, { loanPurpose: "Approved cash-out refinance" });
  check("extracted loanPurpose is scrubbed of 'approved'", !/\bapproved\b/i.test(scrubbed.mergedScenario.loanPurpose ?? ""), scrubbed.mergedScenario.loanPurpose ?? "null");
}

// 10. Garbage / implausible inputs must never produce absurd math.
{
  console.log("Test 10 — implausible inputs are guarded");
  const r = buildChatResponse(EMPTY_SCENARIO, {
    estimatedValue: 580,
    currentDebt: 580_000,
    requestedLoanAmount: 200_000_000_000,
    lienPosition: "2nd",
  });
  check("absurd value ($580) dropped to null", r.mergedScenario.estimatedValue === null, String(r.mergedScenario.estimatedValue));
  check("absurd loan ($200B) dropped to null", r.mergedScenario.requestedLoanAmount === null, String(r.mergedScenario.requestedLoanAmount));
  check("CLTV is not an absurd number", r.calculated.estimatedCLTV === null || r.calculated.estimatedCLTV <= 1000, String(r.calculated.estimatedCLTV));
  check("primary metric value sane", r.calculated.primaryMetric.value === null || r.calculated.primaryMetric.value <= 1000, String(r.calculated.primaryMetric.value));

  // In-bounds but inconsistent (tiny value vs. big loan) → guarded too.
  const r2 = buildChatResponse(EMPTY_SCENARIO, {
    estimatedValue: 2_000,
    requestedLoanAmount: 1_000_000,
    lienPosition: "1st",
  });
  check("inconsistent ratio guarded (LTV null)", r2.calculated.estimatedLTV === null, String(r2.calculated.estimatedLTV));
  check("inconsistent → Needs More Info", r2.calculated.scenarioStrength === "Needs More Info", r2.calculated.scenarioStrength);
}

// 11. Construction stack: land + construction invested = senior position.
//     "Bought land 2.5M, spent 1.2M building, need 500k 2nd, value 6M" must
//     combine land + construction into a $3.7M senior position => CLTV 70%
//     (NOT 8.3%, 20%, 28.3%, or 50% — the bugs that dropped the construction).
{
  const r = analyze(
    "I purchased the land for 2.5 million and spent 1.2 million on construction, mid construction, need another 500k on a second, value as is 6 million in Los Angeles",
  );
  console.log("Test 11 — construction stack (land + build = senior position)");
  check("purchasePrice = 2,500,000", r.mergedScenario.purchasePrice === 2_500_000, `got ${r.mergedScenario.purchasePrice}`);
  check("rehabBudget (construction invested) = 1,200,000", r.mergedScenario.rehabBudget === 1_200_000, `got ${r.mergedScenario.rehabBudget}`);
  check("currentDebt stays null (no lender first loan)", r.mergedScenario.currentDebt === null, `got ${r.mergedScenario.currentDebt}`);
  check("requestedLoanAmount = 500,000", r.mergedScenario.requestedLoanAmount === 500_000, `got ${r.mergedScenario.requestedLoanAmount}`);
  check("seniorPositionAmount = 3,700,000 (land + construction)", r.calculated.seniorPositionAmount === 3_700_000, `got ${r.calculated.seniorPositionAmount}`);
  check("CLTV = 70 (not 8.3 / 20 / 28.3 / 50)", r.calculated.estimatedCLTV === 70, `got ${r.calculated.estimatedCLTV}`);
  check("primary metric is CLTV", r.calculated.primaryMetric.key === "CLTV", `got ${r.calculated.primaryMetric.key}`);
  check("new-money LTV = 8.3", r.calculated.estimatedLTV === 8.3, `got ${r.calculated.estimatedLTV}`);
  check("totalDebtAfterLoan = 4,200,000", r.calculated.totalDebtAfterLoan === 4_200_000, `got ${r.calculated.totalDebtAfterLoan}`);
  check("equityRemaining = 1,800,000", r.calculated.equityRemaining === 1_800_000, `got ${r.calculated.equityRemaining}`);
  check("does NOT ask for existing first loan balance", !r.missingInformation.some((m) => /existing first loan/i.test(m)), r.missingInformation.join(", "));
  check("path mentions Construction Completion", /Construction Completion/i.test(r.calculated.possibleCapitalPath), r.calculated.possibleCapitalPath);
}

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
