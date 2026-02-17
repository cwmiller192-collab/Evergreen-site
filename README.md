# Evergreen Equity Partners — Lead Gen Site

This is a ready-to-deploy Next.js site.

## What you need (non-technical)
- A GitHub account (you already created one)
- A Vercel account (sign in with GitHub)
- An email provider API key (Resend) to send leads to your inbox

## 1) Create a Resend account (free)
- Create an account at Resend
- Get your API key (starts with `re_...`)

## 2) Deploy on Vercel
- Import this repository
- In Vercel → Project → Settings → Environment Variables, add:

RESEND_API_KEY = your Resend key  
LEAD_TO_EMAIL = chris@evgequity.com  
LEAD_FROM_EMAIL = Evergreen Leads <onboarding@resend.dev>  (or your verified domain later)

Then redeploy.

## 3) Connect your domain
Vercel will guide you to add DNS records at your domain registrar.

## Editing text & images
This build is set up so we can add an editing dashboard (CMS) next.
