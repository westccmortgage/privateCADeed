// GRCRM integration.
//
// CADeed never emails lenders directly. It sends structured scenarios (and
// capital-source profiles) to GRCRM, the central machine that stores clients,
// consent logs, lender buy-boxes, routing status, and email history.
//
// If GRCRM_WEBHOOK_URL is not configured, everything still works — the payload
// is logged and a friendly "saved locally" message is returned.

import crypto from "crypto";
import { CONSENT_TEXT } from "./compliance-rules";
import { deriveLenderMatchCriteria } from "./deal-calculator";
import { computeComplianceFlags } from "./compliance-rules";
import type {
  CalculatedScenario,
  CapitalSourcePayload,
  CapitalSourceProfile,
  ChatTurn,
  ExtractedScenario,
  GRCRMScenarioPayload,
  UserContact,
} from "./types";

export interface GRCRMResult {
  configured: boolean;
  sent: boolean;
  message: string;
  status?: number;
}

function randomId(prefix: string): string {
  const rand = crypto.randomBytes(6).toString("hex");
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function sign(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

const NOT_CONFIGURED_MESSAGE =
  "Scenario saved locally for review. GRCRM connection is not configured yet.";

interface ScenarioPayloadInput {
  rawUserInput: string;
  rawConversation: ChatTurn[];
  extractedScenario: ExtractedScenario;
  calculatedScenario: CalculatedScenario;
  missingInformation: string[];
  nextBestQuestion: string;
  consentGiven: boolean;
  userContact: UserContact;
  timestamp: string;
}

/** Assemble the full GRCRM scenario payload (all required routing fields). */
export function buildScenarioPayload(
  input: ScenarioPayloadInput,
): GRCRMScenarioPayload {
  const flags = computeComplianceFlags(input.extractedScenario);
  const lenderMatchCriteria = deriveLenderMatchCriteria(
    input.extractedScenario,
    input.calculatedScenario,
  );

  return {
    sourceDomain: "CADeed.com",
    scenarioId: randomId("cad"),
    rawConversation: input.rawConversation,
    rawUserInput: input.rawUserInput,
    extractedScenario: input.extractedScenario,
    calculatedScenario: input.calculatedScenario,
    missingInformation: input.missingInformation,
    nextBestQuestion: input.nextBestQuestion,
    consentGiven: input.consentGiven,
    consentText: CONSENT_TEXT,
    timestamp: input.timestamp,
    userContact: input.userContact,
    routingStatus: "new",
    complianceFlags: flags.complianceFlags,
    ownerOccupiedFlag: flags.ownerOccupiedFlag,
    businessPurposeFlag: flags.businessPurposeFlag,
    recommendedCapitalPath: input.calculatedScenario.possibleCapitalPath,
    lenderMatchCriteria,
  };
}

/** Build a capital-source profile payload for GRCRM. */
export function buildCapitalSourcePayload(
  profile: CapitalSourceProfile,
  timestamp: string,
): CapitalSourcePayload {
  return {
    sourceDomain: "CADeed.com",
    type: "capitalSourceProfile",
    profileId: randomId("cap"),
    capitalSourceProfile: profile,
    timestamp,
    routingStatus: "new",
  };
}

async function postToGRCRM(payload: unknown): Promise<GRCRMResult> {
  const webhookUrl = process.env.GRCRM_WEBHOOK_URL;
  const secret = process.env.GRCRM_WEBHOOK_SECRET;
  const body = JSON.stringify(payload);

  if (!webhookUrl) {
    console.log("[grcrm] GRCRM_WEBHOOK_URL not set. Payload prepared:");
    console.log(body);
    return { configured: false, sent: false, message: NOT_CONFIGURED_MESSAGE };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-CADeed-Source": "CADeed.com",
  };
  if (secret) headers["X-CADeed-Signature"] = `sha256=${sign(body, secret)}`;

  try {
    const res = await fetch(webhookUrl, { method: "POST", headers, body });
    if (!res.ok) {
      console.error(`[grcrm] webhook responded ${res.status}`);
      return {
        configured: true,
        sent: false,
        status: res.status,
        message:
          "Scenario saved. We could not reach GRCRM right now; it will be retried.",
      };
    }
    return {
      configured: true,
      sent: true,
      status: res.status,
      message: "Scenario sent to GRCRM for routing.",
    };
  } catch (err) {
    console.error("[grcrm] webhook error:", err);
    return {
      configured: true,
      sent: false,
      message:
        "Scenario saved. We could not reach GRCRM right now; it will be retried.",
    };
  }
}

/** Send a scenario to GRCRM (or log it when not configured). */
export function sendScenarioToGRCRM(
  payload: GRCRMScenarioPayload,
): Promise<GRCRMResult> {
  return postToGRCRM(payload);
}

/** Send a capital-source profile to GRCRM (or log it when not configured). */
export function sendCapitalSourceToGRCRM(
  payload: CapitalSourcePayload,
): Promise<GRCRMResult> {
  return postToGRCRM(payload);
}
