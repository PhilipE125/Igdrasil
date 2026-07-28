import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders a URL or link text as a compact, muted reference chip.
 * Called by the custom <a> renderer below.
 */
function LinkChip({ href, children }: { href: string; children: React.ReactNode }) {
  // If link text IS the URL (bare auto-link), show only the hostname
  const childText = String(children);
  const isRawUrl = childText.startsWith("http://") || childText.startsWith("https://");
  let label: string;
  if (isRawUrl) {
    try {
      label = new URL(href).hostname.replace(/^www\./, "");
    } catch {
      label = childText.slice(0, 40);
    }
  } else {
    label = childText;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      {label}
      <ExternalLink className="size-2.5 shrink-0 opacity-70" />
    </a>
  );
}

// Markdown node renderers: unboxed typography that flows on the panel background.
const COMPONENTS = {
  a: ({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (!href) return <>{children}</>;
    return <LinkChip href={href}>{children}</LinkChip>;
  },
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-2 first:mt-0 last:mb-0 leading-relaxed text-pretty">{children}</p>
  ),
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mt-4 mb-2 text-base font-semibold text-foreground first:mt-0">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-4 mb-2 text-sm font-semibold text-foreground first:mt-0">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-3 mb-1.5 text-sm font-semibold text-foreground first:mt-0">{children}</h3>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-2 list-disc pl-5 space-y-0.5 marker:text-muted-foreground/60">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-2 list-decimal pl-5 space-y-0.5 marker:text-muted-foreground/60">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-2 border-l-2 border-border pl-3 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
    // Block code blocks arrive wrapped in <pre><code class="language-x"> — the
    // `pre` override below handles the block styling. For inline code (no language
    // class), use a subtle chip.
    const isBlock = /language-/.test(className ?? "");
    if (isBlock) {
      return <code className={cn("text-[12px] font-mono", className)}>{children}</code>;
    }
    return (
      <code className="rounded bg-muted px-1 py-0.5 text-[12px] font-mono text-foreground">
        {children}
      </code>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-2 overflow-x-auto rounded-md border border-border bg-muted/40 p-2 text-[12px] leading-relaxed">
      {children}
    </pre>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-[12px]">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="border-b border-border">{children}</thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => <tbody>{children}</tbody>,
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="border-b border-border/40 last:border-0">{children}</tr>
  ),
  th: ({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) => (
    <th
      className="px-2 py-1.5 text-left font-medium text-muted-foreground"
      style={style}
    >
      {children}
    </th>
  ),
  td: ({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) => (
    <td className="px-2 py-1.5 align-top text-foreground/90 tabular-nums" style={style}>
      {children}
    </td>
  ),
  hr: () => <hr className="my-3 border-border/60" />,
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
};

interface Props {
  children: string;
  className?: string;
}

/**
 * Renders assistant markdown with:
 * - GitHub Flavored Markdown (tables, strikethrough, auto-links)
 * - Reference URLs rendered as clickable chips (not raw URLs)
 * - Typographic components that flow on the panel background (no card shell)
 * - All links open in new tab
 */
export function AssistantMarkdown({ children, className }: Props) {
  return (
    <div className={cn("text-[13.5px] leading-relaxed text-foreground/90", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={COMPONENTS}
      >
        {children}
      </Markdown>
    </div>
  );
}
