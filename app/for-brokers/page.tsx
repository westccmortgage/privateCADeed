import type { Metadata } from "next";
import { Layers, Send, Gauge, ArrowRight } from "lucide-react";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "For Brokers — CADeed.com",
  description:
    "Qualify and package California private-capital scenarios in minutes, then route them to matched capital sources through GRCRM.",
};

const VALUE = [
  {
    icon: Gauge,
    title: "Qualify faster",
    body: "Drop a client's deal in plain English and get instant CLTV, leverage, capital path, and the exact missing items — before you pick up the phone.",
  },
  {
    icon: Send,
    title: "Package & route",
    body: "Send a clean, structured scenario into GRCRM for routing to capital sources whose box fits. No spray-and-pray.",
  },
  {
    icon: Layers,
    title: "Work your pipeline",
    body: "Use it per client, on repeat. The engine asks the next best question so nothing is missed for review.",
  },
];

export default function ForBrokers() {
  return (
    <PageShell
      eyebrow="For Brokers"
      title="Qualify, package, and route — in minutes."
      intro="CADeed turns a messy deal description into a structured, calculated scenario your capital sources can actually act on."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {VALUE.map((v) => (
          <div key={v.title} className="glass-card rounded-card p-6 shadow-soft">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
              <v.icon size={20} />
            </span>
            <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-navy">{v.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-navy-muted">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-[15px] font-medium text-white/95 transition-colors hover:bg-navy-soft"
        >
          Submit a client deal
          <ArrowRight size={17} />
        </a>
        <a
          href="/for-capital-sources"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-hairline bg-white/70 px-6 py-3 text-[15px] font-medium text-navy transition-colors hover:border-navy/20"
        >
          Are you a capital source?
        </a>
      </div>
    </PageShell>
  );
}
