"use client";

import { useRef, useState } from "react";
import { Send, Check, ArrowRight, ExternalLink } from "lucide-react";
import { COMPANY, telHref } from "@/lib/company";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  EMAIL_ERROR,
  NAME_ERROR,
  PHONE_ERROR,
  PHONE_HINT,
  PHONE_PATTERN,
  RequestFailure,
  isEmailValid,
  isPhoneValid,
  postJson,
} from "@/lib/forms";
import Field, { inputClass } from "@/components/FormField";
import FormError from "@/components/FormError";

// Built-in scheduling link (override in Netlify with NEXT_PUBLIC_BOOKING_URL).
const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ||
  "https://calendly.com/westccmortgage/deal-review";

export default function BookReview() {
  const { t } = useLocale();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState<RequestFailure | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const inFlight = useRef(false);

  const errors = {
    name: form.name.trim() ? null : NAME_ERROR,
    email: isEmailValid(form.email) ? null : EMAIL_ERROR,
    phone: isPhoneValid(form.phone) ? null : PHONE_ERROR,
  };
  const hasErrors = !!(errors.name || errors.email || errors.phone);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    inFlight.current = true;
    setSending(true);
    setFailure(null);
    try {
      await postJson("/api/book-review", form);
      setDone(true);
    } catch (err) {
      setFailure(err instanceof RequestFailure ? err : new RequestFailure("service", "unknown"));
    } finally {
      inFlight.current = false;
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
            aria-expanded={showForm}
            className="min-h-[44px] px-3 text-[14px] font-medium text-white/80 underline-offset-2 hover:text-white hover:underline"
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
            <form onSubmit={submit} noValidate>
              <p className="mb-4 text-center text-[13px] font-medium uppercase tracking-wide text-white/65">
                {t.book.requestCallback}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t.book.fieldName} required tone="dark" error={showErrors ? errors.name : null}>
                  {(c) => (
                    <input
                      {...c}
                      className={inputClass("dark")}
                      name="name"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  )}
                </Field>
                <Field label={t.book.fieldEmail} required tone="dark" error={showErrors ? errors.email : null}>
                  {(c) => (
                    <input
                      {...c}
                      className={inputClass("dark")}
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  )}
                </Field>
              </div>
              <Field
                label={t.book.fieldPhone}
                tone="dark"
                className="mt-3"
                hint={PHONE_HINT}
                error={showErrors ? errors.phone : null}
              >
                {(c) => (
                  <input
                    {...c}
                    className={inputClass("dark")}
                    type="tel"
                    name="phone"
                    inputMode="tel"
                    autoComplete="tel"
                    pattern={PHONE_PATTERN}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                )}
              </Field>
              <Field label={t.book.fieldMessage} tone="dark" className="mt-3">
                {(c) => (
                  <textarea
                    {...c}
                    className={`${inputClass("dark")} min-h-[88px] resize-y`}
                    name="message"
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                  />
                )}
              </Field>
              <FormError failure={failure} lead={t.book.errorService} tone="dark" className="mt-3" />
              <button
                type="submit"
                disabled={sending}
                className={`mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition-transform ${
                  sending
                    ? "cursor-not-allowed bg-white/40 text-navy/60"
                    : "bg-white text-navy hover:-translate-y-0.5"
                }`}
              >
                {sending ? t.book.sending : t.book.requestCallback}
                {sending ? <Send size={16} /> : <ArrowRight size={17} />}
              </button>
              <p className="mt-3 text-center text-[12.5px] leading-relaxed text-white/70">
                {t.book.consent}{" "}
                <a href="/legal#privacy" className="underline underline-offset-2 hover:text-white">
                  {t.book.privacy}
                </a>
              </p>
            </form>
          )}
        </div>
      )}

      <p className="mt-5 text-center text-[13px] leading-relaxed text-white/70">
        {t.book.orCall}{" "}
        <a
          href={telHref(COMPANY.phoneOffice)}
          className="whitespace-nowrap font-medium text-white/90 hover:text-white"
        >
          {COMPANY.phoneOfficeDisplay}
        </a>
        <br />
        {COMPANY.licenseLine}
      </p>
    </div>
  );
}
