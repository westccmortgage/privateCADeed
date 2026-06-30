import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { COMPLIANCE_NOTE } from "@/lib/types";
import { CONSENT_TEXT } from "@/lib/compliance-rules";
import { COMPANY, telHref } from "@/lib/company";

export const metadata: Metadata = {
  title: "Legal, Disclosures & Privacy — CADeed.com",
  description:
    "Disclosures, Terms of Use, Privacy Policy, California (CCPA/CPRA) privacy rights, and communications consent for CADeed.com / West Coast Capital Mortgage Inc.",
};

const EFFECTIVE = "June 30, 2026";

type Body = Array<string | { list: string[] }>;
interface Section {
  id: string;
  title: string;
  body: Body;
}

const SECTIONS: Section[] = [
  {
    id: "overview",
    title: "1. Overview & Acceptance",
    body: [
      `CADeed.com (the "Site") and its conversational deal terminal, calculators, and related tools (together, the "Services") are operated by ${COMPANY.legalName} ("West Coast Capital Mortgage," "we," "us," or "our"), NMLS #${COMPANY.nmls}.`,
      `By accessing or using the Services, you agree to these Terms of Use, acknowledge the Disclosures below, and consent to the data practices described in our Privacy Policy. If you do not agree, please do not use the Services.`,
      `These terms apply to everyone who uses the Services — borrowers, brokers, investors, capital sources, and other visitors.`,
    ],
  },
  {
    id: "disclosures",
    title: "2. Lending & Regulatory Disclosures",
    body: [
      COMPLIANCE_NOTE,
      `Preliminary only. Any scenario, figure, leverage metric (such as LTV or CLTV), capital path, or estimate produced by the Services is a preliminary modeling output generated from the information you provide. It is not a pre-qualification, pre-approval, approval, rate quote, rate lock, or commitment to lend, and it creates no obligation for us or any capital source to extend credit.`,
      `Subject to review. Actual availability, terms, pricing, and eligibility depend on a complete review of the property, borrower, collateral, documentation, occupancy, purpose, title, and applicable law, and on underwriting by a licensed mortgage professional and/or private capital source.`,
      `Estimates may be incomplete or inaccurate. Calculators and engine outputs are general illustrations based on the inputs you provide, which may be incomplete or incorrect. Nothing on the Site is financial, legal, accounting, or tax advice. Do not rely on any output to make a financial decision.`,
      `Licensing. Private capital and mortgage financing are arranged through licensed professionals where required. You can verify our license on the NMLS Consumer Access website (nmlsconsumeraccess.org) using NMLS #${COMPANY.nmls}.`,
      `Equal opportunity. We conduct business in accordance with the Equal Credit Opportunity Act (ECOA) and the Fair Housing Act. We do not discriminate on the basis of race, color, religion, national origin, sex, marital status, age (provided the applicant has the capacity to contract), because all or part of an applicant's income derives from a public assistance program, or because of the good-faith exercise of any right under the Consumer Credit Protection Act.`,
      `Business-purpose vs. consumer. Many private-capital scenarios are intended for business or investment purposes. Owner-occupied or consumer-purpose financing is subject to additional consumer-protection laws, must be reviewed by a licensed mortgage professional, and may not be available from all capital sources.`,
    ],
  },
  {
    id: "terms",
    title: "3. Terms of Use",
    body: [
      `Eligibility. You must be at least 18 years old and able to form a binding contract to use the Services.`,
      `License. We grant you a limited, non-exclusive, non-transferable, revocable license to use the Services to evaluate California real estate financing for your own purposes. You may not resell the Services, scrape or harvest data from them, or use them to build or train a competing product.`,
      `Acceptable use. You agree not to:`,
      {
        list: [
          "Use the Services for any unlawful, fraudulent, or deceptive purpose;",
          "Submit information you know to be false, or another person's personal or financial information without authorization;",
          "Probe, scan, or attempt to breach the security of the Services, or interfere with their operation;",
          "Send automated, bulk, or abusive requests to the AI or other endpoints;",
          "Infringe any intellectual-property, privacy, or other right.",
        ],
      },
      `No warranty. THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, AND NON-INFRINGEMENT. We do not warrant that any output is accurate, complete, or current, or that the Services will be uninterrupted, secure, or error-free.`,
      `Third-party services. We rely on third-party providers to operate the Services, including AI language processing (Anthropic), meeting scheduling (Calendly), email delivery (Resend), and client/lead routing (GRCRM). Features powered by these providers may also be subject to their own terms and privacy practices.`,
      `Intellectual property. The Site, its content and design, and the CADeed name and marks are owned by ${COMPANY.legalName} or its licensors and are protected by applicable intellectual-property laws.`,
      `Limitation of liability. TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${COMPANY.legalName.toUpperCase()} AND ITS OWNERS, OFFICERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR ANY LOST PROFITS, DATA, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF THE SERVICES. OUR TOTAL LIABILITY FOR ANY CLAIM WILL NOT EXCEED ONE HUNDRED U.S. DOLLARS ($100).`,
      `Indemnification. You agree to indemnify and hold us harmless from any claim, loss, or expense (including reasonable attorneys' fees) arising out of your misuse of the Services or your violation of these terms or applicable law.`,
      `Governing law & venue. These terms are governed by the laws of the State of California, without regard to its conflict-of-laws rules. The exclusive venue for any dispute is the state or federal courts located in Los Angeles County, California.`,
      `Changes & termination. We may modify the Services or these terms at any time; your continued use after changes take effect constitutes acceptance. We may suspend or terminate access to the Services at our discretion.`,
    ],
  },
  {
    id: "privacy",
    title: "4. Privacy Policy",
    body: [
      `This Privacy Policy explains what we collect, how we use it, and the choices you have.`,
      `Information we collect:`,
      {
        list: [
          "Information you provide — deal details (such as property location, value, existing debt, requested loan amount, lien position, purpose, and occupancy), and your name, email, phone, role, and any message you submit.",
          "Information collected automatically — basic device and usage data such as IP address, browser type, and pages viewed, through standard web server logs and any analytics we enable.",
          "Cookies — we use strictly necessary cookies to operate the Site; if analytics are enabled, related cookies may also be used.",
        ],
      },
      `How we use information:`,
      {
        list: [
          "To operate, maintain, and improve the Services and generate your preliminary scenario;",
          "With your explicit consent, to share your structured scenario with a licensed professional and selected private capital sources for financing review via GRCRM;",
          "To respond to your inquiries and schedule deal reviews;",
          "To detect, prevent, and address fraud, abuse, and security issues, and to comply with legal obligations.",
        ],
      },
      `How we share information:`,
      {
        list: [
          "Service providers — AI processing (Anthropic), scheduling (Calendly), email delivery (Resend), and CRM/routing (GRCRM), under agreements that limit their use of your information to providing services to us.",
          "Capital sources and licensed professionals — only after you give explicit consent on the Site.",
          "Legal and safety — when required by law, regulation, or legal process, or to protect rights, property, or safety.",
          "We do not sell your personal information.",
        ],
      },
      `Data security. We use reasonable administrative and technical safeguards to protect your information. No method of transmission over the internet or electronic storage is completely secure, so we cannot guarantee absolute security.`,
      `Data retention. We retain information for as long as needed to provide the Services, comply with our legal obligations, resolve disputes, and enforce our agreements.`,
      `Financial privacy (GLBA). As a financial-services provider, our handling of nonpublic personal information is also subject to the Gramm-Leach-Bliley Act, and we limit the use and disclosure of such information as required by law.`,
      `Children. The Services are not directed to children under 16, and we do not knowingly collect their personal information.`,
    ],
  },
  {
    id: "ca-privacy",
    title: "5. California Privacy Rights (CCPA/CPRA)",
    body: [
      `If you are a California resident, the California Consumer Privacy Act, as amended by the California Privacy Rights Act, gives you the following rights, subject to legal exceptions:`,
      {
        list: [
          "Right to know the personal information we collect, use, and disclose;",
          "Right to delete personal information we have collected from you;",
          "Right to correct inaccurate personal information;",
          "Right to opt out of the sale or sharing of personal information — note: we do not sell or share personal information for cross-context behavioral advertising;",
          "Right to limit the use of sensitive personal information;",
          "Right to non-discrimination for exercising any of these rights.",
        ],
      },
      `Categories we collect. Identifiers (name, email, phone); financial and transaction information you provide about a property and proposed financing; internet or network activity (usage and log data); and inferences drawn to model a scenario. We collect these categories for the purposes described in the Privacy Policy above.`,
      `How to exercise your rights. Contact us using the details in the Contact section. We will verify your request and respond within the timeframes required by law. You may designate an authorized agent to act on your behalf.`,
    ],
  },
  {
    id: "communications",
    title: "6. Electronic Communications & Consent",
    body: [
      CONSENT_TEXT,
      `By providing your email address or phone number, you consent to receive communications from West Coast Capital Mortgage / CADeed about your inquiry, including by email, phone, and text message. Message and data rates may apply, and message frequency may vary.`,
      `Calls and text messages may be placed using automated technology where applicable. Consent to receive marketing calls or texts is not a condition of obtaining any financing.`,
      `Opting out. You can unsubscribe from marketing emails using the link in each message, and stop text messages by replying STOP; reply HELP for help.`,
      `CAN-SPAM. Our commercial emails include accurate sender identification and a valid physical mailing address (shown in the Contact section) and honor opt-out requests promptly.`,
    ],
  },
  {
    id: "accessibility",
    title: "7. Accessibility",
    body: [
      `We are committed to making the Site usable for everyone and strive to follow recognized accessibility standards. If you experience any difficulty accessing the Services, please contact us and we will work to provide the information or complete the transaction through an alternative method.`,
    ],
  },
];

