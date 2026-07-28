import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileBarChart2, CheckCircle2, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  getBalanceSheet,
  getIncomeStatement,
  getTrialBalance,
  type BalanceSheetReport,
  type IncomeStatementReport,
  type TrialBalanceReport,
  type ReportSection,
} from "@/lib/uploadApi";
import { useCompany } from "@/contexts/CompanyContext";

// ─── Utilities ────────────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear();
const defaultToday = new Date().toISOString().split("T")[0];
const defaultPeriodStart = `${currentYear}-01-01`;

function SEK(v: number) {
  return v.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SEKSigned(v: number) {
  const abs = Math.abs(v);
  const formatted = abs.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return v < 0 ? `−${formatted}` : formatted;
}

// ─── Date pickers ─────────────────────────────────────────────────────────────

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground shrink-0">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 rounded-md border border-border/70 bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

// ─── Collapsible report section ───────────────────────────────────────────────

function ReportSectionBlock({
  section,
  dimNegative,
}: {
  section: ReportSection;
  dimNegative?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasRows = section.rows.length > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => hasRows && setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between py-1.5 text-left transition-colors",
          hasRows ? "cursor-pointer hover:bg-accent/10 rounded px-1 -mx-1" : "cursor-default",
        )}
      >
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-[0.08em]">
          {section.label}
          {hasRows && (
            <span className="ml-1.5 inline-flex items-center">
              {open
                ? <ChevronDown className="size-3 opacity-50" />
                : <ChevronRight className="size-3 opacity-50" />}
            </span>
          )}
        </span>
        <span className={cn("text-sm font-semibold tabular-nums", dimNegative && section.subtotal < 0 ? "text-rose-600 dark:text-rose-400" : "")}>
          {SEK(section.subtotal)}
        </span>
      </button>

      {open && (
        <div className="mt-1 mb-2 pl-2 border-l border-border/40">
          {section.rows.map((row) => (
            <div key={row.account_number} className="flex items-center justify-between py-0.5">
              <span className="text-xs text-muted-foreground tabular-nums">
                {row.account_number} · {row.account_name}
              </span>
              <span className={cn("text-xs tabular-nums", row.amount < 0 ? "text-rose-600 dark:text-rose-400" : "")}>
                {SEKSigned(row.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Balance sheet ────────────────────────────────────────────────────────────

function BalanceSheetView({ data }: { data: BalanceSheetReport }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Assets */}
      <Card>
        <CardContent className="pt-4 pb-4 px-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Tillgångar (Assets)
          </h3>
          <div className="space-y-1">
            {data.assets.map((section) => (
              <ReportSectionBlock key={section.label} section={section} />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5">
            <span className="text-xs font-semibold uppercase tracking-[0.08em]">Summa tillgångar</span>
            <span className="text-sm font-bold tabular-nums">{SEK(data.total_assets)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Equity & Liabilities */}
      <Card>
        <CardContent className="pt-4 pb-4 px-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Eget kapital & skulder
          </h3>
          <div className="space-y-1">
            {data.equity_and_liabilities.map((section) => (
              <ReportSectionBlock key={section.label} section={section} />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5">
            <span className="text-xs font-semibold uppercase tracking-[0.08em]">Summa eget kapital & skulder</span>
            <span className="text-sm font-bold tabular-nums">{SEK(data.total_equity_and_liabilities)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Balance check */}
      <div className="md:col-span-2 flex items-center gap-2 rounded-lg border border-border/70 bg-card px-4 py-2.5">
        {data.is_balanced
          ? <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
          : <XCircle className="size-4 text-rose-500 shrink-0" />}
        <span className="text-xs text-muted-foreground">
          {data.is_balanced
            ? `Balansräkningen balanserar · Periodens resultat: ${SEK(data.period_result)} SEK`
            : `Balansräkningen balanserar INTE · Differens: ${SEK(data.total_assets - data.total_equity_and_liabilities)} SEK`}
        </span>
      </div>
    </div>
  );
}

// ─── Income statement ─────────────────────────────────────────────────────────

function IncomeStatementView({ data }: { data: IncomeStatementReport }) {
  const sections = [
    data.revenue,
    data.cost_of_goods,
    data.external_expenses,
    data.personnel_costs,
    data.financial_items,
  ];

  return (
    <Card>
      <CardContent className="pt-4 pb-4 px-4 max-w-2xl">
        <div className="space-y-1">
          {sections.map((section) => (
            <ReportSectionBlock key={section.label} section={section} dimNegative />
          ))}
        </div>

        <div className="mt-3 space-y-1 border-t border-border/70 pt-2.5">
          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em]">Rörelseresultat</span>
            <span className={cn("text-sm font-bold tabular-nums", data.operating_result < 0 ? "text-rose-600" : "text-emerald-600")}>
              {SEKSigned(data.operating_result)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-muted-foreground">Resultat efter finansiella poster</span>
            <span className={cn("text-sm tabular-nums font-medium", data.result_after_financial < 0 ? "text-rose-600" : "")}>
              {SEKSigned(data.result_after_financial)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border/70 py-1.5 mt-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em]">Årets resultat</span>
            <span className={cn("text-base font-bold tabular-nums", data.net_result < 0 ? "text-rose-600" : "text-emerald-600")}>
              {SEKSigned(data.net_result)} SEK
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Trial balance ────────────────────────────────────────────────────────────

function TrialBalanceView({ data }: { data: TrialBalanceReport }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border/70 bg-muted/30">
                <th className="px-3 py-2 text-left text-[11px] font-medium text-muted-foreground">Konto</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-muted-foreground min-w-[180px]">Namn</th>
                <th className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground">IB Debet</th>
                <th className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground">IB Kredit</th>
                <th className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground">Period Debet</th>
                <th className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground">Period Kredit</th>
                <th className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground">UB Debet</th>
                <th className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground">UB Kredit</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.account_number} className="border-b border-border/60 hover:bg-accent/10 transition-colors">
                  <td className="px-3 py-1.5 tabular-nums font-mono text-[11px]">{row.account_number}</td>
                  <td className="px-3 py-1.5 max-w-[200px] truncate text-muted-foreground">{row.account_name}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{row.opening_debit > 0 ? SEK(row.opening_debit) : "—"}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{row.opening_credit > 0 ? SEK(row.opening_credit) : "—"}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{row.period_debit > 0 ? SEK(row.period_debit) : "—"}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{row.period_credit > 0 ? SEK(row.period_credit) : "—"}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums font-medium">{row.closing_debit > 0 ? SEK(row.closing_debit) : "—"}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums font-medium">{row.closing_credit > 0 ? SEK(row.closing_credit) : "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border/70 bg-muted/30 font-semibold">
                <td className="px-3 py-2 text-xs uppercase tracking-[0.08em]" colSpan={2}>Summa</td>
                <td className="px-3 py-2 text-right tabular-nums text-xs">{SEK(data.total_opening_debit)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-xs">{SEK(data.total_opening_credit)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-xs">{SEK(data.total_period_debit)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-xs">{SEK(data.total_period_credit)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-xs">{SEK(data.total_closing_debit)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-xs">{SEK(data.total_closing_credit)}</td>
              </tr>
              {!data.is_balanced && (
                <tr>
                  <td colSpan={8} className="px-3 py-2 text-center text-xs text-rose-500">
                    ⚠ Saldobalansen balanserar inte
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ReportSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

type Tab = "balance-sheet" | "income-statement" | "trial-balance";

const TABS: { id: Tab; label: string; swedish: string }[] = [
  { id: "balance-sheet", label: "Balance Sheet", swedish: "Balansräkning" },
  { id: "income-statement", label: "Income Statement", swedish: "Resultaträkning" },
  { id: "trial-balance", label: "Trial Balance", swedish: "Saldobalans" },
];

export function FinancialPositionView() {
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id;

  const [activeTab, setActiveTab] = useState<Tab>("balance-sheet");
  const [asOfDate, setAsOfDate] = useState(defaultToday);
  const [periodStart, setPeriodStart] = useState(defaultPeriodStart);
  const [periodEnd, setPeriodEnd] = useState(defaultToday);

  const bsQuery = useQuery({
    queryKey: ["balance-sheet", companyId, asOfDate],
    queryFn: () => getBalanceSheet(asOfDate),
    enabled: !!companyId && activeTab === "balance-sheet",
    staleTime: 5 * 60 * 1000,
  });

  const isQuery = useQuery({
    queryKey: ["income-statement", companyId, periodStart, periodEnd],
    queryFn: () => getIncomeStatement(periodStart, periodEnd),
    enabled: !!companyId && activeTab === "income-statement",
    staleTime: 5 * 60 * 1000,
  });

  const tbQuery = useQuery({
    queryKey: ["trial-balance", companyId, periodStart, periodEnd],
    queryFn: () => getTrialBalance(periodStart, periodEnd),
    enabled: !!companyId && activeTab === "trial-balance",
    staleTime: 5 * 60 * 1000,
  });

  const activeQuery = activeTab === "balance-sheet" ? bsQuery
    : activeTab === "income-statement" ? isQuery
    : tbQuery;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background shadow-sm">
            <FileBarChart2 className="size-3.5 text-muted-foreground" />
          </div>
          <h1 className="text-base font-semibold tracking-tight">Financial Position</h1>
        </div>
      </div>

      {/* ── Tabs + date pickers ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border/70 bg-card p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/30",
              )}
            >
              {tab.label}
              <span className="ml-1 hidden text-[10px] opacity-60 sm:inline">· {tab.swedish}</span>
            </button>
          ))}
        </div>

        {/* Date controls */}
        <div className="flex flex-wrap items-center gap-3">
          {activeTab === "balance-sheet" ? (
            <DateInput label="As of" value={asOfDate} onChange={setAsOfDate} />
          ) : (
            <>
              <DateInput label="From" value={periodStart} onChange={setPeriodStart} />
              <DateInput label="To" value={periodEnd} onChange={setPeriodEnd} />
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs"
            onClick={() => activeQuery.refetch()}
            disabled={activeQuery.isFetching}
          >
            {activeQuery.isFetching ? "Loading…" : "Generate"}
          </Button>
        </div>
      </div>

      {/* ── Content ── */}
      {!companyId ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Select a company to generate reports.
        </div>
      ) : activeQuery.isLoading || activeQuery.isFetching ? (
        <ReportSkeleton />
      ) : activeQuery.isError ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <p className="text-sm text-rose-500">Failed to load report.</p>
          <Button size="sm" variant="outline" onClick={() => activeQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : activeTab === "balance-sheet" && bsQuery.data ? (
        <BalanceSheetView data={bsQuery.data} />
      ) : activeTab === "income-statement" && isQuery.data ? (
        <IncomeStatementView data={isQuery.data} />
      ) : activeTab === "trial-balance" && tbQuery.data ? (
        <TrialBalanceView data={tbQuery.data} />
      ) : (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Click "Generate" to load the report.
        </div>
      )}
    </div>
  );
}
