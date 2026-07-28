import { useState } from "react";
import { ChevronDown, ChevronRight, Database, Globe, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryLogEntry {
  node: string;
  type: "db" | "llm" | "s3" | "api";
  query?: string;
  model?: string;
  rows?: number;
  input_tokens?: number;
  output_tokens?: number;
  duration_ms?: number;
  result_count?: number;
}

interface QueryLogPanelProps {
  queries: QueryLogEntry[];
  className?: string;
}

function getDurationColor(ms: number | undefined): string {
  if (!ms) return "text-muted-foreground";
  if (ms < 50) return "text-green-600";
  if (ms < 500) return "text-yellow-600";
  return "text-red-600";
}

function getTypeIcon(type: string) {
  switch (type) {
    case "db": return <Database className="h-3.5 w-3.5" />;
    case "llm": return <Brain className="h-3.5 w-3.5" />;
    case "s3": case "api": return <Globe className="h-3.5 w-3.5" />;
    default: return <Database className="h-3.5 w-3.5" />;
  }
}

export function QueryLogPanel({ queries, className }: QueryLogPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!queries || queries.length === 0) return null;

  const totalTime = queries.reduce((sum, q) => sum + (q.duration_ms || 0), 0);
  const totalTokens = queries.reduce(
    (sum, q) => sum + (q.input_tokens || 0) + (q.output_tokens || 0),
    0,
  );

  return (
    <div className={cn("rounded-md border bg-muted/30", className)}>
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          {queries.length} queries
          <span className="text-xs">&middot; {totalTime}ms total</span>
          {totalTokens > 0 && (
            <span className="text-xs">&middot; {totalTokens.toLocaleString()} tokens</span>
          )}
        </span>
        {expanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t px-3 py-2 space-y-1">
          {queries.map((q, i) => (
            <div key={i} className="flex items-start gap-2 text-xs font-mono">
              <span className="flex items-center gap-1 shrink-0 text-muted-foreground">
                {getTypeIcon(q.type)}
                <span className="uppercase w-6">{q.type}</span>
              </span>
              <span className="flex-1 truncate" title={q.query || q.model}>
                {q.type === "llm"
                  ? `${q.model} (${q.input_tokens}→${q.output_tokens} tokens)`
                  : q.query}
              </span>
              {q.rows !== undefined && (
                <span className="shrink-0 text-muted-foreground">{q.rows} rows</span>
              )}
              <span className={cn("shrink-0 tabular-nums", getDurationColor(q.duration_ms))}>
                {q.duration_ms != null ? `${q.duration_ms}ms` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
