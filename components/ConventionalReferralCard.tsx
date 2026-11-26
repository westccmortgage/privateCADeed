"use client";

import { useRef, useState } from "react";
import { Compass, ArrowUpRight, Check, ArrowRight, Send } from "lucide-react";
import { COMPANY, telHref } from "@/lib/company";
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
import type { ConventionalReferral, ExtractedScenario } from "@/lib/types";

// Conventional / agency channel (override in Netlify with NEXT_PUBLIC_CONVENTIONAL_URL).
const CONVENTIONAL_URL =
  process.env.NEXT_PUBLIC_CONVENTIONAL_URL || "https://westcoastcapitalmortgage.com";

export default function ConventionalReferralCard({
  referral,
  scenario,
}: {
  referral: ConventionalReferral;
  scenario: ExtractedScenario;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [consent, setConsent] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const [failure, setFailure] = useState<RequestFailure | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const inFlight = useRef(false);

  const errors = {
    name: form.name.trim() ? null : NAME_ERROR,
    email: isEmailValid(form.email) ? null : EMAIL_ERROR,
    phone: isPhoneValid(form.phone) ? null : PHONE_ERROR,
  };

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    if (inFlight.current) return;
    if (errors.name || errors.email || errors.phone || !consent) {
      setShowErrors(true);
      return;
    }
    inFlight.current = true;
    setSending(true);
    setFailure(null);
    try {
      await postJson("/api/conventional-referral", {
        ...form,
        consentGiven: consent,
        reasons: referral.reasons,
        extractedScenario: scenario,
      });
      setDone(true);
    } catch (err) {
      setFailure(err instanceof RequestFailure ? err : new RequestFailure("service", "unknown"));
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-gradient-to-br from-navy to-navy-soft p-6 text-white">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20">
          <Compass size={18} className="text-gold-soft" />
        </span>
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wide text-white/55">
            A better-fit path
          </p>
          <p className="text-[18px] font-semibold tracking-tight">{referral.headline}</p>
        </div>
      </div>

      <p className="mt-3 text-[14.5px] leading-relaxed text-white/80">{referral.message}</p>

      {referral.reasons.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {referral.reasons.map((r) => (
            <li
              key={r}
              className="flex items-start gap-2 text-[13.5px] leading-relaxed text-white/70"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              {r}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={CONVENTIONAL_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-navy transition-transform hover:-translate-y-0.5"
        >
          Talk to a conventional specialist <ArrowUpRight size={16} />
        </a>
        <a
          href={telHref(COMPANY.phoneOffice)}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/25 px-5 py-2.5 text-[14px] font-medium text-white/90 transition-colors hover:border-white/50"
        >
          Call {COMPANY.phoneOfficeDisplay}
        </a>
      </div>

      {/* Callback capture — consent-gated, tagged as a conventional referral */}
      <div className="mt-4 border-t border-white/10 pt-4">
        {done ? (
          <div className="flex items-start gap-3">
            <Check size={18} className="mt-0.5 shrink-0 text-emerald-300" />
            <p className="text-[14px] leading-relaxed text-white/90">
              Thanks — a licensed loan officer will reach out about conventional options.
              This is not an offer or a commitment to lend.
            </p>
          </div>
        ) : !showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="min-h-[44px] text-[13px] font-medium text-white/80 underline-offset-2 transition-colors hover:text-white hover:underline"
          >
            Prefer we call you? Request a callback →
          </button>
        ) : (
          <div className="text-left">
            <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-white/55">
              Request a callback
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" required tone="dark" error={showErrors ? errors.name : null}>
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
              <Field label="Email" required tone="dark" error={showErrors ? errors.email : null}>
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
              label="Phone (optional)"
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
            <label className="mt-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-white/75">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                aria-required="true"
                className="mt-0.5 h-5 w-5 shrink-0"
              />
              <span>
                I agree to be contacted by {COMPANY.legalName} about conventional financing
                options. This is not an offer or a commitment to lend. <span aria-hidden="true">*</span>
              </span>
            </label>
            {showErrors && !consent && (
              <p className="mt-1 text-[12.5px] font-medium text-red-300">
                Please tick the box to agree.
              </p>
            )}
            <FormError failure={failure} tone="dark" className="mt-2" />
            <button
              type="button"
              onClick={submit}
              disabled={sending}
              className={`mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition-transform ${
                sending
                  ? "cursor-not-allowed bg-white/30 text-white/60"
                  : "bg-gold text-navy hover:-translate-y-0.5"
              }`}
            >
              {sending ? "Sending…" : "Request a callback"}
              {sending ? <Send size={16} /> : <ArrowRight size={17} />}
            </button>
            <p className="mt-3 text-center text-[12.5px] leading-relaxed text-white/70">
              By sending, you agree we may contact you by phone or email about your request.{" "}
              <a href="/legal#privacy" className="underline underline-offset-2 hover:text-white">
                Privacy
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
