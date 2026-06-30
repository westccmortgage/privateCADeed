"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Sparkles, ArrowRight, Route, Gauge } from "lucide-react";

interface Chip {
  label: string;
  value: string;
}
interface DemoScenario {
  key: string;
  tab: string;
  text: string;
  chips: Chip[];
  metricLabel: string;
  metricValue: number;
  path: string;
  strength: "Strong" | "Moderate";
}

const SCENARIOS: DemoScenario[] = [
  {
    key: "second",
    tab: "2nd · construction",
    text: "Need $500K, 2nd position, mid-construction. First loan $3M, value $6M.",
    chips: [
      { label: "Value", value: "$6,000,000" },
      { label: "Existing 1st", value: "$3,000,000" },
      { label: "Requested", value: "$500,000" },
      { label: "Lien", value: "2nd" },
    ],
    metricLabel: "Combined LTV",
    metricValue: 58.3,
    path: "2nd Deed / Construction Completion",
    strength: "Moderate",
  },
  {
    key: "cashout",
    tab: "Cash-out",
    text: "$300K cash-out on an LA property worth $1.2M. I owe $520K.",
    chips: [
      { label: "Location", value: "Los Angeles" },
      { label: "Value", value: "$1,200,000" },
      { label: "Owe", value: "$520,000" },
      { label: "Cash-out", value: "$300,000" },
    ],
    metricLabel: "Combined LTV",
    metricValue: 68.3,
    path: "2nd Deed of Trust",
    strength: "Moderate",
  },
  {
    key: "flip",
    tab: "Fix & flip",
    text: "Flip in Sherman Oaks. Buy $900K, $150K rehab, ARV $1.35M, need $780K.",
    chips: [
      { label: "Purchase", value: "$900,000" },
      { label: "Rehab", value: "$150,000" },
      { label: "ARV", value: "$1,350,000" },
      { label: "Requested", value: "$780,000" },
    ],
    metricLabel: "Loan-to-ARV",
    metricValue: 57.8,
    path: "Fix & Flip / Bridge",
    strength: "Strong",
  },
  {
    key: "construction",
    tab: "Construction",
    text: "Bank declined my build. Need $600K to finish in San Diego. As-complete $1.5M.",
    chips: [
      { label: "Location", value: "San Diego" },
      { label: "Requested", value: "$600,000" },
      { label: "As-complete", value: "$1,500,000" },
      { label: "Lien", value: "1st" },
    ],
    metricLabel: "Loan-to-Value",
    metricValue: 40.0,
    path: "Construction Completion Capital",
    strength: "Strong",
  },
];

const TYPE_MS = 24;
const R = 52;
const C = 2 * Math.PI * R;
// Data particles that condense into the gauge when the result lands.
const PARTICLES = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return { x: Math.cos(a) * 78, y: Math.sin(a) * 78 };
});

