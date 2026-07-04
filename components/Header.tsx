"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Messages } from "@/lib/i18n/dictionaries";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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

function buildNav(t: Messages): NavItem[] {
  const { nav, cols, links } = t.header;
  return [
    {
      label: nav.howItWorks,
      href: "/#how-it-works",
      columns: [
        {
          title: cols.theEngine,
          links: [
            { label: links.describeDeal, href: "/" },
            { label: links.deterministicMath, href: "/#how-it-works" },
            { label: links.nextBestQuestion, href: "/#how-it-works" },
          ],
        },
        {
          title: cols.whyDifferent,
          links: [
            { label: links.noApplicationForm, href: "/for-borrowers" },
            { label: links.numbersNeverInvented, href: "/company#underwriting" },
            { label: links.routedGrcrm, href: "/company" },
          ],
        },
      ],
    },
    {
      label: nav.solutions,
      href: "/solutions",
      columns: [
        {
          title: cols.capitalPaths,
          links: [
            { label: links.cashOut, href: "/solutions#cash-out" },
            { label: links.secondDeed, href: "/solutions#second" },
            { label: links.fixFlip, href: "/solutions#fix-flip" },
            { label: links.construction, href: "/solutions#construction" },
          ],
        },
        {
          title: cols.whoItsFor,
          links: [
            { label: links.forBorrowers, href: "/for-borrowers" },
            { label: links.forBrokers, href: "/for-brokers" },
            { label: links.forCapitalSources, href: "/for-capital-sources" },
          ],
        },
      ],
    },
    {
      label: nav.tools,
      href: "/tools",
      columns: [
        {
          title: cols.calculators,
          links: [
            { label: links.cltvCalc, href: "/tools/cltv" },
            { label: links.ltvLtcCalc, href: "/tools/ltv-ltc" },
            { label: links.flipProfit, href: "/tools/flip-profit" },
          ],
        },
        {
          title: cols.moreTools,
          links: [
            { label: links.dscrCalc, href: "/tools/dscr" },
            { label: links.maxLoan, href: "/tools/max-loan" },
            { label: links.allTools, href: "/tools" },
          ],
        },
      ],
    },
    {
      label: nav.resources,
      href: "/resources",
      columns: [
        {
          title: cols.learn,
          links: [
            { label: links.lienBasics, href: "/resources" },
            { label: links.understandingCltv, href: "/resources" },
            { label: links.businessPurpose, href: "/resources" },
          ],
        },
        {
          title: cols.more,
          links: [
            { label: links.glossary, href: "/resources" },
            { label: links.faq, href: "/faq" },
          ],
        },
      ],
    },
    {
      label: nav.company,
      href: "/company",
      columns: [
        {
          title: cols.company,
          links: [
            { label: links.aboutCadeed, href: "/company" },
            { label: links.howWeUnderwrite, href: "/company#underwriting" },
            { label: links.complianceLicensing, href: "/company#compliance" },
            { label: links.legalPrivacy, href: "/legal" },
          ],
        },
      ],
    },
    {
      label: nav.forCapitalSources,
      href: "/for-capital-sources",
      columns: [
        {
          title: cols.capitalSources,
          links: [
            { label: links.submitLendingBox, href: "/for-capital-sources" },
            { label: links.howRoutingWorks, href: "/for-capital-sources" },
            { label: links.receiveScenarios, href: "/for-capital-sources" },
          ],
        },
      ],
    },
  ];
}

// Subtle "shaded" letters — a faint shadow for depth without brightness.
const SHADE = "[text-shadow:0_0.5px_1px_rgb(7_26_61_/_0.10)]";

export default function Header() {
  const { t } = useLocale();
  const NAV = buildNav(t);
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

          {/* Right: language + CTA */}
          <div className="hidden items-center gap-1.5 md:flex">
            <div onMouseEnter={() => setActive(null)}>
              <LanguageSwitcher />
            </div>
            <a
              href="/#book"
              onMouseEnter={() => setActive(null)}
              className={`rounded-full bg-navy px-4 py-1.5 text-[13px] font-medium text-white/95 transition-colors hover:bg-navy-soft ${SHADE}`}
            >
              {t.header.cta}
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
              <div className="mt-1 border-t border-[#eef2f8]">
                <LanguageSwitcher variant="block" />
              </div>
              <a
                href="/#book"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-full bg-navy px-3 py-2.5 text-center text-[15px] font-medium text-white"
              >
                {t.header.cta}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