function Block({ item }: { item: string | { list: string[] } }) {
  if (typeof item === "string") {
    return <p className="text-[14.5px] leading-relaxed text-navy-muted">{item}</p>;
  }
  return (
    <ul className="space-y-1.5">
      {item.list.map((li) => (
        <li
          key={li}
          className="flex items-start gap-2 text-[14.5px] leading-relaxed text-navy-muted"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy/30" />
          {li}
        </li>
      ))}
    </ul>
  );
}

export default function Legal() {
  return (
    <PageShell
      eyebrow="Legal, Disclosures & Privacy"
      title="The fine print, in full."
      intro={`Effective ${EFFECTIVE}. These terms, disclosures, and privacy practices govern your use of CADeed.com.`}
    >
      {/* Table of contents */}
      <nav className="glass-card mb-8 rounded-card p-5 shadow-soft sm:p-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-muted">
          On this page
        </p>
        <ol className="grid gap-1.5 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-[14px] font-medium text-navy/80 underline-offset-2 hover:text-navy hover:underline"
              >
                {s.title}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#contact"
              className="text-[14px] font-medium text-navy/80 underline-offset-2 hover:text-navy hover:underline"
            >
              8. Contact
            </a>
          </li>
        </ol>
      </nav>

      <div className="glass-card space-y-10 rounded-card p-6 shadow-soft sm:p-9">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="text-[18px] font-semibold tracking-tight text-navy">{s.title}</h2>
            <div className="mt-3 space-y-3">
              {s.body.map((item, i) => (
                <Block key={i} item={item} />
              ))}
            </div>
          </section>
        ))}

        {/* Contact */}
        <section id="contact" className="scroll-mt-24">
          <h2 className="text-[18px] font-semibold tracking-tight text-navy">8. Contact</h2>
          <div className="mt-3 space-y-2 text-[14.5px] leading-relaxed text-navy-muted">
            <p>
              {COMPANY.legalName} · NMLS&nbsp;#{COMPANY.nmls}
              <br />
              {COMPANY.mailingAddress}
            </p>
            <p>
              Office:{" "}
              <a
                href={telHref(COMPANY.phoneOffice)}
                className="font-medium text-navy underline-offset-2 hover:underline"
              >
                {COMPANY.phoneOffice}
              </a>{" "}
              · Direct:{" "}
              <a
                href={telHref(COMPANY.phoneDirect)}
                className="font-medium text-navy underline-offset-2 hover:underline"
              >
                {COMPANY.phoneDirect}
              </a>
            </p>
            <p>
              Email:{" "}
              <a
                href={`mailto:${COMPANY.email}`}
                className="font-medium text-navy underline-offset-2 hover:underline"
              >
                {COMPANY.email}
              </a>
            </p>
            <p>
              License verification:{" "}
              <a
                href="https://www.nmlsconsumeraccess.org/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-navy underline-offset-2 hover:underline"
              >
                NMLS Consumer Access
              </a>
            </p>
          </div>
        </section>

        <p className="border-t border-hairline pt-6 text-[12.5px] leading-relaxed text-navy-muted/80">
          This page provides general information about the Services and our practices and is not
          legal advice. We may update it from time to time; the effective date above reflects the
          most recent revision.
        </p>
      </div>
    </PageShell>
  );
}
