import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
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
              {config.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
              {config.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              {config.description}
            </p>
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-6 pb-24 lg:px-12">
          <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-layer-1/90 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-sm">
            <div className="border-b border-border/80 px-6 py-4 sm:px-8 lg:px-12">
              <p className="text-sm text-muted-foreground">
                A stable public copy of this document for customer review and compliance reference.
              </p>
            </div>

            <div className="px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={{
                  h1: ({ children, ...props }) => (
                    <h2
                      className="mt-10 scroll-mt-28 font-display text-3xl tracking-wide text-foreground first:mt-0 sm:text-4xl"
                      {...props}
                    >
                      {children}
                    </h2>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2
                      className="mt-10 scroll-mt-28 font-display text-3xl tracking-wide text-foreground first:mt-0 sm:text-4xl"
                      {...props}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3
                      className="mt-8 scroll-mt-28 text-xl font-semibold text-foreground sm:text-2xl"
                      {...props}
                    >
                      {children}
                    </h3>
                  ),
                  h4: ({ children, ...props }) => (
                    <h4 className="mt-6 text-base font-semibold text-foreground" {...props}>
                      {children}
                    </h4>
                  ),
                  p: ({ children, ...props }) => (
                    <p className="mt-4 text-[15px] leading-7 text-foreground/85" {...props}>
                      {children}
                    </p>
                  ),
                  hr: (props) => <hr className="my-8 border-border/80" {...props} />,
                  ul: ({ children, ...props }) => (
                    <ul className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-7 text-foreground/85 marker:text-primary" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol className="mt-4 list-decimal space-y-2 pl-6 text-[15px] leading-7 text-foreground/85 marker:text-primary" {...props}>
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li className="pl-1" {...props}>
                      {children}
                    </li>
                  ),
                  strong: ({ children, ...props }) => (
                    <strong className="font-semibold text-foreground" {...props}>
                      {children}
                    </strong>
                  ),
                  em: ({ children, ...props }) => (
                    <em className="italic text-foreground/90" {...props}>
                      {children}
                    </em>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote
                      className="my-6 rounded-2xl border border-primary/25 bg-primary/6 px-5 py-4 text-sm leading-7 text-foreground/80"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href = "", ...props }) => {
                    const isExternal =
                      href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");

                    return (
                      <a
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noreferrer" : undefined}
                        className="font-medium text-foreground underline decoration-primary/70 underline-offset-4 transition-colors hover:text-primary"
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  },
                  code: ({ children, ...props }) => (
                    <code
                      className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                  pre: ({ children, ...props }) => (
                    <pre
                      className="mt-6 overflow-x-auto rounded-2xl border border-border/80 bg-muted p-4 text-sm text-foreground"
                      {...props}
                    >
                      {children}
                    </pre>
                  ),
                  table: ({ children, ...props }) => (
                    <div className="my-8 overflow-x-auto rounded-2xl border border-border/80">
                      <table className="min-w-full border-collapse bg-layer-1 text-left text-sm" {...props}>
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children, ...props }) => (
                    <thead className="bg-muted/70 text-foreground" {...props}>
                      {children}
                    </thead>
                  ),
                  tbody: ({ children, ...props }) => (
                    <tbody className="divide-y divide-border/80" {...props}>
                      {children}
                    </tbody>
                  ),
                  tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
                  th: ({ children, ...props }) => (
                    <th className="px-4 py-3 font-semibold" {...props}>
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }) => (
                    <td className="px-4 py-3 align-top text-foreground/80" {...props}>
                      {children}
                    </td>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}