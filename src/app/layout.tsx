import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/ThemeProvider";
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

export const metadata: Metadata = {
  title: "Igdrasil AB | Coming Soon",
  description:
    "Exclusive pre-launch access portal for Igdrasil AB. Join the future ecosystem.",
  metadataBase: new URL("https://igdrasil.se"),
  openGraph: {
    title: "Igdrasil AB | Coming Soon",
    description:
      "Exclusive pre-launch access portal for Igdrasil AB. Join the future ecosystem.",
    siteName: "Igdrasil AB",
  },
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${haffer.variable} ${perfectlyNineties.variable} overflow-x-hidden`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground font-sans antialiased overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
