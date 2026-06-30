import { NextResponse } from "next/server";
import { sendNotificationEmail } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BookBody {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export async function POST(request: Request) {
  let body: BookBody;
  try {
    body = (await request.json()) as BookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !/\S+@\S+\.\S+/.test(email)) {
    return NextResponse.json(
      { error: "Please add your name and a valid email." },
      { status: 400 },
    );
  }

  const result = await sendNotificationEmail(
    `New deal-review request — ${name}`,
    [
      `New "Book a deal review" request from CADeed.com`,
      ``,
      `Name:  ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "—"}`,
      ``,
      `Message:`,
      message || "(none)",
    ].join("\n"),
    email, // reply-to → answer the lead directly
  );

  return NextResponse.json(
    {
      ok: true,
      emailed: result.sent,
      message: "Thanks — we received your request and will reach out shortly.",
    },
    { status: 200 },
  );
}
