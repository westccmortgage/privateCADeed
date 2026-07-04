"use client";

import { useState } from "react";
import { Send, Check, ArrowRight, ExternalLink } from "lucide-react";
import { COMPANY, telHref } from "@/lib/company";
import { useLocale } from "@/lib/i18n/LocaleProvider";

// Built-in scheduling link (override in Netlify with NEXT_PUBLIC_BOOKING_URL).
const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ||
  "https://calendly.com/westccmortgage/deal-review";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-[14px] text-white outline-none transition-colors placeholder:text-white/45 focus:border-white/35";

export default function BookReview() {
  const { t } = useLocale();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const emailValid = /\S+@\S+\.\S+/.test(form.email);
  const canSend = !!form.name.trim() && emailValid && !sending;

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/book-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? t.book.error);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.book.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-8">
      {/* Scheduler link — opens Calendly in a new tab (no giant inline embed) */}
      <div className="flex flex-col items-center gap-4 text-center">
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-navy shadow-lift transition-transform hover:-translate-y-0.5"
        >
          {t.book.pickTime} <ExternalLink size={16} />
        </a>

        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-[13px] font-medium text-white/70 underline-offset-2 hover:text-white hover:underline"
          >
            {t.book.preferCallback}
          </button>
        )}
      </div>

      {/* Callback request fallback */}
      {showForm && (
        <div className="mx-auto mt-6 max-w-md border-t border-white/10 pt-6 text-left">
          {done ? (
            <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-5">
              <Check size={18} className="mt-0.5 shrink-0 text-emerald-300" />
              <p className="text-[14px] leading-relaxed text-white/90">
                {t.book.done}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-center text-[13px] font-medium uppercase tracking-wide text-white/55">
                {t.book.requestCallback}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder={t.book.fieldName}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
                <input
                  className={inputClass}
                  type="email"
                  placeholder={t.book.fieldEmail}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <input
                className={`${inputClass} mt-3`}
                placeholder={t.book.fieldPhone}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
              <textarea
                className={`${inputClass} mt-3 min-h-[88px] resize-y`}
                placeholder={t.book.fieldMessage}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
              />
              {error && <p className="mt-2 text-[13px] font-medium text-red-300">{error}</p>}
              <button
                type="button"
                onClick={submit}
                disabled={!canSend}
                className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition-transform ${
                  canSend
                    ? "bg-white text-navy hover:-translate-y-0.5"
                    : "cursor-not-allowed bg-white/40 text-navy/60"
                }`}
              >
                {sending ? t.book.sending : t.book.requestCallback}
                {sending ? <Send size={16} /> : <ArrowRight size={17} />}
              </button>
            </>
          )}
        </div>
      )}

      <p className="mt-5 text-center text-[13px] text-white/60">
        {t.book.orCall}{" "}
        <a
          href={telHref(COMPANY.phoneOffice)}
          className="font-medium text-white/80 hover:text-white"
        >
          {COMPANY.phoneOffice}
        </a>{" "}
        · {COMPANY.legalName} · NMLS #{COMPANY.nmls}
      </p>
    </div>
  );
}
