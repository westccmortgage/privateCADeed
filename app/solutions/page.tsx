import type { Metadata } from "next";
import { ArrowRight, RefreshCw, Hammer, Building, Layers } from "lucide-react";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Solutions — CADeed.com",
  description:
    "Plain-English explanations of the private-capital paths CADeed can map for California real estate: cash-out & refinance, fix & flip / bridge, construction completion, and 2nd deed of trust. Educational only — not a loan offer.",
};

type Body = Array<string | { list: string[] }>;

interface Solution {
  id: string;
  icon: typeof RefreshCw;
  title: string;
  summary: string;
  plain: Body;
  fits: string[];
  looksAt: string[];
  /** Prefill key for the terminal (?start=…) for anyone ready to proceed. */
  startKey: string;
}

// NOTE: ids are linked from the homepage Solutions cards and the header menu
// (/solutions#cash-out, #fix-flip, #construction, #second). Keep them stable.
const SOLUTIONS: Solution[] = [
  {
    id: "cash-out",
    icon: RefreshCw,
    title: "Cash-Out & Refinance",
    summary: "Turn equity you already have in a property into usable cash.",
    plain: [
      `If your California property is worth more than you owe on it, the difference is your equity. A cash-out refinance (or a second loan) lets you borrow against that equity and receive money you can use — for a project, another purchase, paying off higher-cost debt, or working capital for your business.`,
      `There are two common ways to do it. A new 1st refinance replaces your existing loan with one larger loan and hands you the difference in cash. A 2nd deed of trust leaves your current loan in place and adds a smaller second loan behind it. Which one fits depends on your current rate, how much you need, and the total leverage on the property.`,
    ],
    fits: [
      "You have meaningful equity and want to pull some of it out as cash",
      "You'd rather not disturb a low-rate existing first loan (a 2nd may fit)",
      "You need to move faster than a traditional bank timeline",
      "The purpose is business or investment rather than a primary residence",
    ],
    looksAt: [
      "Property value and how much you currently owe",
      "Combined loan-to-value (CLTV) once the new money is added",
      "How the loan gets repaid — your exit strategy",
    ],
    startKey: "cashout",
  },
  {
    id: "fix-flip",
    icon: Hammer,
    title: "Fix & Flip / Bridge",
    summary: "Short-term capital to buy, renovate, and resell a property.",
    plain: [
      `A fix & flip loan is short-term money for investors who buy a property, renovate it, and sell it for a profit. Because banks are usually too slow and too rigid for these deals, private capital steps in: it can close quickly and is sized around the project, not just your income.`,
      `A bridge loan is the same idea in a broader sense — temporary financing that "bridges" the gap until a property is sold or refinanced into something longer-term. Both are meant to be paid off in months, not years, so the plan for the exit matters as much as the numbers.`,
    ],
    fits: [
      "You're buying a property to renovate and resell",
      "You need to close quickly to win the deal",
      "You want funding sized to the project's cost and future value",
      "You have a clear plan to sell or refinance when the work is done",
    ],
    looksAt: [
      "Purchase price plus your rehab budget (loan-to-cost, or LTC)",
      "The projected after-repair value (ARV) once work is complete",
      "Your experience and a realistic timeline to finish and exit",
    ],
    startKey: "flip",
  },
  {
    id: "construction",
    icon: Building,
    title: "Construction Completion",
    summary: "Capital to finish a stalled or bank-declined building project.",
    plain: [
      `Sometimes a construction project runs out of financing before it's finished — the original lender pulls back, a bank declines the next draw, or costs came in higher than planned. Construction completion capital funds the remaining work so the project can reach the finish line.`,
      `Because the property is only partly built, this kind of loan is released in stages tied to inspections and the remaining budget, rather than all at once. Lenders want to see how far along the project is, what's left to spend, how much you've already put in, and what the finished property will be worth.`,
    ],
    fits: [
      "A project is mid-construction and needs money to be completed",
      "A bank declined the next draw or the construction loan overall",
      "You've already invested significant equity into the build",
      "You can document the remaining budget and the finished value",
    ],
    looksAt: [
      "Project stage, permits, and the cost remaining to complete",
      "Amount already invested and the as-is value today",
      "The as-complete (finished) value and your exit — sale or refinance",
    ],
    startKey: "construction",
  },
  {
    id: "second",
    icon: Layers,
    title: "2nd Deed of Trust",
    summary: "A second loan that sits behind your existing first loan.",
    plain: [
      `A deed of trust is the document that secures a loan against your property. When you already have a loan (the "1st"), a second deed of trust is an additional loan recorded behind it. It lets you tap equity without touching — or paying off — your existing first loan, which is useful when that first loan has a good rate you'd like to keep.`,
      `Because a 2nd is repaid only after the 1st in a sale or foreclosure, the lender is taking more risk, so what matters most is the combined leverage: your existing first loan plus the new second, measured against the property's value. When the combined total stays within a comfortable range, a 2nd can be a clean, fast way to raise capital.`,
    ],
    fits: [
      "You want to keep your existing first loan in place",
      "You need additional capital and have equity to support it",
      "Combined leverage (first + second) stays within range",
      "The purpose is business or investment use",
    ],
    looksAt: [
      "Existing first-loan balance and the property value",
      "Combined loan-to-value (CLTV) — the primary metric for a 2nd",
      "Equity remaining behind both loans and your exit strategy",
    ],
    startKey: "second",
  },
];

