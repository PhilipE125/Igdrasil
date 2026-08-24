import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Markdown } from "@/components/Markdown";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

type ProsePageProps = {
  eyebrow: string;
  title: string;
  lead?: string;
  /** Byline, dateline, avatars — whatever sits under the lead. */
  meta?: ReactNode;
  content: string;
  /** Structured data for the page. */
  children?: ReactNode;
};

/** Masthead plus a markdown body, for the long-form pages under `content/pages/`. */
export function ProsePage({ eyebrow, title, lead, meta, content, children }: ProsePageProps) {
  return (
    <>
      <SiteHeader />
      {children}
      <main className="relative overflow-hidden pt-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(238,143,224,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(176,238,143,0.18),transparent_28%)]" />
        <div className="pointer-events-none absolute left-[-8rem] top-24 size-72 rounded-full bg-primary/10 blur-3xl" />

        <section className="relative mx-auto max-w-6xl px-6 pb-10 lg:px-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-layer-1/80 px-4 py-2 text-sm text-foreground/80 shadow-sm shadow-black/[0.04] transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>

          <div className="mt-8 max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-subtle-foreground">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl tracking-wide text-foreground text-balance sm:text-5xl">
              {title}
            </h1>
            {lead ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground text-pretty">
                {lead}
              </p>
            ) : null}
            {meta}
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-6 pb-24 lg:px-12">
          <article className="overflow-hidden rounded-[2rem] border border-border/80 bg-layer-1/90 px-6 py-8 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:px-8 lg:px-12 lg:py-10">
            <Markdown>{content}</Markdown>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
