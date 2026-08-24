import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";

type LegalPageConfig = {
  fileName: `${string}.md`;
  eyebrow: string;
  title: string;
  description: string;
};

export const legalPages = {
  privacy: {
    fileName: "privacy.md",
    eyebrow: "Privacy",
    title: "Privacy Notice",
    description:
      "How Igdrasil processes personal data for customers, users, website visitors, and business contacts.",
  },
  terms: {
    fileName: "terms.md",
    eyebrow: "Terms",
    title: "General Terms and Conditions",
    description:
      "The legal terms that govern access to and use of the Igdrasil platform and subscription services.",
  },
  cookies: {
    fileName: "cookies.md",
    eyebrow: "Cookies",
    title: "Cookie Policy",
    description:
      "Which cookies and browser storage Igdrasil uses, what each one is for, and how to control them.",
  },
  dpa: {
    fileName: "dpa.md",
    eyebrow: "Data protection",
    title: "Data Processing Agreement",
    description:
      "The Article 28 terms under which Igdrasil processes personal data on behalf of its customers.",
  },
  subprocessors: {
    fileName: "subprocessors.md",
    eyebrow: "Data protection",
    title: "Sub-processors",
    description:
      "Every provider Igdrasil engages to process customer personal data, what each one does, and where it processes.",
  },
  "security-overview": {
    fileName: "security.md",
    eyebrow: "Security",
    title: "Security and Infrastructure Overview",
    description:
      "The technical and organisational measures protecting customer data, and the claims we deliberately do not make.",
  },
} as const satisfies Record<string, LegalPageConfig>;

export type LegalPageSlug = keyof typeof legalPages;

export async function getLegalPageContent(slug: LegalPageSlug) {
  const config = legalPages[slug];
  const content = await readFile(
    path.join(process.cwd(), "content", "legal", config.fileName),
    "utf8"
  );

  return content.replace(/^#\s.+\n+/u, "");
}

export function getLegalPageMetadata(slug: LegalPageSlug): Metadata {
  const config = legalPages[slug];

  return {
    title: `${config.title} | Igdrasil`,
    description: config.description,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title: `${config.title} | Igdrasil`,
      description: config.description,
      url: `https://igdrasil.se/${slug}`,
      siteName: "Igdrasil",
    },
  };
}