import { useEffect, useRef, useState } from "react";
import { ChevronDown, Filter, Plus, Search, X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export interface FilterDimension {
  id: string;
  label: string;
  type?: "options" | "text-input" | "date-range";
  options?: Array<{ value: string; label: string }>;
  currentValue?: string;
  onSelect?: (value: string) => void;
  fromValue?: string;
  toValue?: string;
  onFromChange?: (v: string) => void;
  onToChange?: (v: string) => void;
}

interface TableFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  activeFilters?: ActiveFilter[];
  /** First 2 are shown as inline pills; the rest go into "Add filter +" */
  filterDimensions?: FilterDimension[];
  /** Always-visible content rendered on the left of the toolbar (e.g. tabs). */
  leadingSlot?: React.ReactNode;
  /** Right-side content next to the search trigger (e.g. primary action). */
  trailingSlot?: React.ReactNode;
  className?: string;
}

// ─── Dimension popover body ────────────────────────────────────────────────────

function DimensionBody({ dim, onClose }: { dim: FilterDimension; onClose?: () => void }) {
  if (dim.type === "text-input") {
    return (
      <div className="p-2">
        <Input
          value={dim.currentValue ?? ""}
          onChange={(e) => dim.onSelect?.(e.target.value)}
          placeholder={dim.label}
          className="h-7 text-xs"
          autoFocus
        />
      </div>
    );
  }
  if (dim.type === "date-range") {
    return (
      <div className="space-y-1 p-2">
        <Input
          type="date"
          value={dim.fromValue ?? ""}
          onChange={(e) => dim.onFromChange?.(e.target.value)}
          className="h-7 text-xs"
        />
        <Input
          type="date"
          value={dim.toValue ?? ""}
          onChange={(e) => dim.onToChange?.(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
    );
  }
  return (
    <>
      {dim.options?.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={cn(
            "flex w-full items-center rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent",
            dim.currentValue === opt.value && "bg-accent/50 font-medium text-foreground",
          )}
          onClick={() => { dim.onSelect?.(opt.value); onClose?.(); }}
        >
          {opt.label}
        </button>
      ))}
    </>
  );
}

// ─── Pinned filter pill (always visible) ──────────────────────────────────────

