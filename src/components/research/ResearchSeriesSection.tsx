import { ArrowUpRight, BarChart3, LineChart } from "lucide-react";
import { ResearchChart } from "@/components/research/ResearchChart";
import { Delta, StatusBadge } from "@/components/research/atoms";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
  deltaVsFourWeekAverage,
  deltaVsLastYear,
  formatCount,
  latestComplete,
} from "@/lib/research";
import type { ResearchSeries } from "@/types/content";

/** Ranked rows read column-major, so 1–5 sit left and 6–10 sit right. */
function interleave<T>(rows: T[]): T[] {
  const half = Math.ceil(rows.length / 2);
  const out: T[] = [];
  for (let i = 0; i < half; i++) {
    out.push(rows[i]);
    if (rows[i + half]) out.push(rows[i + half]);
  }
  return out;
}

export function ResearchSeriesSection({ series }: { series: ResearchSeries }) {
  const latest = latestComplete(series);
  if (!latest || !series.metric) return null;

  const vsFourWeek = deltaVsFourWeekAverage(series);
  const vsLastYear = deltaVsLastYear(series);
  const Icon = series.chart === "area" ? LineChart : BarChart3;
  const total = series.breakdown?.rows.reduce((sum, r) => sum + r.value, 0) ?? 0;

  return (
    <section
      id={series.id}
      className="scroll-mt-24 border-t border-border py-12 first:border-t-0 first:pt-2 md:py-14"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2.5 font-display text-2xl font-black tracking-[0.02em] text-foreground text-balance md:text-3xl">
            <Icon aria-hidden="true" className="size-5 text-primary" />
            {series.title}
          </h2>
          <p className="mt-2.5 max-w-xl text-sm text-muted-foreground text-pretty md:text-base">
            {series.question}
          </p>
        </div>
        <StatusBadge status={series.status} className="mt-1.5" />
      </div>

      <div className="mt-7 flex flex-wrap items-end gap-x-10 gap-y-4">
        <div>
          <p className="font-display text-5xl font-black leading-none tracking-[0.02em] tabular-nums text-foreground md:text-6xl">
            {formatCount(latest.value)}
          </p>
          <Eyebrow className="mt-3">
            {series.metric.unit} · week {latest.label.slice(1)} (last complete)
          </Eyebrow>
        </div>
        {vsFourWeek !== undefined ? (
          <div className="pb-1">
            <Delta pct={vsFourWeek} className="text-base" />
            <Eyebrow className="mt-1.5">vs trailing 4-wk avg</Eyebrow>
          </div>
        ) : null}
        {vsLastYear !== undefined ? (
          <div className="pb-1">
            <Delta pct={vsLastYear} className="text-base" />
            <Eyebrow className="mt-1.5">vs same week {latest.year - 1}</Eyebrow>
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <ResearchChart series={series} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4">
        {series.chart === "area" ? (
          <Eyebrow>Dashed = week in progress</Eyebrow>
        ) : (
          <>
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="size-2.5 rounded-xs bg-primary" />
              <Eyebrow>Latest complete week</Eyebrow>
            </span>
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-xs border border-border bg-foreground/20"
              />
              <Eyebrow>Week in progress</Eyebrow>
            </span>
          </>
        )}
        <Eyebrow>{series.source}</Eyebrow>
        <Eyebrow>{series.cadence}</Eyebrow>
      </div>

      {series.breakdown ? (
        <div className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pb-1">
            <Eyebrow>{series.breakdown.caption}</Eyebrow>
            <Eyebrow>{series.breakdown.valueCaption}</Eyebrow>
          </div>

          {series.breakdown.kind === "ranked" ? (
            <>
              <ol className="grid sm:grid-cols-2 sm:gap-x-10">
                {interleave(
                  series.breakdown.rows.map((row, i) => ({ ...row, rank: i + 1 })),
                ).map((row) => (
                  <li
                    key={row.name}
                    className="flex items-center gap-3 border-b border-border py-3"
                  >
                    <span className="w-5 shrink-0 text-xs tabular-nums text-subtle-foreground">
                      {row.rank}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-foreground">
                        {row.name}
                      </span>
                      {row.sub ? (
                        <span className="mt-0.5 block text-[11px] uppercase tracking-[0.12em] text-subtle-foreground">
                          {row.sub}
                        </span>
                      ) : null}
                    </span>
                    <span className="ml-auto shrink-0 text-right">
                      <span className="block text-sm font-bold tabular-nums text-foreground">
                        {formatCount(row.value)}
                      </span>
                      {row.deltaPct !== undefined ? (
                        <Delta pct={row.deltaPct} digits={0} className="block text-[11px]" />
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
              {series.breakdown.footnote ? (
                <Eyebrow className="pt-3.5">{series.breakdown.footnote}</Eyebrow>
              ) : null}
            </>
          ) : (
            <ul className="mt-4 flex flex-col gap-3.5">
              {series.breakdown.rows.map((row, i) => {
                const share = total > 0 ? (row.value / total) * 100 : 0;
                return (
                  <li key={row.name}>
                    <div className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="text-foreground">{row.name}</span>
                      <span>
                        <span className="font-bold tabular-nums text-foreground">
                          {formatCount(row.value)}
                        </span>
                        <span className="ml-2 text-xs tabular-nums text-subtle-foreground">
                          {share.toFixed(0)}%
                        </span>
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/[0.07]">
                      <div
                        className={
                          i === 0
                            ? "h-full rounded-full bg-primary"
                            : "h-full rounded-full bg-foreground/25"
                        }
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      {series.read ? (
        <p className="mt-9 max-w-2xl border-l-2 border-primary pl-4 text-sm text-muted-foreground text-pretty md:text-base">
          <span className="font-semibold text-foreground">What we&rsquo;re seeing. </span>
          {series.read}
        </p>
      ) : null}

      <a
        href={series.href}
        className="btn-hover-overlay mt-7 inline-flex min-h-10 items-center gap-2 overflow-hidden rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-transform active:scale-[0.96]"
      >
        Open research
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </a>
    </section>
  );
}
