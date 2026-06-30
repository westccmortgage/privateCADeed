// Multi-turn scenario state merging.
//
// Each conversation turn produces a partial patch of newly-learned facts. We
// merge that patch into the running scenario so the engine gets smarter every
// turn WITHOUT erasing anything it already knew.

import { scrubForbiddenLanguage } from "./compliance-rules";
import { EMPTY_SCENARIO } from "./types";
import type { ExtractedScenario } from "./types";

// Free-text fields that originate from the model and are shown to the user or
// sent to GRCRM — every one is scrubbed of forbidden compliance language.
const TEXT_FIELDS: Array<keyof ExtractedScenario> = [
  "propertyLocation",
  "loanPurpose",
  "occupancy",
  "businessPurpose",
  "closingTimeline",
  "exitStrategy",
  "projectStatus",
  "propertyType",
  "borrowerRole",
];

function isEmptyValue(v: unknown): boolean {
  return v === null || v === undefined || v === "";
}

// Plausibility bounds for any dollar figure. Anything outside this range is
// almost certainly a parse/typo error (e.g. "$580" or "$200,000,000,000") and
// is dropped to null so it can be re-asked — never fed into the math.
const DOLLAR_MIN = 1_000;
const DOLLAR_MAX = 5_000_000_000; // $5B ceiling — generous for CA private capital

/** Coerce a loose value to a plausible positive dollar amount, or null. */
function toNumber(v: unknown): number | null {
  if (isEmptyValue(v)) return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < DOLLAR_MIN || n > DOLLAR_MAX) return null;
  return n;
}

const NUMERIC_FIELDS: Array<keyof ExtractedScenario> = [
  "estimatedValue",
  "currentDebt",
  "requestedLoanAmount",
  "requestedCashOut",
  "purchasePrice",
  "rehabBudget",
  "constructionBudget",
  "arv",
];

/**
 * Normalize a raw/partial scenario into clean field types (numbers coerced,
 * CA state inferred from the location). Missing keys become null.
 */
export function normalizeScenario(
  raw: Partial<ExtractedScenario> | null | undefined,
): ExtractedScenario {
  const merged = { ...EMPTY_SCENARIO, ...(raw ?? {}) };

  for (const field of NUMERIC_FIELDS) {
    // @ts-expect-error — numeric fields only
    merged[field] = toNumber(merged[field]);
  }

  for (const field of TEXT_FIELDS) {
    const v = merged[field];
    if (typeof v === "string" && v) {
      // @ts-expect-error — text fields only
      merged[field] = scrubForbiddenLanguage(v);
    }
  }

  merged.propertyState =
    merged.propertyState === "CA" ||
    /california|\bca\b/i.test(merged.propertyLocation ?? "")
      ? "CA"
      : merged.propertyState ?? null;

  return merged;
}

/**
 * Merge a freshly-extracted patch into the running scenario. New non-empty
 * values win; empty values never erase something already known.
 */
export function mergeScenario(
  current: ExtractedScenario,
  patch: Partial<ExtractedScenario> | null | undefined,
): ExtractedScenario {
  const base = normalizeScenario(current);
  if (!patch) return base;

  const cleanPatch = normalizeScenario({ ...EMPTY_SCENARIO, ...patch });
  const result: ExtractedScenario = { ...base };

  (Object.keys(cleanPatch) as Array<keyof ExtractedScenario>).forEach((key) => {
    const incoming = cleanPatch[key];
    if (!isEmptyValue(incoming)) {
      // @ts-expect-error — key/value aligned by construction
      result[key] = incoming;
    }
  });

  // Re-derive CA state after merge.
  result.propertyState =
    result.propertyState === "CA" ||
    /california|\bca\b/i.test(result.propertyLocation ?? "")
      ? "CA"
      : result.propertyState ?? null;

  return result;
}

/**
 * Compute the diff between two scenarios — the fields that actually changed.
 * Used to report `scenarioPatch` back to the client and for logging.
 */
export function diffScenario(
  before: ExtractedScenario,
  after: ExtractedScenario,
): Partial<ExtractedScenario> {
  const patch: Partial<ExtractedScenario> = {};
  (Object.keys(after) as Array<keyof ExtractedScenario>).forEach((key) => {
    if (before[key] !== after[key]) {
      // @ts-expect-error — key/value aligned by construction
      patch[key] = after[key];
    }
  });
  return patch;
}
