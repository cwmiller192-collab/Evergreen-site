import { NextResponse } from "next/server";

type LeadForm = {
  fullName: string;
  email: string;
  phone: string;
  loanType: "DSCR" | "Commercial" | "Unsure";
  loanAmount: string;
  propertyState: string;
  timeline: "ASAP" | "30-60 days" | "60+ days";
  message: string;
  consent: boolean;
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function digitsOnly(value: string) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function normalizePhone(value: string) {
  let d = digitsOnly(value);
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  if (d.length !== 10) return ""; // only accept valid US 10-digit for FUB
  return d;
}

function splitName(fullName: string) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

function buildLeadNote(body: LeadForm) {
  return [
    `Loan Type: ${body.loanType}`,
    `Loan Amount: ${body.loanAmount || "(not provided)"}`,
    `Property State: ${body.propertyState}`,
    `Timeline: ${body.timeline}`,
    `Message: ${body.message || "(none)"}`,
  ].join("\n");
}

async function fetchWithTimeout(url: string, init: RequestInit, ms = 8000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LeadForm;

    // --- light server-side validation ---
    if (!body?.fullName?.trim()) {
      return NextResponse.json({ ok: false, error: "Missing fullName" }, { status: 400 });
    }
    if (!isEmail(body?.email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    if (!body?.propertyState?.trim()) {
      return NextResponse.json({ ok: false, error: "Missing propertyState" }, { status: 400 });
    }
    if (!body?.consent) {
      return NextResponse.json({ ok: false, error: "Consent required" }, { status: 400 });
    }

    const fubApiKey = process.env.FUB_API_KEY;
    if (!fubApiKey) {
      // If you’d rather “not block” form submissions when FUB is down, change this to status 200 with ok:true.
      return NextResponse.json({ ok: false, error: "Missing FUB_API_KEY" }, { status: 500 });
    }

    const { firstName, lastName } = splitName(body.fullName);
    const phone = normalizePhone(body.phone);
    const note = buildLeadNote(body);

    // FUB recommends sending leads via /v1/events (not /v1/people).  [oai_citation:1‡Follow Up Boss](https://docs.followupboss.com/reference/send-in-a-lead)
    const eventType = process.env.FUB_EVENT_TYPE || "Website Inquiry";
    const eventSource = process.env.FUB_EVENT_SOURCE || "Evergreen Equity Website";

    const eventPayload: any = {
      type: eventType,
      source: eventSource,
      // “person” is the contact being created/updated
      person: {
        firstName,
        lastName,
        emails: [{ value: body.email }],
        ...(phone ? { phones: [{ value: phone }] } : {}),
        tags: ["Website Lead",body.loanType],
      },
      // Event detail — we keep it simple & readable
      message: note,
    };

    const auth = Buffer.from(`${fubApiKey}:`).toString("base64");

    const fubRes = await fetchWithTimeout("https://api.followupboss.com/v1/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(eventPayload),
    });

    const fubText = await fubRes.text();

    if (!fubRes.ok) {
      // Log enough detail to debug quickly in Vercel logs
      console.error("FUB error:", fubRes.status, fubText);
      return NextResponse.json(
        { ok: false, error: "FUB request failed", fubStatus: fubRes.status, fubBody: fubText },
        { status: 502 }
      );
    }

    // If you want, you can inspect/return parsed JSON
    let fubJson: any = null;
    try {
      fubJson = fubText ? JSON.parse(fubText) : null;
    } catch {
      // ignore parse errors; FUB may not always return JSON
    }

    return NextResponse.json({
      ok: true,
      fub: { ok: true, status: fubRes.status, response: fubJson || fubText || null },
    });
  } catch (e: any) {
    console.error("Lead route error:", e);
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
