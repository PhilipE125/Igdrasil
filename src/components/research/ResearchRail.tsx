"use client";

import { useEffect, useState } from "react";
import { BarChart3, FileText, LineChart, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RailItem {
  id: string;
  label: string;
  icon: "column" | "area" | "table" | "doc";
  count?: number;
}

const ICONS = {
  column: BarChart3,
  area: LineChart,
  table: Table2,
  doc: FileText,
} as const;

/**
 * Section index for the page. It tracks which section is on screen rather than
 * only reacting to clicks, so scrolling past a section still moves the marker.
 * Hidden below lg, where the content column is the whole width anyway.
 */
export function ResearchRail({
  data,
  writing,
}: {
  data: RailItem[];
  writing: RailItem[];
}) {
  const items = [...data, ...writing];
  const [current, setCurrent] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best = "";
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (best) setCurrent(best);
      },
      // Discount the floating header and the lower half of the viewport, so the
      // marker follows what is actually being read.
      { rootMargin: "-80px 0px -55% 0px", threshold: [0, 0.1, 0.3, 0.6, 1] },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
    // The item list is static content, keyed by id.
  }, [items.map((i) => i.id).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <nav
      aria-label="Sections"
      className="sticky top-24 hidden max-h-[calc(100dvh-8rem)] self-start overflow-y-auto pt-2 pb-10 lg:block"
    >
      {[
        { heading: "Data", entries: data },
        { heading: "Writing", entries: writing },
      ].map((group) => (
        <div key={group.heading} className="mb-5 last:mb-0">
          <p className="px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle-foreground">
            {group.heading}
          </p>
          {group.entries.map((item) => {
            const Icon = ICONS[item.icon];
            const active = current === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex min-h-10 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors",
                  active
                    ? "bg-primary/12 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn("size-4 shrink-0", active ? "text-primary" : "opacity-70")}
                />
                <span className="truncate">{item.label}</span>
                {item.count !== undefined ? (
                  <span className="ml-auto text-xs tabular-nums text-subtle-foreground">
                    {item.count}
                  </span>
                ) : null}
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
