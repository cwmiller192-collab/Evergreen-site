"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Calculator,
  Check,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Timer,
  Landmark,
} from "lucide-react";
import { Accordion } from "@/components/accordion";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea, cn } from "@/components/ui";

const logoSrc = "/logo.jpg"; // placed in /public

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

const initialForm: LeadForm = {
  fullName: "",
  email: "",
  phone: "",
  loanType: "DSCR",
  loanAmount: "",
  propertyState: "",
  timeline: "ASAP",
  message: "",
  consent: false,
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function formatPhone(value: string) {
  let d = digitsOnly(value);

  // If user includes US country code (1), drop it
  if (d.length === 11 && d.startsWith("1")) {
    d = d.slice(1);
  }

  // Keep only 10 digits max after normalization
  d = d.slice(0, 10);

  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return `(${parts[0]}`;
  if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`;
  return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
}
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Page() {
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const validation = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Please enter your name.";
    if (!isEmail(form.email)) errs.email = "Please enter a valid email.";
    const phoneDigits = digitsOnly(form.phone);
    if (phoneDigits.length > 0 && phoneDigits.length < 10) errs.phone = "Please enter a 10-digit phone number (or leave blank).";
    if (!form.propertyState.trim()) errs.propertyState = "Please enter the property state.";
    if (!form.consent) errs.consent = "Please confirm you consent to be contacted.";
    return { errs, isValid: Object.keys(errs).length === 0 };
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validation.isValid) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm(initialForm);
      setTimeout(() => setStatus("idle"), 4500);
    } catch {
      setStatus("error");
    }
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Decorative background */} 
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-[-140px] h-[420px] w-[420px] rounded-full bg-brand-600/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <button
            onClick={() => scrollToId("top")}
            className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-50"
            aria-label="Go to top"
          >
            <img src={logoSrc} alt="Evergreen Equity Partners" className="h-10 w-auto" />
            <div className="leading-tight text-left">
              <div className="text-sm font-semibold">Evergreen Equity Partners</div>
              <div className="text-xs text-slate-500">Commercial & DSCR Lending</div>
            </div>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              ["Solutions", "solutions"],
              ["Process", "process"],
              ["FAQ", "faq"],
              ["Contact", "contact"],
            ].map(([label, id]) => (
              <Button key={id} variant="ghost" className="rounded-xl" onClick={() => scrollToId(id)}>
                {label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="hidden rounded-xl md:inline-flex" onClick={() => scrollToId("contact")}>
              Get a Quote
            </Button>
            <Button className="rounded-xl" onClick={() => scrollToId("contact")}>
              Apply / Get Pre-Qualified <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main id="top">
        <section className="mx-auto max-w-6xl px-4 pt-14 md:px-6 md:pt-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5 }}
              variants={fadeUp}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full">
                  <Sparkles className="h-3.5 w-3.5" />
                  Modern, borrower-first lending
                </Badge>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                  Transparent terms
                </span>
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Commercial & DSCR loans—
                <span className="block text-brand-600">designed to close.</span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
                Evergreen Equity Partners helps investors and owners secure financing for income-producing properties.
                Fast, straightforward qualification and a process built around speed, clarity, and certainty.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button className="rounded-2xl" size="lg" onClick={() => scrollToId("contact")}>
                  Get pre-qualified <ArrowRight className="h-4 w-4" />
                </Button>
                <Button className="rounded-2xl" size="lg" variant="outline" onClick={() => scrollToId("solutions")}>
                  Explore loan options
                </Button>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: <Timer className="h-4 w-4" />, title: "Fast turnarounds", desc: "Clear next steps within 24–48 hrs." },
                  { icon: <Calculator className="h-4 w-4" />, title: "Investor friendly", desc: "DSCR-focused options." },
                  { icon: <Building2 className="h-4 w-4" />, title: "Commercial ready", desc: "Stabilized and value-add." },
                ].map((it) => (
                  <div key={it.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-brand-600">
                        {it.icon}
                      </span>
                      {it.title}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{it.desc}</p>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-xs text-slate-500">
                * Timelines and terms vary by scenario. Submit your details for a tailored quote.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55 }}
            >
              <Card className="rounded-3xl shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Get a quote in minutes</CardTitle>
                  <p className="text-sm text-slate-600">
                    Tell us about the property and your timeline—we’ll follow up with options.
                  </p>
                </CardHeader>
                <CardContent>
                  <LeadFormCard form={form} setForm={setForm} validation={validation} status={status} onSubmit={onSubmit} />
                </CardContent>
              </Card>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { title: "No hard pull", desc: "Initial review without impacting credit." },
                  { title: "Clear terms", desc: "Upfront expectations, no surprises." },
                  { title: "Investor focus", desc: "Built for rental portfolios." },
                ].map((b) => (
                  <div key={b.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-medium">{b.title}</div>
                    <div className="mt-1 text-xs text-slate-600">{b.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Solutions */}
        <section id="solutions" className="mx-auto max-w-6xl px-4 pt-16 md:px-6 md:pt-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            variants={fadeUp}
            className="flex items-end justify-between gap-6"
          >
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Loan solutions</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                Choose the path that matches your deal. If you’re not sure, select “Unsure” in the form and we’ll guide you.
              </p>
            </div>
            <Button variant="outline" className="hidden rounded-2xl md:inline-flex" onClick={() => scrollToId("contact")}>
              Talk to a lending specialist
            </Button>
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-2xl border border-slate-200 bg-brand-600/10 text-brand-600">
                    <Calculator className="h-4 w-4" />
                  </span>
                  DSCR Loans
                </CardTitle>
                <p className="text-sm text-slate-600">
                  For investment properties—qualify primarily on cash flow.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Ideal for rental investors and portfolio growth",
                  "Flexible structures for many investor scenarios",
                  "Streamlined documentation compared to conventional",
                  "Designed to move quickly when the deal is hot",
                ].map((t) => (
                  <div key={t} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 text-brand-600" />
                    <span className="text-slate-600">{t}</span>
                  </div>
                ))}
                <Button className="mt-2 w-full rounded-2xl" onClick={() => { setForm((f) => ({ ...f, loanType: "DSCR" })); scrollToId("contact"); }}>
                  Get DSCR options <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-2xl border border-slate-200 bg-brand-600/10 text-brand-600">
                    <Building2 className="h-4 w-4" />
                  </span>
                  Commercial Loans
                </CardTitle>
                <p className="text-sm text-slate-600">
                  For owner-occupied or income-producing commercial real estate scenarios.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Stabilized and value-add opportunities",
                  "Terms aligned to your business plan",
                  "Support for acquisitions, refinances, and cash-out",
                  "Guidance from application to closing",
                ].map((t) => (
                  <div key={t} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 text-brand-600" />
                    <span className="text-slate-600">{t}</span>
                  </div>
                ))}
                <Button className="mt-2 w-full rounded-2xl" onClick={() => { setForm((f) => ({ ...f, loanType: "Commercial" })); scrollToId("contact"); }}>
                  Get commercial options <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-brand-600/5 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-brand-600">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold">What we typically need</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Property address/state, estimated value or purchase price, and your timeline. Additional documents depend on scenario.
                  </div>
                </div>
              </div>
              <Button variant="outline" className="rounded-2xl" onClick={() => scrollToId("contact")}>
                Start an inquiry
              </Button>
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="mx-auto max-w-6xl px-4 pt-16 md:px-6 md:pt-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            variants={fadeUp}
          >
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">A simple, modern process</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              We keep things straightforward. You’ll always know what’s next.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { step: "01", title: "Share your deal", desc: "Submit the form with basic details—loan type, amount, state, timeline." },
              { step: "02", title: "Review & options", desc: "We review your scenario and respond with the best-fit structures." },
              { step: "03", title: "Move to close", desc: "Clear documentation, coordinated underwriting, and a close-ready path." },
            ].map((s) => (
              <Card key={s.step} className="rounded-3xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-brand-600/10 px-3 py-1 text-xs font-medium text-brand-600">
                      {s.step}
                    </span>
                    <div className="grid h-9 w-9 place-items-center rounded-2xl border border-slate-200 bg-brand-600/10 text-brand-600">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                  <CardTitle className="mt-2">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold">Want us to call you?</div>
              <div className="mt-1 text-sm text-slate-600">
                Leave your phone number and the best time to reach you.
              </div>
            </div>
            <Button className="rounded-2xl" onClick={() => scrollToId("contact")}>
              Request a call <Phone className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-6xl px-4 pt-16 md:px-6 md:pt-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            variants={fadeUp}
          >
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Built for clarity</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              Borrowers choose Evergreen for a process that feels modern and predictable.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { quote: "Clear communication and fast feedback—exactly what you want when timing matters.", name: "Real estate investor" },
              { quote: "Straightforward checklist and no runaround. We always knew the next step.", name: "Owner-operator" },
              { quote: "They understood the deal and provided options that matched our plan.", name: "Sponsor" },
            ].map((t) => (
              <Card key={t.name} className="rounded-3xl">
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed text-slate-600">“{t.quote}”</p>
                  <div className="my-4 h-px w-full bg-slate-200" />
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-slate-500">Client testimonial</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-6xl px-4 pt-16 md:px-6 md:pt-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            variants={fadeUp}
          >
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">FAQ</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              Quick answers to common questions. If your scenario is unique, send us the details.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="rounded-3xl">
              <CardContent className="pt-6">
                <Accordion
                  items={[
                    {
                      q: "What’s the difference between DSCR and commercial loans?",
                      a: "DSCR loans are typically geared toward investment properties and often focus on cash flow coverage. Commercial loans commonly apply to owner-occupied or broader commercial real estate scenarios. We’ll help you choose the right structure for your deal.",
                    },
                    {
                      q: "How fast can you respond after I submit the form?",
                      a: "We aim to provide clear next steps within 24–48 hours. More complex deals may require a bit more detail, but you’ll always know what we need.",
                    },
                    {
                      q: "Do you require a hard credit pull to start?",
                      a: "For an initial review, we can often start without a hard pull. If your scenario requires additional verification later, we’ll explain exactly when and why.",
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="pt-6">
                <Accordion
                  items={[
                    {
                      q: "What information should I have ready?",
                      a: "Property state (and address if available), estimated value or purchase price, loan request amount, and your target timeline. If you have a rent roll or financials, those can help—but they’re not required to start.",
                    },
                    {
                      q: "Do you work with investors who have multiple properties?",
                      a: "Yes—many borrowers come to us for portfolio growth and repeat transactions. Share your goals and we’ll structure a plan that scales.",
                    },
                    {
                      q: "Where do you lend?",
                      a: "Tell us your property state in the form. We’ll confirm eligibility and outline the best options available for that market.",
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mx-auto max-w-6xl px-4 pb-20 pt-16 md:px-6 md:pb-28 md:pt-24">
          <div className="grid gap-6 md:grid-cols-2 md:items-start">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              variants={fadeUp}
            >
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Let’s talk about your deal</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600 md:text-base">
                Submit the inquiry and we’ll respond with next steps and options.
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4 text-brand-600" /> Email
                  </div>
                  <div className="mt-1 text-sm text-slate-600">chris@evgequity.com</div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4 text-brand-600" /> Phone
                  </div>
                  <div className="mt-1 text-sm text-slate-600">(555) 123-4567</div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-medium">Hours</div>
                  <div className="mt-1 text-sm text-slate-600">Mon–Fri • 9:00am–6:00pm ET</div>
                </div>
              </div>

              <p className="mt-6 text-xs text-slate-500">
                By submitting, you agree Evergreen Equity Partners may contact you about your inquiry.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55 }}
            >
              <Card className="rounded-3xl shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Inquiry form</CardTitle>
                  <p className="text-sm text-slate-600">We’ll get back to you within 1–2 business days.</p>
                </CardHeader>
                <CardContent>
                  <LeadFormCard form={form} setForm={setForm} validation={validation} status={status} onSubmit={onSubmit} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <footer className="mt-16 border-t border-slate-200 pt-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-0 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-brand-600/10 text-brand-600">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Evergreen Equity Partners</div>
                  <div className="text-xs text-slate-500">Commercial & DSCR Lending</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  ["Solutions", "solutions"],
                  ["Process", "process"],
                  ["FAQ", "faq"],
                  ["Contact", "contact"],
                ].map(([label, id]) => (
                  <Button key={id} variant="ghost" className="rounded-xl" onClick={() => scrollToId(id)}>
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-6 max-w-6xl text-xs text-slate-500">
              © {new Date().getFullYear()} Evergreen Equity Partners. All rights reserved.
              <span className="block mt-2">
                Disclaimer: This website is for informational purposes only and is not a commitment to lend. Loan approval, terms, and conditions are subject to underwriting and verification.
              </span>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

function LeadFormCard({
  form,
  setForm,
  validation,
  status,
  onSubmit,
}: {
  form: LeadForm;
  setForm: React.Dispatch<React.SetStateAction<LeadForm>>;
  validation: { errs: Record<string, string>; isValid: boolean };
  status: "idle" | "sending" | "success" | "error";
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
}) {
  const err = validation.errs;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {status === "error" ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          Please fix the highlighted fields and try again.
        </div>
      ) : null}

      {status === "success" ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          <span className="font-medium">Thanks—got it.</span> We’ll reach out shortly.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className={cn(err.fullName && "border-red-300")}
            placeholder="Chris Miller"
            autoComplete="name"
          />
          {err.fullName ? <p className="text-xs text-red-700">{err.fullName}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={cn(err.email && "border-red-300")}
            placeholder="you@company.com"
            autoComplete="email"
          />
          {err.email ? <p className="text-xs text-red-700">{err.email}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
            className={cn(err.phone && "border-red-300")}
            placeholder="(555) 123-4567"
            autoComplete="tel"
            inputMode="tel"
          />
          {err.phone ? <p className="text-xs text-red-700">{err.phone}</p> : null}
        </div>

        <div className="space-y-2">
          <Label>Loan type</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: "DSCR" as const, label: "DSCR" },
              { v: "Commercial" as const, label: "Commercial" },
              { v: "Unsure" as const, label: "Unsure" },
            ].map((o) => {
              const active = form.loanType === o.v;
              return (
                <Button
                  key={o.v}
                  type="button"
                  variant={active ? "solid" : "outline"}
                  className={cn("rounded-2xl", !active && "bg-white")}
                  onClick={() => setForm((f) => ({ ...f, loanType: o.v }))}
                >
                  {o.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="loanAmount">Desired loan amount (optional)</Label>
          <Input
            id="loanAmount"
            value={form.loanAmount}
            onChange={(e) => setForm((f) => ({ ...f, loanAmount: e.target.value }))}
            placeholder="$250,000"
            inputMode="decimal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyState">Property state</Label>
          <Input
            id="propertyState"
            value={form.propertyState}
            onChange={(e) => setForm((f) => ({ ...f, propertyState: e.target.value }))}
            className={cn(err.propertyState && "border-red-300")}
            placeholder="NY"
            autoComplete="address-level1"
          />
          {err.propertyState ? <p className="text-xs text-red-700">{err.propertyState}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Timeline</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: "ASAP" as const, label: "ASAP" },
            { v: "30-60 days" as const, label: "30–60" },
            { v: "60+ days" as const, label: "60+" },
          ].map((o) => {
            const active = form.timeline === o.v;
            return (
              <Button
                key={o.v}
                type="button"
                variant={active ? "solid" : "outline"}
                className={cn("rounded-2xl", !active && "bg-white")}
                onClick={() => setForm((f) => ({ ...f, timeline: o.v }))}
              >
                {o.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Tell us a bit more (optional)</Label>
        <Textarea
          id="message"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="min-h-[96px]"
          placeholder="Property type, purchase/refi, occupancy, rental income, anything helpful."
        />
      </div>

      <div className="space-y-2">
        <label className={cn("flex items-start gap-3 rounded-2xl border border-slate-200 p-3", err.consent && "border-red-300")}>
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={form.consent}
            onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
          />
          <span className="text-sm text-slate-600">
            I consent to be contacted by Evergreen Equity Partners about my inquiry.
          </span>
        </label>
        {err.consent ? <p className="text-xs text-red-700">{err.consent}</p> : null}
      </div>

      <Button type="submit" className="w-full rounded-2xl" disabled={status === "sending"}>
        {status === "sending" ? "Submitting…" : "Submit inquiry"}
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="text-xs text-slate-500">
        Prefer email? Send your details to <span className="font-medium">chris@evgequity.com</span>.
      </p>
    </form>
  );
}
