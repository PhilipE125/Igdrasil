import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const haffer = localFont({
  src: [
    { path: "../../public/fonts/haffer-regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/haffer-medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/haffer-bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/haffer-heavy.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-haffer",
  display: "swap",
  fallback: ["Arial", "system-ui", "sans-serif"],
});

const perfectlyNineties = localFont({
  src: [
    { path: "../../public/fonts/perfectly-nineties-regular.otf", weight: "400", style: "normal" },
  ],
  variable: "--font-perfectly-nineties",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const TITLE = "Igdrasil | AI accounting for Swedish businesses";
const DESCRIPTION =
  "Igdrasil is a Swedish AI-powered accounting platform: bookkeeping, invoicing, payroll, VAT, reporting and forecasting in one system, with accounting-specific guardrails and human approval before anything is posted.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "Igdrasil",
    locale: "en_GB",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${haffer.variable} ${perfectlyNineties.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
