import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { round2Sync } from "@/lib/accounting-engine";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Pencil,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  getDashboardSummary,
  getDashboardSuppliers,
  getDashboardCustomers,
  saveAnalyticsQuery,
  type DashboardSummary,
  type DashboardSupplier,
  type DashboardCustomer,
} from "@/lib/uploadApi";
import { useCompany } from "@/contexts/CompanyContext";

// ── Analytics icon (Shopify-style inspect icon) ───────────────────────────────

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className} fill="currentColor">
      <path d="M7.018 1.5h1.964c.813 0 1.469 0 2 .043.546.045 1.026.14 1.47.366.706.36 1.28.933 1.64 1.639.226.444.32.924.365 1.47.043.531.043 1.187.043 2v.232a.75.75 0 0 1-1.5 0v-.2c0-.852 0-1.447-.038-1.91-.037-.453-.107-.714-.207-.911a2.25 2.25 0 0 0-.984-.984c-.197-.1-.458-.17-.912-.207-.462-.037-1.057-.038-1.909-.038h-1.9c-.852 0-1.447 0-1.91.038-.453.037-.714.107-.911.207a2.25 2.25 0 0 0-.984.984c-.1.197-.17.458-.207.912-.037.462-.038 1.057-.038 1.909v1.9c0 .852 0 1.447.038 1.91.037.453.107.714.207.912.216.423.56.767.984.983.197.1.458.17.912.207.462.037 1.057.038 1.909.038h.2a.75.75 0 0 1 0 1.5h-.232c-.813 0-1.469 0-2-.043-.546-.045-1.026-.14-1.47-.366a3.76 3.76 0 0 1-1.64-1.638c-.226-.445-.32-.925-.365-1.471-.043-.531-.043-1.187-.043-2v-1.964c0-.813 0-1.469.043-2 .045-.546.14-1.026.366-1.47.36-.706.933-1.28 1.639-1.64.444-.226.924-.32 1.47-.365.531-.043 1.187-.043 2-.043" />
      <path fillRule="evenodd" d="M8.25 11a2.75 2.75 0 1 1 5.152 1.34l1.128 1.13a.749.749 0 1 1-1.06 1.06l-1.13-1.128a2.75 2.75 0 0 1-4.09-2.402m2.75-1.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5" />
      <path d="M5 5.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75" />
      <path d="M5.75 8a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5z" />
    </svg>
  );
}

// ── Period helpers ────────────────────────────────────────────────────────────

function formatPeriodRange(
  period: PeriodKey,
  customFrom: string,
  customTo: string,
  summaryFromDate?: string,
): string {
  const today = new Date();
  const y = today.getFullYear();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const t = fmt(today);

  if (period === "custom") return customFrom && customTo ? `${customFrom} – ${customTo}` : "";
  if (period === "ytd") return `${y}-01-01 – ${t}`;
  if (period === "this_month") return `${y}-${pad(today.getMonth() + 1)}-01 – ${t}`;
  if (period === "last_30d") {
    const s = new Date(today); s.setDate(s.getDate() - 30);
    return `${fmt(s)} – ${t}`;
  }
  if (period === "last_90d") {
    const s = new Date(today); s.setDate(s.getDate() - 90);
    return `${fmt(s)} – ${t}`;
  }
  if (period === "last_month") {
    const end = new Date(y, today.getMonth(), 0);
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return `${fmt(start)} – ${fmt(end)}`;
  }
  if (period === "last_quarter") {
    const q = Math.floor(today.getMonth() / 3);
    if (q === 0) return `${y - 1}-10-01 – ${y - 1}-12-31`;
    const sm = (q - 1) * 3 + 1;
    const em = sm + 2;
    const ed = new Date(y, em, 0).getDate();
    return `${y}-${pad(sm)}-01 – ${y}-${pad(em)}-${pad(ed)}`;
  }
  if (period === "last_year") return `${y - 1}-01-01 – ${y - 1}-12-31`;
  if (period === "all") return summaryFromDate ? `${summaryFromDate} – ${t}` : `– ${t}`;
  return `${y}-01-01 – ${t}`;
}

