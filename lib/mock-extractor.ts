import type { ExtractedScenario } from "./types";

/**
 * Parse money tokens into numbers. Handles:
 *   "$1.2M", "300K", "520,000", "1,350,000", "3mil", "3 mil", "3M",
 *   "$3,000,000", "6 mil", "2 million", "750 thousand".
 */
function parseMoney(token: string): number | null {
  const cleaned = token
    .replace(/[\s,$]/g, "")
    .toLowerCase()
    .replace(/dollars?/g, "");
  const match = cleaned.match(
    /^([0-9]*\.?[0-9]+)(k|thousand|mm|mil|million|m|bn|billion|b)?$/,
  );
  if (!match) return null;
  let value = parseFloat(match[1]);
  switch (match[2]) {
    case "k":
    case "thousand":
      value *= 1_000;
      break;
    case "m":
    case "mm":
    case "mil":
    case "million":
      value *= 1_000_000;
      break;
    case "b":
    case "bn":
    case "billion":
      value *= 1_000_000_000;
      break;
  }
  return Number.isFinite(value) && value > 0 ? value : null;
}

// Multi-char units listed first so the token regex matches them greedily.
const MONEY_TOKEN =
  /\$?\s*[0-9][0-9.,]*\s*(?:thousand|million|billion|mm|mil|bn|k|m|b)?/gi;

interface MoneySpan {
  value: number;
  start: number;
  end: number;
}

