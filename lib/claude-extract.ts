import Anthropic from "@anthropic-ai/sdk";
import type { ChatTurn, ExtractedScenario } from "./types";

// Extraction layer powered by Anthropic Claude. Claude ONLY understands the
// language and records structured facts via a forced tool call — it never does
// the math. All numbers are computed deterministically in lib/deal-calculator.

const GLOSSARY = `Private-capital / hard-money vocabulary you must understand (including typos):
- Existing senior debt (currentDebt): an OUTSTANDING LOAN BALANCE OWED TO A LENDER in first position — "first loan", "1st", "first lien", "current first", "existing first", "senior debt", "senior loan", "payoff", "first mortgage", common typos like "firs loan". NEVER put a purchase/land price or construction costs here.
- purchasePrice: the acquisition / land / lot cost — "purchase price", "bought the land for", "paid for the lot", "acquired for".
- rehabBudget: rehab OR construction money the borrower has ALREADY PUT IN (their own basis) — "construction cost(s)", "spent on construction", "spent so far", "already invested", "put into the build", "sunk", "rehab budget". This is money already in the project, NOT a lender loan.
- constructionBudget: the REMAINING cost to COMPLETE the project that new financing would fund — "need X to finish", "cost to complete", "remaining budget", "left to finish". (If the borrower is requesting this exact amount, also set requestedLoanAmount.)
- IMPORTANT construction rule: when a borrower describes their "first position" as land PLUS construction spent (their own basis, with no separate lender loan), put the land in purchasePrice and the construction spent in rehabBudget, and leave currentDebt null. The calculator combines land + construction into the senior position — do NOT pre-sum them and do NOT cram them into currentDebt.
- Lien position: "second position", "2nd", "second deed", "junior lien", "2nd deed of trust" => "2nd". "new 1st", "first position", "refinance the first" => "1st".
- Purpose: "mid construction" / "mid-construction" / "construction completion" / "completion capital" => construction completion. "cashout" / "cash-out" / "refi" / "refinance" => cash-out refinance. "fix and flip" / "flip" / "bridge" => fix & flip / bridge.
- Money formats incl. SPOKEN numbers: "value is 6 mil"=6000000, "six million"=6000000, "3mil"/"3 mil"/"3M"/"$3,000,000"=3000000, "need 500k"/"$500K"/"five hundred thousand"=500000, "1.2M"/"a million two hundred thousand"/"one point two million"=1200000, "2.5 million"/"two and a half million"=2500000.
- projectStatus: construction stage, e.g. "mid-construction", "framing", "finishing", "stalled", "50% complete", "70% done".
- borrowerRole: "borrower", "broker" ("my client"), or "investor".`;

const SYSTEM_PROMPT = `You are the extraction layer of CADeed, a California private capital engine.
Your ONLY job is to read plain-English real estate financing language and record structured facts by calling the extract_scenario tool.

${GLOSSARY}

Rules:
- Extract only what is stated or strongly implied. Use null when unknown. Never guess hard numbers.
- Money values must be plain integers in US dollars (e.g. "$1.2M" -> 1200000, "300K" -> 300000, "3 mil" -> 3000000).
- currentDebt is ONLY an existing first/senior LOAN BALANCE owed to a lender — NOT the new requested loan, NOT the purchase/land price, NOT construction costs.
- purchasePrice = land/acquisition cost. rehabBudget = rehab/construction money already spent or invested by the borrower. constructionBudget = remaining cost to complete.
- For a construction deal, keep the land in purchasePrice and the construction-spent in rehabBudget as SEPARATE values; never add them together and never move them into currentDebt.
- requestedLoanAmount is the NEW money being requested.
- Do NOT calculate LTV, CLTV, leverage, capital paths, or any derived numbers. A separate deterministic calculator handles all math.
- propertyState must be "CA" only when the property is in California, otherwise null.
- loanPurpose: short phrase (e.g. "Cash-out refinance", "Fix & flip", "Construction completion").
- lienPosition: "1st" or "2nd" when determinable.
- occupancy: one of "Owner-occupied", "Investment", "Second home" when stated.
- businessPurpose: "Business" or "Consumer" when determinable.
- borrowerRole: "Borrower", "Broker", or "Investor" when determinable.
- Always call the extract_scenario tool exactly once.`;

