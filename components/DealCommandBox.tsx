"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Mic, ChevronDown, Sparkles, Square, MicOff } from "lucide-react";
import { DEAL_EXAMPLES, HERO_PLACEHOLDER } from "@/lib/examples";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface DealCommandBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  placeholder?: string;
  showExampleHint?: boolean;
}

// --- Minimal Web Speech API typings (avoid `any`) ---------------------------
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onstart: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type MicStatus = "idle" | "listening" | "denied" | "unavailable";

function getSpeechCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function DealCommandBox({
  value,
  onChange,
  onSubmit,
  loading,
  placeholder,
  showExampleHint = true,
}: DealCommandBoxProps) {
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldKeepListeningRef = useRef(false); // survives re-renders / stale closures
  const manualStopRef = useRef(false);
  const runningRef = useRef(false);
  const baseTextRef = useRef(""); // text present before / between dictation sessions
  const sessionFinalRef = useRef(""); // finalized transcript for the active session
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);

  // Keep a live ref to the current value so a fresh dictation session appends
  // to whatever is already typed, without recreating handlers.
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Auto-grow the textarea.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 260)}px`;
  }, [value]);

  // Detect speech support on the client.
  useEffect(() => {
    if (!getSpeechCtor()) setMicStatus("unavailable");
  }, []);

  // Close the example menu on outside click.
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const composeValue = useCallback((interim: string) => {
    // Preserve the user's already-typed text verbatim; only normalize the
    // dictated portion, then join with a single separating space.
    const dictation = [sessionFinalRef.current, interim]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");
    const base = baseTextRef.current;
    if (base && dictation) return `${base} ${dictation}`;
    return base || dictation;
  }, []);

  const beginSession = useCallback(() => {
    const Ctor = getSpeechCtor();
    if (!Ctor || runningRef.current) return;
    sessionFinalRef.current = ""; // defensive: each instance owns one session

    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      runningRef.current = true;
      setMicStatus("listening");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const transcript = res[0]?.transcript ?? "";
        if (res.isFinal) final += transcript;
        else interim += transcript;
      }
      if (final) {
        sessionFinalRef.current = `${sessionFinalRef.current} ${final}`.trim();
      }
      onChange(composeValue(interim));
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        // Permission denied — stop for good and surface a clean message.
        shouldKeepListeningRef.current = false;
        runningRef.current = false;
        setMicStatus("denied");
        return;
      }
      // "no-speech", "aborted", "network" etc. — let onend decide on a restart.
    };

    recognition.onend = () => {
      runningRef.current = false;
      // Fold the finalized session text into the base so it always persists.
      baseTextRef.current = composeValue("");
      sessionFinalRef.current = "";

      if (shouldKeepListeningRef.current && !manualStopRef.current) {
        // Browser ended recognition automatically (e.g. a pause). Restart with
        // a FRESH instance — reusing the just-ended one can throw
        // InvalidStateError or replay buffered results (duplicated text).
        clearRestartTimer();
        restartTimerRef.current = setTimeout(() => {
          if (shouldKeepListeningRef.current) beginSession();
        }, 250);
      } else {
        setMicStatus("idle");
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      runningRef.current = true; // synchronous guard against a double-start race
    } catch {
      // start() can throw if called too quickly; retry shortly.
      runningRef.current = false;
      clearRestartTimer();
      restartTimerRef.current = setTimeout(() => beginSession(), 300);
    }
  }, [clearRestartTimer, composeValue, onChange]);

  const startListening = useCallback(() => {
    if (micStatus === "unavailable" || shouldKeepListeningRef.current) return;
    manualStopRef.current = false;
    shouldKeepListeningRef.current = true;
    baseTextRef.current = valueRef.current.trim();
    sessionFinalRef.current = "";
    beginSession();
  }, [beginSession, micStatus]);

  const stopListening = useCallback(() => {
    manualStopRef.current = true;
    shouldKeepListeningRef.current = false;
    clearRestartTimer();
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        /* no-op */
      }
    }
    runningRef.current = false;
    setMicStatus((s) => (s === "denied" || s === "unavailable" ? s : "idle"));
  }, [clearRestartTimer]);

  const toggleDictation = useCallback(() => {
    if (shouldKeepListeningRef.current) stopListening();
    else startListening();
  }, [startListening, stopListening]);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;
      manualStopRef.current = true;
      clearRestartTimer();
      const rec = recognitionRef.current;
      if (rec) {
        rec.onresult = null;
        rec.onend = null;
        rec.onerror = null;
        rec.onstart = null;
        try {
          rec.abort();
        } catch {
          /* no-op */
        }
      }
    };
  }, [clearRestartTimer]);

  const handleSubmit = useCallback(() => {
    if (shouldKeepListeningRef.current) stopListening(); // stop dictation on submit
    onSubmit();
  }, [onSubmit, stopListening]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (value.trim() && !loading) handleSubmit();
    }
  }

  const listening = micStatus === "listening";
  const canSubmit = value.trim().length > 0 && !loading;

  return (
    <div className="relative w-full">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card rounded-card p-2.5 shadow-lift"
      >
        <div className="rounded-[18px] bg-white/60 p-4 sm:p-5">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder={placeholder ?? HERO_PLACEHOLDER}
            className="block w-full resize-none border-0 bg-transparent text-[17px] leading-relaxed text-navy outline-none placeholder:text-navy-muted/70 sm:text-[18px]"
          />

          {!value && showExampleHint && (
            <p className="mt-1 select-none text-[13px] italic text-navy-muted/70">
              {t.commandBox.exampleHint}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            {/* Left: try an example */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white/70 px-3 py-2 text-[13px] font-medium text-navy-soft transition-colors hover:border-navy/20 hover:text-navy"
              >
                <Sparkles size={15} className="text-gold" />
                {t.commandBox.tryExample}
                <ChevronDown
                  size={15}
                  className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute bottom-full left-0 z-20 mb-2 w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-hairline bg-white/95 shadow-lift backdrop-blur"
                  >
                    {DEAL_EXAMPLES.map((ex, i) => (
                      <button
                        key={ex.text}
                        type="button"
                        onClick={() => {
                          onChange(ex.text);
                          setMenuOpen(false);
                          textareaRef.current?.focus();
                        }}
                        className="flex w-full flex-col items-start gap-0.5 border-b border-hairline/70 px-4 py-3 text-left last:border-0 hover:bg-canvas"
                      >
                        <span className="text-[13px] font-semibold text-navy">
                          {t.commandBox.exampleLabels[i] ?? ex.label}
                        </span>
                        <span className="text-[12.5px] leading-snug text-navy-muted">
                          {ex.text}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: mic + submit */}
            <div className="flex items-center gap-2">
              {micStatus !== "unavailable" && (
                <button
                  type="button"
                  onClick={toggleDictation}
                  aria-label={listening ? t.commandBox.ariaStop : t.commandBox.ariaDictate}
                  aria-pressed={listening}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                    listening
                      ? "border-gold bg-gold/15 text-gold"
                      : micStatus === "denied"
                        ? "border-red-200 bg-red-50 text-red-500"
                        : "border-hairline bg-white/70 text-navy-soft hover:text-navy"
                  }`}
                >
                  {listening && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-gold/20" />
                  )}
                  {micStatus === "denied" ? (
                    <MicOff size={18} />
                  ) : listening ? (
                    <Square size={16} />
                  ) : (
                    <Mic size={18} />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-label={t.commandBox.ariaSubmit}
                className={`flex h-11 w-11 items-center justify-center rounded-full text-white transition-all ${
                  canSubmit
                    ? "bg-navy shadow-soft hover:-translate-y-0.5 hover:bg-navy-soft"
                    : "cursor-not-allowed bg-navy/30"
                }`}
              >
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="block h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                  />
                ) : (
                  <ArrowUp size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {listening && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center text-[13px] font-medium text-gold"
          >
            {t.commandBox.listening}
          </motion.p>
        )}
      </AnimatePresence>
      {micStatus === "denied" && (
        <p className="mt-3 text-center text-[13px] font-medium text-red-500">
          Microphone access is blocked. Allow mic access in your browser to dictate.
        </p>
      )}
    </div>
  );
}
