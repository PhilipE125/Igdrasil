/**
 * Small shared pieces for /research. No client state, so both the server
 * sections and the client tables can use them.
 */

import { formatDelta } from "@/lib/research";
import type { ResearchSeries } from "@/types/content";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ResearchSeries["status"], string> = {
  live: "Live",
  building: "Building",
  planned: "Planned",
};

/**
 * State reads by shape as well as colour — a dot for a running series, a
 * dashed outline for one that has not started — so it survives without hue.
 */
export function StatusBadge({
  status,
  eta,
  className,
}: {
  status: ResearchSeries["status"];
  eta?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5",
        "text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground",
        status === "live" && "border-emerald-600/30 bg-emerald-500/10",
        status === "building" && "border-primary/45 bg-primary/10",
        status === "planned" && "border-dashed border-border text-subtle-foreground",
        className,
      )}
    >
      {status !== "planned" ? (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full",
            status === "live" ? "bg-emerald-600 dark:bg-accent" : "bg-primary",
          )}
        />
      ) : null}
      {status === "planned" && eta ? eta : STATUS_LABEL[status]}
    </span>
  );
}

/** A signed percentage change. The arrow carries the direction, not the colour. */
export function Delta({
  pct,
  digits,
  className,
}: {
  pct: number;
  digits?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        pct < 0
          ? "text-red-600 dark:text-red-400"
          : "text-emerald-700 dark:text-emerald-400",
        className,
      )}
    >
      {formatDelta(pct, digits)}
    </span>
  );
}

/** The uppercase micro-label the landing page uses above every section. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * One wide search bar per table. Presentational — the owning client component
 * holds the query, so this file stays free of state.
 */
export function SearchBar({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="relative mt-6 flex items-center">
      <svg
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute left-4 size-4 text-subtle-foreground"
      >
        <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10.6 10.6 14.5 14.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className={cn(
          "min-h-11 w-full rounded-xl border border-border bg-transparent",
          "pl-11 pr-4 text-sm text-foreground transition-colors",
          "placeholder:text-subtle-foreground hover:border-foreground/25",
          "focus-visible:border-foreground/40 focus-visible:outline-none",
        )}
      />
    </label>
  );
}
