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

    // Basic server-side validation (keep light)
    if (!body?.fullName || !body?.email || !body?.propertyState || !body?.consent) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.LEAD_TO_EMAIL || "chris@evgequity.com";
    const fromEmail = process.env.LEAD_FROM_EMAIL || "Evergreen Leads <onboarding@resend.dev>";

    if (!resendApiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing RESEND_API_KEY env var" },
        { status: 500 }
      );
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

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
      replyTo: body.email,
    });

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
