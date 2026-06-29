import type { ExtractedScenario } from "./types";

/** Parse "$1.2M", "300K", "520,000", "1,350,000" into a number. */
function parseMoney(token: string): number | null {
  const cleaned = token.replace(/[\s,$]/g, "").toLowerCase();
  const match = cleaned.match(/^([0-9]*\.?[0-9]+)(k|m|mm|b)?$/);
  if (!match) return null;
  let value = parseFloat(match[1]);
  const unit = match[2];
  if (unit === "k") value *= 1_000;
  else if (unit === "m" || unit === "mm") value *= 1_000_000;
  else if (unit === "b") value *= 1_000_000_000;
  return Number.isFinite(value) && value > 0 ? value : null;
}

const MONEY_TOKEN = /\$?\s*[0-9][0-9.,]*\s*(?:k|m|mm|b)?/gi;

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
 * Find the money amount nearest to a keyword, biased toward the side the value
 * usually sits on. With prefer="after" ("worth $X", "ARV ... $X"), amounts to
 * the right of the keyword win even if a stray number is nearer on the left;
 * with prefer="before" ("$X cash-out", "$X rehab") the left side wins. The
 * opposite side is only used when the preferred side has nothing in range.
 */
function amountNear(
  text: string,
  keywords: RegExp,
  prefer: "after" | "before" = "after",
  maxGap = 45
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
  /(los angeles|sherman oaks|san diego|san francisco|sacramento|oakland|san jose|fresno|long beach|bakersfield|anaheim|santa ana|riverside|irvine|orange county|beverly hills|pasadena|burbank|glendale|santa monica|malibu|calabasas|encino|studio city|west hollywood|culver city|inglewood|torrance|ventura|santa barbara|palm springs|temecula|carlsbad|la jolla|del mar|napa|sonoma|marin|berkeley)/i;

/**
 * Lightweight, deterministic extractor used when no OpenAI key is configured.
 * It is intentionally conservative — it only fills fields it can detect.
 */
export function mockExtract(input: string): Partial<ExtractedScenario> {
  const text = input.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();

  const cityMatch = text.match(CA_CITIES);
  const inCalifornia = /california|\bca\b/i.test(text) || !!cityMatch;
  const propertyLocation = cityMatch
    ? `${cityMatch[0].replace(/\b\w/g, (c) => c.toUpperCase())}, CA`
    : inCalifornia
      ? "California"
      : null;

  const estimatedValue = amountNear(
    text,
    /(worth|valued?|value of|property worth|home worth)/,
    "after"
  );
  const purchasePrice = amountNear(
    text,
    /(buy|buying|purchase|acquir|for)/,
    "after"
  );
  const currentDebt = amountNear(
    text,
    /(owe|first loan|existing|balance|payoff|current debt|mortgage of)/,
    "after"
  );
  const requestedCashOut = amountNear(text, /(cash[\s-]?out)/, "before");
  const rehabBudget = amountNear(
    text,
    /(rehab|renovation|repairs?|reno)/,
    "before"
  );
  const constructionBudget = amountNear(
    text,
    /(construction|finish|complete|build)/,
    "after"
  );
  const arv = amountNear(
    text,
    /(arv|after[\s-]?repair|completed value)/,
    "after"
  );

  // Generic "I need $X" request.
  const needMatch = text.match(
    /(?:need|want|looking for|raise|require)[^.$0-9]{0,20}\$?\s*([0-9][0-9.,]*\s*(?:k|m|mm|b)?)/i
  );
  const requestedLoanAmount = needMatch ? parseMoney(needMatch[1]) : null;

  const isFlip = /(flip|fix and flip|fix & flip|bridge)/i.test(text);
  const isConstruction = /(construction|finish|complete a project|build)/i.test(text);
  const isCashOut = !!requestedCashOut || /(cash[\s-]?out|refi|refinance)/i.test(text);
  const isSecond = /(second deed|2nd deed|second position|2nd position|second loan)/i.test(text);

  let loanPurpose: string | null = null;
  if (isFlip) loanPurpose = "Fix & flip / bridge";
  else if (isConstruction) loanPurpose = "Construction completion";
  else if (isCashOut) loanPurpose = "Cash-out refinance";

  let lienPosition: string | null = null;
  if (isSecond) lienPosition = "2nd";
  else if (/(new\s*1st|first position|refinance)/i.test(text)) lienPosition = "1st";

  const closingTimeline = /(close fast|asap|urgent|quickly|fast|rush|immediately)/i.test(
    lower
  )
    ? "Fast / expedited"
    : null;

  const borrowerRole = /\b(my client|client needs|for a client|broker)\b/i.test(text)
    ? "Broker / representative"
    : null;

  // Business purpose inferred for clearly investment deals.
  const businessPurpose =
    isFlip || isConstruction || lower.includes("investment") || borrowerRole
      ? "Business"
      : null;

  const occupancy =
    isFlip || isConstruction || lower.includes("investment")
      ? "Investment"
      : lower.includes("owner-occupied") || lower.includes("primary")
        ? "Owner-occupied"
        : lower.includes("second home")
          ? "Second home"
          : null;

  return {
    propertyLocation,
    propertyState: inCalifornia ? "CA" : null,
    estimatedValue: estimatedValue ?? (isFlip ? arv : null),
    currentDebt,
    requestedLoanAmount,
    requestedCashOut,
    purchasePrice: isFlip ? purchasePrice : null,
    rehabBudget,
    constructionBudget: isConstruction ? constructionBudget ?? requestedLoanAmount : null,
    arv,
    propertyType: null,
    loanPurpose,
    lienPosition,
    occupancy,
    businessPurpose,
    closingTimeline,
    exitStrategy: null,
    borrowerRole,
  };
}
