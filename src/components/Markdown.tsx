import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

/**
 * The one markdown renderer for prose the site ships as `.md` — legal
 * documents, the about page, the product explainer. `rehypeSlug` gives every
 * heading an id so the in-document contents lists resolve.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={{
        h1: ({ children, ...props }) => (
          <h2
            className="mt-14 scroll-mt-28 border-t border-border/70 pt-9 font-display text-2xl tracking-wide text-foreground first:mt-0 first:border-0 first:pt-0 sm:text-3xl"
            {...props}
          >
            {children}
          </h2>
        ),
        h2: ({ children, ...props }) => (
          <h2
            className="mt-14 scroll-mt-28 border-t border-border/70 pt-9 font-display text-2xl tracking-wide text-foreground first:mt-0 first:border-0 first:pt-0 sm:text-3xl"
            {...props}
          >
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3
            className="mt-8 max-w-[68ch] scroll-mt-28 text-lg font-semibold text-foreground sm:text-xl"
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
          <p className="mt-4 max-w-[68ch] text-[15px] leading-7 text-foreground/85" {...props}>
            {children}
          </p>
        ),
        hr: (props) => <hr className="my-8 border-border/80" {...props} />,
        ul: ({ children, ...props }) => (
          <ul className="mt-4 max-w-[68ch] list-disc space-y-2 pl-6 text-[15px] leading-7 text-foreground/85 marker:text-primary" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="mt-4 max-w-[68ch] list-decimal space-y-2 pl-6 text-[15px] leading-7 text-foreground/85 marker:text-primary" {...props}>
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
            className="my-6 max-w-[68ch] rounded-2xl border border-primary/25 bg-primary/6 px-5 py-4 text-sm leading-7 text-foreground/80"
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
      {children}
    </ReactMarkdown>
  );
}
