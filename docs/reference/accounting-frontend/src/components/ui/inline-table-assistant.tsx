import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Send, Sparkles } from "lucide-react";
import owlWise from "@/assets/igdrasil-characters/owl_wise.png";
import type { InlineAssistantResult } from "@/lib/tableAssistant";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Textarea } from "./textarea";

// ─── SQL Syntax Highlighter ───────────────────────────────────────────────────

type TT = "keyword" | "attr" | "op" | "str" | "num" | "plain";
interface Tok { t: TT; v: string }

const KW = new Set(
  "SELECT FROM WHERE ORDER BY GROUP HAVING LIMIT AND OR NOT IN IS NULL LIKE BETWEEN AS DISTINCT SHOW CONTAINS JOIN INNER LEFT RIGHT OUTER ON ASC DESC CASE WHEN THEN END IF".split(" ")
);

function tokenizeLine(line: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < line.length) {
    // String literal
    if (line[i] === "'" || line[i] === '"') {
      const q = line[i]; let j = i + 1;
      while (j < line.length && line[j] !== q) { if (line[j] === "\\") j++; j++; }
      out.push({ t: "str", v: line.slice(i, j + 1) }); i = j + 1; continue;
    }
    // Identifier or keyword
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /\w/.test(line[j])) j++;
      const w = line.slice(i, j);
      out.push({ t: KW.has(w.toUpperCase()) ? "keyword" : "attr", v: w }); i = j; continue;
    }
    // Number
    if (/\d/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\d.]/.test(line[j])) j++;
      out.push({ t: "num", v: line.slice(i, j) }); i = j; continue;
    }
    // Operator
    const m = line.slice(i).match(/^(>=|<=|!=|<>|[=<>*])/);
    if (m) { out.push({ t: "op", v: m[1] }); i += m[1].length; continue; }
    // Plain
    out.push({ t: "plain", v: line[i] }); i++;
  }
  return out;
}

const TCLS: Record<TT, string> = {
  keyword: "text-[#0055B3] dark:text-[#7AB8F5] font-semibold",
  attr:    "text-[#067A4F] dark:text-emerald-400",
  op:      "text-violet-600 dark:text-violet-400",
  str:     "text-amber-700 dark:text-amber-400",
  num:     "text-violet-600 dark:text-violet-400",
  plain:   "text-foreground/70",
};

function SqlBlock({ sql }: { sql: string }) {
  const lines = sql.split("\n");
  return (
    <div className="flex gap-3 font-mono text-[12.5px] leading-[21px]">
      {/* Line numbers */}
      <div className="flex flex-col items-end shrink-0 select-none">
        {lines.map((_, i) => (
          <span key={i} className="text-muted-foreground/40 tabular-nums">{i + 1}</span>
        ))}
      </div>
      {/* Highlighted code */}
      <div className="flex-1 min-w-0 overflow-x-auto">
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre">
            {tokenizeLine(line).map((tok, j) => (
              <span key={j} className={TCLS[tok.t]}>{tok.v}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface InlineTableAssistantProps<Row> {
  tableId: string;
  metricLabel: string;
  metricValue: string;
  metricMeta?: string;
  promptPlaceholder: string;
  result: InlineAssistantResult<Row> | null;
  onSubmitPrompt: (prompt: string) => void;
  onClear: () => void;
  isApplying?: boolean;
  /** Total (unfiltered) row count — used to show percentage when a result is active */
  totalRowCount?: number;
}

export function InlineTableAssistant<Row>({
  tableId,
  metricLabel,
  metricValue,
  metricMeta,
  promptPlaceholder,
  result,
  onSubmitPrompt,
  onClear,
  isApplying = false,
  totalRowCount,
}: InlineTableAssistantProps<Row>) {
  const storageKey = `table-assistant:${tableId}:open`;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "1") setOpen(true);
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, open ? "1" : "0");
  }, [open, storageKey]);

  function submit(prompt: string) {
    const clean = prompt.trim();
    if (!clean) return;
    onSubmitPrompt(clean);
    setDraft("");
    setOpen(true);
  }

  const pct =
    result && totalRowCount && totalRowCount > 0
      ? ((result.rowCount / totalRowCount) * 100).toFixed(1)
      : null;

  return (
    <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-sm">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">

        {/* Left: KPI */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              "size-2 rounded-full shrink-0 transition-colors",
              result ? "bg-emerald-500" : "bg-muted-foreground/30",
            )}
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground leading-none mb-0.5">
              {metricLabel}
            </p>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-semibold tabular-nums text-foreground">{metricValue}</span>
              {metricMeta && (
                <span className="text-xs text-muted-foreground truncate">{metricMeta}</span>
              )}
              {pct && (
                <span className="text-xs text-muted-foreground">· {pct}% of total</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 shrink-0">
          {result && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onClear}
            >
              <RotateCcw className="size-3" />
              Reset
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 gap-1.5 text-xs"
            onClick={() => setOpen((v) => !v)}
          >
            <Sparkles className="size-3.5" />
            Wise Owl
            {open
              ? <ChevronUp className="size-3 text-muted-foreground" />
              : <ChevronDown className="size-3 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {/* ── Expanded body ── */}
      {open && (
        <div className="border-t border-border/60 px-4 py-3 space-y-3 bg-[#FAFAF8] dark:bg-muted/10">

          {/* SQL editor */}
          {result ? (
            <div className="rounded-lg border border-border/70 bg-background overflow-hidden">
              {/* Natural-language translation */}
              <div className="px-3 py-2 border-b border-border/50">
                <p className="text-xs text-muted-foreground italic">{result.interpretation}</p>
              </div>
              {/* SQL with line numbers */}
              <div className="px-3 py-3">
                <SqlBlock sql={result.sql} />
              </div>
              {/* Footer row count */}
              <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/50 bg-muted/20">
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {result.rowCount} {result.rowCount === 1 ? "row" : "rows"} matched
                </span>
              </div>
            </div>
          ) : null}

          {/* Chat input row */}
          <div className="border-t border-border/60 pt-3">
            <div className="flex items-end gap-2 rounded-lg border border-border/70 bg-background p-3">
              <img
                src={owlWise}
                alt="Wise owl assistant"
                className="mb-0.5 size-8 shrink-0 rounded-full border border-border/60 bg-white object-cover"
              />
              <label className="flex-1 min-w-0">
                <span className="sr-only">{promptPlaceholder}</span>
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={promptPlaceholder}
                  rows={1}
                  className="min-h-[38px] resize-none border-0 bg-transparent px-0 text-sm leading-snug shadow-none focus-visible:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit(draft);
                    }
                  }}
                />
              </label>
              <Button
                type="button"
                size="icon"
                className={cn(
                  "mb-0.5 size-9 shrink-0 rounded-full",
                  isApplying && "animate-pulse",
                )}
                disabled={isApplying || !draft.trim()}
                onClick={() => submit(draft)}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
