import { NextResponse } from "next/server";
import {
  buildScenarioPayload,
  formatScenarioSummary,
  sendLeadToGRCRM,
} from "@/lib/grcrm-client";
import { sendNotificationEmail } from "@/lib/notify";
import { consentSatisfied } from "@/lib/compliance-rules";
import { normalizeScenario } from "@/lib/scenario-merger";
import { buildCalculated } from "@/lib/scenario-engine";
import { findMissingInformation, getNextBestQuestion } from "@/lib/deal-calculator";
import type {
  CalculatedScenario,
  ChatTurn,
  ExtractedScenario,
  UserContact,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SaveRequestBody {
  rawUserInput?: string;
  rawConversation?: ChatTurn[];
  extractedScenario?: Partial<ExtractedScenario>;
  calculatedScenario?: CalculatedScenario;
  missingInformation?: string[];
  nextBestQuestion?: string;
  consentGiven?: boolean;
  userContact?: UserContact;
}

/**
 * Builds the GRCRM scenario payload and forwards it. Requires explicit consent.
 * If GRCRM_WEBHOOK_URL is not configured, the payload is logged and a friendly
 * "saved locally" message is returned — the app keeps working.
 */
export async function POST(request: Request) {
  let body: SaveRequestBody;
  try {
    body = (await request.json()) as SaveRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.extractedScenario) {
    return NextResponse.json({ error: "Missing scenario data." }, { status: 400 });
  }

  // Consent is mandatory before anything leaves CADeed.
  if (!consentSatisfied(body.consentGiven)) {
    return NextResponse.json(
      { error: "Consent is required before sending this scenario for review." },
      { status: 400 },
    );
  }

  const extracted = normalizeScenario(body.extractedScenario);
  // Recompute the math server-side so the payload is always authoritative.
  const calculated = buildCalculated(extracted);
  const missingInformation =
    body.missingInformation ?? findMissingInformation(extracted);
  const nextBestQuestion =
    body.nextBestQuestion ?? getNextBestQuestion(missingInformation, extracted);

  const payload = buildScenarioPayload({
    rawUserInput: body.rawUserInput ?? "",
    rawConversation: Array.isArray(body.rawConversation) ? body.rawConversation : [],
    extractedScenario: extracted,
    calculatedScenario: calculated,
    missingInformation,
    nextBestQuestion,
    consentGiven: true,
    userContact: body.userContact ?? {},
    timestamp: new Date().toISOString(),
  });

  const lm = payload.lenderMatchCriteria;
  const c = payload.userContact;

  // Forward to GRCRM as a clean lead (name/email/phone + full scenario in message).
  const result = await sendLeadToGRCRM({
    name: c.name,
    email: c.email,
    phone: c.phone,
    message: [
      `CADeed scenario — ${payload.recommendedCapitalPath} (${calculated.scenarioStrength})`,
      ``,
      formatScenarioSummary(extracted, calculated),
      `Role: ${c.role ?? "—"} · Compliance flags: ${payload.complianceFlags.join(", ") || "none"}`,
      payload.rawUserInput ? `\nRaw: ${payload.rawUserInput}` : "",
    ].join("\n"),
  });

  // Email safety-net so a lead is never lost before GRCRM is wired up.
  const emailResult = await sendNotificationEmail(
    `New CADeed scenario — ${payload.recommendedCapitalPath} (${payload.scenarioId})`,
    [
      `New scenario from CADeed.com`,
      ``,
      `Contact: ${c.name ?? "—"} · ${c.email ?? "—"} · ${c.phone ?? "—"} · ${c.role ?? "—"}`,
      `Location: ${extracted.propertyLocation ?? extracted.propertyState ?? "—"}`,
      `Value: ${extracted.estimatedValue ?? "—"} · Existing 1st: ${extracted.currentDebt ?? "—"} · Requested: ${lm.loanAmount ?? "—"}`,
      `Lien: ${extracted.lienPosition ?? "—"} · Purpose: ${extracted.loanPurpose ?? "—"} · Occupancy: ${extracted.occupancy ?? "—"} · Business purpose: ${extracted.businessPurpose ?? "—"}`,
      `CLTV: ${calculated.estimatedCLTV ?? "—"}% · LTV: ${calculated.estimatedLTV ?? "—"}% · Path: ${payload.recommendedCapitalPath} (${calculated.scenarioStrength})`,
      `Exit: ${extracted.exitStrategy ?? "—"} · Timeline: ${extracted.closingTimeline ?? "—"}`,
      `Compliance flags: ${payload.complianceFlags.join(", ") || "none"}`,
      ``,
      `Raw: ${payload.rawUserInput}`,
    ].join("\n"),
  );

  // Borrower-facing message stays reassuring; technical GRCRM/email state is for logs/flags.
  const userMessage =
    "Scenario received — a licensed mortgage professional will review it and reach out. " +
    "This is not a loan approval or commitment to lend.";

  return NextResponse.json(
    {
      ok: true,
      scenarioId: payload.scenarioId,
      configured: result.configured,
      forwarded: result.sent,
      emailed: emailResult.sent,
      message: userMessage,
    },
    { status: 200 },
  );
}
