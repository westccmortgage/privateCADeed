import type { Metadata } from "next";
import { Plus } from "lucide-react";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "FAQ — CADeed.com",
  description:
    "Answers about CADeed.com — the California Deal Intake Terminal: how it works, what it does for borrowers, brokers, and capital sources, and how it handles compliance and your data.",
};

interface Group {
  title: string;
  items: Array<[string, string]>;
}

const GROUPS: Group[] = [
  {
    title: "The basics",
    items: [
      [
        "What is CADeed.com?",
        "A California deal intake terminal for private capital. You describe a real estate financing scenario in plain English; the engine extracts the facts, calculates the structure (LTV, CLTV, LTC, ARV, equity), maps the likely capital path, asks the next best question, and — with your consent — routes a structured scenario for licensed review.",
      ],
      [
        "Is this a loan approval?",
        "No. CADeed produces a preliminary scenario only. It is not a pre-qualification, approval, rate quote, rate lock, or commitment to lend. Every scenario requires review by a licensed mortgage professional and/or private capital source.",
      ],
      [
        "Does the AI decide the numbers?",
        "No. The AI only understands your language and extracts facts. All math is computed by deterministic code, so the numbers are reproducible and never invented. Implausible inputs are caught rather than turned into an absurd result.",
      ],
      [
        "How much does it cost to use?",
        "Using the terminal and the calculators is free. There is no application fee to get a preliminary scenario.",
      ],
    ],
  },
  {
    title: "For borrowers",
    items: [
      [
        "What information do I need?",
        "Enough to map the structure: property location, value, requested loan, existing debt (if any), lien position, purpose, occupancy, business vs. consumer purpose, exit strategy, and timeline. The engine asks for what is missing, one question at a time — you do not fill out a long form.",
      ],
      [
        "What happens after I submit a scenario?",
        "With your consent, the structured scenario is sent to GRCRM, where it is reviewed and routed to private capital sources whose lending box fits. A licensed professional follows up. CADeed never emails lenders directly.",
      ],
      [
        "Do you handle owner-occupied loans?",
        "Owner-occupied / consumer-purpose scenarios are compliance-sensitive and may not suit all private capital sources. They require additional review by a licensed professional, and the engine flags them automatically.",
      ],
      [
        "Can I use voice instead of typing?",
        "Yes — tap the microphone to dictate your deal. It keeps listening until you stop it or submit, and your typed text is preserved.",
      ],
    ],
  },
  {
    title: "For brokers & capital sources",
    items: [
      [
        "I'm a broker — how does this help me?",
        "Drop a client's deal in plain English and get instant CLTV, leverage, the likely capital path, and the exact missing items before you pick up the phone — then send a clean, structured scenario into GRCRM for routing to capital sources whose box fits.",
      ],
      [
        "I'm a capital source — how do I receive deals?",
        "Submit your lending box on the For Capital Sources page — states, lien positions, max LTV/CLTV, loan range, property types, programs, and overlays. When a California scenario matches, GRCRM routes it to you, structured and consent-backed.",
      ],
      [
        "Will I be spammed with leads?",
        "No. The model is match-first: structured scenarios are routed to capital sources whose stated box fits, not blasted to a list.",
      ],
    ],
  },
  {
    title: "Compliance & data",
    items: [
      [
        "Is my information shared without permission?",
        "No. Nothing is sent for review until you give explicit consent on the Site, and your consent is logged with the scenario.",
      ],
      [
        "Do you sell my personal information?",
        "No. We do not sell your personal information. See the Privacy Policy on our Legal & Privacy page for full detail, including your California (CCPA/CPRA) rights.",
      ],
      [
        "What AI does CADeed use?",
        "Language understanding is powered by Anthropic Claude, used only to read your description and extract facts. It does not compute the financial figures — that is deterministic TypeScript.",
      ],
      [
        "Do you lend in other states?",
        "CADeed focuses on California real estate scenarios.",
      ],
    ],
  },
];

export default function Faq() {
  return (
    <PageShell
      eyebrow="FAQ"
      title="Questions, answered."
      intro="The essentials about how CADeed works and what to expect — for borrowers, brokers, and capital sources."
    >
      <div className="space-y-8">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
              {g.title}
            </h2>
            <div className="glass-card divide-y divide-hairline rounded-card p-2 shadow-soft">
              {g.items.map(([q, a]) => (
                <details key={q} className="group p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold tracking-tight text-navy">
                    {q}
                    <Plus
                      size={18}
                      className="shrink-0 text-navy/40 transition-transform group-open:rotate-45"
                    />
                  </summary>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-navy-muted">{a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
