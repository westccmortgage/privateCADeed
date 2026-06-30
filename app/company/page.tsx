import type { Metadata } from "next";
import { ShieldCheck, Calculator, Route, ArrowRight } from "lucide-react";
import PageShell from "@/components/PageShell";
import { COMPANY, telHref } from "@/lib/company";

export const metadata: Metadata = {
  title: "Company — CADeed.com",
  description:
    "About CADeed.com and West Coast Capital Mortgage Inc. — how the deterministic private-capital engine underwrites, the capital paths it maps, and our compliance and licensing posture.",
};

const PILLARS = [
  {
    icon: Calculator,
    title: "Deterministic underwriting",
    body: "Claude understands the language; TypeScript computes every number. Results are reproducible and auditable — never invented.",
  },
  {
    icon: Route,
    title: "Routed through GRCRM",
    body: "We don't email lenders directly. Consent-backed, structured scenarios flow to GRCRM for licensed review and capital-source matching.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance first",
    body: "No approvals, no quotes, no promises. Owner-occupied and consumer-purpose scenarios are flagged for licensed review.",
  },
];

type Body = Array<string | { list: string[] }>;

function Block({ item }: { item: string | { list: string[] } }) {
  if (typeof item === "string") {
    return <p className="text-[15px] leading-relaxed text-navy-soft">{item}</p>;
  }
  return (
    <ul className="space-y-2">
      {item.list.map((li) => (
        <li
          key={li}
          className="flex items-start gap-2 text-[14.5px] leading-relaxed text-navy-soft"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
          {li}
        </li>
      ))}
    </ul>
  );
}

const ABOUT: Body = [
  `CADeed is a California deal intake terminal for private capital, operated by ${COMPANY.legalName} (NMLS #${COMPANY.nmls}). It reads a real estate financing scenario the way an experienced capital desk would — in plain English — then maps the structure, the math, and the missing pieces in seconds.`,
  `Our premise is simple: software should accelerate the reasoning around a deal, not invent the numbers. So we split the work in two. A language model interprets what you wrote and extracts the facts. Deterministic code does every calculation. You get a clear, preliminary read on where a deal can go — and exactly what is still needed to get it there — without a long application form or a sales call.`,
  `CADeed does not lend, approve, or commit funds. It prepares a structured, consent-backed scenario and routes it, through GRCRM, to a licensed professional and to private capital sources whose lending box fits.`,
];

const UNDERWRITING: Body = [
  `Every scenario is graded against conservative, non-binding private-capital guidelines. These shape the language and the suggested path; they are not lender commitments, and they never produce a decline — over-leveraged scenarios are returned with restructuring options instead.`,
  `1st deed of trust. Evaluated on loan-to-value (LTV). Generally strongest at or below roughly 60–65% LTV, sometimes to about 70% depending on the collateral and the specific capital source.`,
  `2nd deed of trust. Evaluated on combined loan-to-value (CLTV) — the existing first loan plus the requested new loan, divided by value. This is the metric that matters for subordinate financing, and it is what the engine leads with for any 2nd. Generally stronger under about 60% CLTV, with roughly 60–65% possible depending on property, borrower, purpose, and exit.`,
  `Fix & flip / bridge. Sized against loan-to-cost (purchase plus rehab) and loan-to-after-repair-value (ARV). Higher leverage typically means a larger borrower cash contribution and a stronger documented exit.`,
  `Construction completion. A draw-based facility tied to the remaining work. A complete review needs:`,
  {
    list: [
      "Project stage / percent complete and permit status",
      "Remaining budget to complete and amount already invested",
      "As-is value and as-complete (after-construction) value",
      "Contractor / general-contractor status",
      "A documented exit strategy (sale, refinance, or term payoff)",
    ],
  },
  `When leverage is elevated, the engine routes to "Needs Restructuring" and proposes concrete levers — lower the requested amount, add collateral, structure a new 1st instead of a 2nd, stage the funding, or strengthen the exit.`,
];

