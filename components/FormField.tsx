"use client";

import { useId } from "react";

export type Tone = "light" | "dark";

export const inputClass = (tone: Tone = "light") =>
  tone === "dark"
    ? "w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-[16px] text-white outline-none transition-colors placeholder:text-white/50 focus:border-white/40"
    : "w-full rounded-xl border border-hairline bg-white/80 px-3.5 py-2.5 text-[16px] text-navy outline-none transition-colors placeholder:text-navy-muted/60 focus:border-navy/30";

interface ControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
}

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  tone?: Tone;
  className?: string;
  children: (control: ControlProps) => React.ReactNode;
}

/** Visible label linked to its control, plus optional hint and inline error. */
export default function Field({
  label,
  required,
  hint,
  error,
  tone = "light",
  className,
  children,
}: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  const dark = tone === "dark";
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={`mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide ${
          dark ? "text-white/75" : "text-navy-muted"
        }`}
      >
        {label}
        {required && (
          <span aria-hidden="true" className={dark ? "text-gold-soft" : "text-gold"}>
            {" "}
            *
          </span>
        )}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required ? true : undefined,
      })}
      {hint && (
        <p id={hintId} className={`mt-1 text-[12px] ${dark ? "text-white/60" : "text-navy-muted/80"}`}>
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errId}
          className={`mt-1 text-[12.5px] font-medium ${dark ? "text-red-300" : "text-red-600"}`}
        >
          {error}
        </p>
      )}
    </div>
  );
}
