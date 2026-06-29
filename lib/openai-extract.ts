import OpenAI from "openai";
import type { ExtractedScenario } from "./types";

const SYSTEM_PROMPT = `You are the extraction layer of CADeed, a California private capital engine.
Your ONLY job is to read a plain-English real estate financing request and extract structured facts.

Rules:
- Extract only what is stated or strongly implied. Use null when unknown. Never guess hard numbers.
- Money values must be plain integers in US dollars (e.g. "$1.2M" -> 1200000, "300K" -> 300000).
- Do NOT calculate LTV, CLTV, leverage, capital paths, or any derived numbers. A separate
  deterministic calculator handles all math. You only extract raw facts.
- propertyState must be "CA" only when the property is in California, otherwise null.
- loanPurpose should be a short phrase (e.g. "Cash-out refinance", "Fix & flip", "Construction completion").
- lienPosition should be "1st" or "2nd" when determinable.
- occupancy should be one of "Owner-occupied", "Investment", "Second home" when stated.
- businessPurpose should be "Business" or "Consumer" when determinable.
- Return ONLY the JSON object described by the schema. No prose.`;

const EXTRACTION_SCHEMA = {
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
    "borrowerRole",
  ],
} as const;

/**
 * Extract structured scenario facts using the OpenAI Responses API with a
 * strict JSON schema. Returns the parsed object or throws.
 */
export async function extractWithOpenAI(
  input: string
): Promise<Partial<ExtractedScenario>> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const response = await client.responses.create({
    model,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: input },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "extracted_scenario",
        strict: true,
        schema: EXTRACTION_SCHEMA,
      },
    },
  });

  const text = response.output_text;
  if (!text) {
    throw new Error("Empty response from OpenAI");
  }
  return JSON.parse(text) as Partial<ExtractedScenario>;
}