const PATHS: Body = [
  `The engine maps each scenario to a likely capital path:`,
  {
    list: [
      "Cash-Out & Refinance — unlock equity via a new 1st or a 2nd, sized on combined leverage.",
      "2nd Deed of Trust — subordinate financing behind an existing first when CLTV allows.",
      "Fix & Flip / Bridge — short-term capital underwritten against cost and ARV.",
      "Construction Completion Capital — funding to finish a stalled or bank-declined project.",
      "DSCR / rental — coverage-based evaluation for income property (via the calculators).",
    ],
  },
];

export default function Company() {
  return (
    <PageShell
      eyebrow="Company"
      title="A California deal intake terminal for private capital."
      intro="We pair deterministic underwriting math with language understanding, so the numbers are never invented — only the reasoning is accelerated."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <div key={p.title} className="glass-card rounded-card p-6 shadow-soft">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
              <p.icon size={20} />
            </span>
            <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-navy">{p.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-navy-muted">{p.body}</p>
          </div>
        ))}
      </div>

      <section id="about" className="mt-10 scroll-mt-24">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
          About CADeed
        </h2>
        <div className="glass-card mt-4 space-y-3 rounded-card p-6 shadow-soft sm:p-8">
          {ABOUT.map((item, i) => (
            <Block key={i} item={item} />
          ))}
        </div>
      </section>

      <section id="underwriting" className="mt-10 scroll-mt-24">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
          How we underwrite
        </h2>
        <div className="glass-card mt-4 space-y-3 rounded-card p-6 shadow-soft sm:p-8">
          {UNDERWRITING.map((item, i) => (
            <Block key={i} item={item} />
          ))}
        </div>
      </section>

      <section id="paths" className="mt-10 scroll-mt-24">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
          Capital paths we map
        </h2>
        <div className="glass-card mt-4 space-y-3 rounded-card p-6 shadow-soft sm:p-8">
          {PATHS.map((item, i) => (
            <Block key={i} item={item} />
          ))}
        </div>
      </section>

      <section id="compliance" className="mt-10 scroll-mt-24">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
          Compliance & licensing
        </h2>
        <div className="glass-card mt-4 space-y-3 rounded-card p-6 shadow-soft sm:p-8">
          <p className="text-[15px] leading-relaxed text-navy-soft">
            CADeed produces preliminary scenarios only — not approvals, quotes, or commitments to
            lend. Private capital is arranged through licensed professionals where required, and we
            do business in accordance with the Equal Credit Opportunity Act and the Fair Housing
            Act.
          </p>
          <p className="text-[15px] leading-relaxed text-navy-soft">
            Nothing is shared with a capital source until you give explicit consent. Owner-occupied
            and consumer-purpose scenarios are flagged for additional review by a licensed mortgage
            professional and may not suit all capital sources.
          </p>
          <p className="text-[14px] leading-relaxed text-navy-muted">
            {COMPANY.legalName} · NMLS&nbsp;#{COMPANY.nmls} · {COMPANY.mailingAddress} ·{" "}
            <a href={telHref(COMPANY.phoneOffice)} className="font-medium text-navy underline-offset-2 hover:underline">
              {COMPANY.phoneOffice}
            </a>
            . Full details on our{" "}
            <a href="/legal" className="font-medium text-navy underline-offset-2 hover:underline">
              Legal &amp; Privacy
            </a>{" "}
            page; verify licensing at{" "}
            <a
              href="https://www.nmlsconsumeraccess.org/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-navy underline-offset-2 hover:underline"
            >
              NMLS Consumer Access
            </a>
            .
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-[15px] font-medium text-white/95 transition-colors hover:bg-navy-soft"
        >
          Describe your deal
          <ArrowRight size={17} />
        </a>
        <a
          href="/for-capital-sources"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-hairline bg-white/70 px-6 py-3 text-[15px] font-medium text-navy transition-colors hover:border-navy/20"
        >
          For capital sources
        </a>
      </div>
    </PageShell>
  );
}
