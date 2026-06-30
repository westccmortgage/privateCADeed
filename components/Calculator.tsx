"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Scale } from "lucide-react";
import { parseNum } from "@/lib/format";
import { COMPLIANCE_NOTE } from "@/lib/types";

export interface CalcField {
  key: string;
  label: string;
  adorn?: "$" | "%";
  placeholder?: string;
  hint?: string;
}
export interface CalcRow {
  label: string;
  value: string;
  primary?: boolean;
}
export interface CalcOutput {
  rows: CalcRow[];
  note?: string;
  tone?: "neutral" | "good" | "warn";
}

const TONE: Record<NonNullable<CalcOutput["tone"]>, string> = {
  neutral: "border-hairline bg-white/70 text-navy-soft",
  good: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
  warn: "border-amber-200 bg-amber-50/70 text-amber-900",
};

const inputClass =
  "w-full rounded-xl border border-hairline bg-white/80 py-2.5 pl-7 pr-3 text-[15px] text-navy outline-none transition-colors placeholder:text-navy-muted/50 focus:border-navy/30";

export default function Calculator({
  fields,
  compute,
  ctaHref = "/",
  ctaText = "Run this as a full scenario",
}: {
  fields: CalcField[];
  compute: (values: Record<string, number | null>) => CalcOutput;
  ctaHref?: string;
  ctaText?: string;
}) {
  const [vals, setVals] = useState<Record<string, string>>({});

  const parsed: Record<string, number | null> = {};
  for (const f of fields) parsed[f.key] = parseNum(vals[f.key]);
  const out = compute(parsed);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* Inputs */}
      <div className="glass-card rounded-card p-6 shadow-soft sm:p-7">
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-navy-muted">
                {f.label}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-navy-muted/70">
                  {f.adorn ?? "#"}
                </span>
                <input
                  inputMode="decimal"
                  placeholder={f.placeholder}
                  value={vals[f.key] ?? ""}
                  onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
                  className={inputClass}
                />
              </div>
              {f.hint && (
                <p className="mt-1 text-[12px] text-navy-muted/80">{f.hint}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <motion.div
          layout
          className="glass-card rounded-card p-6 shadow-lift sm:p-7"
        >
          <div className="space-y-3">
            {out.rows.map((r) => (
              <div
                key={r.label}
                className={`flex items-baseline justify-between gap-4 ${
                  r.primary ? "border-b border-hairline pb-3" : ""
                }`}
              >
                <span
                  className={`text-[13.5px] ${
                    r.primary ? "font-semibold text-navy" : "text-navy-muted"
                  }`}
                >
                  {r.label}
                </span>
                <span
                  className={`tracking-tight ${
                    r.primary
                      ? "text-[28px] font-semibold text-navy"
                      : "text-[16px] font-medium text-navy-soft"
                  }`}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>

          {out.note && (
            <div className={`mt-5 rounded-2xl border p-4 text-[13.5px] leading-relaxed ${TONE[out.tone ?? "neutral"]}`}>
              {out.note}
            </div>
          )}

          <a
            href={ctaHref}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-[14px] font-medium text-white/95 transition-colors hover:bg-navy-soft"
          >
            {ctaText}
            <ArrowRight size={16} />
          </a>
        </motion.div>

        <div className="flex items-start gap-3 rounded-2xl border border-hairline bg-white/50 px-5 py-4">
          <Scale size={15} className="mt-0.5 shrink-0 text-navy-muted" />
          <p className="text-[12px] leading-relaxed text-navy-muted">{COMPLIANCE_NOTE}</p>
        </div>
      </div>
    </div>
  );
}
