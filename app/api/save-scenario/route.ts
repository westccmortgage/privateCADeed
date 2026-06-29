import { NextResponse } from "next/server";
import type {
  CalculatedScenario,
  ExtractedScenario,
  SaveScenarioPayload,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SaveRequestBody {
  rawUserInput?: string;
  extractedScenario?: ExtractedScenario;
  calculatedScenario?: CalculatedScenario;
  userContact?: SaveScenarioPayload["userContact"];
}

/** Simple, dependency-free unique id (timestamp + random suffix). */
function makeScenarioId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `cad_${Date.now().toString(36)}_${rand}`;
}

/**
 * Prepares a GRCRM payload. If GRCRM_WEBHOOK_URL is set, the payload is POSTed
 * to that webhook. Otherwise it is logged for now.
 */
export async function POST(request: Request) {
  let body: SaveRequestBody;
  try {
    body = (await request.json()) as SaveRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.extractedScenario || !body.calculatedScenario) {
    return NextResponse.json(
      { error: "Missing scenario data." },
      { status: 400 }
    );
  }

  const payload: SaveScenarioPayload = {
    sourceDomain: "CADeed.com",
    scenarioId: makeScenarioId(),
    rawUserInput: body.rawUserInput ?? "",
    extractedScenario: body.extractedScenario,
    calculatedScenario: body.calculatedScenario,
    userContact: body.userContact,
    createdAt: new Date().toISOString(),
  };

  const webhookUrl = process.env.GRCRM_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error(
          `[save-scenario] GRCRM webhook responded ${res.status}`
        );
        return NextResponse.json(
          {
            ok: false,
            scenarioId: payload.scenarioId,
            error: "GRCRM webhook rejected the scenario.",
          },
          { status: 502 }
        );
      }
    } catch (err) {
      console.error("[save-scenario] GRCRM webhook error:", err);
      return NextResponse.json(
        {
          ok: false,
          scenarioId: payload.scenarioId,
          error: "Could not reach GRCRM.",
        },
        { status: 502 }
      );
    }
  } else {
    // No webhook configured yet — log the prepared payload.
    console.log("[save-scenario] GRCRM_WEBHOOK_URL not set. Payload prepared:");
    console.log(JSON.stringify(payload, null, 2));
  }

  return NextResponse.json(
    { ok: true, scenarioId: payload.scenarioId, forwarded: !!webhookUrl },
    { status: 200 }
  );
}
