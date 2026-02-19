import { NextResponse } from "next/server";
import { Resend } from "resend";

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

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function digitsOnly(value: string) {
  return (value || "").replace(/[^0-9]/g, "");
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LeadForm;

    // --- Basic server-side validation (keep light) ---
    if (
      !body?.fullName?.trim() ||
      !isEmail(body?.email) ||
      !body?.propertyState?.trim() ||
      body?.consent !== true
    ) {
      return NextResponse.json({ ok: false, error: "Missing/invalid fields" }, { status: 400 });
    }

    // Optional: normalize phone
    const phoneDigits = digitsOnly(body.phone);
    const normalizedPhone = phoneDigits.length >= 10 ? body.phone : "";

    // --- ENV ---
    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.LEAD_TO_EMAIL || "contact@evglending.com";
    const fromEmail = process.env.LEAD_FROM_EMAIL || "Evergreen Leads <onboarding@resend.dev>";

    const fubApiKey = process.env.FUB_API_KEY; // optional

    if (!resendApiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing RESEND_API_KEY env var" },
        { status: 500 }
      );
    }

    // --- Email (Resend) ---
    const resend = new Resend(resendApiKey);

    const subject = `New Lead: ${body.loanType} — ${body.propertyState} — ${body.fullName}`;

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45;">
        <h2 style="margin:0 0 12px;">New Lead Submission</h2>
        <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          ${[
            ["Full Name", body.fullName],
            ["Email", body.email],
            ["Phone", normalizedPhone || "(none)"],
            ["Loan Type", body.loanType],
            ["Loan Amount", body.loanAmount || "(not provided)"],
            ["Property State", body.propertyState],
            ["Timeline", body.timeline],
            ["Message", body.message || "(none)"],
          ]
            .map(
              ([k, v]) => `
              <tr>
                <td style="padding:6px 10px; border:1px solid #e5e7eb; font-weight:600; background:#f9fafb;">${escapeHtml(
                  String(k)
                )}</td>
                <td style="padding:6px 10px; border:1px solid #e5e7eb;">${escapeHtml(
                  String(v)
                )}</td>
              </tr>`
            )
            .join("")}
        </table>
        <p style="margin:14px 0 0; color:#6b7280; font-size:12px;">
          Sent from the Evergreen Equity Partners website.
        </p>
      </div>
    `;

    const resendResult = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
      replyTo: body.email,
    });

    if (resendResult.error) {
      return NextResponse.json({ ok: false, error: resendResult.error }, { status: 500 });
    }

    // --- Follow Up Boss (optional integration) ---
    // We DO NOT fail the request if FUB errors — we log it and still return ok:true.
    if (fubApiKey) {
      try {
        const parts = body.fullName.trim().split(/\s+/);
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ");

        // 1) Create person
        const createRes = await fetch("https://api.followupboss.com/v1/people", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + Buffer.from(`${fubApiKey}:`).toString("base64"),
          },
          body: JSON.stringify({
            firstName,
            lastName,
            source: "Website Inquiry",
            emails: [{ value: body.email }],
            phones: normalizedPhone ? [{ value: normalizedPhone }] : [],
            tags: ["Website Lead"],
          }),
        });

        const createText = await createRes.text();
        let createdPerson: any = null;
        try {
          createdPerson = createText ? JSON.parse(createText) : null;
        } catch {
          createdPerson = null;
        }

        if (!createRes.ok) {
          console.error("FUB create person failed:", createRes.status, createText);
        } else if (createdPerson?.id) {
          // 2) Add note (this is the correct place for your "Loan Type / Timeline / Message" details)
          const noteBody =
            `Loan Type: ${body.loanType}\n` +
            `Loan Amount: ${body.loanAmount || "(not provided)"}\n` +
            `Property State: ${body.propertyState}\n` +
            `Timeline: ${body.timeline}\n\n` +
            `Message: ${body.message || "(none)"}`;

          const noteRes = await fetch(`https://api.followupboss.com/v1/people/${createdPerson.id}/notes`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + Buffer.from(`${fubApiKey}:`).toString("base64"),
            },
            body: JSON.stringify({ body: noteBody }),
          });

          if (!noteRes.ok) {
            const noteErr = await noteRes.text();
            console.error("FUB note failed:", noteRes.status, noteErr);
          }
        }
      } catch (err) {
        console.error("FUB integration failed:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