function moneySpans(text: string): MoneySpan[] {
  const re = new RegExp(MONEY_TOKEN.source, "gi");
  const spans: MoneySpan[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[0].trim();
    if (!/[0-9]/.test(raw)) continue;
    const value = parseMoney(raw);
    if (value) spans.push({ value, start: m.index, end: m.index + m[0].length });
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  return spans;
}

/**
 * Find the money amount nearest a keyword, biased toward the side the value
 * usually sits on. prefer="after" → "worth $X"; prefer="before" → "$X rehab".
 * The opposite side is only used when the preferred side has nothing in range.
 */
function amountNear(
  text: string,
  keywords: RegExp,
  prefer: "after" | "before" = "after",
  maxGap = 45,
): number | null {
  const kwRe = new RegExp(keywords.source, "gi");
  const keywordSpans: Array<[number, number]> = [];
  let km: RegExpExecArray | null;
  while ((km = kwRe.exec(text)) !== null) {
    keywordSpans.push([km.index, km.index + km[0].length]);
    if (km.index === kwRe.lastIndex) kwRe.lastIndex++;
  }
  if (keywordSpans.length === 0) return null;

  const spans = moneySpans(text);
  let preferred: { value: number; gap: number } | null = null;
  let opposite: { value: number; gap: number } | null = null;

  for (const { value, start, end } of spans) {
    for (const [ks, ke] of keywordSpans) {
      const isAfter = start >= ke;
      const gap = isAfter ? start - ke : ks - end;
      if (gap < 0 || gap > maxGap) continue;
      const onPreferredSide =
        (prefer === "after" && isAfter) || (prefer === "before" && !isAfter);
      if (onPreferredSide) {
        if (!preferred || gap < preferred.gap) preferred = { value, gap };
      } else {
        if (!opposite || gap < opposite.gap) opposite = { value, gap };
      }
    }
  }
  return (preferred ?? opposite)?.value ?? null;
}

const CA_CITIES =
  /(los angeles|sherman oaks|san diego|san francisco|sacramento|oakland|san jose|fresno|long beach|bakersfield|anaheim|santa ana|riverside|irvine|orange county|beverly hills|pasadena|burbank|glendale|santa monica|malibu|calabasas|encino|studio city|west hollywood|culver city|inglewood|torrance|ventura|santa barbara|palm springs|temecula|carlsbad|la jolla|del mar|napa|sonoma|marin|berkeley|hollywood|brentwood|woodland hills|tarzana|van nuys|north hollywood)/i;

export interface ExtractContext {
  /** The field the engine just asked about — used to bind bare answers. */
  pendingField?: keyof ExtractedScenario | null;
}

/**
 * Deterministic extractor used when no OpenAI key is configured AND as a robust
 * baseline. Understands hard-money / private-lending language, common typos,
 * and short conversational answers (e.g. quick-reply chips).
 */
export function mockExtract(
  input: string,
  context: ExtractContext = {},
): Partial<ExtractedScenario> {
  const text = input.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();

  // ---- Location / state ----
  const cityMatch = text.match(CA_CITIES);
  const inCalifornia = /california|\bca\b/i.test(text) || !!cityMatch;
  const propertyLocation = cityMatch
    ? `${cityMatch[0].replace(/\b\w/g, (c) => c.toUpperCase())}, CA`
    : inCalifornia
      ? "California"
      : null;

  // ---- Money fields ----
  const estimatedValue = amountNear(
    text,
    /(worth|valued|value of|value is|value at|value as is|value as-is|as-is value|as is value|property worth|home worth|appraised|valuation|value)/,
    "after",
  );

  const purchasePrice = amountNear(
    text,
    /(buy|buying|bought|purchase|purchasing|purchased|acquire|acquiring|land for|lot for|under contract (?:for|at)|contract price)/,
    "after",
  );

  // Existing senior debt — broad synonyms + common typos.
  const currentDebt = amountNear(
    text,
    /(owe|owed|current first|existing first|first loan|first lien|first mortgage|firs loan|1st loan|1st lien|1st is|first is|senior loan|senior debt|senior lien|existing loan|current debt|balance|payoff|pay ?off|first of)/,
    "after",
  );

  const requestedCashOut = amountNear(
    text,
    /(cash[\s-]?out|pull out|take out|pull cash|equity of)/,
    "before",
  );

  // Rehab / construction money the borrower has already put in (their basis).
  // "spent $X / invested $X" puts the amount AFTER the keyword; "$X rehab /
  // $X construction costs" puts it BEFORE. Check both and prefer the spent form.
  const rehabSpent = amountNear(
    text,
    /(spent|already invested|invested|put into (?:the )?(?:build|construction|project)|sunk into)/,
    "after",
  );
  const rehabCost = amountNear(
    text,
    /(rehab|renovation|repairs?|reno|construction budget|budget of|construction costs?|cost of construction|on (?:the )?construction)/,
    "before",
  );
  const rehabBudget = rehabSpent ?? rehabCost;

  // Only treat as a remaining construction budget with explicit budget phrasing.
  const constructionBudget = amountNear(
    text,
    /(construction budget|budget to (?:finish|complete)|cost to complete|remaining budget|left to (?:finish|complete))/,
    "before",
  );

  const arv = amountNear(
    text,
    /(arv|after[\s-]?repair|as[\s-]?complete|as complete value|completed value|finished value)/,
    "after",
  );

  // Generic "I need $X" request.
  const needMatch = text.match(
    /(?:need|want|looking for|loan for|loan of|seeking|require|raise|request)[^.$0-9]{0,24}\$?\s*([0-9][0-9.,]*\s*(?:thousand|million|billion|mm|mil|bn|k|m|b)?)/i,
  );
  let requestedLoanAmount = needMatch ? parseMoney(needMatch[1]) : null;

  // ---- Deal shape ----
  const isFlip =
    /(fix and flip|fix & flip|fix-and-flip|fix\/flip|flipping|flip (?:a|this|the|in|for)|bridge loan|\bbridge\b)/i.test(
      text,
    ) ||
    (/\bflip\b/i.test(text) && /(buy|buying|purchase|rehab|arv)/i.test(text));
  const isConstruction =
    /(construction|mid[\s-]?construction|completion capital|construction completion|finish (?:a|the|my|this) (?:project|build|construction|home|house)|complete (?:a|the|my|this) (?:project|build|construction)|stalled (?:project|build)|finish building)/i.test(
      text,
    );
  const isHeloc = /\bheloc\b|home[\s-]?equity line|equity line of credit/i.test(text);
  const isCashOut =
    !!requestedCashOut || /(cash[\s-]?out|refi|refinance|pull (?:cash|equity)|tap equity)/i.test(text);

  const isSecond =
    /(second deed|2nd deed|second position|2nd position|second lien|2nd lien|second mortgage|2nd mortgage|second loan|2nd loan|junior lien|junior position|behind (?:the|a|an|my) (?:first|1st))/i.test(
      text,
    );
  const isNewFirst =
    /(new 1st|new first|first position|1st position|refinance the first|payoff (?:the )?first|replace the first)/i.test(
      text,
    );

  let loanPurpose: string | null = null;
  if (isConstruction) loanPurpose = "Construction completion";
  else if (isFlip) loanPurpose = "Fix & flip / bridge";
  else if (isHeloc) loanPurpose = "HELOC / home equity line";
  else if (isCashOut) loanPurpose = "Cash-out refinance";
  else if (purchasePrice) loanPurpose = "Purchase";

  let lienPosition: string | null = null;
  if (isSecond) lienPosition = "2nd";
  else if (isNewFirst) lienPosition = "1st";

  // ---- Project status (construction stage) ----
  let projectStatus: string | null = null;
  if (/mid[\s-]?construction|halfway|half done|half-done|50% complete|in progress/i.test(text))
    projectStatus = "Mid-construction";
  else if (/foundation|framing|rough-?in|framed/i.test(text)) projectStatus = "Early stage";
  else if (/finishing|final|punch list|punch-list|almost (?:done|complete)|nearly complete/i.test(text))
    projectStatus = "Finishing stage";
  else if (/stalled|paused|halted/i.test(text)) projectStatus = "Stalled";

  // ---- Occupancy ----
  let occupancy: string | null = null;
  if (/owner[\s-]?occupied|owner occ|primary residence|primary home|live in it|i live|my home|my house/i.test(text))
    occupancy = "Owner-occupied";
  else if (/investment|rental|investor|non[\s-]?owner|tenant[\s-]?occupied|income property/i.test(text))
    occupancy = "Investment";
  else if (/second home|vacation home/i.test(text)) occupancy = "Second home";

  // ---- Business vs consumer purpose ----
  let businessPurpose: string | null = null;
  if (/business[\s-]?purpose|business\/investment|investment purpose|for business|commercial purpose/i.test(text))
    businessPurpose = "Business";
  else if (/consumer[\s-]?purpose|personal[\s-]?purpose|personal use|for personal|consumer loan/i.test(text))
    businessPurpose = "Consumer";

  // ---- Exit strategy ----
  let exitStrategy: string | null = null;
  if (/refinance out|refi out|take ?out (?:loan|financing)|permanent (?:loan|financing)|refinance (?:into|to a)/i.test(text))
    exitStrategy = "Refinance out";
  else if (/long[\s-]?term hold|buy and hold|keep it|hold (?:it|the)|rent it/i.test(text))
    exitStrategy = "Long-term hold";
  else if (/\bsell\b|sale|list it|flip and sell/i.test(text)) exitStrategy = "Sell";
  else if (/pay ?off at term|payoff at maturity|pay it off|payoff at term/i.test(text))
    exitStrategy = "Pay off at term";

  // ---- Closing timeline ----
  let closingTimeline: string | null = null;
  if (/asap|urgent|right away|immediately|today|this week/i.test(text))
    closingTimeline = "ASAP";
  else if (/close fast|quickly|fast|rush|need it (?:soon|quick)/i.test(text))
    closingTimeline = "Fast / expedited";
  else if (/\b(\d+)\s*days?\b/i.test(text)) {
    const d = text.match(/\b(\d+)\s*days?\b/i);
    closingTimeline = d ? `${d[1]} days` : "Specific date";
  } else if (/\b(\d+)\s*weeks?\b/i.test(text)) {
    const w = text.match(/\b(\d+)\s*weeks?\b/i);
    closingTimeline = w ? `${w[1]} weeks` : "Specific date";
  } else if (/next month|flexible|no rush|whenever/i.test(text))
    closingTimeline = "Flexible";

  // ---- Borrower / user role ----
  let borrowerRole: string | null = null;
  if (/\b(broker|i'?m a broker|as a broker|mortgage broker)\b/i.test(text) || /my client|client needs|for (?:a|my) client/i.test(text))
    borrowerRole = "Broker";
  else if (/\binvestor\b|i'?m an investor|as an investor/i.test(text)) borrowerRole = "Investor";
  else if (/i'?m the borrower|i am the borrower|\bborrower\b|for myself|my (?:deal|property|loan)/i.test(text))
    borrowerRole = "Borrower";

  // Investment context implies business purpose if not contradicted.
  if (!businessPurpose && (isFlip || isConstruction || occupancy === "Investment" || borrowerRole === "Investor"))
    businessPurpose = "Business";

  // Don't double-count: if the only "need" amount equals the cash-out, treat it
  // as cash-out only (not a separate requested loan).
  if (requestedLoanAmount && requestedCashOut && requestedLoanAmount === requestedCashOut)
    requestedLoanAmount = null;

  const result: Partial<ExtractedScenario> = {
    propertyLocation,
    propertyState: inCalifornia ? "CA" : null,
    estimatedValue: estimatedValue ?? (isFlip ? arv : null),
    currentDebt,
    requestedLoanAmount,
    requestedCashOut: requestedCashOut ?? null,
    purchasePrice: purchasePrice ?? null,
    rehabBudget: rehabBudget ?? null,
    constructionBudget: constructionBudget ?? null,
    arv: arv ?? null,
    propertyType: null,
    loanPurpose,
    lienPosition,
    occupancy,
    businessPurpose,
    closingTimeline,
    exitStrategy,
    projectStatus,
    borrowerRole,
  };

  // ---- Bind a bare answer to the field the engine just asked about ----
  if (context.pendingField) {
    bindPendingAnswer(result, context.pendingField, text, lower);
  }

  return result;
}

const NUMERIC_FIELDS = new Set<keyof ExtractedScenario>([
  "estimatedValue",
  "currentDebt",
  "requestedLoanAmount",
  "requestedCashOut",
  "purchasePrice",
  "rehabBudget",
  "constructionBudget",
  "arv",
]);

/**
 * When the user replies tersely to a specific question (e.g. "3 million" after
 * "what's the existing first loan?"), bind that bare value to the pending field
 * if the normal keyword pass didn't already fill it.
 */
function bindPendingAnswer(
  result: Partial<ExtractedScenario>,
  field: keyof ExtractedScenario,
  text: string,
  lower: string,
): void {
  const already = result[field];
  if (already !== null && already !== undefined && already !== "") return;

  // "Not sure" / "skip" must advance the flow (never trap the user in a re-ask
  // loop). Record a review-flagged sentinel for categorical fields.
  const NOT_SURE = /\b(not sure|unsure|don'?t know|no idea|skip|unknown|n\/a)\b/i;
  if (!NUMERIC_FIELDS.has(field) && NOT_SURE.test(text)) {
    // @ts-expect-error — categorical field
    result[field] = "Not sure — needs review";
    return;
  }

  if (NUMERIC_FIELDS.has(field)) {
    const spans = moneySpans(text);
    if (spans.length >= 1) {
      // @ts-expect-error — numeric field
      result[field] = spans[0].value;
    }
    return;
  }

  // Free-text fields: accept the answer verbatim when it's a short reply.
  if (field === "occupancy" && !result.occupancy) {
    if (/owner|primary|residence/.test(lower)) result.occupancy = "Owner-occupied";
    else if (/invest|rental/.test(lower)) result.occupancy = "Investment";
    else if (/second home|vacation/.test(lower)) result.occupancy = "Second home";
  } else if (field === "businessPurpose" && !result.businessPurpose) {
    if (/business|investment|commercial/.test(lower)) result.businessPurpose = "Business";
    else if (/consumer|personal/.test(lower)) result.businessPurpose = "Consumer";
  } else if (field === "lienPosition" && !result.lienPosition) {
    if (/2nd|second|junior/.test(lower)) result.lienPosition = "2nd";
    else if (/1st|first/.test(lower)) result.lienPosition = "1st";
  } else if (field === "borrowerRole" && !result.borrowerRole) {
    if (/broker/.test(lower)) result.borrowerRole = "Broker";
    else if (/investor/.test(lower)) result.borrowerRole = "Investor";
    else if (/borrower|myself/.test(lower)) result.borrowerRole = "Borrower";
  } else if (field === "exitStrategy" && !result.exitStrategy) {
    if (text.length <= 60) result.exitStrategy = text;
  } else if (field === "closingTimeline" && !result.closingTimeline) {
    if (text.length <= 40) result.closingTimeline = text;
  } else if (field === "propertyLocation" && !result.propertyLocation) {
    if (text.length <= 60) result.propertyLocation = text;
  } else if (field === "loanPurpose" && !result.loanPurpose) {
    if (text.length <= 60) result.loanPurpose = text;
  }
}