// ── Period presets ────────────────────────────────────────────────────────────

type PeriodKey =
  | "ytd"
  | "last_30d"
  | "last_90d"
  | "this_month"
  | "last_month"
  | "last_quarter"
  | "last_year"
  | "all"
  | "custom";

const PERIOD_PRESETS: { key: PeriodKey; label: string }[] = [
  { key: "ytd", label: "I år" },
  { key: "this_month", label: "Denna månad" },
  { key: "last_30d", label: "Senaste 30 dagarna" },
  { key: "last_90d", label: "Senaste 90 dagarna" },
  { key: "last_month", label: "Förra månaden" },
  { key: "last_quarter", label: "Förra kvartalet" },
  { key: "last_year", label: "Förra året" },
  { key: "all", label: "All tid" },
  { key: "custom", label: "Anpassad period" },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type MetricKey = "sales" | "expenses" | "suppliers" | "customers";

interface SlotConfig {
  metric: MetricKey;
  entityFilter: string | null; // specific supplier/customer name
}

interface SlotData {
  label: string;
  value: string;
  subLabel: string | null;
  trend: { pct: number; direction: "up" | "down" | "neutral" } | null;
  sparkline: { x: string; v: number }[];
  accentColor: string;
  sqlQuery: string | null;
  chartConfig: { type: string; xKey: string; yKeys: string[]; yLabels?: string[] } | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACCENT: Record<MetricKey, string> = {
  sales: "#b0ee8f",
  expenses: "#eedd8f",
  suppliers: "#ee8fe0",
  customers: "#8fd4ee",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(n);

const fmtShort = (n: number): string => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return fmt(n);
};

function calcTrend(data: { v: number }[]): { pct: number; direction: "up" | "down" | "neutral" } | null {
  if (data.length < 2) return null;
  const first = data[0].v;
  const last = data[data.length - 1].v;
  if (first === 0) return null;
  const diff = round2Sync(last - first) ?? (last - first);
  const pct = (diff / first) * 100;
  return {
    pct: Math.abs(pct),
    direction: pct > 1 ? "up" : pct < -1 ? "down" : "neutral",
  };
}

function computeSlotData(
  slot: SlotConfig,
  summary: DashboardSummary | null,
  suppliers: DashboardSupplier[],
  customers: DashboardCustomer[],
  sqlByMetric: Record<MetricKey, string | null>,
): SlotData {
  const monthly = summary?.monthly_breakdown ?? [];
  const accent = ACCENT[slot.metric];
  const baseSql = sqlByMetric[slot.metric];

  if (slot.metric === "sales") {
    const sparkline = monthly.map((m) => ({ x: m.month.slice(5), v: m.revenue }));
    const total = summary?.revenue ?? 0;
    return {
      label: "Försäljning",
      value: summary ? `${fmtShort(total)} kr` : "—",
      subLabel: null,
      trend: calcTrend(sparkline),
      sparkline,
      accentColor: accent,
      sqlQuery: baseSql,
      chartConfig: { type: "line", xKey: "month", yKeys: ["revenue"], yLabels: ["Intäkter"] },
    };
  }

  if (slot.metric === "expenses") {
    const sparkline = monthly.map((m) => ({ x: m.month.slice(5), v: m.expenses }));
    const total = summary?.expenses ?? 0;
    return {
      label: "Kostnader",
      value: summary ? `${fmtShort(total)} kr` : "—",
      subLabel: null,
      trend: calcTrend(sparkline),
      sparkline,
      accentColor: accent,
      sqlQuery: baseSql,
      chartConfig: { type: "line", xKey: "month", yKeys: ["expenses"], yLabels: ["Kostnader"] },
    };
  }

  if (slot.metric === "suppliers") {
    const sparkline = monthly.map((m) => ({ x: m.month.slice(5), v: m.expenses }));
    if (slot.entityFilter) {
      const s = suppliers.find((x) => x.name === slot.entityFilter);
      return {
        label: slot.entityFilter.length > 18 ? slot.entityFilter.slice(0, 16) + "…" : slot.entityFilter,
        value: s ? `${fmtShort(s.total)} kr` : "—",
        subLabel: s ? `${s.invoice_count} fakturor` : null,
        trend: null,
        sparkline,
        accentColor: accent,
        sqlQuery: baseSql,
        chartConfig: { type: "bar", xKey: "name", yKeys: ["total"], yLabels: ["Kostnad"] },
      };
    }
    return {
      label: "Leverantörer",
      value: suppliers.length > 0 ? `${suppliers.length} st` : "—",
      subLabel: summary ? `${fmtShort(summary.expenses)} kr totalt` : null,
      trend: calcTrend(sparkline),
      sparkline,
      accentColor: accent,
      sqlQuery: baseSql,
      chartConfig: { type: "bar", xKey: "name", yKeys: ["total"], yLabels: ["Kostnad"] },
    };
  }

  // customers
  const sparkline = monthly.map((m) => ({ x: m.month.slice(5), v: m.revenue }));
  if (slot.entityFilter) {
    const c = customers.find((x) => x.name === slot.entityFilter);
    return {
      label: slot.entityFilter.length > 18 ? slot.entityFilter.slice(0, 16) + "…" : slot.entityFilter,
      value: c ? `${fmtShort(c.total)} kr` : "—",
      subLabel: c ? `${c.invoice_count} fakturor` : null,
      trend: null,
      sparkline,
      accentColor: accent,
      sqlQuery: baseSql,
      chartConfig: { type: "bar", xKey: "name", yKeys: ["total"], yLabels: ["Intäkt"] },
    };
  }
  return {
    label: "Kunder",
    value: customers.length > 0 ? `${customers.length} st` : "—",
    subLabel: summary ? `${fmtShort(summary.revenue)} kr totalt` : null,
    trend: calcTrend(sparkline),
    sparkline,
    accentColor: accent,
    sqlQuery: baseSql,
    chartConfig: { type: "bar", xKey: "name", yKeys: ["total"], yLabels: ["Intäkt"] },
  };
}

// ── Date Input ────────────────────────────────────────────────────────────────

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

// ── Metric Picker Popover ─────────────────────────────────────────────────────

const METRIC_OPTIONS: { key: MetricKey; label: string }[] = [
  { key: "sales", label: "Försäljning" },
  { key: "expenses", label: "Kostnader" },
  { key: "suppliers", label: "Leverantörer" },
  { key: "customers", label: "Kunder" },
];

function MetricPickerPopover({
  slot,
  suppliers,
  customers,
  onUpdate,
}: {
  slot: SlotConfig;
  suppliers: DashboardSupplier[];
  customers: DashboardCustomer[];
  onUpdate: (config: SlotConfig) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const isEntityMetric = slot.metric === "suppliers" || slot.metric === "customers";
  const entityList = slot.metric === "suppliers" ? suppliers : customers;
  const filtered = entityList.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleMetricSelect = (key: MetricKey) => {
    onUpdate({ metric: key, entityFilter: null });
    setOpen(false);
    setSearch("");
  };

  const handleEntitySelect = (name: string | null) => {
    onUpdate({ metric: slot.metric, entityFilter: name });
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="size-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/60"
        >
          <Pencil className="size-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start" onClick={(e) => e.stopPropagation()}>
        {/* Metric selector */}
        <div className="mb-1">
          <p className="text-[10px] font-medium text-muted-foreground px-1 mb-1 uppercase tracking-wide">
            Visa
          </p>
          {METRIC_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleMetricSelect(opt.key)}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-left hover:bg-muted/60 transition-colors",
                slot.metric === opt.key && !slot.entityFilter && "bg-muted font-medium",
              )}
            >
              {slot.metric === opt.key && !slot.entityFilter && (
                <Check className="size-3 shrink-0" />
              )}
              {(slot.metric !== opt.key || slot.entityFilter) && (
                <span className="size-3 shrink-0" />
              )}
              {opt.label}
            </button>
          ))}
        </div>

        {/* Entity search for suppliers/customers */}
        {isEntityMetric && entityList.length > 0 && (
          <>
            <div className="my-1.5 border-t border-border" />
            <p className="text-[10px] font-medium text-muted-foreground px-1 mb-1 uppercase tracking-wide">
              {slot.metric === "suppliers" ? "Filtrera leverantör" : "Filtrera kund"}
            </p>
            <div className="relative mb-1">
              <Search className="absolute left-2 top-1.5 size-3 text-muted-foreground" />
              <Input
                className="h-7 pl-6 text-xs"
                placeholder="Sök..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-0.5">
              <button
                onClick={() => handleEntitySelect(null)}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-left hover:bg-muted/60 transition-colors",
                  !slot.entityFilter && "bg-muted font-medium",
                )}
              >
                {!slot.entityFilter ? <Check className="size-3 shrink-0" /> : <span className="size-3 shrink-0" />}
                Alla
              </button>
              {filtered.map((e) => (
                <button
                  key={e.name}
                  onClick={() => handleEntitySelect(e.name)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-left hover:bg-muted/60 transition-colors",
                    slot.entityFilter === e.name && "bg-muted font-medium",
                  )}
                >
                  {slot.entityFilter === e.name ? (
                    <Check className="size-3 shrink-0" />
                  ) : (
                    <span className="size-3 shrink-0" />
                  )}
                  <span className="truncate">{e.name}</span>
                  <span className="ml-auto text-muted-foreground shrink-0">
                    {fmtShort(e.total)}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ── Mini Sparkline ────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: { x: string; v: number }[]; color: string }) {
  if (data.length < 2) return <div className="h-10 w-full" />;
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── KPI Slot ──────────────────────────────────────────────────────────────────

function KpiSlot({
  data,
  slot,
  isActive,
  suppliers,
  customers,
  onClick,
  onUpdate,
  onViewInAnalytics,
}: {
  data: SlotData;
  slot: SlotConfig;
  isActive: boolean;
  suppliers: DashboardSupplier[];
  customers: DashboardCustomer[];
  onClick: () => void;
  onUpdate: (config: SlotConfig) => void;
  onViewInAnalytics: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className={cn(
        "group flex-1 flex flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/30 min-w-0 cursor-pointer",
        isActive && "bg-muted/20",
      )}
    >
      {/* Label + actions */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-medium text-muted-foreground truncate">
          {data.label}
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          {data.sqlQuery && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewInAnalytics(); }}
              className="size-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/60"
              title="Visa i Analytics"
            >
              <AnalyticsIcon className="size-3.5 text-muted-foreground" />
            </button>
          )}
          <MetricPickerPopover
            slot={slot}
            suppliers={suppliers}
            customers={customers}
            onUpdate={onUpdate}
          />
        </div>
      </div>

      {/* Value */}
      <span className="text-lg font-semibold text-foreground tracking-tight leading-tight">
        {data.value}
      </span>

      {/* Sub-label or trend */}
      {data.subLabel ? (
        <span className="text-[11px] text-muted-foreground leading-none">
          {data.subLabel}
        </span>
      ) : data.trend ? (
        <div className="flex items-center gap-0.5">
          {data.trend.direction === "up" && (
            <TrendingUp className="size-3 shrink-0" style={{ color: "#7abf5a" }} />
          )}
          {data.trend.direction === "down" && (
            <TrendingDown className="size-3 shrink-0" style={{ color: "#c4a83a" }} />
          )}
          {data.trend.direction === "neutral" && (
            <Minus className="size-3 shrink-0 text-muted-foreground" />
          )}
          <span
            className="text-[11px]"
            style={{
              color:
                data.trend.direction === "up"
                  ? "#7abf5a"
                  : data.trend.direction === "down"
                    ? "#c4a83a"
                    : undefined,
            }}
          >
            {data.trend.pct.toFixed(1)}%
          </span>
        </div>
      ) : (
        <div className="h-3.5" />
      )}

      {/* Sparkline */}
      <Sparkline data={data.sparkline} color={data.accentColor} />
    </div>
  );
}

