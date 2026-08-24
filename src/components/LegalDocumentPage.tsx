import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Markdown } from "@/components/Markdown";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getLegalPageContent, legalPages, type LegalPageSlug } from "@/lib/legal";

type LegalDocumentPageProps = {
  slug: LegalPageSlug;
};

export async function LegalDocumentPage({ slug }: LegalDocumentPageProps) {
  const config = legalPages[slug];
  const content = await getLegalPageContent(slug);

  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden pt-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(238,143,224,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(176,238,143,0.18),transparent_28%)]" />
        <div className="pointer-events-none absolute left-[-8rem] top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-6rem] top-40 size-80 rounded-full bg-accent/10 blur-3xl" />

        <section className="relative mx-auto max-w-4xl px-6 pb-10 lg:px-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-layer-1/80 px-4 py-2 text-sm text-foreground/80 shadow-sm shadow-black/[0.04] transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>

          <div className="mt-8 max-w-3xl">
            <Eyebrow>{config.eyebrow}</Eyebrow>
            <h1 className="mt-4 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
              {config.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              {config.description}
            </p>
          </div>
        </section>

        <section className="relative mx-auto max-w-4xl px-6 pb-24 lg:px-12">
          <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-layer-1/90 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-sm">
            <div className="border-b border-border/80 px-6 py-4 sm:px-8 lg:px-12">
              <p className="text-sm text-muted-foreground">
                A stable public copy of this document for customer review and compliance reference.
              </p>
            </div>

            <div className="px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}