import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ProsePage } from "@/components/ProsePage";
import { extractFaq, readDoc } from "@/lib/docs";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo";

const TITLE = "Igdrasil accounting software: AI for Swedish businesses";
const DESCRIPTION =
  "Igdrasil is an AI-powered platform for Swedish businesses and accounting firms. Bookkeeping, payroll, VAT, reporting, budgeting, forecasting and AI insights.";
const PUBLISHED = "2026-08-23";
const AUTHOR = "Edith Wolff";

export const metadata: Metadata = {
  title: `${TITLE} | Igdrasil`,
  description: DESCRIPTION,
  alternates: { canonical: "/why-igdrasil" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/why-igdrasil",
    siteName: "Igdrasil",
    type: "article",
    publishedTime: PUBLISHED,
    authors: [AUTHOR],
  },
};

export default async function WhyIgdrasilPage() {
  const content = await readDoc("why-igdrasil");

  return (
    <ProsePage
      eyebrow="Product"
      title="Igdrasil accounting software: AI accounting for Swedish businesses and firms"
      lead="What the platform does, how the three steps fit together, and where the guardrails stop an agent short of posting."
      meta={
        <div className="mt-6 space-y-1 text-sm text-muted-foreground">
          <p>
            Written by{" "}
            <span className="font-medium text-foreground">{AUTHOR}</span>, co-founder of
            Igdrasil &middot; 14 min read &middot; Updated 23 August 2026
          </p>
          <p className="text-xs">
            MSc in Accounting, Valuation &amp; Financial Management, Stockholm School of
            Economics
          </p>
        </div>
      }
      content={content}
    >
      <JsonLd
        data={articleSchema({
          headline: TITLE,
          description: DESCRIPTION,
          path: "/why-igdrasil",
          published: PUBLISHED,
          modified: PUBLISHED,
          authorName: AUTHOR,
        })}
      />
      <JsonLd data={faqSchema(extractFaq(content))} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Why Igdrasil", path: "/why-igdrasil" },
        ])}
      />
    </ProsePage>
  );
}
