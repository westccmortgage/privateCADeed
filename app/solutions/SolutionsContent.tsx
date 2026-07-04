"use client";

import { ArrowRight, RefreshCw, Hammer, Building, Layers } from "lucide-react";
import PageShell from "@/components/PageShell";
import { useLocale } from "@/lib/i18n/LocaleProvider";

// Static per-item metadata (ids + icons + prefill keys). Order matches the
// dictionary's solutions.items: cash-out, fix-flip, construction, second.
const META = [
  { id: "cash-out", icon: RefreshCw, startKey: "cashout" },
  { id: "fix-flip", icon: Hammer, startKey: "flip" },
  { id: "construction", icon: Building, startKey: "construction" },
  { id: "second", icon: Layers, startKey: "second" },
] as const;

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

export default function SolutionsContent() {
  const { t } = useLocale();
  const s = t.solutions;

  return (
    <PageShell eyebrow={s.eyebrow} title={s.title} intro={s.intro}>
      {/* Quick jump */}
      <nav className="mb-8 flex flex-wrap gap-2">
        {META.map((m, i) => {
          const Icon = m.icon;
          return (
            <a
              key={m.id}
              href={`#${m.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/70 px-4 py-2 text-[13.5px] font-medium text-navy-soft transition-colors hover:border-navy/20 hover:text-navy"
            >
              <Icon size={15} className="text-gold" />
              {s.items[i].title}
            </a>
          );
        })}
      </nav>

      <div className="space-y-5">
        {META.map((m, i) => {
          const item = s.items[i];
          const Icon = m.icon;
          return (
            <article
              key={m.id}
              id={m.id}
              className="glass-card scroll-mt-24 rounded-card p-6 shadow-soft sm:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Icon size={22} />
                </span>
                <div>
                  <h2 className="text-[21px] font-semibold tracking-tight text-navy">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-[15px] font-medium text-navy-soft">{item.summary}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {item.plain.map((p, j) => (
                  <p key={j} className="text-[14.5px] leading-relaxed text-navy-muted">
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <MiniList title={s.whenItFits} items={item.fits} />
                <MiniList title={s.whatLenderLooksAt} items={item.looksAt} />
              </div>

              <a
                href={`/?start=${m.startKey}#top`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-navy-soft"
              >
                {s.describeThisDeal}
                <ArrowRight size={16} />
              </a>
            </article>
          );
        })}
      </div>

      {/* Reassurance + next steps */}
      <div className="glass-card mt-8 rounded-card p-6 shadow-soft sm:p-8">
        <h2 className="text-[17px] font-semibold tracking-tight text-navy">
          {s.stillUnsureTitle}
        </h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-navy-muted">{s.stillUnsureBody}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="/#top"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-navy-soft"
          >
            {s.describeYourDeal}
            <ArrowRight size={16} />
          </a>
          <a
            href="/resources"
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/70 px-5 py-2.5 text-[14px] font-semibold text-navy transition-colors hover:border-navy/20"
          >
            {s.learnBasics}
          </a>
        </div>
      </div>
    </PageShell>
  );
}
