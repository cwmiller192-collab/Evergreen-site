import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evergreen Equity Partners | Commercial & DSCR Lending",
  description:
    "Evergreen Equity Partners provides fast, transparent commercial and DSCR lending for income-producing properties.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
