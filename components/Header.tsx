"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Solutions", href: "#solutions" },
  { label: "About Us", href: "#about" },
  { label: "Resources", href: "#resources" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-engine px-5 pt-4 sm:px-8">
        <nav className="glass-card flex items-center justify-between rounded-[20px] px-4 py-3 shadow-soft sm:px-6">
          {/* Brand */}
          <a href="#top" className="flex flex-col leading-none">
            <span className="text-[17px] font-semibold tracking-tight text-navy">
              CADeed<span className="text-gold">.com</span>
            </span>
            <span className="mt-0.5 text-[11px] font-medium tracking-wide text-navy-muted">
              Private Capital Engine
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[14px] font-medium text-navy-soft transition-colors hover:text-navy"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#book"
              className="rounded-full bg-navy px-4 py-2 text-[14px] font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-navy-soft"
            >
              Book Deal Review
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-navy md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="glass-card mt-2 flex flex-col gap-1 rounded-[20px] p-3 shadow-soft md:hidden"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-[15px] font-medium text-navy-soft hover:bg-white/70"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#book"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-xl bg-navy px-3 py-2.5 text-center text-[15px] font-semibold text-white"
              >
                Book Deal Review
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
