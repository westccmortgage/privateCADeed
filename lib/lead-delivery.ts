import { NextResponse } from "next/server";

export const DELIVERY_FAILED_MESSAGE =
  "We could not send your request. Please try again or call (310) 654-1577.";

/**
 * Lead APIs answer ok:true only if at least one delivery channel (CRM or
 * email) succeeded. Otherwise 502 so the UI can show a clear failure.
 */
export function deliveryResponse(
  route: string,
  channels: { forwarded: boolean; emailed: boolean },
  success: Record<string, unknown>,
) {
  if (channels.forwarded || channels.emailed) {
    return NextResponse.json({ ok: true, ...channels, ...success }, { status: 200 });
  }
  console.error(`[${route}] lead NOT delivered: no channel succeeded (crm + email both failed or unconfigured)`);
  return NextResponse.json(
    { ok: false, message: DELIVERY_FAILED_MESSAGE },
    { status: 502 },
  );
}