export default function EngineDemo({ onTry }: { onTry?: (key: string) => void }) {
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "extract" | "result">("typing");
  const [metricNow, setMetricNow] = useState(0);
  const autoRef = useRef(true);

  // Cursor parallax tilt.
  const tiltX = useSpring(0, { stiffness: 120, damping: 14 });
  const tiltY = useSpring(0, { stiffness: 120, damping: 14 });

  const sc = SCENARIOS[active];

  useEffect(() => {
    setTyped("");
    setPhase("typing");
    const text = sc.text;
    let i = 0;
    const typer = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(typer);
    }, TYPE_MS);

    const base = text.length * TYPE_MS;
    const tExtract = setTimeout(() => setPhase("extract"), base + 250);
    const tResult = setTimeout(() => setPhase("result"), base + 950);
    const tNext = setTimeout(() => {
      if (autoRef.current) setActive((a) => (a + 1) % SCENARIOS.length);
    }, base + 4800);

    return () => {
      clearInterval(typer);
      clearTimeout(tExtract);
      clearTimeout(tResult);
      clearTimeout(tNext);
    };
  }, [active, sc.text]);

  useEffect(() => {
    if (phase !== "result") {
      setMetricNow(0);
      return;
    }
    const target = sc.metricValue;
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setMetricNow(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, active, sc.metricValue]);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tiltY.set(px * 6);
    tiltX.set(-py * 6);
  }
  function handleEnter() {
    autoRef.current = false;
  }
  function handleLeave() {
    autoRef.current = true;
    tiltX.set(0);
    tiltY.set(0);
  }

  const revealed = phase !== "typing";
  const result = phase === "result";
  const offset = C * (1 - Math.min(metricNow, 100) / 100);
  const cycleMs = sc.text.length * TYPE_MS + 4800;

  return (
    <div>
      {/* Scenario tabs with sliding highlight */}
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive(i)}
            className={`relative rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
              i === active ? "border-navy" : "border-hairline hover:border-navy/20"
            }`}
          >
            {i === active && (
              <motion.span
                layoutId="demoTabBg"
                className="absolute inset-0 rounded-full bg-navy"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className={`relative z-10 ${i === active ? "text-white" : "text-navy-soft"}`}>
              {s.tab}
            </span>
          </button>
        ))}
      </div>

      <motion.div
        onMouseEnter={handleEnter}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1200 }}
        className="glass-card overflow-hidden rounded-card shadow-lift [will-change:transform]"
      >
        {/* faux window bar */}
        <div className="flex items-center gap-2 border-b border-hairline bg-white/50 px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e5b3b0]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#e7d3a1]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#bcd6b5]" />
          <span className="ml-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-muted">
            <Sparkles size={12} className="text-gold" /> CADeed engine · live preview
          </span>
          {/* autoplay progress */}
          <div className="ml-auto h-0.5 w-16 overflow-hidden rounded-full bg-hairline">
            <motion.div
              key={active}
              className="h-full bg-gold"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: cycleMs / 1000, ease: "linear" }}
            />
          </div>
        </div>

        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* scan line while reading */}
          <AnimatePresence>
            {!result && (
              <motion.div
                initial={{ y: "-12%", opacity: 0 }}
                animate={{ y: "112%", opacity: [0, 0.6, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-transparent via-gold/15 to-transparent"
              />
            )}
          </AnimatePresence>

          {/* Left: command + extracted chips */}
          <div>
            <div className="rounded-2xl border border-hairline bg-white/70 p-4 sm:p-5">
              <p className="min-h-[3.2em] text-[16px] leading-relaxed text-navy sm:text-[17px]">
                {typed}
                {!result && (
                  <span className="ml-0.5 inline-block h-[1.05em] w-[2px] -translate-y-[1px] animate-pulse bg-navy/70 align-middle" />
                )}
              </p>
            </div>

            <p className="mt-5 mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-muted">
              Extracted
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {sc.chips.map((chip, i) => (
                <motion.div
                  key={`${sc.key}-${chip.label}`}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={
                    revealed
                      ? { opacity: 1, y: 0, scale: 1 }
                      : { opacity: 0, y: 10, scale: 0.96 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 22,
                    delay: revealed ? i * 0.08 : 0,
                  }}
                  className="rounded-xl border border-hairline bg-white/70 px-3.5 py-2.5"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-navy-muted">
                    {chip.label}
                  </p>
                  <p className="mt-0.5 text-[15px] font-semibold tracking-tight text-navy">
                    {chip.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: gauge + path */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative h-[150px] w-[150px]">
              {/* gold glow pulse on result */}
              <motion.div
                key={`glow-${sc.key}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={
                  result
                    ? { opacity: [0, 0.7, 0.25], scale: [0.85, 1.08, 1] }
                    : { opacity: 0, scale: 0.85 }
                }
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-2 rounded-full"
                style={{ boxShadow: "0 0 44px 6px rgba(200,154,60,0.4)" }}
              />

              {/* condensing data particles */}
              <AnimatePresence>
                {result &&
                  PARTICLES.map((p, i) => (
                    <motion.span
                      key={`p-${sc.key}-${i}`}
                      initial={{ x: p.x, y: p.y, opacity: 0, scale: 0.5 }}
                      animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: 1 }}
                      transition={{ duration: 0.85, delay: i * 0.04, ease: "easeIn" }}
                      className="absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-gold"
                    />
                  ))}
              </AnimatePresence>

              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r={R} fill="none" stroke="#E5ECF5" strokeWidth="9" />
                <circle
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke="#C89A3C"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-navy-muted">
                  <Gauge size={12} /> {sc.metricLabel}
                </span>
                <motion.span
                  key={`num-${sc.key}-${result}`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: result ? [0.9, 1.06, 1] : 0.9 }}
                  transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                  className="text-[30px] font-semibold tracking-tight text-navy"
                >
                  {result ? metricNow.toFixed(1) : "0.0"}%
                </motion.span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key={sc.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="mt-5 w-full rounded-2xl border border-navy/10 bg-navy p-4 text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                      <Route size={14} className="text-gold-soft" />
                    </span>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-white/55">
                      Likely capital path
                    </p>
                  </div>
                  <p className="mt-2 text-[16px] font-semibold leading-tight tracking-tight">
                    {sc.path}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      sc.strength === "Strong"
                        ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-200"
                        : "border-amber-300/40 bg-amber-400/15 text-amber-100"
                    }`}
                  >
                    {sc.strength}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* footer CTA */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-hairline bg-white/50 px-6 py-4 sm:flex-row sm:px-8">
          <p className="text-[13px] text-navy-muted">
            A live preview — your real numbers are computed the same deterministic way.
          </p>
          <button
            type="button"
            onClick={() => onTry?.(sc.key)}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-[14px] font-medium text-white/95 transition-colors hover:bg-navy-soft"
          >
            Describe your own deal
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
