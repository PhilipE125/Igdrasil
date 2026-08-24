"use client";

import { useId, useMemo, useState } from "react";
import { formatCount, windowPoints } from "@/lib/research";
import type { ResearchPoint, ResearchSeries } from "@/types/content";
import { cn } from "@/lib/utils";

/** Ranges offered above every chart. */
const RANGES = [12, 24, 52] as const;

const VIEW_W = 760;
const VIEW_H = 250;
const PAD_L = 52;
const PAD_R = 8;
const PAD_T = 26;
const PAD_B = 26;
const PLOT_W = VIEW_W - PAD_L - PAD_R;
const PLOT_H = VIEW_H - PAD_T - PAD_B;

/**
 * A zero-based axis with four or five gridlines. Counts are never truncated —
 * on this data a non-zero baseline would triple the apparent summer swing.
 */
function axisTop(max: number): { top: number; step: number } {
  for (const step of [25, 50, 100, 200, 250, 500, 1000, 2000, 5000]) {
    if (max / step <= 5) return { top: Math.ceil(max / step) * step, step };
  }
  return { top: max, step: max };
}

/** A bar with a rounded data-end, square against the baseline. */
function barPath(x: number, top: number, w: number, h: number): string {
  const r = Math.min(4, w / 3, h);
  return (
    `M${x} ${top + h}V${top + r}` +
    `a${r} ${r} 0 0 1 ${r} ${-r}` +
    `h${w - 2 * r}` +
    `a${r} ${r} 0 0 1 ${r} ${r}` +
    `V${top + h}Z`
  );
}

interface Props {
  series: ResearchSeries;
}

export function ResearchChart({ series }: Props) {
  const [weeks, setWeeks] = useState<number>(24);
  const [hovered, setHovered] = useState<number | null>(null);
  const hatchId = useId();

  const points = useMemo(() => windowPoints(series, weeks), [series, weeks]);
  const unit = series.metric?.unit ?? "";
  const isColumn = series.chart !== "area";

  const { top, step } = axisTop(Math.max(...points.map((p) => p.value)));
  const y = (value: number) => PAD_T + PLOT_H - (value / top) * PLOT_H;
  const colW = PLOT_W / points.length;
  const centre = (i: number) => PAD_L + i * colW + colW / 2;
  // The last complete reading — the one the headline figure quotes.
  const lastComplete = points.length - 2;

  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);

  const active: ResearchPoint | null = hovered === null ? null : points[hovered];

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle-foreground">
          {series.metric?.unit} per week · {weeks} weeks
        </p>
        <div
          role="group"
          aria-label={`Time range for ${series.title}`}
          className="inline-flex overflow-hidden rounded-lg border border-border"
        >
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              aria-pressed={weeks === range}
              onClick={() => setWeeks(range)}
              className={cn(
                "min-h-10 px-3 text-xs font-medium tabular-nums transition-colors",
                "border-l border-border first:border-l-0",
                weeks === range
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              {range} w
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block w-full overflow-visible"
          role="img"
          aria-label={`${points.length} weeks of ${unit}, from ${formatCount(
            Math.min(...points.map((p) => p.value)),
          )} to ${formatCount(
            Math.max(...points.map((p) => p.value)),
          )}. The final week is still being counted.`}
        >
          <defs>
            <pattern
              id={hatchId}
              width="5"
              height="5"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="2.5"
                y1="-1"
                x2="2.5"
                y2="6"
                strokeWidth="2"
                className="stroke-foreground/40"
              />
            </pattern>
          </defs>

          {ticks.map((value) => (
            <g key={value}>
              <line
                x1={PAD_L}
                x2={VIEW_W - PAD_R}
                y1={y(value)}
                y2={y(value)}
                className={value === 0 ? "stroke-border" : "stroke-border/60"}
                shapeRendering="crispEdges"
              />
              <text
                x={PAD_L - 12}
                y={y(value) + 4}
                textAnchor="end"
                className="fill-subtle-foreground text-[11px] tabular-nums"
              >
                {formatCount(value)}
              </text>
            </g>
          ))}

          {isColumn
            ? points.map((point, i) => {
                const gap = colW > 12 ? 2.5 : 1.5;
                const w = Math.max(2, colW - gap);
                const h = Math.max(2, (point.value / top) * PLOT_H);
                return (
                  <path
                    key={`${point.year}-${point.label}`}
                    d={barPath(PAD_L + i * colW + gap / 2, y(point.value), w, h)}
                    fill={point.partial ? `url(#${hatchId})` : undefined}
                    className={cn(
                      "transition-colors",
                      point.partial
                        ? "stroke-foreground/25"
                        : i === lastComplete
                          ? "fill-primary"
                          : hovered === i
                            ? "fill-foreground/40"
                            : "fill-foreground/25",
                    )}
                  />
                );
              })
            : (() => {
                const solid = points.slice(0, -1);
                const line = solid
                  .map(
                    (p, i) =>
                      `${i ? "L" : "M"}${centre(i).toFixed(2)} ${y(p.value).toFixed(2)}`,
                  )
                  .join(" ");
                const last = points[points.length - 1];
                const tipX = centre(solid.length - 1);
                const tipY = y(solid[solid.length - 1].value);
                return (
                  <g>
                    <path
                      d={`${line} L${centre(solid.length - 1).toFixed(2)} ${y(0)} L${centre(0).toFixed(2)} ${y(0)} Z`}
                      className="fill-foreground/[0.07]"
                    />
                    <path
                      d={line}
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="fill-none stroke-foreground/80"
                    />
                    <path
                      d={`M${tipX.toFixed(2)} ${tipY.toFixed(2)}L${centre(points.length - 1).toFixed(2)} ${y(last.value).toFixed(2)}`}
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      strokeLinecap="round"
                      className="fill-none stroke-foreground/40"
                    />
                    <circle cx={tipX} cy={tipY} r="5.5" className="fill-background" />
                    <circle cx={tipX} cy={tipY} r="3.5" className="fill-primary" />
                  </g>
                );
              })()}

          {/* Direct label on the latest complete week only — never one per point. */}
          <text
            x={Math.min(centre(lastComplete), VIEW_W - PAD_R - 20)}
            y={y(points[lastComplete].value) - 10}
            textAnchor="middle"
            className="fill-foreground text-[12px] font-bold tabular-nums"
          >
            {formatCount(points[lastComplete].value)}
          </text>

          {points.map((point, i) =>
            i % Math.ceil(points.length / 6) === 0 || i === points.length - 1 ? (
              <text
                key={`x-${point.year}-${point.label}`}
                x={centre(i)}
                y={VIEW_H - 6}
                textAnchor="middle"
                className="fill-subtle-foreground text-[11px] tabular-nums"
              >
                {point.label}
              </text>
            ) : null,
          )}

          {/* Hit targets sized to the column, not the mark. */}
          {points.map((point, i) => (
            <rect
              key={`hit-${point.year}-${point.label}`}
              x={PAD_L + i * colW}
              y={PAD_T}
              width={colW}
              height={PLOT_H}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>

        {active ? (
          <div
            role="status"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-foreground px-2.5 py-1.5 text-xs leading-snug text-background shadow-md"
            style={{
              left: `${(centre(hovered!) / VIEW_W) * 100}%`,
              top: `${(y(active.value) / VIEW_H) * 100 - 3}%`,
            }}
          >
            <span className="font-bold tabular-nums">{formatCount(active.value)}</span>{" "}
            <span className="opacity-70">{unit}</span>
            <br />
            <span className="opacity-70 tabular-nums">
              {active.year} · {active.label}
              {active.partial ? " · in progress" : ""}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
