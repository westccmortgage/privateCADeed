import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Resources — CADeed.com",
  description:
    "Learn California private-capital fundamentals: lien position, CLTV and equity, business-purpose vs. consumer loans, construction completion, exit strategy — plus a plain-English glossary.",
};

type Body = Array<string | { list: string[] }>;
interface Article {
  id: string;
  title: string;
  body: Body;
}

// NOTE: the ids below are linked from the homepage Resources cards
// (/resources#lien-basics, #cltv, #business-purpose). Keep them stable.
const ARTICLES: Article[] = [
  {
    id: "lien-basics",
    title: "California lien position basics",
    body: [
      `A deed of trust secures a loan against real property. When more than one loan is recorded against the same property, they have an order of priority — usually by recording date. That order is the lien position, and it determines who gets paid first if the property is sold or foreclosed.`,
      `A 1st deed of trust is the senior loan: first in line to be repaid. A 2nd deed of trust (a junior lien) sits behind the first and is only repaid after the senior loan is satisfied. The more subordinate the position, the more risk the lender takes — which is why private capital evaluates a 2nd differently from a 1st.`,
      `Private capital evaluates a 1st on loan-to-value (LTV) and a 2nd on combined loan-to-value (CLTV), because the existing first loan still has to be repaid ahead of the new money. A common alternative to stacking a 2nd is a new 1st that pays off the existing first and delivers the requested proceeds in a single senior loan.`,
    ],
  },
  {
    id: "cltv",
    title: "Understanding CLTV & equity",
    body: [
      `Loan-to-value (LTV) is the requested loan divided by the property value. Combined loan-to-value (CLTV) adds in any debt that stays ahead of or alongside the new loan:`,
      {
        list: [
          "CLTV = (existing first loan + requested new loan) ÷ property value",
          "Equity remaining = property value − total debt after the new loan",
        ],
      },
      `For a 2nd position, CLTV is the primary metric — not the new-money LTV. Example: a $500K second behind a $3M first on a $6M property is only 8.3% on new money, but 58.3% on a combined basis. The combined figure is what a capital source actually underwrites, so it is what CADeed leads with.`,
      `Lower CLTV generally means a stronger, more placeable scenario and more equity cushion. As combined leverage climbs past the comfort range, terms tighten and the deal may need restructuring — a lower amount, more collateral, a new 1st instead of a 2nd, staged funding, or a stronger exit.`,
    ],
  },
  {
    id: "business-purpose",
    title: "Business-purpose vs. consumer loans",
    body: [
      `Whether a loan is for a business/investment purpose or a personal/consumer purpose changes which laws apply and which capital sources can participate. The distinction is about the use of the loan proceeds, not the type of property.`,
      `Business-purpose / investment-property loans — for example, financing a rental, a fix-and-flip, or a project held for income or resale — are generally more suitable for private capital and are subject to fewer consumer-protection requirements.`,
      `Consumer-purpose / owner-occupied financing — secured by a borrower's primary residence and used for personal, family, or household purposes — is compliance-sensitive. It triggers additional consumer-protection laws, must be reviewed by a licensed mortgage professional, and may not be available from all capital sources.`,
      `Because the answer drives both compliance and routing, the engine always asks which applies, and it flags owner-occupied scenarios for additional review.`,
    ],
  },
  {
    id: "construction",
    title: "Construction completion capital",
    body: [
      `Construction completion capital funds the remaining work on a project that has stalled or been declined by a bank — often mid-construction, when a borrower has already invested significant equity but cannot finish under the original financing.`,
      `Because the collateral is only partly built, these facilities are draw-based and tied closely to the remaining budget and inspections. A complete review needs the project stage and permit status, the remaining cost to complete, the amount already invested, the as-is value, the as-complete value, the contractor or general-contractor status, and a documented exit strategy.`,
      `When an existing first loan is in place, completion capital is often structured as a 2nd behind it (evaluated on CLTV) or as a new 1st that consolidates the debt. The right structure depends on the numbers and the exit.`,
    ],
  },
  {
    id: "exit",
    title: "Exit strategy & timeline",
    body: [
      `Private capital is usually short-term, so how the loan gets repaid — the exit — is as important as the leverage. The common exits are a sale of the property, a refinance into longer-term financing, or a payoff at the end of the term from another source.`,
      `A credible, documented exit strengthens almost every scenario, especially higher-leverage ones. The timeline matters too: a fast, well-supported close is a feature of private capital, but the exit should be realistic for the property, the market, and the borrower.`,
    ],
  },
];

const GLOSSARY: Array<[string, string]> = [
  ["LTV", "Loan-to-value: requested loan ÷ property value."],
  ["CLTV", "Combined loan-to-value: (existing debt + new loan) ÷ value. Primary metric for 2nds."],
  ["LTC", "Loan-to-cost: loan ÷ (purchase + rehab)."],
  ["ARV", "After-repair value: estimated value once rehab or construction is complete."],
  ["As-is value", "Current value of the property in its present condition."],
  ["As-complete value", "Projected value once a construction project is finished."],
  ["DSCR", "Debt-service coverage: net operating income ÷ loan payment."],
  ["1st / 2nd deed of trust", "Lien priority — senior (1st) vs. subordinate (2nd / junior)."],
  ["Bridge loan", "Short-term financing, typically interest-only, repaid by sale or refinance."],
  ["Cash-out refinance", "A refinance that returns equity to the borrower as proceeds."],
  ["Exit strategy", "How the loan is repaid — sale, refinance, or term payoff."],
  ["Business purpose", "Loan for investment/commercial use rather than personal/consumer use."],
  ["Equity", "Property value minus total debt secured against it."],
  ["Points", "An up-front fee equal to a percentage of the loan amount."],
];

function Block({ item }: { item: string | { list: string[] } }) {
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

export default function Resources() {
  return (
    <PageShell
      eyebrow="Resources"
      title="Private capital, in plain English."
      intro="The fundamentals behind every CADeed scenario — and a glossary you can actually use. Educational only; not financial, legal, or tax advice."
    >
      <div className="space-y-4">
        {ARTICLES.map((a) => (
          <article
            key={a.id}
            id={a.id}
            className="glass-card scroll-mt-24 rounded-card p-6 shadow-soft sm:p-8"
          >
            <h2 className="text-[18px] font-semibold tracking-tight text-navy">{a.title}</h2>
            <div className="mt-3 space-y-3">
              {a.body.map((item, i) => (
                <Block key={i} item={item} />
              ))}
            </div>
          </article>
        ))}
      </div>

      <section id="glossary" className="mt-10 scroll-mt-24">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
          Glossary
        </h2>
        <dl className="glass-card mt-4 divide-y divide-hairline rounded-card p-2 shadow-soft">
          {GLOSSARY.map(([term, def]) => (
            <div key={term} className="grid gap-1 p-4 sm:grid-cols-[220px_1fr] sm:gap-6">
              <dt className="text-[14.5px] font-semibold text-navy">{term}</dt>
              <dd className="text-[14px] leading-relaxed text-navy-muted">{def}</dd>
            </div>
          ))}
        </dl>
      </section>

      <a
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-[14px] font-medium text-white/95 transition-colors hover:bg-navy-soft"
      >
        Describe your deal
        <ArrowRight size={16} />
      </a>
    </PageShell>
  );
}
