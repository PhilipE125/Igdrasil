import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Scale,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  getMomsdeklaration,
  getVatDeclaration,
  getNeBilaga,
  getInk2,
  getYearEndReadiness,
  listFiscalPeriods,
  downloadNeBilagaSru,
  downloadInk2Sru,
  downloadAuditTrail,
  downloadFullArchive,
  type Momsdeklaration,
  type VatDeclarationReport,
  type VatPeriodType,
  type NeBilagaReport,
  type Ink2Report,
  type YearEndReadinessReport,
  type FiscalPeriod,
} from "@/lib/uploadApi";
import { useCompany } from "@/contexts/CompanyContext";

// ─── Utilities ────────────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear();
const defaultToday = new Date().toISOString().split("T")[0];
const defaultPeriodStart = `${currentYear}-01-01`;

function SEK(v: number) {
  return v.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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

function FiscalPeriodSelect({
  periods,
  value,
  onChange,
}: {
  periods: FiscalPeriod[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground shrink-0">Fiscal period</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 rounded-md border border-border/70 bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Select period…</option>
        {periods.map((p) => (
          <option key={p.id} value={p.id}>
            {p.period_start} – {p.period_end}
            {p.is_closed ? " (closed)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="max-w-xl space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

// ─── Momsdeklaration (SKV 4700) ───────────────────────────────────────────────

const MOMS_SECTIONS: { title: string; rutor: number[] }[] = [
  { title: "Momspliktig försäljning", rutor: [5, 6, 7, 8] },
  { title: "Utgående moms", rutor: [10, 11, 12] },
  { title: "Inköp & Omvänd skattskyldighet", rutor: [20, 21, 22, 23, 24, 30, 31, 32] },
  { title: "EU-handel & Export", rutor: [35, 36, 37, 38, 39, 40, 41, 42] },
  { title: "Ingående moms", rutor: [48] },
];

function MomsdeklarationDisplay({
  data,
  periodStart,
  periodEnd,
}: {
  data: Momsdeklaration;
  periodStart: string;
  periodEnd: string;
}) {
  const rutaMap = new Map(data.rutor.map((r) => [r.ruta, r]));
  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">SKV 4700</p>
            <p className="mt-0.5 text-sm font-medium">Momsdeklaration</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Deklarationsperiod</p>
            <p className="text-xs tabular-nums">{periodStart} – {periodEnd}</p>
          </div>
        </div>
      </div>
      {MOMS_SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardContent className="p-0">
            <div className="px-4 py-2.5 border-b border-border/60">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{section.title}</p>
            </div>
            <div className="divide-y divide-border/40">
              {section.rutor.map((n) => {
                const ruta = rutaMap.get(n);
                if (!ruta) return null;
                const isNonZero = ruta.amount !== 0;
                return (
                  <div key={n} className={cn("flex items-center justify-between px-4 py-2.5", !isNonZero && "opacity-40")}>
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded border border-border/60 bg-muted/30 text-[11px] font-mono font-medium text-muted-foreground shrink-0">{n}</span>
                      <span className="text-xs text-foreground">{ruta.label}</span>
                    </div>
                    <span className={cn("text-sm tabular-nums font-medium", isNonZero ? "text-foreground" : "text-muted-foreground")}>
                      {isNonZero ? `${SEK(ruta.amount)} kr` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
      <div className={cn(
        "flex items-center justify-between rounded-lg border-2 px-4 py-4",
        data.moms_att_betala > 0 ? "border-rose-500/30 bg-rose-50 dark:bg-rose-950/20"
          : data.moms_att_betala < 0 ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20"
          : "border-border/70 bg-card",
      )}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Ruta 49</p>
          <p className="mt-0.5 text-sm font-medium">
            {data.moms_att_betala > 0 ? "Moms att betala" : data.moms_att_betala < 0 ? "Moms att återfå" : "Noll-deklaration"}
          </p>
        </div>
        <span className={cn(
          "text-2xl font-bold tabular-nums",
          data.moms_att_betala > 0 ? "text-rose-600 dark:text-rose-400"
            : data.moms_att_betala < 0 ? "text-emerald-600 dark:text-emerald-400"
            : "text-foreground",
        )}>
          {Math.abs(data.moms_att_betala).toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
        </span>
      </div>
    </div>
  );
}

// ─── VAT Declaration tab ──────────────────────────────────────────────────────

function VatDeclarationTab({ companyId }: { companyId: string }) {
  const [periodType, setPeriodType] = useState<VatPeriodType>("monthly");
  const [year, setYear] = useState(currentYear);
  const [period, setPeriod] = useState(new Date().getMonth() + 1);

  const maxPeriod = periodType === "monthly" ? 12 : periodType === "quarterly" ? 4 : 1;

  const query = useQuery({
    queryKey: ["vat-declaration", companyId, periodType, year, period],
    queryFn: () => getVatDeclaration(periodType, year, period),
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground shrink-0">Period type</label>
          <select
            value={periodType}
            onChange={(e) => { setPeriodType(e.target.value as VatPeriodType); setPeriod(1); }}
            className="h-7 rounded-md border border-border/70 bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground shrink-0">Year</label>
          <input
            type="number"
            value={year}
            min={2000}
            max={2100}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-7 w-20 rounded-md border border-border/70 bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        {periodType !== "yearly" && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground shrink-0">
              {periodType === "monthly" ? "Month" : "Quarter"}
            </label>
            <input
              type="number"
              value={period}
              min={1}
              max={maxPeriod}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="h-7 w-16 rounded-md border border-border/70 bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}
        <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => query.refetch()} disabled={query.isFetching}>
          {query.isFetching ? "Loading…" : "Generate"}
        </Button>
      </div>
      {query.isFetching ? <ReportSkeleton />
        : query.isError ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <p className="text-sm text-rose-500">Failed to load VAT declaration.</p>
            <Button size="sm" variant="outline" onClick={() => query.refetch()}>Retry</Button>
          </div>
        ) : query.data ? (
          <MomsdeklarationDisplay data={query.data} periodStart={query.data.period_start} periodEnd={query.data.period_end} />
        ) : (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Select a period and click "Generate".
          </div>
        )}
    </div>
  );
}

// ─── NE-bilaga tab ────────────────────────────────────────────────────────────

const NE_CODE_LABELS: Record<string, string> = {
  R1: "Försäljning och andra intäkter med moms",
  R2: "Momsfria intäkter",
  R3: "Bil- och bostadsförmån m.m.",
  R4: "Ränteintäkter",
  R5: "Varuinköp",
  R6: "Övriga externa kostnader",
  R7: "Anställdas löner",
  R8: "Räntekostnader",
  R9: "Avskrivningar på byggnader och markanläggningar",
  R10: "Avskrivningar på maskiner och inventarier",
  R11: "Årets resultat",
};

function NeBilagaTab({ companyId, periods }: { companyId: string; periods: FiscalPeriod[] }) {
  const [periodId, setPeriodId] = useState("");
  const [downloading, setDownloading] = useState(false);

  const query = useQuery({
    queryKey: ["ne-bilaga", companyId, periodId],
    queryFn: () => getNeBilaga(periodId),
    enabled: !!periodId,
    staleTime: 5 * 60 * 1000,
  });

  async function handleSruDownload() {
    if (!query.data) return;
    setDownloading(true);
    try {
      await downloadNeBilagaSru(periodId, query.data.fiscalYear.end.slice(0, 4));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {periods.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fiscal periods found.</p>
        ) : (
          <FiscalPeriodSelect periods={periods} value={periodId} onChange={setPeriodId} />
        )}
        {query.data && (
          <Button size="sm" variant="outline" className="h-7 px-3 text-xs gap-1.5" onClick={handleSruDownload} disabled={downloading}>
            <Download className="size-3" />
            {downloading ? "Downloading…" : "Export SRU"}
          </Button>
        )}
      </div>
      {!periodId ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Select a fiscal period to generate NE-bilaga.
        </div>
      ) : query.isLoading ? <ReportSkeleton />
      : query.isError ? (
        <div className="flex flex-col items-center gap-2 py-16">
          <p className="text-sm text-rose-500">Failed to load NE-bilaga.</p>
          <Button size="sm" variant="outline" onClick={() => query.refetch()}>Retry</Button>
        </div>
      ) : query.data ? (
        <div className="max-w-xl space-y-4">
          {query.data.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-4 py-2.5 space-y-1">
              {query.data.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
              ))}
            </div>
          )}
          <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">NE-bilaga · Enskild firma</p>
                <p className="mt-0.5 text-sm font-medium">{query.data.companyInfo.companyName}</p>
                <p className="text-xs text-muted-foreground">{query.data.companyInfo.orgNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Räkenskapsår</p>
                <p className="text-xs tabular-nums">{query.data.fiscalYear.start} – {query.data.fiscalYear.end}</p>
              </div>
            </div>
          </div>
          <Card>
            <CardContent className="p-0 divide-y divide-border/40">
              {(["R1","R2","R3","R4","R5","R6","R7","R8","R9","R10","R11"] as const).map((ruta) => {
                const amount = query.data.rutor[ruta] ?? 0;
                return (
                  <div key={ruta} className={cn("flex items-center justify-between px-4 py-2.5", amount === 0 && "opacity-40")}>
                    <div className="flex items-center gap-3">
                      <span className="flex min-w-[3rem] items-center justify-center rounded border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[11px] font-mono font-medium text-muted-foreground">{ruta}</span>
                      <span className="text-xs text-foreground">{NE_CODE_LABELS[ruta] ?? ruta}</span>
                    </div>
                    <span className={cn("text-sm tabular-nums font-medium", amount !== 0 ? "text-foreground" : "text-muted-foreground")}>
                      {amount !== 0 ? `${SEK(amount)} kr` : "—"}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <div className={cn(
            "flex items-center justify-between rounded-lg border-2 px-4 py-4",
            query.data.summary.netResult > 0 ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20"
              : query.data.summary.netResult < 0 ? "border-rose-500/30 bg-rose-50 dark:bg-rose-950/20"
              : "border-border/70 bg-card",
          )}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">R11</p>
              <p className="mt-0.5 text-sm font-medium">Årets resultat</p>
            </div>
            <span className={cn(
              "text-2xl font-bold tabular-nums",
              query.data.summary.netResult > 0 ? "text-emerald-600 dark:text-emerald-400"
                : query.data.summary.netResult < 0 ? "text-rose-600 dark:text-rose-400"
                : "text-foreground",
            )}>
              {SEK(query.data.summary.netResult)} kr
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─── INK2 tab ─────────────────────────────────────────────────────────────────

const INK2_CODE_LABELS: Record<string, string> = {
  // Balance sheet — assets
  "7201": "Immateriella anläggningstillgångar",
  "7202": "Materiella anläggningstillgångar",
  "7203": "Finansiella anläggningstillgångar",
  "7210": "Varulager",
  "7211": "Kortfristiga fordringar",
  "7212": "Kassa och bank",
  // Balance sheet — equity & liabilities
  "7220": "Aktiekapital",
  "7221": "Annat eget kapital",
  "7222": "Årets resultat",
  "7230": "Långfristiga skulder",
  "7231": "Kortfristiga skulder",
  // Income statement
  "7310": "Nettoomsättning",
  "7320": "Varuinköp / kostnad sålda varor",
  "7330": "Övriga externa kostnader",
  "7340": "Personalkostnader",
  "7350": "Avskrivningar",
  "7360": "Övriga rörelsekostnader",
  "7370": "Finansiella poster",
  "7380": "Extraordinära poster / skatter",
};

function Ink2Tab({ companyId, periods }: { companyId: string; periods: FiscalPeriod[] }) {
  const [periodId, setPeriodId] = useState("");
  const [downloading, setDownloading] = useState(false);

  const query = useQuery({
    queryKey: ["ink2", companyId, periodId],
    queryFn: () => getInk2(periodId),
    enabled: !!periodId,
    staleTime: 5 * 60 * 1000,
  });

  async function handleSruDownload() {
    if (!query.data) return;
    setDownloading(true);
    try {
      await downloadInk2Sru(periodId, query.data.fiscalYear.end.slice(0, 4));
    } finally {
      setDownloading(false);
    }
  }

  const INK2_SRU_ORDER = [
    "7201","7202","7203","7210","7211","7212",
    "7220","7221","7222","7230","7231",
    "7310","7320","7330","7340","7350","7360","7370","7380",
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {periods.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fiscal periods found.</p>
        ) : (
          <FiscalPeriodSelect periods={periods} value={periodId} onChange={setPeriodId} />
        )}
        {query.data && (
          <Button size="sm" variant="outline" className="h-7 px-3 text-xs gap-1.5" onClick={handleSruDownload} disabled={downloading}>
            <Download className="size-3" />
            {downloading ? "Downloading…" : "Export SRU"}
          </Button>
        )}
      </div>
      {!periodId ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Select a fiscal period to generate INK2.
        </div>
      ) : query.isLoading ? <ReportSkeleton />
      : query.isError ? (
        <div className="flex flex-col items-center gap-2 py-16">
          <p className="text-sm text-rose-500">Failed to load INK2.</p>
          <Button size="sm" variant="outline" onClick={() => query.refetch()}>Retry</Button>
        </div>
      ) : query.data ? (
        <div className="max-w-xl space-y-4">
          {query.data.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-4 py-2.5 space-y-1">
              {query.data.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
              ))}
            </div>
          )}
          <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">INK2 · Aktiebolag</p>
                <p className="mt-0.5 text-sm font-medium">{query.data.companyInfo.companyName}</p>
                <p className="text-xs text-muted-foreground">{query.data.companyInfo.orgNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Räkenskapsår</p>
                <p className="text-xs tabular-nums">{query.data.fiscalYear.start} – {query.data.fiscalYear.end}</p>
              </div>
            </div>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground px-1">Balansräkning</p>
          <Card>
            <CardContent className="p-0 divide-y divide-border/40">
              {["7201","7202","7203","7210","7211","7212","7220","7221","7222","7230","7231"].map((code) => {
                const amount = query.data.rutor[code] ?? 0;
                return (
                  <div key={code} className={cn("flex items-center justify-between px-4 py-2.5", amount === 0 && "opacity-40")}>
                    <div className="flex items-center gap-3">
                      <span className="flex min-w-[3rem] items-center justify-center rounded border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[11px] font-mono font-medium text-muted-foreground">{code}</span>
                      <span className="text-xs text-foreground">{INK2_CODE_LABELS[code] ?? `Uppgift ${code}`}</span>
                    </div>
                    <span className={cn("text-sm tabular-nums font-medium", amount !== 0 ? "text-foreground" : "text-muted-foreground")}>
                      {amount !== 0 ? `${SEK(amount)} kr` : "—"}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground px-1">Resultaträkning</p>
          <Card>
            <CardContent className="p-0 divide-y divide-border/40">
              {["7310","7320","7330","7340","7350","7360","7370","7380"].map((code) => {
                const amount = query.data.rutor[code] ?? 0;
                return (
                  <div key={code} className={cn("flex items-center justify-between px-4 py-2.5", amount === 0 && "opacity-40")}>
                    <div className="flex items-center gap-3">
                      <span className="flex min-w-[3rem] items-center justify-center rounded border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[11px] font-mono font-medium text-muted-foreground">{code}</span>
                      <span className="text-xs text-foreground">{INK2_CODE_LABELS[code] ?? `Uppgift ${code}`}</span>
                    </div>
                    <span className={cn("text-sm tabular-nums font-medium", amount !== 0 ? "text-foreground" : "text-muted-foreground")}>
                      {amount !== 0 ? `${SEK(amount)} kr` : "—"}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Totala tillgångar", value: query.data.summary.totalAssets },
              { label: "Eget kapital och skulder", value: query.data.summary.totalEquityAndLiabilities },
              { label: "Årets resultat", value: query.data.summary.resultAfterFinancial },
              { label: "Beräknad bolagsskatt (20,6 %)", value: query.data.summary.beraknadBolagsskatt },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-border/70 bg-card px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">{SEK(value)} kr</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─── Audit trail export tab ───────────────────────────────────────────────────

function AuditTrailTab() {
  const [fromDate, setFromDate] = useState(defaultPeriodStart);
  const [toDate, setToDate] = useState(defaultToday);
  const [downloading, setDownloading] = useState<"json" | "csv" | null>(null);

  async function handleDownload(format: "json" | "csv") {
    setDownloading(format);
    try {
      await downloadAuditTrail(format, { fromDate, toDate });
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <DateInput label="From" value={fromDate} onChange={setFromDate} />
        <DateInput label="To" value={toDate} onChange={setToDate} />
        <Button size="sm" variant="outline" className="h-7 px-3 text-xs gap-1.5" onClick={() => handleDownload("json")} disabled={!!downloading}>
          <Download className="size-3" />
          {downloading === "json" ? "Downloading…" : "Export JSON"}
        </Button>
        <Button size="sm" variant="outline" className="h-7 px-3 text-xs gap-1.5" onClick={() => handleDownload("csv")} disabled={!!downloading}>
          <Download className="size-3" />
          {downloading === "csv" ? "Downloading…" : "Export CSV"}
        </Button>
      </div>
      <div className="max-w-xl rounded-lg border border-border/70 bg-muted/30 px-4 py-6 text-center">
        <ClipboardList className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-2 text-sm font-medium">Audit Trail Export</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Exports all audit log events with cryptographic hash chain for the selected date range.
          Use as compliance documentation or supporting evidence for auditors.
        </p>
      </div>
    </div>
  );
}

// ─── Full archive tab ─────────────────────────────────────────────────────────

function FullArchiveTab({ periods }: { periods: FiscalPeriod[] }) {
  const [periodId, setPeriodId] = useState("");
  const [includeDocs, setIncludeDocs] = useState(true);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!periodId) return;
    setDownloading(true);
    try {
      await downloadFullArchive(periodId, includeDocs);
    } finally {
      setDownloading(false);
    }
  }

  const selectedPeriod = periods.find((p) => p.id === periodId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {periods.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fiscal periods found.</p>
        ) : (
          <FiscalPeriodSelect periods={periods} value={periodId} onChange={setPeriodId} />
        )}
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={includeDocs}
            onChange={(e) => setIncludeDocs(e.target.checked)}
            className="rounded border-border/70"
          />
          Include documents
        </label>
        <Button size="sm" className="h-7 px-3 text-xs gap-1.5" onClick={handleDownload} disabled={!periodId || downloading}>
          <Archive className="size-3" />
          {downloading ? "Building archive…" : "Download ZIP"}
        </Button>
      </div>
      <div className="max-w-xl space-y-3">
        <div className="rounded-lg border border-border/70 bg-muted/30 px-4 py-5">
          <div className="flex items-start gap-3">
            <Archive className="size-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Fiscal period archive</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Generates a complete archive ZIP fulfilling BFL 7 kap. archival requirements.
              </p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {[
                  "SIE4 export (sie4.se)",
                  "Balance sheet (balance_sheet.json)",
                  "Income statement (income_statement.json)",
                  "Trial balance (trial_balance.json)",
                  "VAT declaration (momsdeklaration.json)",
                  "Audit trail (audit_trail.json + .csv)",
                  ...(includeDocs ? ["Document index (documents/index.json)"] : []),
                ].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <FileText className="size-3 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {selectedPeriod && (
          <div className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
            selectedPeriod.is_closed
              ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
              : "border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300",
          )}>
            {selectedPeriod.is_closed
              ? <CheckCircle2 className="size-3.5 shrink-0" />
              : <AlertTriangle className="size-3.5 shrink-0" />}
            {selectedPeriod.is_closed
              ? "Period is closed — archive is final."
              : "Period is still open — archive will reflect current state."}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bokslut readiness tab ────────────────────────────────────────────────────

const CHECK_LABELS: Record<string, string> = {
  is_closed: "Perioden är stängd",
  is_locked: "Perioden är låst",
  trial_balance_balanced: "Saldobalansen balanserar",
  draft_entry_count: "Inga ofärdiga bokföringsposter",
  supplier_reconciliation_ok: "Leverantörsreskontra stämmer",
  revaluation_done: "Valutaomvärdering klar",
  opening_balances_set: "Ingående saldon angivna",
};

function CheckItem({ label, value }: { label: string; value: unknown }) {
  const isOk = typeof value === "boolean" ? value : value === 0 || value === true;
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn("text-xs tabular-nums", isOk ? "text-muted-foreground" : "text-rose-500")}>
          {typeof value === "number" ? `${value} st` : ""}
        </span>
        {isOk
          ? <CheckCircle2 className="size-4 text-emerald-500" />
          : <XCircle className="size-4 text-rose-500" />}
      </div>
    </div>
  );
}

function BokslutTab({ companyId, periods }: { companyId: string; periods: FiscalPeriod[] }) {
  const [periodId, setPeriodId] = useState("");

  const query = useQuery({
    queryKey: ["year-end-readiness", companyId, periodId],
    queryFn: () => getYearEndReadiness(periodId),
    enabled: !!periodId,
    staleTime: 5 * 60 * 1000,
  });

  const selectedPeriod = periods.find((p) => p.id === (query.data?.period_id ?? periodId));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {periods.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fiscal periods found.</p>
        ) : (
          <>
            <FiscalPeriodSelect periods={periods} value={periodId} onChange={setPeriodId} />
            <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => query.refetch()} disabled={!periodId || query.isFetching}>
              {query.isFetching ? "Loading…" : "Check readiness"}
            </Button>
          </>
        )}
      </div>
      {query.isFetching ? <ReportSkeleton />
        : query.isError ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <p className="text-sm text-rose-500">Failed to load readiness report.</p>
            <Button size="sm" variant="outline" onClick={() => query.refetch()}>Retry</Button>
          </div>
        ) : query.data ? (
          <div className="max-w-xl space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Räkenskapsår</p>
                <p className="mt-0.5 text-sm font-medium tabular-nums">{query.data.period_start} – {query.data.period_end}</p>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                query.data.ready
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
              )}>
                {query.data.ready ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
                {query.data.ready ? "Redo för bokslut" : "Ej klar"}
              </div>
            </div>
            <Card>
              <CardContent className="p-0 px-4 divide-y divide-border/40">
                {Object.entries(query.data.checks).map(([key, value]) => (
                  <CheckItem key={key} label={CHECK_LABELS[key] ?? key.replace(/_/g, " ")} value={value} />
                ))}
              </CardContent>
            </Card>
            {selectedPeriod?.is_closed && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                ✓ Denna period är stängd och låst.
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Select a fiscal period and click "Check readiness".
          </div>
        )}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

type Tab = "vat" | "ne-bilaga" | "ink2" | "audit-trail" | "full-archive" | "bokslut";

const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: "vat", label: "Momsdeklaration", sub: "SKV 4700" },
  { id: "ne-bilaga", label: "NE-bilaga", sub: "Enskild firma" },
  { id: "ink2", label: "INK2", sub: "Aktiebolag" },
  { id: "audit-trail", label: "Audit Trail", sub: "Export" },
  { id: "full-archive", label: "Full Archive", sub: "BFL 7 kap." },
  { id: "bokslut", label: "Bokslut", sub: "Year-end" },
];

const PERIOD_TABS = new Set<Tab>(["ne-bilaga", "ink2", "full-archive", "bokslut"]);

export function RegulatoryView() {
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id;
  const [activeTab, setActiveTab] = useState<Tab>("vat");

  const needsPeriods = PERIOD_TABS.has(activeTab);

  const fiscalPeriodsQuery = useQuery({
    queryKey: ["fiscal-periods", companyId],
    queryFn: listFiscalPeriods,
    enabled: !!companyId && needsPeriods,
  });
  const periods = fiscalPeriodsQuery.data ?? [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* ── Page header ── */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background shadow-sm">
          <Scale className="size-3.5 text-muted-foreground" />
        </div>
        <h1 className="text-base font-semibold tracking-tight">Regulatory</h1>
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap items-center gap-0.5 rounded-lg border border-border/70 bg-card p-1 shadow-sm self-start">
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
            <span className="ml-1 hidden text-[10px] opacity-60 sm:inline">· {tab.sub}</span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {!companyId ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Select a company to generate reports.
        </div>
      ) : activeTab === "vat" ? (
        <VatDeclarationTab companyId={companyId} />
      ) : activeTab === "ne-bilaga" ? (
        fiscalPeriodsQuery.isLoading ? <ReportSkeleton /> : <NeBilagaTab companyId={companyId} periods={periods} />
      ) : activeTab === "ink2" ? (
        fiscalPeriodsQuery.isLoading ? <ReportSkeleton /> : <Ink2Tab companyId={companyId} periods={periods} />
      ) : activeTab === "audit-trail" ? (
        <AuditTrailTab />
      ) : activeTab === "full-archive" ? (
        fiscalPeriodsQuery.isLoading ? <ReportSkeleton /> : <FullArchiveTab periods={periods} />
      ) : (
        fiscalPeriodsQuery.isLoading ? <ReportSkeleton /> : <BokslutTab companyId={companyId} periods={periods} />
      )}
    </div>
  );
}
