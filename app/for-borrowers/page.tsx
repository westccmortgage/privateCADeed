import type { Metadata } from "next";
import { MessageSquare, Calculator, ShieldCheck, ArrowRight } from "lucide-react";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "For Borrowers — CADeed.com",
  description:
    "Describe your California real estate deal in plain English. See the likely private capital path in seconds — no application, no obligation.",
};

const STEPS = [
  {
    icon: MessageSquare,
    title: "Describe it your way",
    body: "Type or speak your deal in plain English. No long form, no 'Get a Quote'. The engine asks one smart question at a time.",
  },
  {
    icon: Calculator,
    title: "See the structure & math",
    body: "Instant LTV/CLTV, equity, likely capital path, and what's missing — calculated, never guessed.",
  },
  {
    icon: ShieldCheck,
    title: "Send for review on your terms",
    body: "Only when you consent, your structured scenario goes to a licensed professional and matched capital sources.",
  },
];

export default function ForBorrowers() {
  return (
    <PageShell
      eyebrow="For Borrowers"
      title="Your deal, understood in seconds."
      intro="CADeed maps the private capital path for your California property — no application form, no obligation, no pressure."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.title} className="glass-card rounded-card p-6 shadow-soft">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
              <s.icon size={20} />
            </span>
            <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-navy">{s.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-navy-muted">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-[15px] font-medium text-white/95 transition-colors hover:bg-navy-soft"
        >
          Describe your deal
          <ArrowRight size={17} />
        </a>
        <a
          href="/tools"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-hairline bg-white/70 px-6 py-3 text-[15px] font-medium text-navy transition-colors hover:border-navy/20"
        >
          Try the calculators
        </a>
      </div>
    </PageShell>
  );
}
