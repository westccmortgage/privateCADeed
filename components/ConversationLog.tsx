"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { ChatTurn } from "@/lib/types";

interface ConversationLogProps {
  messages: ChatTurn[];
  quickReplies: string[];
  onQuickReply: (text: string) => void;
  loading: boolean;
}

export default function ConversationLog({
  messages,
  quickReplies,
  onQuickReply,
  loading,
}: ConversationLogProps) {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-3" aria-live="polite">
      {messages.map((m, i) => (
        <motion.div
          key={`${i}-${m.role}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {m.role === "assistant" ? (
            <div className="flex max-w-[85%] items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy/5 text-gold">
                <Sparkles size={14} />
              </span>
              <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3 shadow-soft">
                <p className="text-[14.5px] leading-relaxed text-navy">{m.content}</p>
              </div>
            </div>
          ) : (
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-navy px-4 py-3 shadow-soft">
              <p className="text-[14.5px] leading-relaxed text-white">{m.content}</p>
            </div>
          )}
        </motion.div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy/5 text-gold">
              <Sparkles size={14} />
            </span>
            <div className="glass-card flex items-center gap-1 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-soft">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-navy/40"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {!loading && quickReplies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2 pl-10 pt-1"
          >
            {quickReplies.map((qr) => (
              <button
                key={qr}
                type="button"
                onClick={() => onQuickReply(qr)}
                className="rounded-full border border-gold/40 bg-gold/10 px-3.5 py-2 text-[13px] font-medium text-navy transition-colors hover:bg-gold/20"
              >
                {qr}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