const EXTRACTION_SCHEMA: Anthropic.Tool.InputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    propertyLocation: { type: ["string", "null"] },
    propertyState: { type: ["string", "null"], enum: ["CA", null] },
    estimatedValue: { type: ["number", "null"] },
    currentDebt: { type: ["number", "null"] },
    requestedLoanAmount: { type: ["number", "null"] },
    requestedCashOut: { type: ["number", "null"] },
    purchasePrice: { type: ["number", "null"] },
    rehabBudget: { type: ["number", "null"] },
    constructionBudget: { type: ["number", "null"] },
    arv: { type: ["number", "null"] },
    propertyType: { type: ["string", "null"] },
    loanPurpose: { type: ["string", "null"] },
    lienPosition: { type: ["string", "null"] },
    occupancy: { type: ["string", "null"] },
    businessPurpose: { type: ["string", "null"] },
    closingTimeline: { type: ["string", "null"] },
    exitStrategy: { type: ["string", "null"] },
    projectStatus: { type: ["string", "null"] },
    borrowerRole: { type: ["string", "null"] },
  },
  required: [
    "propertyLocation",
    "propertyState",
    "estimatedValue",
    "currentDebt",
    "requestedLoanAmount",
    "requestedCashOut",
    "purchasePrice",
    "rehabBudget",
    "constructionBudget",
    "arv",
    "propertyType",
    "loanPurpose",
    "lienPosition",
    "occupancy",
    "businessPurpose",
    "closingTimeline",
    "exitStrategy",
    "projectStatus",
    "borrowerRole",
  ],
} as Anthropic.Tool.InputSchema;

function client(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function model(): string {
  // Extraction is a fast, cheap classification task. Override in Netlify with
  // ANTHROPIC_MODEL=claude-opus-4-8 or claude-sonnet-4-6 for more power.
  return process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
}

async function runExtraction(
  system: string,
  userContent: string,
): Promise<Partial<ExtractedScenario>> {
  const response = await client().messages.create({
    model: model(),
    max_tokens: 1024,
    system,
    tools: [
      {
        name: "extract_scenario",
        description: "Record the structured facts extracted from the deal description.",
        input_schema: EXTRACTION_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "extract_scenario" },
    messages: [{ role: "user", content: userContent }],
  });

  const block = response.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude returned no extraction");
  }
  return block.input as Partial<ExtractedScenario>;
}

/** Single-shot extraction of all facts from one description. */
export function extractWithClaude(input: string): Promise<Partial<ExtractedScenario>> {
  return runExtraction(SYSTEM_PROMPT, input);
}

/**
 * Multi-turn patch extraction. Given the conversation so far and what's already
 * known, extract ONLY the facts present in the latest message; null for anything
 * not stated in this message (so we never overwrite known values).
 */
export function extractPatchWithClaude(
  message: string,
  conversation: ChatTurn[],
  knownScenario: Partial<ExtractedScenario>,
): Promise<Partial<ExtractedScenario>> {
  const transcript = conversation
    .slice(-8)
    .map((t) => `${t.role === "user" ? "User" : "Engine"}: ${t.content}`)
    .join("\n");

  const patchPrompt = `${SYSTEM_PROMPT}

This is a MULTI-TURN conversation. Extract ONLY the new facts stated in the latest user message.
Return null for any field not addressed in THIS message — do not repeat earlier values.
If the latest message is a short answer (e.g. "investment property", "2nd position", "3 million",
"I'm the broker"), map it to the correct field, using the conversation for context.

Known so far (for context only, do not echo back): ${JSON.stringify(knownScenario)}

Recent conversation:
${transcript || "(none)"}`;

  return runExtraction(patchPrompt, `Latest user message: ${message}`);
}