// ── Expanded Chart ────────────────────────────────────────────────────────────

function ExpandedChart({
  slot,
  summary,
  suppliers,
  customers,
}: {
  slot: SlotConfig;
  summary: DashboardSummary | null;
  suppliers: DashboardSupplier[];
  customers: DashboardCustomer[];
}) {
  const monthly = summary?.monthly_breakdown ?? [];

  // Entity bar charts (suppliers / customers, no entity filter)
  if ((slot.metric === "suppliers" || slot.metric === "customers") && !slot.entityFilter) {
    const list = slot.metric === "suppliers" ? suppliers : customers;
    const barData = list
      .slice(0, 8)
      .map((e) => ({ name: e.name.length > 18 ? e.name.slice(0, 16) + "…" : e.name, value: e.total }));
    const color = ACCENT[slot.metric];
    return (
      <div className="px-4 pb-4 pt-2">
        <p className="text-xs font-medium text-muted-foreground mb-3">
          {slot.metric === "suppliers" ? "Topp leverantörer — kostnad (kr)" : "Topp kunder — intäkt (kr)"}
        </p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 4, right: 4, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => fmtShort(v as number)}
                width={52}
              />
              <Tooltip
                formatter={(v: number) => [`${fmt(v)} kr`, ""]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 6,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--background))",
                }}
              />
              <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Line chart for sales / expenses / per-entity trends
  const showRevenue = slot.metric === "sales" || (slot.metric === "customers" && !!slot.entityFilter);
  const showExpenses = slot.metric === "expenses" || (slot.metric === "suppliers" && !!slot.entityFilter);
  const showBoth = monthly.length > 0 && !slot.entityFilter && slot.metric !== "sales" && slot.metric !== "expenses";

  const chartData = monthly.map((m) => ({
    month: m.month.slice(5),
    revenue: m.revenue,
    expenses: m.expenses,
  }));

  if (chartData.length === 0) {
    return (
      <div className="px-4 pb-4 pt-2 text-xs text-muted-foreground">Ingen data för perioden.</div>
    );
  }

  const lines: { key: "revenue" | "expenses"; color: string; label: string }[] = [];
  if (showRevenue || showBoth) lines.push({ key: "revenue", color: ACCENT.sales, label: "Intäkter" });
  if (showExpenses || showBoth) lines.push({ key: "expenses", color: ACCENT.expenses, label: "Kostnader" });
  if (!lines.length) {
    lines.push({ key: "revenue", color: ACCENT.sales, label: "Intäkter" });
    lines.push({ key: "expenses", color: ACCENT.expenses, label: "Kostnader" });
  }

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="flex items-center gap-4 mb-3">
        {lines.map((l) => (
          <div key={l.key} className="flex items-center gap-1.5">
            <div className="size-2 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-[11px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => fmtShort(v as number)}
              width={52}
            />
            <Tooltip
              formatter={(v: number, name: string) => [`${fmt(v)} kr`, name]}
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--background))",
              }}
            />
            {lines.map((l) => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                stroke={l.color}
                strokeWidth={2}
                dot={{ r: 3, fill: l.color }}
                name={l.label}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── KpiMetricsBar ─────────────────────────────────────────────────────────────

export function KpiMetricsBar() {
  const { activeCompany } = useCompany();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodKey>("ytd");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const queryEnabled = period !== "custom" || (!!customFrom && !!customTo);
  const periodLabel = PERIOD_PRESETS.find((p) => p.key === period)?.label ?? "I år";

  const customDates = queryEnabled && period === "custom" ? [customFrom, customTo] : [];

  const { data: summary = null } = useQuery({
    queryKey: ["dashboard-summary", activeCompany?.id, period, ...customDates],
    queryFn: () => getDashboardSummary(period, customFrom, customTo),
    enabled: !!activeCompany?.id && queryEnabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
    retry: 1,
  });

  const { data: suppliersResp } = useQuery({
    queryKey: ["dashboard-suppliers", activeCompany?.id, period, ...customDates],
    queryFn: () => getDashboardSuppliers(period, 20, customFrom, customTo),
    enabled: !!activeCompany?.id && queryEnabled,
    staleTime: 60_000,
    retry: 1,
  });

  const { data: customersResp } = useQuery({
    queryKey: ["dashboard-customers", activeCompany?.id, period, ...customDates],
    queryFn: () => getDashboardCustomers(period, 20, customFrom, customTo),
    enabled: !!activeCompany?.id && queryEnabled,
    staleTime: 60_000,
    retry: 1,
  });

  const suppliers = suppliersResp?.suppliers ?? [];
  const customers = customersResp?.customers ?? [];

  // SQL from the API — keyed by metric
  const sqlByMetric = useMemo<Record<MetricKey, string | null>>(() => ({
    sales: summary?.sql_query ?? null,
    expenses: summary?.sql_query ?? null,
    suppliers: suppliersResp?.sql_query ?? null,
    customers: customersResp?.sql_query ?? null,
  }), [summary, suppliersResp, customersResp]);

  const [slots, setSlots] = useState<SlotConfig[]>([
    { metric: "sales", entityFilter: null },
    { metric: "expenses", entityFilter: null },
    { metric: "suppliers", entityFilter: null },
    { metric: "customers", entityFilter: null },
  ]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const slotDataList = useMemo(
    () => slots.map((s) => computeSlotData(s, summary, suppliers, customers, sqlByMetric)),
    [slots, summary, suppliers, customers, sqlByMetric],
  );

  const updateSlot = (idx: number, config: SlotConfig) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? config : s)));
    setActiveSlot(idx);
  };

  const handleViewInAnalytics = async (idx: number) => {
    const d = slotDataList[idx];
    if (!d.sqlQuery) return;
    try {
      await saveAnalyticsQuery({
        title: d.label,
        sql_query: d.sqlQuery,
        chart_config: d.chartConfig ?? undefined,
      });
    } catch {
      // If save fails (e.g. duplicate), navigate anyway
    }
    navigate("/analytics");
  };

  return (
    <Card className="overflow-hidden">
      {/* Period picker bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border flex-wrap">
        <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors">
              <Calendar className="size-3 text-muted-foreground" />
              {periodLabel}
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-1.5" align="start">
            {PERIOD_PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => { setPeriod(p.key); if (p.key !== "custom") setPeriodOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-left hover:bg-muted/60 transition-colors",
                  period === p.key && "bg-muted font-medium",
                )}
              >
                {period === p.key ? (
                  <Check className="size-3 shrink-0" />
                ) : (
                  <span className="size-3 shrink-0" />
                )}
                {p.label}
              </button>
            ))}
            {period === "custom" && (
              <div className="mt-2 space-y-1.5 px-1">
                <DateInput label="Från" value={customFrom} onChange={setCustomFrom} />
                <DateInput label="Till" value={customTo} onChange={setCustomTo} />
                <button
                  disabled={!customFrom || !customTo}
                  onClick={() => setPeriodOpen(false)}
                  className="w-full mt-1 rounded bg-foreground text-background text-xs py-1.5 font-medium disabled:opacity-40 hover:bg-foreground/90 transition-colors"
                >
                  Tillämpa
                </button>
              </div>
            )}
          </PopoverContent>
        </Popover>
        {(() => {
          const range = formatPeriodRange(period, customFrom, customTo, summary?.from_date);
          return range ? (
            <span className="text-[11px] text-muted-foreground">{range}</span>
          ) : null;
        })()}
      </div>

      {/* KPI slots row */}
      <div className="flex items-stretch">
        {slots.map((slot, i) => (
          <KpiSlot
            key={i}
            data={slotDataList[i]}
            slot={slot}
            isActive={activeSlot === i}
            suppliers={suppliers}
            customers={customers}
            onClick={() => setActiveSlot(i)}
            onUpdate={(config) => updateSlot(i, config)}
            onViewInAnalytics={() => handleViewInAnalytics(i)}
          />
        ))}

        {/* Expand toggle */}
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="flex items-center px-3 hover:bg-muted/30 transition-colors shrink-0"
          aria-label={isExpanded ? "Dölj diagram" : "Visa diagram"}
        >
          {isExpanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Expanded chart */}
      {isExpanded && (
        <div className="border-t border-border">
          <ExpandedChart
            slot={slots[activeSlot]}
            summary={summary}
            suppliers={suppliers}
            customers={customers}
          />
        </div>
      )}
    </Card>
  );
}
