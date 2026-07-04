"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";

interface SubLink {
  label: string;
  href: string;
}
interface Column {
  title: string;
  links: SubLink[];
}
interface NavItem {
  label: string;
  href: string;
  columns?: Column[];
}

const NAV: NavItem[] = [
  {
    label: "How It Works",
    href: "/#how-it-works",
    columns: [
      {
        title: "The engine",
        links: [
          { label: "Describe your deal", href: "/" },
          { label: "Deterministic math", href: "/#how-it-works" },
          { label: "Next best question", href: "/#how-it-works" },
        ],
      },
      {
        title: "Why it's different",
        links: [
          { label: "No application form", href: "/for-borrowers" },
          { label: "Numbers are never invented", href: "/company#underwriting" },
          { label: "Routed through GRCRM", href: "/company" },
        ],
      },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    columns: [
      {
        title: "Capital paths",
        links: [
          { label: "Cash-Out & Refinance", href: "/solutions#cash-out" },
          { label: "2nd Deed of Trust", href: "/solutions#second" },
          { label: "Fix & Flip / Bridge", href: "/solutions#fix-flip" },
          { label: "Construction Completion", href: "/solutions#construction" },
        ],
      },
      {
        title: "Who it's for",
        links: [
          { label: "For borrowers", href: "/for-borrowers" },
          { label: "For brokers", href: "/for-brokers" },
          { label: "For capital sources", href: "/for-capital-sources" },
        ],
      },
    ],
  },
  {
    label: "Tools",
    href: "/tools",
    columns: [
      {
        title: "Calculators",
        links: [
          { label: "CLTV calculator", href: "/tools/cltv" },
          { label: "LTV / LTC calculator", href: "/tools/ltv-ltc" },
          { label: "Fix & flip profit", href: "/tools/flip-profit" },
        ],
      },
      {
        title: "More tools",
        links: [
          { label: "DSCR calculator", href: "/tools/dscr" },
          { label: "Max-loan solver", href: "/tools/max-loan" },
          { label: "All tools", href: "/tools" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    columns: [
      {
        title: "Learn",
        links: [
          { label: "California lien position basics", href: "/resources" },
          { label: "Understanding CLTV & equity", href: "/resources" },
          { label: "Business-purpose vs. consumer", href: "/resources" },
        ],
      },
      {
        title: "More",
        links: [
          { label: "Glossary", href: "/resources" },
          { label: "FAQ", href: "/faq" },
        ],
      },
    ],
  },
  {
    label: "Company",
    href: "/company",
    columns: [
      {
        title: "Company",
        links: [
          { label: "About CADeed", href: "/company" },
          { label: "How we underwrite", href: "/company#underwriting" },
          { label: "Compliance & licensing", href: "/company#compliance" },
          { label: "Legal & privacy", href: "/legal" },
        ],
      },
    ],
  },
  {
    label: "For Capital Sources",
    href: "/for-capital-sources",
    columns: [
      {
        title: "Capital sources",
        links: [
          { label: "Submit your lending box", href: "/for-capital-sources" },
          { label: "How routing works", href: "/for-capital-sources" },
          { label: "Receive matched scenarios", href: "/for-capital-sources" },
        ],
      },
    ],
  },
];

// Subtle "shaded" letters — a faint shadow for depth without brightness.
const SHADE = "[text-shadow:0_0.5px_1px_rgb(7_26_61_/_0.10)]";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const activeItem = NAV.find((n) => n.label === active && n.columns);

  return (
    <header
      className="sticky top-0 z-50"
      onMouseLeave={() => setActive(null)}
    >
      <div className="border-b border-[#e7edf5] bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
        <nav className="mx-auto flex h-12 max-w-engine items-center gap-6 px-5 sm:px-8">
          {/* Brand */}
          <a
            href="/"
            className={`flex items-baseline leading-none ${SHADE}`}
            onMouseEnter={() => setActive(null)}
          >
            <span className="text-[16px] font-semibold tracking-tight text-navy">
              CADeed
            </span>
            <span className="text-[16px] font-semibold tracking-tight text-gold/80">
              .com
            </span>
          </a>

          {/* Desktop nav — centered, evenly spaced */}
          <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {NAV.map((item) => {
              const isActive = active === item.label;
              return (
                <div
                  key={item.label}
                  onMouseEnter={() => setActive(item.label)}
                >
                  <a
                    href={item.href}
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-medium tracking-tight transition-colors ${SHADE} ${
                      isActive ? "text-navy" : "text-navy/70 hover:text-navy"
                    }`}
                  >
                    {item.label}
                    {item.columns && (
                      <ChevronDown
                        size={13}
                        className={`mt-px text-navy/40 transition-transform duration-200 ${
                          isActive ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Right CTA */}
          <div className="hidden md:block">
            <a
              href="/#book"
              onMouseEnter={() => setActive(null)}
              className={`rounded-full bg-navy px-4 py-1.5 text-[13px] font-medium text-white/95 transition-colors hover:bg-navy-soft ${SHADE}`}
            >
              Book Deal Review
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-navy md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Desktop mega-menu panel */}
        <AnimatePresence>
          {activeItem?.columns && (
            <motion.div
              key={activeItem.label}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full hidden border-b border-[#e7edf5] bg-white/95 shadow-[0_24px_50px_rgba(7,26,61,0.08)] backdrop-blur-xl md:block"
            >
              <div className="mx-auto grid max-w-engine gap-x-12 gap-y-8 px-5 py-9 sm:px-8 md:grid-cols-[repeat(auto-fit,minmax(180px,auto))]">
                {activeItem.columns.map((col) => (
                  <div key={col.title}>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9aa7bd]">
                      {col.title}
                    </p>
                    <ul className="space-y-2.5">
                      {col.links.map((sub) => (
                        <li key={sub.label}>
                          <a
                            href={sub.href}
                            onClick={() => setActive(null)}
                            className={`group inline-flex items-center gap-1.5 text-[16px] font-medium tracking-tight text-navy/80 transition-colors hover:text-navy ${SHADE}`}
                          >
                            {sub.label}
                            <ArrowRight
                              size={14}
                              className="-translate-x-1 text-navy/0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-navy/40"
                            />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="max-h-[calc(100vh-3rem)] overflow-y-auto border-b border-[#e7edf5] bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto max-w-engine px-5 py-3 sm:px-8">
              {NAV.map((item) => {
                const isOpen = openSection === item.label;
                return (
                  <div key={item.label} className="border-b border-[#eef2f8] last:border-0">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenSection((s) => (s === item.label ? null : item.label))
                      }
                      className={`flex w-full items-center justify-between py-3 text-[15px] font-medium text-navy ${SHADE}`}
                    >
                      {item.label}
                      {item.columns && (
                        <ChevronDown
                          size={16}
                          className={`text-navy/40 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>
                    <AnimatePresence>
                      {isOpen && item.columns && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pb-3 pl-2">
                            {item.columns.map((col) => (
                              <div key={col.title} className="mb-2">
                                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9aa7bd]">
                                  {col.title}
                                </p>
                                <ul className="space-y-1.5">
                                  {col.links.map((sub) => (
                                    <li key={sub.label}>
                                      <a
                                        href={sub.href}
                                        onClick={() => setOpen(false)}
                                        className="block py-1 text-[14.5px] font-medium text-navy/75 hover:text-navy"
                                      >
                                        {sub.label}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              <a
                href="/#book"
                onClick={() => setOpen(false)}
                className="mt-3 block rounded-full bg-navy px-3 py-2.5 text-center text-[15px] font-medium text-white"
              >
                Book Deal Review
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
