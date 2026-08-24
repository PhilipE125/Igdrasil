"use client";

import { useMemo, useState } from "react";
import { Table2 } from "lucide-react";
import { Delta, SearchBar, StatusBadge } from "@/components/research/atoms";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
  deltaVsFourWeekAverage,
  formatCount,
  windowPoints,
} from "@/lib/research";
import type { ResearchSeries } from "@/types/content";

/**
 * 24 complete weeks at a glance. The domain is padded so ordinary weekly noise
 * does not read as a cliff at this size.
 */
function Sparkline({ series }: { series: ResearchSeries }) {
  const values = windowPoints(series, 24)
    .filter((p) => !p.partial)
    .map((p) => p.value);
  if (values.length < 2) return null;

  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const slack = (hi - lo || 1) * 0.35;
  const min = lo - slack;
  const span = hi - lo + slack * 2;
  const points = values.map((v, i) => [
    (i / (values.length - 1)) * 100,
    3 + (1 - (v - min) / span) * 24,
  ]);
  const line = points
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="block h-7 w-24"
    >
      <path d={`${line} L100 30 L0 30 Z`} className="fill-foreground/[0.06]" />
      <path
        d={line}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="fill-none stroke-foreground/60"
      />
      <circle cx={lastX - 1.2} cy={lastY} r="2" className="fill-primary" />
    </svg>
  );
}

export function ResearchRegister({ series }: { series: ResearchSeries[] }) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return series;
    return series.filter((s) =>
      [s.title, s.what, s.source].some((field) => field.toLowerCase().includes(q)),
    );
  }, [series, query]);

  return (
    <section id="market-research" className="scroll-mt-24 border-t border-border py-12 md:py-14">
      <h2 className="flex items-center gap-2.5 font-display text-2xl font-black tracking-[0.02em] text-foreground text-balance md:text-3xl">
        <Table2 aria-hidden="true" className="size-5 text-primary" />
        Market Research
      </h2>
      <p className="mt-2.5 max-w-2xl text-sm text-muted-foreground text-pretty md:text-base">
        Every row is a query that re-runs on a fixed cadence against a named public
        source. &Delta; compares the latest reading to its trailing four-week average.
      </p>

      <SearchBar label="Search market research" value={query} onChange={setQuery} />

      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No series match &ldquo;{query}&rdquo;.
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
          <table className="w-full min-w-[42rem] border-collapse">
            <thead>
              <tr className="border-b border-border">
                {["Series", "Source & cadence", "Latest", "Δ", "24-week trend", "Updated"].map(
                  (heading, i) => (
                    <th
                      key={heading}
                      scope="col"
                      className={`whitespace-nowrap py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle-foreground ${
                        i === 2 || i === 3 || i === 5 ? "text-right" : "text-left"
                      } ${i === 0 ? "pr-3" : "px-3"} ${i === 5 ? "pr-0" : ""}`}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const latest = s.metric
                  ? windowPoints(s, 24).filter((p) => !p.partial).at(-1)
                  : undefined;
                const delta = deltaVsFourWeekAverage(s);
                return (
                  <tr
                    key={s.id}
                    className="border-b border-border/60 transition-colors last:border-border hover:bg-foreground/[0.025]"
                  >
                    <td className="py-4 pr-3 align-middle">
                      <div className="flex items-center gap-2.5">
                        <a
                          href={s.href}
                          className="font-display text-base font-bold tracking-[0.02em] text-foreground transition-opacity hover:opacity-70"
                        >
                          {s.title}
                        </a>
                        <StatusBadge status={s.status} eta={s.eta} />
                      </div>
                      <p className="mt-1 max-w-[22rem] text-xs text-muted-foreground text-pretty">
                        {s.what}
                      </p>
                    </td>
                    <td className="px-3 py-4 align-middle">
                      <p className="whitespace-nowrap text-xs text-muted-foreground">
                        {s.source}
                      </p>
                      <p className="mt-0.5 whitespace-nowrap text-[11px] text-subtle-foreground">
                        {s.cadence}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right align-middle">
                      {latest ? (
                        <>
                          <span className="block text-base font-bold tabular-nums text-foreground">
                            {formatCount(latest.value)}
                          </span>
                          <span className="block text-[11px] text-subtle-foreground">
                            {s.metric?.shortUnit}
                          </span>
                        </>
                      ) : (
                        <span className="text-subtle-foreground">&mdash;</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right align-middle text-sm">
                      {delta !== undefined ? (
                        <Delta pct={delta} />
                      ) : (
                        <span className="text-subtle-foreground">&mdash;</span>
                      )}
                    </td>
                    <td className="px-3 py-4 align-middle">
                      {s.metric ? (
                        <Sparkline series={s} />
                      ) : (
                        <span className="text-xs text-subtle-foreground">Not started</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 text-right align-middle text-xs text-subtle-foreground">
                      {s.updatedLabel ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Eyebrow className="pt-4">
        Every series publishes its source query, its filters, and a CSV export of the
        full history
      </Eyebrow>
    </section>
  );
}
