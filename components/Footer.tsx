"use client";

import { COMPANY, telHref } from "@/lib/company";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function Footer() {
  const { t } = useLocale();

  const footerLinks = [
    { label: t.footer.links.howItWorks, href: "/#how-it-works" },
    { label: t.footer.links.solutions, href: "/#solutions" },
    { label: t.footer.links.tools, href: "/tools" },
    { label: t.footer.links.resources, href: "/resources" },
    { label: t.footer.links.faq, href: "/faq" },
    { label: t.footer.links.forBorrowers, href: "/for-borrowers" },
    { label: t.footer.links.forBrokers, href: "/for-brokers" },
    { label: t.footer.links.forCapitalSources, href: "/for-capital-sources" },
    { label: t.footer.links.company, href: "/company" },
    { label: t.footer.links.legalPrivacy, href: "/legal" },
  ];

  return (
    <footer className="mx-auto mt-20 max-w-engine px-5 pb-12 sm:px-8">
      <div className="border-t border-hairline pt-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-navy">
              CADeed<span className="text-gold">.com</span>
            </span>
            <span className="mt-1 text-[12px] font-medium tracking-wide text-navy-muted">
              {t.footer.tagline}
            </span>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                className="text-[13px] font-medium text-navy-muted transition-colors hover:text-navy"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <p className="mt-8 text-[12px] leading-relaxed text-navy-muted">
          {COMPANY.legalName} · NMLS&nbsp;#{COMPANY.nmls} · CA DRE Corporation License #{COMPANY.dreCorporationLicense} · {COMPANY.mailingAddress}
          <br />
          <a href={telHref(COMPANY.phoneOffice)} className="hover:text-navy">
            {COMPANY.phoneOffice}
          </a>{" "}
          ·{" "}
          <a href={`mailto:${COMPANY.email}`} className="hover:text-navy">
            {COMPANY.email}
          </a>
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-navy-muted/80">
          © {new Date().getFullYear()} {t.footer.disclaimer}
        </p>
      </div>
    </footer>
  );
}
