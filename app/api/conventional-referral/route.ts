import { NextResponse } from "next/server";
import { sendNotificationEmail } from "@/lib/notify";
import {
  buildScenarioPayload,
  formatScenarioSummary,
  sendLeadToGRCRM,
} from "@/lib/grcrm-client";
import { consentSatisfied } from "@/lib/compliance-rules";
import { normalizeScenario } from "@/lib/scenario-merger";
import { buildCalculated } from "@/lib/scenario-engine";
import { findMissingInformation, getNextBestQuestion } from "@/lib/deal-calculator";
import type { ChatTurn, ExtractedScenario } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReferralBody {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  reasons?: string[];
  consentGiven?: boolean;
  extractedScenario?: Partial<ExtractedScenario>;
  rawConversation?: ChatTurn[];
}

/**
 * Captures a borrower whose deal fits conventional/agency better than private
 * capital and routes them to West Coast Capital Mortgage. Consent-gated. The
 * lead is tagged "CONVENTIONAL_REFERRAL" and forwarded by email and to GRCRM
 * (best-effort) so it is never lost — even if the borrower never clicks through.
 */
export async function POST(request: Request) {
  let body: ReferralBody;
  try {
    body = (await request.json()) as ReferralBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();

  if (!name || !/\S+@\S+\.\S+/.test(email)) {
    return NextResponse.json(
      { error: "Please add your name and a valid email." },
      { status: 400 },
    );
  }
  if (!consentSatisfied(body.consentGiven)) {
    return NextResponse.json(
      { error: "Please check the consent box so a specialist can contact you." },
      { status: 400 },
    );
  }

  const extracted = normalizeScenario(body.extractedScenario);
  const calculated = buildCalculated(extracted);
  const reasons =
    Array.isArray(body.reasons) && body.reasons.length
      ? body.reasons
      : calculated.conventionalReferral.reasons;

  // GRCRM (best-effort) as a clean lead, tagged so it routes to the conventional
  // channel rather than private capital sources.
  const missingInformation = findMissingInformation(extracted);
  const payload = buildScenarioPayload({
    rawUserInput: "",
    rawConversation: Array.isArray(body.rawConversation) ? body.rawConversation : [],
    extractedScenario: extracted,
    calculatedScenario: calculated,
    missingInformation,
    nextBestQuestion: getNextBestQuestion(missingInformation, extracted),
    consentGiven: true,
    userContact: { name, email, phone, role: "Borrower" },
    timestamp: new Date().toISOString(),
  });
  const grcrm = await sendLeadToGRCRM({
    name,
    email,
    phone,
    message: [
      `CONVENTIONAL REFERRAL — route to West Coast Capital Mortgage`,
      ``,
      formatScenarioSummary(extracted, calculated),
      ``,
      `Why conventional may fit better:`,
      ...(reasons.length ? reasons.map((r) => `- ${r}`) : ["- (not specified)"]),
    ].join("\n"),
  });

  // Email safety-net so the referral lead is never lost.
  const emailResult = await sendNotificationEmail(
    `Conventional referral — ${name} (${payload.scenarioId})`,
    [
      `New CONVENTIONAL REFERRAL from CADeed.com — route to West Coast Capital Mortgage`,
      ``,
      `Contact: ${name} · ${email} · ${phone || "—"}`,
      `Location: ${extracted.propertyLocation ?? extracted.propertyState ?? "—"}`,
      `Value: ${extracted.estimatedValue ?? "—"} · Existing 1st: ${extracted.currentDebt ?? "—"} · Requested: ${extracted.requestedLoanAmount ?? extracted.requestedCashOut ?? "—"}`,
      `Lien: ${extracted.lienPosition ?? "—"} · Purpose: ${extracted.loanPurpose ?? "—"} · Occupancy: ${extracted.occupancy ?? "—"} · Business purpose: ${extracted.businessPurpose ?? "—"}`,
      `CLTV: ${calculated.estimatedCLTV ?? "—"}% · LTV: ${calculated.estimatedLTV ?? "—"}% · Private path: ${calculated.possibleCapitalPath} (${calculated.scenarioStrength})`,
      ``,
      `Why conventional may fit better:`,
      ...(reasons.length ? reasons.map((r) => `- ${r}`) : ["- (not specified)"]),
    ].join("\n"),
    email, // reply-to → answer the lead directly
  );

  return NextResponse.json(
    {
      ok: true,
      scenarioId: payload.scenarioId,
      configured: grcrm.configured,
      forwarded: grcrm.sent,
      emailed: emailResult.sent,
      message:
        "Thanks — a licensed loan officer will reach out about conventional options. " +
        "This is not an offer or a commitment to lend.",
    },
    { status: 200 },
  );
}
