import { NextResponse } from "next/server";
import { buildCapitalSourcePayload, sendLeadToGRCRM } from "@/lib/grcrm-client";
import { sendNotificationEmail } from "@/lib/notify";
import type { CapitalSourceProfile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CapitalSourceBody = Partial<CapitalSourceProfile>;

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export async function POST(request: Request) {
  let body: CapitalSourceBody;
  try {
    body = (await request.json()) as CapitalSourceBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const companyName = (body.companyName ?? "").toString().trim();
  const email = (body.email ?? "").toString().trim();
  if (!companyName || !email) {
    return NextResponse.json(
      { error: "Company name and email are required." },
      { status: 400 },
    );
  }

  const profile: CapitalSourceProfile = {
    companyName,
    contactPerson: (body.contactPerson ?? "").toString().trim(),
    email,
    phone: (body.phone ?? "").toString().trim(),
    states: toArray(body.states),
    counties: (body.counties ?? "").toString().trim(),
    lienPositions: (body.lienPositions ?? "").toString().trim(),
    maxLTV: toNumber(body.maxLTV),
    maxCLTV: toNumber(body.maxCLTV),
    minLoanAmount: toNumber(body.minLoanAmount),
    maxLoanAmount: toNumber(body.maxLoanAmount),
    propertyTypes: toArray(body.propertyTypes),
    programs: toArray(body.programs),
    ownerOccupiedAllowed:
      typeof body.ownerOccupiedAllowed === "boolean" ? body.ownerOccupiedAllowed : null,
    businessPurposeOnly:
      typeof body.businessPurposeOnly === "boolean" ? body.businessPurposeOnly : null,
    expectedResponseTime: (body.expectedResponseTime ?? null) as string | null,
    notes: (body.notes ?? "").toString().trim(),
  };

  const payload = buildCapitalSourcePayload(profile, new Date().toISOString());

  const summary = [
    `New capital-source lending box from CADeed.com`,
    ``,
    `Company: ${profile.companyName}`,
    `Contact: ${profile.contactPerson || "—"} · ${profile.email} · ${profile.phone || "—"}`,
    `States: ${profile.states.join(", ") || "—"} · Counties: ${profile.counties || "—"}`,
    `Lien: ${profile.lienPositions || "—"} · Max LTV: ${profile.maxLTV ?? "—"} · Max CLTV: ${profile.maxCLTV ?? "—"}`,
    `Loan range: ${profile.minLoanAmount ?? "—"} – ${profile.maxLoanAmount ?? "—"}`,
    `Property types: ${profile.propertyTypes.join(", ") || "—"}`,
    `Programs: ${profile.programs.join(", ") || "—"}`,
    `Owner-occupied allowed: ${profile.ownerOccupiedAllowed ?? "—"} · Business-purpose only: ${profile.businessPurposeOnly ?? "—"}`,
    `Response time: ${profile.expectedResponseTime ?? "—"}`,
    `Notes: ${profile.notes || "—"}`,
  ].join("\n");

  // Forward to GRCRM as a clean lead (company as the name).
  const result = await sendLeadToGRCRM({
    name: profile.companyName,
    email: profile.email,
    phone: profile.phone,
    message: `[CAPITAL SOURCE]\n${summary}`,
  });

  const emailResult = await sendNotificationEmail(
    `New CADeed capital-source profile — ${profile.companyName} (${payload.profileId})`,
    summary,
  );

  return NextResponse.json(
    {
      ok: true,
      profileId: payload.profileId,
      configured: result.configured,
      forwarded: result.sent,
      emailed: emailResult.sent,
      message:
        "Thanks — your lending box was received. We'll be in touch about matching California scenarios.",
    },
    { status: 200 },
  );
}
