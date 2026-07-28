import { useEffect, useState, useMemo } from "react";
import { RefreshCw, Trash2, BarChart3, ChevronDown, ChevronUp, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  listSavedQueries,
  deleteSavedQuery,
  refreshSavedQuery,
  type SavedAnalyticsQuery,
} from "@/lib/uploadApi";
import { useCompany } from "@/contexts/CompanyContext";

const CHART_COLORS = [
  "#4ade80", "#f87171", "#60a5fa", "#facc15", "#a78bfa",
  "#fb923c", "#34d399", "#f472b6", "#38bdf8", "#a3e635",
];

function fmt(v: unknown): string {
  const n = Number(v);
  if (isNaN(n)) return String(v ?? "");
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
}

// --- SQL syntax highlighter --------------------------------------------------

const SQL_KEYWORDS = new Set([
  "SELECT","FROM","WHERE","GROUP","BY","ORDER","HAVING","JOIN","LEFT","RIGHT",
  "INNER","OUTER","FULL","CROSS","ON","AS","LIMIT","OFFSET","DISTINCT","WITH",
  "UNION","ALL","IN","NOT","AND","OR","IS","NULL","LIKE","BETWEEN","CASE",
  "WHEN","THEN","ELSE","END","INSERT","INTO","UPDATE","DELETE","CREATE","TABLE",
  "VIEW","INDEX","SET","EXISTS","ASC","DESC","OVER","PARTITION","FILTER",
  "RETURNING","VALUES","DEFAULT","PRIMARY","KEY","FOREIGN","REFERENCES",
]);

const SQL_FUNCTIONS = new Set([
  "COUNT","SUM","AVG","MIN","MAX","COALESCE","NULLIF","CAST","ROUND","FLOOR",
  "CEIL","ABS","DATE","NOW","EXTRACT","TO_CHAR","TO_DATE","CONCAT","LOWER",
  "UPPER","TRIM","REPLACE","SUBSTRING","LENGTH","RANK","ROW_NUMBER","DENSE_RANK",
  "LAG","LEAD","FIRST_VALUE","LAST_VALUE","NTILE","PERCENTILE_CONT","JSONB_AGG",
  "JSON_AGG","ARRAY_AGG","STRING_AGG","BOOL_AND","BOOL_OR",
]);

type Token = { type: "keyword" | "function" | "string" | "number" | "comment" | "operator" | "plain"; text: string };

function tokenizeSQL(sql: string): Token[] {
  const tokens: Token[] = [];
  // Regex alternation order matters: comments first, then strings, then words, then numbers, then operators
  const re = /(--[^\n]*)|(\/\*[\s\S]*?\*\/)|(E?'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|([<>=!,;()*+\-/%:|])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    if (m.index > last) tokens.push({ type: "plain", text: sql.slice(last, m.index) });
    const [full, comment1, comment2, str, num, word, op] = m;
    if (comment1 || comment2) tokens.push({ type: "comment", text: full });
    else if (str) tokens.push({ type: "string", text: str });
    else if (num) tokens.push({ type: "number", text: num });
    else if (word) {
      const up = word.toUpperCase();
      if (SQL_KEYWORDS.has(up)) tokens.push({ type: "keyword", text: word });
      else if (SQL_FUNCTIONS.has(up)) tokens.push({ type: "function", text: word });
      else tokens.push({ type: "plain", text: word });
    } else if (op) tokens.push({ type: "operator", text: op });
    last = m.index + full.length;
  }
  if (last < sql.length) tokens.push({ type: "plain", text: sql.slice(last) });
  return tokens;
}

const TOKEN_CLASS: Record<Token["type"], string> = {
  keyword:  "text-[#ee8fe0] font-semibold",   // brand pink  — SELECT, FROM, WHERE …
  function: "text-[#8fe0ee]",                  // brand cyan  — COUNT, SUM, AVG …
  string:   "text-[#b0ee8f]",                  // brand green — 'literals'
  number:   "text-[#eedd8f]",                  // brand yellow — 42, 3.14
  comment:  "text-muted-foreground italic",
  operator: "text-muted-foreground",
  plain:    "text-foreground",
};

