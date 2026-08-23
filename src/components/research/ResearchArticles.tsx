"use client";

import { useMemo, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { SearchBar } from "@/components/research/atoms";
import { formatArticleDate } from "@/lib/research";
import type { ResearchArticle } from "@/types/content";

const COLLAPSED_COUNT = 6;

export function ResearchArticles({ articles }: { articles: ResearchArticle[] }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) =>
      [a.title, a.topic, a.dek ?? ""].some((field) => field.toLowerCase().includes(q)),
    );
  }, [articles, query]);

  // A search already narrows the list, so the expander only applies to the
  // unfiltered view.
  const searching = query.trim().length > 0;
  const visible = searching || expanded ? matches : matches.slice(0, COLLAPSED_COUNT);
  const hidden = matches.length - visible.length;

  return (
    <section id="research-articles" className="scroll-mt-24 border-t border-border py-12 md:py-14">
      <h2 className="flex items-center gap-2.5 font-display text-2xl font-black tracking-[0.02em] text-foreground text-balance md:text-3xl">
        <FileText aria-hidden="true" className="size-5 text-primary" />
        Research Articles
      </h2>
      <p className="mt-2.5 max-w-2xl text-sm text-muted-foreground text-pretty md:text-base">
        Dated pieces &mdash; what a series turned up, how we built it, and where we were
        wrong. The research keeps running; these stay as written.
      </p>

      <SearchBar label="Search research articles" value={query} onChange={setQuery} />

      {matches.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No articles match &ldquo;{query}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-3 min-h-10 text-sm font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Clear the search
          </button>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th
                  scope="col"
                  className="w-32 whitespace-nowrap py-3 pr-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle-foreground"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="w-44 whitespace-nowrap px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle-foreground"
                >
                  Topic
                </th>
                <th
                  scope="col"
                  className="py-3 pl-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle-foreground"
                >
                  Title
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((article) => (
                <tr
                  key={article.date + article.title}
                  className="group border-b border-border/60 transition-colors last:border-border hover:bg-foreground/[0.025]"
                >
                  <td className="whitespace-nowrap py-4 pr-3 align-top text-xs tabular-nums text-muted-foreground">
                    {formatArticleDate(article.date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 align-top text-sm text-muted-foreground">
                    {article.topic}
                  </td>
                  <td className="py-4 pl-3 align-top">
                    <a
                      href={article.href}
                      className="text-base text-foreground underline-offset-4 group-hover:underline"
                    >
                      {article.title}
                    </a>
                    {article.dek ? (
                      <p className="mt-1 max-w-[46rem] text-sm text-muted-foreground text-pretty">
                        {article.dek}
                      </p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!searching && matches.length > COLLAPSED_COUNT ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
          className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
        >
          {expanded ? "Show fewer" : `Show ${hidden} more`}
          <ChevronDown
            aria-hidden="true"
            className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      ) : null}
    </section>
  );
}
