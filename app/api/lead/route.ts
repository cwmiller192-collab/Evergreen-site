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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LeadForm;

    // Basic server-side validation
    if (!body?.fullName || !body?.email || !body?.propertyState || !body?.consent) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    // --- Resend email ---
    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.LEAD_TO_EMAIL || "contact@evglending.com";
    const fromEmail = process.env.LEAD_FROM_EMAIL || "Evergreen Leads <onboarding@resend.dev>";

    if (!resendApiKey) {
      return NextResponse.json({ ok: false, error: "Missing RESEND_API_KEY env var" }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    const subject = `New Lead: ${body.loanType} — ${body.propertyState} — ${body.fullName}`;

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45;">
        <h2 style="margin:0 0 12px;">New Lead Submission</h2>
        <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          ${[
            ["Full Name", body.fullName],
            ["Email", body.email],
            ["Phone", body.phone || "(none)"],
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
                <td style="padding:6px 10px; border:1px solid #e5e7eb;">${escapeHtml(String(v))}</td>
              </tr>`
            )
            .join("")}
        </table>
        <p style="margin:14px 0 0; color:#6b7280; font-size:12px;">
          Sent from the Evergreen Equity Partners website.
        </p>
      </div>
    `;

    const sendResult = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
      replyTo: body.email,
    });

    if (sendResult.error) {
      return NextResponse.json({ ok: false, error: sendResult.error }, { status: 500 });
    }

    // --- Follow Up Boss (direct integration) ---
    const fubApiKey = process.env.FUB_API_KEY;

    if (fubApiKey) {
      try {
        const parts = body.fullName.trim().split(/\s+/);
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ");

        const fubRes = await fetch("https://api.followupboss.com/v1/people", {
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
            phones: body.phone ? [{ value: body.phone }] : [],
            tags: ["Website Lead"],
            notes: [
              {
                body:
                  `Loan Type: ${body.loanType}\n` +
                  `Loan Amount: ${body.loanAmount || "(not provided)"}\n` +
                  `Property State: ${body.propertyState}\n` +
                  `Timeline: ${body.timeline}\n\n` +
                  `Message: ${body.message || "(none)"}`,
              },
            ],
          }),
        });

        if (!fubRes.ok) {
          const errText = await fubRes.text();
          console.error("FUB error:", fubRes.status, errText);
        }
      } catch (err) {
        console.error("FUB integration failed:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
