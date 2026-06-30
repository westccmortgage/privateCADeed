import { NextResponse } from "next/server";
import { buildScenario } from "@/lib/scenario-engine";
import { extractWithClaude } from "@/lib/claude-extract";
import { mockExtract } from "@/lib/mock-extractor";
import type { ExtractedScenario } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AnalyzeRequestBody {
  input?: string;
}

export async function POST(request: Request) {
  let body: AnalyzeRequestBody;
  try {
    body = (await request.json()) as AnalyzeRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const input = (body.input ?? "").trim();
  if (!input) {
    return NextResponse.json(
      { error: "Please describe your deal." },
      { status: 400 }
    );
  }
  if (input.length > 4000) {
    return NextResponse.json(
      { error: "That description is too long. Please shorten it." },
      { status: 400 }
    );
  }

  let extracted: Partial<ExtractedScenario>;
  let usedFallback = false;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      extracted = await extractWithClaude(input);
    } catch (err) {
      console.error("[analyze-deal] Claude extraction failed, using fallback:", err);
      extracted = mockExtract(input);
      usedFallback = true;
    }
  } else {
    extracted = mockExtract(input);
    usedFallback = true;
  }

  const scenario = buildScenario(input, extracted);

  return NextResponse.json(
    { ...scenario, meta: { usedFallback } },
    { status: 200 }
  );
}
