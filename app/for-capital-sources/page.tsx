"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Check, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { COMPLIANCE_DISCLAIMER } from "@/lib/compliance-rules";
import Field, { inputClass as fieldInputClass } from "@/components/FormField";
import FormError from "@/components/FormError";
import {
  EMAIL_ERROR,
  PHONE_ERROR,
  PHONE_HINT,
  PHONE_PATTERN,
  RequestFailure,
  isEmailValid,
  isPhoneValid,
  postJson,
} from "@/lib/forms";

const PROPERTY_TYPES = [
  "SFR (1-unit)",
  "2–4 units",
  "Multifamily (5+)",
  "Mixed-use",
  "Commercial",
  "Land",
];
const PROGRAMS = [
  "Bridge",
  "Cash-out",
  "Fix & flip",
  "Construction",
  "2nd deed of trust",
];

const inputClass = fieldInputClass();

interface FormState {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  states: string;
  counties: string;
  lienPositions: string;
  maxLTV: string;
  maxCLTV: string;
  minLoanAmount: string;
  maxLoanAmount: string;
  propertyTypes: string[];
  programs: string[];
  ownerOccupiedAllowed: string;
  businessPurposeOnly: string;
  expectedResponseTime: string;
  notes: string;
}

const EMPTY: FormState = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  states: "CA",
  counties: "",
  lienPositions: "",
  maxLTV: "",
  maxCLTV: "",
  minLoanAmount: "",
  maxLoanAmount: "",
  propertyTypes: [],
  programs: [],
  ownerOccupiedAllowed: "",
  businessPurposeOnly: "",
  expectedResponseTime: "",
  notes: "",
};

function toBoolOrNull(v: string): boolean | null {
  if (v === "yes") return true;
  if (v === "no") return false;
  return null;
}

