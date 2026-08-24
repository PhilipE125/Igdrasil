import type { FaqEntry } from "@/lib/docs";

export const SITE_URL = "https://igdrasil.se";

const ORGANISATION_ID = `${SITE_URL}/#organization`;

/** The founders, as they are described on the about page. */
const founders = [
  {
    "@type": "Person",
    name: "Edith Wolff",
    jobTitle: "Co-founder",
    alumniOf: { "@type": "CollegeOrUniversity", name: "Stockholm School of Economics" },
  },
  {
    "@type": "Person",
    name: "Philip Eriksson",
    jobTitle: "Co-founder",
    alumniOf: { "@type": "CollegeOrUniversity", name: "Stockholm School of Economics" },
  },
] as const;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANISATION_ID,
    name: "Igdrasil AB",
    url: SITE_URL,
    logo: `${SITE_URL}/igdrasil_logo.svg`,
    description:
      "Igdrasil is a Swedish AI-powered accounting platform for bookkeeping, invoicing, payroll, VAT, reporting, budgeting and forecasting.",
    email: "support@igdrasil.se",
    telephone: "+46723007638",
    foundingDate: "2026",
    founder: founders,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kornhamnstorg 61",
      postalCode: "111 27",
      addressLocality: "Stockholm",
      addressCountry: "SE",
    },
    areaServed: { "@type": "Country", name: "Sweden" },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Igdrasil",
    publisher: { "@id": ORGANISATION_ID },
    inLanguage: "en",
  };
}

/** Answer-engine bait: the questions a page answers, in machine-readable form. */
export function faqSchema(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

export function articleSchema(article: {
  headline: string;
  description: string;
  path: string;
  published: string;
  modified: string;
  authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    datePublished: article.published,
    dateModified: article.modified,
    author: { "@type": "Person", name: article.authorName },
    publisher: { "@id": ORGANISATION_ID },
    mainEntityOfPage: `${SITE_URL}${article.path}`,
    inLanguage: "en",
  };
}
