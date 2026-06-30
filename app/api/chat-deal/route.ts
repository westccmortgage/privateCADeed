import { NextResponse } from "next/server";
import { buildChatResponse } from "@/lib/scenario-engine";
import { getPendingField } from "@/lib/deal-calculator";
import { normalizeScenario } from "@/lib/scenario-merger";
import { extractPatchWithClaude } from "@/lib/claude-extract";
import { mockExtract } from "@/lib/mock-extractor";
import type { ChatTurn, ExtractedScenario } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  message?: string;
  currentScenario?: Partial<ExtractedScenario> | null;
  conversation?: ChatTurn[];
}

export async function POST(request: Request) {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json(
      { error: "Please type your deal or answer." },
      { status: 400 },
    );
  }
  if (message.length > 4000) {
    return NextResponse.json(
      { error: "That message is too long. Please shorten it." },
      { status: 400 },
    );
  }

  const current = normalizeScenario(body.currentScenario);
  const conversation = Array.isArray(body.conversation) ? body.conversation : [];
  const pendingField = getPendingField(current);

  let patch: Partial<ExtractedScenario>;
  let usedFallback = false;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      patch = await extractPatchWithClaude(message, conversation, current);
      // Belt-and-suspenders: also bind a terse numeric answer locally.
      const local = mockExtract(message, { pendingField });
      patch = mergePreferAI(patch, local);
    } catch (err) {
      console.error("[chat-deal] Claude extraction failed, using fallback:", err);
      patch = mockExtract(message, { pendingField });
      usedFallback = true;
    }
  } else {
    patch = mockExtract(message, { pendingField });
    usedFallback = true;
  }

  const result = buildChatResponse(current, patch);
  return NextResponse.json({ ...result, meta: { usedFallback } }, { status: 200 });
}

/** Prefer AI-extracted non-null values; fill any gaps with the local pass. */
function mergePreferAI(
  ai: Partial<ExtractedScenario>,
  local: Partial<ExtractedScenario>,
): Partial<ExtractedScenario> {
  const out: Partial<ExtractedScenario> = { ...local };
  (Object.keys(ai) as Array<keyof ExtractedScenario>).forEach((key) => {
    const v = ai[key];
    if (v !== null && v !== undefined && v !== "") {
      // @ts-expect-error — key/value aligned by construction
      out[key] = v;
    }
  });
  return out;
}
