import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { authenticatedApiRequest } from "@/lib/uploadApi";

interface UsageResponse {
  company_name: string;
  days: number;
  totals: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    calls: number;
  };
  by_action: { action: string; total_tokens: number; calls: number }[];
  daily: { date: string; total_tokens: number; calls: number }[];
}

const ACTION_LABELS: Record<string, string> = {
  text_structuring: "Document structuring",
  account_classification: "Account classification",
  dashboard_chat: "Dashboard chat",
};

const ACTION_COLORS: Record<string, string> = {
  text_structuring: "#818cf8",
  account_classification: "#34d399",
  dashboard_chat: "#fb923c",
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function TokenUsageCard({ days = 30 }: { days?: number }) {
  const { activeCompany } = useCompany();
  const [data, setData] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCompany) return;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await authenticatedApiRequest<UsageResponse>(
          `/usage/company?days=${days}`,
          { headers: { "X-Company-Id": activeCompany.id } },
        );
        setData(result);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeCompany, days]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-yellow-400" />
          AI Token Usage
          <Badge variant="outline" className="ml-auto text-xs font-normal">
            Last {days} days
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading usage data…
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive py-4">Failed to load usage: {error}</p>
        )}

        {data && !loading && (
          <div className="space-y-5">
            {/* Totals */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total tokens", value: fmt(data.totals.total_tokens), accent: true },
                { label: "Input tokens", value: fmt(data.totals.input_tokens) },
                { label: "Output tokens", value: fmt(data.totals.output_tokens) },
              ].map(({ label, value, accent }) => (
                <div
                  key={label}
                  className={`rounded-lg border p-3 text-center ${accent ? "border-primary/30 bg-primary/5" : ""}`}
                >
                  <p className={`text-lg font-semibold ${accent ? "text-primary" : ""}`}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* By action */}
            {data.by_action.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  By action
                </p>
                {data.by_action.map(({ action, total_tokens, calls }) => {
                  const pct = data.totals.total_tokens > 0
                    ? Math.round((total_tokens / data.totals.total_tokens) * 100)
                    : 0;
                  return (
                    <div key={action} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{ACTION_LABELS[action] ?? action}</span>
                        <span className="text-muted-foreground">
                          {fmt(total_tokens)} · {calls} {calls === 1 ? "call" : "calls"}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: ACTION_COLORS[action] ?? "#94a3b8",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                No usage recorded yet.
              </p>
            )}

            {/* Daily bar chart */}
            {data.daily.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Daily tokens
                </p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={data.daily} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(d: string) => {
                        const [, m, day] = d.split("-");
                        return `${parseInt(day)}/${parseInt(m)}`;
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={fmt}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(v: number) => [fmt(v), "Tokens"]}
                      labelFormatter={(l: string) => l}
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="total_tokens" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