function HighlightedSQL({ sql }: { sql: string }) {
  const lineSegments = useMemo(() => {
    const tokens = tokenizeSQL(sql);
    const allParts: React.ReactNode[] = [];
    tokens.forEach((tok, ti) => {
      const parts = tok.text.split("\n");
      parts.forEach((part, pi) => {
        if (part) allParts.push(<span key={`${ti}-${pi}`} className={TOKEN_CLASS[tok.type]}>{part}</span>);
        if (pi < parts.length - 1) allParts.push("\n");
      });
    });
    const segments: React.ReactNode[][] = [[]];
    allParts.forEach((node) => {
      if (node === "\n") segments.push([]);
      else segments[segments.length - 1].push(node);
    });
    return segments;
  }, [sql]);

  return (
    <div className="flex text-[11px] font-mono leading-[1.6]">
      <div className="select-none pr-3 text-right text-muted-foreground/40 shrink-0" style={{ minWidth: `${String(lineSegments.length).length + 1}ch` }}>
        {lineSegments.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <pre className="overflow-x-auto whitespace-pre flex-1">
        {lineSegments.map((seg, i) => (
          <div key={i} className="min-h-[1.6em]">{seg}</div>
        ))}
      </pre>
    </div>
  );
}

// --- ShopifyQL-style SQL editor block ----------------------------------------

function SqlBlock({
  sql,
  onRun,
  isRunning,
}: {
  sql: string;
  onRun?: () => void;
  isRunning?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-3 rounded-lg border border-border overflow-hidden bg-[#0d0d0f] dark:bg-[#0d0d0f]">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/60 bg-black/20">
        <span className="size-1.5 rounded-full bg-[#b0ee8f] shrink-0" />
        <span className="text-[10px] font-mono text-muted-foreground tracking-wide uppercase mr-auto">SQL</span>

        <div className="flex items-center gap-0.5">
          {onRun && (
            <button
              onClick={onRun}
              disabled={isRunning}
              title="Run query"
              className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium bg-[#b0ee8f]/15 text-[#b0ee8f] hover:bg-[#b0ee8f]/25 disabled:opacity-50 transition-colors"
            >
              <Play className="size-2.5" />
              Run
            </button>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="ml-1 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            title={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className="px-3 py-2.5">
            <HighlightedSQL sql={sql} />
          </div>

        </>
      )}
    </div>
  );
}

function MiniChart({ config, data }: { config: SavedAnalyticsQuery["chart_config"]; data: Record<string, unknown>[] }) {
  if (!config || data.length === 0) return null;

  if (config.type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey={config.xKey} tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmt(v)} />
          <Tooltip formatter={(v: number) => fmt(v)} />
          {config.yKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (config.type === "line") {
    return (
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey={config.xKey} tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmt(v)} />
          <Tooltip formatter={(v: number) => fmt(v)} />
          {config.yKeys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (config.type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} dataKey={config.yKeys[0]} nameKey={config.xKey} cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => fmt(v)} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

export const AnalyticsView = () => {
  const { activeCompany } = useCompany();
  const [queries, setQueries] = useState<SavedAnalyticsQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await listSavedQueries();
      setQueries(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCompany) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCompany?.id]);

  const handleRefresh = async (id: string) => {
    setRefreshingId(id);
    try {
      const updated = await refreshSavedQuery(id);
      setQueries((prev) => prev.map((q) => (q.id === id ? updated : q)));
    } catch {
      // silently fail
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSavedQuery(id);
      setQueries((prev) => prev.filter((q) => q.id !== id));
    } catch {
      // silently fail
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6 p-6 overflow-y-auto">
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background shadow-sm">
          <Sparkles className="size-3.5 text-muted-foreground" />
        </div>
        <h1 className="text-base font-semibold tracking-tight">Custom Reports</h1>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-40 animate-pulse rounded-lg bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : queries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 size-16 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center">
            <BarChart3 className="size-6 text-muted-foreground" />
          </div>
          <h2 className="mb-1.5 text-base font-medium text-foreground">No saved queries yet</h2>
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            Ask questions on the Dashboard and save query results to see them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {queries.map((q) => (
            <Card key={q.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-medium leading-snug line-clamp-2">
                    {q.title}
                  </CardTitle>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => handleRefresh(q.id)}
                      disabled={refreshingId === q.id}
                    >
                      <RefreshCw className={`size-3.5 ${refreshingId === q.id ? "animate-spin" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(q.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {q.last_refreshed_at && (
                  <p className="text-[10px] text-muted-foreground">
                    Refreshed {new Date(q.last_refreshed_at).toLocaleString()}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <SqlBlock sql={q.sql_query} onRun={() => handleRefresh(q.id)} isRunning={refreshingId === q.id} />
                {q.last_result && q.chart_config && (
                  <MiniChart config={q.chart_config} data={q.last_result.data} />
                )}
                {q.last_result && !q.chart_config && (
                  <div className="text-xs text-muted-foreground">
                    {q.last_result.row_count} row{q.last_result.row_count !== 1 ? "s" : ""}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