function PinnedFilterPill({
  dim,
  active,
}: {
  dim: FilterDimension;
  active?: ActiveFilter;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {active ? (
        /* Active: label + value on left (opens popover to change), × on right (removes) */
        <div className="inline-flex h-6 items-center overflow-hidden rounded border border-border/70 bg-accent/40 text-xs">
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 px-2 transition-colors hover:bg-accent/60"
            >
              <span className="text-muted-foreground">{dim.label}:</span>
              <span className="font-medium">{active.value}</span>
            </button>
          </PopoverTrigger>
          <button
            type="button"
            aria-label={`Remove ${dim.label} filter`}
            onClick={active.onRemove}
            className="border-l border-border/70 px-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ) : (
        /* Inactive: just a trigger pill */
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex h-6 items-center gap-1 rounded border border-border/70 px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {dim.label}
            <ChevronDown className="h-3 w-3" />
          </button>
        </PopoverTrigger>
      )}

      <PopoverContent className="w-48 p-1" align="start" sideOffset={6}>
        <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {dim.label}
        </p>
        <DimensionBody dim={dim} onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function TableFilterBar({
  search,
  onSearchChange,
  placeholder = "Search…",
  activeFilters = [],
  filterDimensions = [],
  leadingSlot,
  trailingSlot,
  className,
}: TableFilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Split dimensions: first 2 pinned, rest go into "Add filter +"
  const pinnedDims = filterDimensions.slice(0, 2);
  const extraDims = filterDimensions.slice(2);

  // Active filters that belong to extra dimensions (not shown as pinned pills)
  const extraActiveFilters = activeFilters.filter((f) => extraDims.some((d) => d.id === f.id));

  const hasFilterDimensions = filterDimensions.length > 0;
  const hasActive = activeFilters.length > 0;

  // Keep the bar expanded whenever filters are active so pills stay visible
  useEffect(() => {
    if (hasActive) setExpanded(true);
  }, [hasActive]);

  function handleExpand() {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleCollapse() {
    if (!search && !hasActive) {
      setExpanded(false);
    }
  }

  function handleInputBlur(e: React.FocusEvent<HTMLInputElement>) {
    // When there are filter dimensions, popovers portal outside the DOM tree.
    // Rely on the document pointerdown listener for collapse instead.
    if (hasFilterDimensions) return;
    // No filter dims: collapse if focus left the bar
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    handleCollapse();
  }

  // When filter dims exist, collapse on click outside the container
  useEffect(() => {
    if (!expanded || !hasFilterDimensions) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current?.contains(e.target as Node)) return;
      // Also allow clicks inside Radix portals (data-radix-popper-content-wrapper)
      const el = e.target as HTMLElement;
      if (el.closest("[data-radix-popper-content-wrapper]")) return;
      handleCollapse();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, hasFilterDimensions, search, hasActive]);

  const showFilterRow = expanded && hasFilterDimensions;

  const searchRow = (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 flex-1 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
        onBlur={handleInputBlur}
      />
      {search && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onSearchChange("");
            inputRef.current?.focus();
          }}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        type="button"
        aria-label="Cancel search"
        onClick={() => {
          onSearchChange("");
          activeFilters.forEach((f) => f.onRemove());
          setExpanded(false);
        }}
        className="ml-1 inline-flex h-6 items-center rounded border border-border/70 px-2 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        Cancel
      </button>
    </div>
  );

  const collapsedTrigger = (
    <button
      type="button"
      aria-label="Search and filter"
      onClick={handleExpand}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded border border-border/70 px-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        hasActive && "border-foreground/20 bg-accent/40 text-foreground",
      )}
    >
      <Search className="h-3.5 w-3.5" />
      {hasFilterDimensions && <Filter className="h-3.5 w-3.5" />}
      {hasActive && (
        <span className="text-[10px] font-medium tabular-nums">{activeFilters.length}</span>
      )}
    </button>
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex min-h-10 flex-col border-b border-border/70",
        className,
      )}
    >
      {leadingSlot ? (
        <>
          {/* Search row (expanded) — appears above header row */}
          {expanded && (
            <div className="border-b border-border/70">{searchRow}</div>
          )}
          {/* Header row: leadingSlot + trailingSlot + collapsed trigger */}
          <div className="flex items-center gap-2 px-3 py-1.5">
            <div className="min-w-0 flex-1">{leadingSlot}</div>
            <div className="flex shrink-0 items-center gap-1">
              {trailingSlot}
              {!expanded && collapsedTrigger}
            </div>
          </div>
        </>
      ) : (
        /* Single-row layout: search inputs + trailing + trigger */
        <div className="flex items-center gap-2 px-3 py-1.5">
          {expanded ? (
            <>
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder}
                className="h-7 flex-1 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
                onBlur={handleInputBlur}
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    onSearchChange("");
                    inputRef.current?.focus();
                  }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                aria-label="Cancel search"
                onClick={() => {
                  onSearchChange("");
                  activeFilters.forEach((f) => f.onRemove());
                  setExpanded(false);
                }}
                className="ml-1 inline-flex h-6 items-center rounded border border-border/70 px-2 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Cancel
              </button>
            </>
          ) : null}
          <div className="ml-auto flex items-center gap-1">
            {trailingSlot}
            {!expanded && collapsedTrigger}
          </div>
        </div>
      )}

      {/* ── Row 2: filter pills ── */}
      {showFilterRow && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/70 px-3 py-1.5">
          {/* Pinned dimension pills */}
          {pinnedDims.map((dim) => {
            const active = activeFilters.find((f) => f.id === dim.id);
            return <PinnedFilterPill key={dim.id} dim={dim} active={active} />;
          })}

          {/* Extra active filter chips (not pinned) */}
          {extraActiveFilters.map((f) => (
            <div
              key={f.id}
              className="inline-flex h-6 items-center gap-1 rounded border border-border/70 bg-accent/40 px-2 text-xs"
            >
              <span className="text-muted-foreground">{f.label}:</span>
              <span className="font-medium">{f.value}</span>
              <button
                type="button"
                aria-label={`Remove ${f.label} filter`}
                onClick={f.onRemove}
                className="ml-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}

          {/* "Add filter +" for extra dimensions */}
          {extraDims.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-6 items-center gap-0.5 rounded border border-dashed border-border/70 px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Plus className="h-3 w-3" />
                  Add filter
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="start" sideOffset={6}>
                <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Add filter
                </p>
                {extraDims.map((dim) => (
                  <Popover key={dim.id}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent"
                      >
                        {dim.label}
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1" align="start" sideOffset={4}>
                      <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {dim.label}
                      </p>
                      <DimensionBody dim={dim} />
                    </PopoverContent>
                  </Popover>
                ))}
              </PopoverContent>
            </Popover>
          )}

          {/* Clear all filters */}
          {hasActive && (
            <button
              type="button"
              onClick={() => activeFilters.forEach((f) => f.onRemove())}
              className="ml-1 text-[11px] text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
