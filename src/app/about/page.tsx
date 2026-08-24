import type { Metadata } from "next";
import Image from "next/image";
import { JsonLd } from "@/components/JsonLd";
import { ProsePage } from "@/components/ProsePage";
import { extractFaq, readDoc } from "@/lib/docs";
import { breadcrumbSchema, faqSchema, organizationSchema } from "@/lib/seo";

const TITLE = "About Igdrasil: the founders behind AI accounting";
const DESCRIPTION =
  "Meet Edith Wolff and Philip Eriksson, the founders of Igdrasil — a Swedish platform for AI-powered accounting and better business decisions.";

export const metadata: Metadata = {
  title: `${TITLE} | Igdrasil`,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Join Igdrasil's journey",
    description:
      "We are building a new generation of accounting for Swedish businesses. Meet founders Edith Wolff and Philip Eriksson.",
    url: "/about",
    siteName: "Igdrasil",
    type: "profile",
  },
};

const founders = [
  { name: "Edith Wolff", avatar: "/images/team/edith.jpeg" },
  { name: "Philip Eriksson", avatar: "/images/team/philip.jpeg" },
];

export default async function AboutPage() {
  const content = await readDoc("about");

  return (
    <ProsePage
      eyebrow="About us"
      title="About Igdrasil: building accounting that helps businesses grow"
      lead="A Swedish company building an AI-powered platform for bookkeeping and business insights — founded by two people who saw the same problem from opposite sides of the ledger."
      meta={
        <div className="mt-6 flex items-center gap-3">
          <div className="flex -space-x-2">
            {founders.map((founder) => (
              <Image
                key={founder.name}
                src={founder.avatar}
                alt={`${founder.name}, co-founder of Igdrasil`}
                width={80}
                height={80}
                className="size-10 rounded-full border-2 border-background object-cover"
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Edith Wolff &amp; Philip Eriksson &middot; co-founders, Stockholm
          </p>
        </div>
      }
      content={content}
    >
      <JsonLd data={organizationSchema()} />
      <JsonLd data={faqSchema(extractFaq(content))} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About us", path: "/about" },
        ])}
      />
    </ProsePage>
  );
}