function Para({ item }: { item: string | { list: string[] } }) {
  if (typeof item === "string") {
    return <p className="text-[14.5px] leading-relaxed text-navy-muted">{item}</p>;
  }
  return (
    <ul className="space-y-1.5">
      {item.list.map((li) => (
        <li
          key={li}
          className="flex items-start gap-2 text-[14.5px] leading-relaxed text-navy-muted"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
          {li}
        </li>
      ))}
    </ul>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white/70 p-5">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-navy-muted">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li
            key={it}
            className="flex items-start gap-2 text-[14px] leading-relaxed text-navy-soft"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy/30" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Solutions() {
  return (
    <PageShell
      eyebrow="Solutions"
      title="What kind of capital fits your deal?"
      intro="Private capital is real estate financing from non-bank sources — funds and individual investors — that can move quickly and is sized around the property and the plan, not just your paperwork. Here's each path in plain English. Read first; you don't have to fill anything out."
    >
      {/* Quick jump */}
      <nav className="mb-8 flex flex-wrap gap-2">
        {SOLUTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/70 px-4 py-2 text-[13.5px] font-medium text-navy-soft transition-colors hover:border-navy/20 hover:text-navy"
          >
            <s.icon size={15} className="text-gold" />
            {s.title}
          </a>
        ))}
      </nav>

      <div className="space-y-5">
        {SOLUTIONS.map((s) => (
          <article
            key={s.id}
            id={s.id}
            className="glass-card scroll-mt-24 rounded-card p-6 shadow-soft sm:p-8"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                <s.icon size={22} />
              </span>
              <div>
                <h2 className="text-[21px] font-semibold tracking-tight text-navy">
                  {s.title}
                </h2>
                <p className="mt-1 text-[15px] font-medium text-navy-soft">{s.summary}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {s.plain.map((item, i) => (
                <Para key={i} item={item} />
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <MiniList title="When it fits" items={s.fits} />
              <MiniList title="What a lender looks at" items={s.looksAt} />
            </div>

            <a
              href={`/?start=${s.startKey}#top`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-navy-soft"
            >
              Describe this kind of deal
              <ArrowRight size={16} />
            </a>
          </article>
        ))}
      </div>

      {/* Reassurance + next steps */}
      <div className="glass-card mt-8 rounded-card p-6 shadow-soft sm:p-8">
        <h2 className="text-[17px] font-semibold tracking-tight text-navy">
          Still not sure which one you need?
        </h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-navy-muted">
          That&apos;s completely normal — and it&apos;s exactly what CADeed is for. Just
          describe your situation in your own words on the home page and the engine will tell
          you which path likely fits, do the math, and show what&apos;s missing. Nothing you
          see is a loan approval or a commitment to lend; every scenario is reviewed by a
          licensed professional before anything happens.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="/#top"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-navy-soft"
          >
            Describe your deal
            <ArrowRight size={16} />
          </a>
          <a
            href="/resources"
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/70 px-5 py-2.5 text-[14px] font-semibold text-navy transition-colors hover:border-navy/20"
          >
            Learn the basics first
          </a>
        </div>
      </div>
    </PageShell>
  );
}
