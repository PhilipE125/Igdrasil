import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface KpiMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export interface KpiCardProps {
  metrics: KpiMetric[];
}

function formatValue(v: string | number): string {
  if (typeof v === "number") {
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} MSEK`;
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)} KSEK`;
    return v.toLocaleString("sv-SE");
  }
  return v;
}

function TrendIcon({ trend }: { trend?: "up" | "down" | "neutral" }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

const TREND_CLASS: Record<string, string> = {
  up: "text-green-500",
  down: "text-red-500",
};

export function KpiCard({ metrics }: KpiCardProps) {
  if (!metrics || metrics.length === 0) return null;
  const cols = metrics.length === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className={`my-3 grid gap-x-6 gap-y-3 border-y border-border/40 py-3 ${cols}`}>
      {metrics.map((m, i) => (
        <div key={i} className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">{m.label}</p>
          <p className="text-xl font-semibold text-foreground tabular-nums">{formatValue(m.value)}</p>
          {m.change && (
            <div className="flex items-center gap-1 mt-1">
              <TrendIcon trend={m.trend} />
              <span className={`text-xs ${TREND_CLASS[m.trend ?? ""] ?? "text-muted-foreground"}`}>
                {m.change}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
