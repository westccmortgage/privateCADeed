"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Mic, ChevronDown, Sparkles, Square } from "lucide-react";
import { DEAL_EXAMPLES, HERO_EXAMPLE, HERO_PLACEHOLDER } from "@/lib/examples";

interface DealCommandBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

// Minimal typing for the Web Speech API so we avoid `any`.
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

export default function DealCommandBox({
  value,
  onChange,
  onSubmit,
  loading,
}: DealCommandBoxProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-grow the textarea.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 260)}px`;
  }, [value]);

  // Detect speech support on the client.
  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    setSpeechSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
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

  function toggleDictation() {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length })
        .map((_, i) => event.results[i][0].transcript)
        .join(" ");
      onChange(value ? `${value} ${transcript}`.trim() : transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (value.trim() && !loading) onSubmit();
    }
  }

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
            placeholder={HERO_PLACEHOLDER}
            className="block w-full resize-none border-0 bg-transparent text-[17px] leading-relaxed text-navy outline-none placeholder:text-navy-muted/70 sm:text-[18px]"
          />

          {!value && (
            <p className="mt-1 select-none text-[13px] italic text-navy-muted/70">
              {HERO_EXAMPLE}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            {/* Left controls: try an example */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white/70 px-3 py-2 text-[13px] font-medium text-navy-soft transition-colors hover:border-navy/20 hover:text-navy"
              >
                <Sparkles size={15} className="text-gold" />
                Try an example
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
                    {DEAL_EXAMPLES.map((ex) => (
                      <button
                        key={ex.label}
                        type="button"
                        onClick={() => {
                          onChange(ex.text);
                          setMenuOpen(false);
                          textareaRef.current?.focus();
                        }}
                        className="flex w-full flex-col items-start gap-0.5 border-b border-hairline/70 px-4 py-3 text-left last:border-0 hover:bg-canvas"
                      >
                        <span className="text-[13px] font-semibold text-navy">
                          {ex.label}
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

            {/* Right controls: mic + submit */}
            <div className="flex items-center gap-2">
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleDictation}
                  aria-label={listening ? "Stop dictation" : "Dictate your deal"}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                    listening
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-hairline bg-white/70 text-navy-soft hover:text-navy"
                  }`}
                >
                  {listening ? <Square size={16} /> : <Mic size={18} />}
                </button>
              )}

              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                aria-label="Analyze deal"
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

      {listening && (
        <p className="mt-3 text-center text-[13px] font-medium text-gold">
          Listening… speak your deal
        </p>
      )}
    </div>
  );
}
