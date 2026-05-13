import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Evergreen Equity Partners | Commercial & DSCR Lending",
  description:
    "Evergreen Equity Partners provides fast, transparent commercial and DSCR lending for income-producing properties.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-957652154"
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-957652154');
          `}
        </Script>
      </body>
    </html>
  );
}