export default function ForCapitalSources() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failure, setFailure] = useState<RequestFailure | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const inFlight = useRef(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function toggle(key: "propertyTypes" | "programs", value: string) {
    setForm((f) => {
      const list = f[key];
      return {
        ...f,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  }

  const errors = {
    companyName: form.companyName.trim() ? null : "Please enter your company name.",
    email: isEmailValid(form.email) ? null : EMAIL_ERROR,
    phone: isPhoneValid(form.phone) ? null : PHONE_ERROR,
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current || submitted) return;
    if (errors.companyName || errors.email || errors.phone) {
      setShowErrors(true);
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setFailure(null);
    setMessage(null);
    try {
      const data = await postJson<{ message?: string }>("/api/capital-source", {
        ...form,
        states: form.states,
        counties: form.counties,
        maxLTV: form.maxLTV,
        maxCLTV: form.maxCLTV,
        minLoanAmount: form.minLoanAmount,
        maxLoanAmount: form.maxLoanAmount,
        ownerOccupiedAllowed: toBoolOrNull(form.ownerOccupiedAllowed),
        businessPurposeOnly: toBoolOrNull(form.businessPurposeOnly),
      });
      setSubmitted(true);
      setMessage(data.message ?? "Profile received.");
    } catch (err) {
      setFailure(err instanceof RequestFailure ? err : new RequestFailure("service", "unknown"));
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div id="top" className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-engine px-5 sm:px-8">
        <section className="pt-14 sm:pt-20">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-muted transition-colors hover:text-navy"
          >
            <ArrowLeft size={15} /> Back to the terminal
          </a>
          <div className="mt-6 max-w-2xl">
            <span className="inline-block rounded-full border border-hairline bg-white/60 px-3.5 py-1.5 text-[12.5px] font-medium tracking-wide text-navy-muted">
              For Capital Sources
            </span>
            <h1 className="mt-5 text-balance text-[30px] font-semibold leading-[1.1] tracking-tight text-navy sm:text-[40px]">
              Receive structured private lending scenarios that match your lending box.
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-navy-muted">
              Tell us your box once. When a scenario fits, our team routes it to you —
              structured, calculated, and consent-backed. No mass lead lists.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-3xl pb-8">
          {submitted ? (
            <div className="glass-card rounded-card p-8 shadow-lift">
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <Check size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <p className="text-[14px] leading-relaxed text-emerald-900">{message}</p>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="glass-card space-y-6 rounded-card p-6 shadow-lift sm:p-8">
              {/* Contact */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company name" required error={showErrors ? errors.companyName : null}>
                  {(c) => (
                  <input
{...c}
                    className={inputClass}
                    name="organization"
                    autoComplete="organization"
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                  />
                  )}
                </Field>
                <Field label="Contact person" >
                  {(c) => (
                  <input
{...c}
                    className={inputClass}
                    name="name"
                    autoComplete="name"
                    value={form.contactPerson}
                    onChange={(e) => set("contactPerson", e.target.value)}
                  />
                  )}
                </Field>
                <Field label="Email" required error={showErrors ? errors.email : null}>
                  {(c) => (
                  <input
{...c}
                    className={inputClass}
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                  )}
                </Field>
                <Field label="Phone" hint={PHONE_HINT} error={showErrors ? errors.phone : null}>
                  {(c) => (
                  <input
{...c}
                    className={inputClass}
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
              </div>

              {/* Geography */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="States (comma separated)" >
                  {(c) => (
                  <input
{...c}
                    className={inputClass}
                    value={form.states}
                    onChange={(e) => set("states", e.target.value)}
                    placeholder="CA"
                  />
                  )}
                </Field>
                <Field label="Counties (optional)" >
                  {(c) => (
                  <input
{...c}
                    className={inputClass}
                    value={form.counties}
                    onChange={(e) => set("counties", e.target.value)}
                    placeholder="Los Angeles, Orange, San Diego…"
                  />
                  )}
                </Field>
              </div>

              {/* Box */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Lien position" >
                  {(c) => (
                  <select
{...c}
                    className={inputClass}
                    value={form.lienPositions}
                    onChange={(e) => set("lienPositions", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="1st">1st only</option>
                    <option value="2nd">2nd only</option>
                    <option value="Both">Both</option>
                  </select>
                  )}
                </Field>
                <Field label="Max LTV (%)" >
                  {(c) => (
                  <input
{...c}
                    className={inputClass}
                    inputMode="numeric"
                    value={form.maxLTV}
                    onChange={(e) => set("maxLTV", e.target.value)}
                  />
                  )}
                </Field>
                <Field label="Max CLTV (%)" >
                  {(c) => (
                  <input
{...c}
                    className={inputClass}
                    inputMode="numeric"
                    value={form.maxCLTV}
                    onChange={(e) => set("maxCLTV", e.target.value)}
                  />
                  )}
                </Field>
                <Field label="Min loan amount ($)" >
                  {(c) => (
                  <input
{...c}
                    className={inputClass}
                    inputMode="numeric"
                    value={form.minLoanAmount}
                    onChange={(e) => set("minLoanAmount", e.target.value)}
                  />
                  )}
                </Field>
                <Field label="Max loan amount ($)" >
                  {(c) => (
                  <input
{...c}
                    className={inputClass}
                    inputMode="numeric"
                    value={form.maxLoanAmount}
                    onChange={(e) => set("maxLoanAmount", e.target.value)}
                  />
                  )}
                </Field>
                <Field label="Expected response time" >
                  {(c) => (
                  <select
{...c}
                    className={inputClass}
                    value={form.expectedResponseTime}
                    onChange={(e) => set("expectedResponseTime", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="Same day">Same day</option>
                    <option value="24 hours">Within 24 hours</option>
                    <option value="48 hours">Within 48 hours</option>
                    <option value="2-3 days">2–3 days</option>
                  </select>
                  )}
                </Field>
              </div>

              {/* Property types */}
              <div role="group" aria-labelledby="cs-proptypes">
                <p id="cs-proptypes" className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-navy-muted">Property types</p>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      active={form.propertyTypes.includes(t)}
                      onClick={() => toggle("propertyTypes", t)}
                    />
                  ))}
                </div>
              </div>

              {/* Programs */}
              <div role="group" aria-labelledby="cs-programs">
                <p id="cs-programs" className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-navy-muted">Programs</p>
                <div className="flex flex-wrap gap-2">
                  {PROGRAMS.map((p) => (
                    <Chip
                      key={p}
                      label={p}
                      active={form.programs.includes(p)}
                      onClick={() => toggle("programs", p)}
                    />
                  ))}
                </div>
              </div>

              {/* Flags */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Owner-occupied allowed?" >
                  {(c) => (
                  <select
{...c}
                    className={inputClass}
                    value={form.ownerOccupiedAllowed}
                    onChange={(e) => set("ownerOccupiedAllowed", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  )}
                </Field>
                <Field label="Business-purpose only?" >
                  {(c) => (
                  <select
{...c}
                    className={inputClass}
                    value={form.businessPurposeOnly}
                    onChange={(e) => set("businessPurposeOnly", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  )}
                </Field>
              </div>

              <Field label="Notes" >
                {(c) => (
                <textarea
{...c}
                  className={`${inputClass} min-h-[96px] resize-y`}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Anything else about your box, overlays, or process…"
                />
                )}
              </Field>

              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold text-white transition-all sm:w-auto ${
                  submitting
                    ? "cursor-not-allowed bg-navy/40"
                    : "bg-navy shadow-soft hover:-translate-y-0.5 hover:bg-navy-soft"
                }`}
              >
                <Send size={16} />
                {submitting ? "Submitting…" : "Submit lending box"}
              </button>

              <FormError failure={failure} />

              <p className="text-[12.5px] leading-relaxed text-navy-muted">
                By sending, you agree we may contact you by phone or email about your request.{" "}
                <a href="/legal#privacy" className="underline underline-offset-2 hover:text-navy">
                  Privacy
                </a>
              </p>

              <p className="text-[12px] leading-relaxed text-navy-muted/80">
                {COMPLIANCE_DISCLAIMER}
              </p>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[44px] rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${
        active
          ? "border-navy bg-navy text-white"
          : "border-hairline bg-white/70 text-navy-soft hover:border-navy/20"
      }`}
    >
      {label}
    </button>
  );
}
