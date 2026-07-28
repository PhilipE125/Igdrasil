import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";

type LegalPageConfig = {
  fileName: "privacy.md" | "terms.md";
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