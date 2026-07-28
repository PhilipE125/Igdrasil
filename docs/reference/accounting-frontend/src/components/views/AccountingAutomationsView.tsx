import { Fragment, useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileUp,
  History,
  Inbox,
  Loader2,
  Mail,
  Play,
  ScanSearch,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileStore } from "@/contexts/FileStoreContext";
import {
  getGmailAuthorizationUrl,
  getGmailStatus,
  getPipelineRun,
  listFiscalPeriods,
  listPipelineRuns,
  rerunDocument,
  runAllUploaded,
  type PipelineRun,
} from "@/lib/uploadApi";
import { SidePanel } from "@/components/ui/side-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TableFilterBar } from "@/components/ui/table-filter-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { AccountingAutomationTabs } from "./AccountingAutomationTabs";
import { MassUploadView } from "./MassUploadView";
import { QueryLogPanel } from "@/components/QueryLogPanel";

// ── Brand ─────────────────────────────────────────────────────────────────────

const BRAND = {
  pink: "#ee8fe0",
  green: "#b0ee8f",
  yellow: "#eedd8f",
  gray1: "#bbbbbb",
  gray2: "#aaaaaa",
} as const;

// Polaris-style secondary medium button — bg-card, subtle border, soft pressable shadow
const polarisSecondaryButton =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-background px-3 text-[13px] font-medium text-foreground shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-colors hover:bg-accent/40 active:shadow-none disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border";

// ── Stage helpers ─────────────────────────────────────────────────────────────

const STAGE_NODES: Record<string, string[]> = {
  classify: ["extract_text", "check_duplicate", "classify_type", "structure_text", "flag_document"],
  match: ["lookup_supplier", "lookup_card_rules", "classify_accounts", "create_journal"],
};

const STAGE_STEP_LABELS: Record<string, string> = {
  extract_text: "Extract text from document",
  check_duplicate: "Check for duplicates",
  classify_type: "Classify document type",
  structure_text: "Structure invoice data",
  flag_document: "Flag document for review",
  lookup_supplier: "Look up supplier history",
  lookup_card_rules: "Check card rules",
  classify_accounts: "Classify accounts (BAS)",
  create_journal: "Create journal entry",
};

const ALL_STAGE_NODES = [...STAGE_NODES.classify, ...STAGE_NODES.match];

// ── Types ─────────────────────────────────────────────────────────────────────

type AutomationStatusTone = "sky" | "amber" | "emerald" | "rose" | "slate";

type VoucherLine = {
  account_number: number;
  account_name?: string | null;
  debit: number;
  credit: number;
  description?: string | null;
};

type AutomationRow = {
  id: string;
  documentId: string;
  processId?: string;
  name: string;
  fileFormat: string;
  supplier: string;
  uploadedAt: string;
  statusLabel: string;
  statusTone: AutomationStatusTone;
  reviewReady: boolean;
  bookkeepingStatus: string;
  documentStatus?: string;
  run: PipelineRun | null;
  // Audit fields
  voucherLines?: VoucherLine[];
  fxCurrency?: string;
  fxRate?: number;
  fxRateDate?: string;
  fxOriginalAmount?: number;
  fxConvertedSek?: number;
  amount?: number;
  currency?: string;
  invoiceNumber?: string;
  ledgerEntryId?: string;
};

// ── Util ──────────────────────────────────────────────────────────────────────

function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("sv-SE");
}

function inferFileFormat(name: string) {
  const ext = name.split(".").pop()?.toUpperCase();
  return ext || "FILE";
}

function resolveAutomationStatus(documentStatus?: string | null, bookkeepingStatus?: string) {
  const status = (documentStatus || "").toLowerCase();
  if (bookkeepingStatus === "processed") return { label: "Completed", tone: "emerald" as const };
  if (status === "approved" || status === "exported") return { label: "Completed", tone: "emerald" as const };
  if (status === "uploaded") return { label: "Uploading", tone: "sky" as const };
  if (status === "extracting" || status === "structuring") return { label: "Structuring", tone: "sky" as const };
  if (status === "classifying") return { label: "Classifying", tone: "amber" as const };
  if (status === "classified" || status === "ready_for_review" || status === "pending_review") return { label: "Ready for Review", tone: "amber" as const };
  if (status === "needs_match" || status === "matching" || status === "matched" || status === "pending_payment_match") return { label: "Matching With Bank", tone: "amber" as const };
  if (status === "failed") return { label: "Needs Attention", tone: "rose" as const };
  if (status === "duplicate") return { label: "Duplicate", tone: "rose" as const };
  return { label: "In Progress", tone: "slate" as const };
}

function toneClasses(tone: AutomationStatusTone) {
  switch (tone) {
    case "sky": return "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100";
    case "amber": return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100";
    case "emerald": return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
    case "rose": return "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100";
    default: return "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";
  }
}

function statusDotColor(status: string) {
  if (status === "completed") return BRAND.green;
  if (status === "failed") return BRAND.pink;
  if (status === "running") return BRAND.yellow;
  return BRAND.gray1;
}

// ── Document Audit Panel ──────────────────────────────────────────────────────

type AuditStep = {
  label: string;
  sublabel?: string;
  dot: string; // BRAND color
  icon: "check" | "flag" | "dot";
};

function AuditStepRow({ step }: { step: AuditStep }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <div className="mt-1 flex-shrink-0">
        {step.icon === "check" ? (
          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: step.dot }} />
        ) : step.icon === "flag" ? (
          <AlertTriangle className="h-3.5 w-3.5" style={{ color: step.dot }} />
        ) : (
          <div className="mt-0.5 h-2 w-2 rounded-full" style={{ background: step.dot }} />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm leading-snug">{step.label}</p>
        {step.sublabel && (
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{step.sublabel}</p>
        )}
      </div>
    </div>
  );
}

function DocumentAuditPanel({ row }: { row: AutomationRow }) {
  const nodeHistory: string[] = Array.isArray(row.run?.node_history) ? (row.run!.node_history as string[]) : [];
  const docStatus = (row.documentStatus || "").toLowerCase();

  const didLookupSupplier = nodeHistory.includes("lookup_supplier");
  const didLookupCardRules = nodeHistory.includes("lookup_card_rules");
  const didClassifyAccounts = nodeHistory.includes("classify_accounts");
  const didCreateJournal = nodeHistory.includes("create_journal");
  const didFlag = nodeHistory.includes("flag_document");

  const hasFx = !!row.fxCurrency && row.fxCurrency !== "SEK" && row.fxCurrency !== row.currency;
  const hasVoucherLines = (row.voucherLines?.length ?? 0) > 0;
  const hasLedgerEntry = !!row.ledgerEntryId;
  const pipelineRan = nodeHistory.length > 0 || hasLedgerEntry;

  // ── Classification steps ──────────────────────────────────────────────────
  const classificationSteps: AuditStep[] = [];

  if (pipelineRan) {
    // Check queries_log for supplier lookups that actually returned rows
    const queriesLog: Array<{ node?: string; rows?: number }> =
      row.run?.queries_log ?? [];
    const supplierFound = queriesLog.some(
      (q) => q.node === "lookup_supplier" && (q.rows ?? 0) > 0,
    );

    classificationSteps.push({
      label: supplierFound
        ? "Supplier found in database — prior entries used as context"
        : "No existing supplier record — classified without history",
      dot: supplierFound ? BRAND.green : BRAND.gray1,
      icon: supplierFound ? "check" : "dot",
    });

    if (didLookupCardRules) {
      classificationSteps.push({
        label: "Card rule matched — credit account pre-determined",
        dot: BRAND.green,
        icon: "check",
      });
    }

    if (didClassifyAccounts) {
      classificationSteps.push({
        label: "Expense account classified via BAS kontoplan (LLM)",
        dot: BRAND.green,
        icon: "check",
      });
    }

    if (didFlag) {
      classificationSteps.push({
        label: "Flagged for manual review",
        dot: BRAND.pink,
        icon: "flag",
      });
    }
  }

  // ── Bank match / journal steps ────────────────────────────────────────────
  const journalSteps: AuditStep[] = [];

  if (didCreateJournal || hasLedgerEntry) {
    journalSteps.push({
      label: "Journal entry created",
      sublabel: row.ledgerEntryId ?? undefined,
      dot: BRAND.green,
      icon: "check",
    });

    if (docStatus === "needs_match" || docStatus === "matching") {
      // Receipt with no card rule — awaiting a bank transaction to close the credit side
      journalSteps.push({
        label: "Payment side unresolved — awaiting bank transaction match",
        dot: BRAND.yellow,
        icon: "dot",
      });
    } else if (docStatus === "matched") {
      journalSteps.push({
        label: "Matched to bank transaction",
        dot: BRAND.green,
        icon: "check",
      });
    } else if (didLookupCardRules) {
      // Card rule was found, so credit side is already settled
      journalSteps.push({
        label: "Payment settled via card rule — no bank match required",
        dot: BRAND.green,
        icon: "check",
      });
    } else {
      // Invoice — sits as supplier payable (2440), bank match happens at payment time
      journalSteps.push({
        label: "Booked as supplier payable — bank match at payment",
        dot: BRAND.gray1,
        icon: "dot",
      });
    }
  }

  return (
    <div className="grid w-full gap-x-12 gap-y-6 py-1 md:grid-cols-2">
      {/* Classification */}
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Classification
        </p>
        {classificationSteps.length > 0 ? (
          <div className="divide-y divide-border/50">
            {classificationSteps.map((s, i) => <AuditStepRow key={i} step={s} />)}
          </div>
        ) : (
          <p className="py-1.5 text-sm text-muted-foreground">Pipeline not yet run</p>
        )}
      </div>

      {/* Journal / Bank Match */}
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Journal & Payment
        </p>
        {journalSteps.length > 0 ? (
          <div className="divide-y divide-border/50">
            {journalSteps.map((s, i) => <AuditStepRow key={i} step={s} />)}
          </div>
        ) : (
          <p className="py-1.5 text-sm text-muted-foreground">No journal entry yet</p>
        )}
      </div>

      {/* FX Conversion */}
      {hasFx && (
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Currency Conversion
          </p>
          <div className="space-y-1 rounded-lg border bg-background px-3 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Original amount</span>
              <span className="font-mono font-medium">
                {row.fxOriginalAmount?.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} {row.fxCurrency}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Exchange rate</span>
              <span className="font-mono font-medium">
                1 {row.fxCurrency} = {row.fxRate?.toFixed(4)} SEK
                {row.fxRateDate ? ` (${row.fxRateDate})` : ""}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-1.5 text-sm">
              <span className="text-muted-foreground">Converted (SEK)</span>
              <span className="font-mono font-semibold">
                {row.fxConvertedSek?.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} SEK
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Journal Entry / Debit-Credit */}
      {hasVoucherLines && (
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Debit / Credit
          </p>
          <div className="overflow-hidden rounded-lg border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-3 py-1.5 text-left text-xs font-medium text-muted-foreground">Account</th>
                  <th className="px-3 py-1.5 text-right text-xs font-medium text-muted-foreground">Debit</th>
                  <th className="px-3 py-1.5 text-right text-xs font-medium text-muted-foreground">Credit</th>
                </tr>
              </thead>
              <tbody>
                {row.voucherLines!.map((line, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-1.5">
                      <span className="font-mono text-xs font-medium">{line.account_number}</span>
                      {line.account_name && (
                        <span className="ml-2 text-xs text-muted-foreground">{line.account_name}</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs">
                      {line.debit > 0
                        ? line.debit.toLocaleString("sv-SE", { minimumFractionDigits: 2 })
                        : ""}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs">
                      {line.credit > 0
                        ? line.credit.toLocaleString("sv-SE", { minimumFractionDigits: 2 })
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Inbox Runs Panel (right-hand bar) ─────────────────────────────────────────

function InboxRunsPanel() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const { data: runs = [], isLoading } = useQuery({
    queryKey: ["pipeline-runs", "inbox-panel"],
    queryFn: () => listPipelineRuns(50),
    refetchInterval: 15_000,
  });

  const { data: selectedRun } = useQuery({
    queryKey: ["pipeline-run", selectedRunId],
    queryFn: () => getPipelineRun(selectedRunId!),
    enabled: !!selectedRunId,
    refetchInterval: selectedRunId ? 5_000 : false,
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {selectedRunId && selectedRun ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <button
            className="flex items-center gap-1.5 border-b px-4 py-2 text-xs text-muted-foreground hover:bg-accent"
            onClick={() => setSelectedRunId(null)}
          >
            <ChevronRight className="h-3 w-3 rotate-180" />
            Back to list
          </button>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* Run summary */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full" style={{ backgroundColor: statusDotColor(selectedRun.status) }} />
                <span className="font-semibold capitalize">{selectedRun.status}</span>
              </div>
              <p>
                <span className="text-muted-foreground">Started: </span>
                {formatDateTime(selectedRun.started_at)}
              </p>
              {selectedRun.completed_at && (
                <p>
                  <span className="text-muted-foreground">Completed: </span>
                  {formatDateTime(selectedRun.completed_at)}
                </p>
              )}
              {selectedRun.error_message && (
                <div
                  className="mt-1 rounded-md border p-2 text-xs"
                  style={{ borderColor: BRAND.pink, color: BRAND.pink, background: `${BRAND.pink}11` }}
                >
                  {selectedRun.error_message}
                </div>
              )}
            </div>

            {/* Step-by-step node history */}
            <div>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Steps
              </p>
              <div className="space-y-0.5">
                {ALL_STAGE_NODES.map((nodeId) => {
                  const history: string[] = Array.isArray(selectedRun.node_history)
                    ? (selectedRun.node_history as string[])
                    : [];
                  const visited = history.includes(nodeId);
                  const isCurrent =
                    selectedRun.status === "running" && history[history.length - 1] === nodeId;
                  const isFlagged = nodeId === "flag_document" && visited;
                  const queries = (
                    Array.isArray(selectedRun.queries_log) ? selectedRun.queries_log : []
                  ) as Array<{ node: string; duration_ms?: number }>;
                  const query = queries.find((q) => q.node === nodeId);
                  const durationMs = query?.duration_ms;
                  const dotColor = isFlagged
                    ? BRAND.pink
                    : visited
                    ? BRAND.green
                    : isCurrent
                    ? BRAND.yellow
                    : BRAND.gray1;

                  return (
                    <div
                      key={nodeId}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs",
                        visited || isCurrent ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      <div className="flex flex-1 items-center gap-2 min-w-0">
                        {isCurrent && !visited ? (
                          <Loader2
                            className="size-3 shrink-0 animate-spin"
                            style={{ color: BRAND.yellow }}
                          />
                        ) : (
                          <div
                            className="size-2 shrink-0 rounded-full"
                            style={{ background: dotColor }}
                          />
                        )}
                        <span className="truncate">{STAGE_STEP_LABELS[nodeId] ?? nodeId}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {durationMs != null && (
                          <span className="tabular-nums text-muted-foreground">{durationMs}ms</span>
                        )}
                        {visited && !isFlagged && (
                          <CheckCircle2 className="size-3" style={{ color: BRAND.green }} />
                        )}
                        {isFlagged && (
                          <AlertTriangle className="size-3" style={{ color: BRAND.pink }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Query log */}
            {Array.isArray(selectedRun.queries_log) && selectedRun.queries_log.length > 0 && (
              <QueryLogPanel
                queries={
                  selectedRun.queries_log as Parameters<typeof QueryLogPanel>[0]["queries"]
                }
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center gap-2 p-4 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading…
            </div>
          ) : runs.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">No pipeline runs yet.</p>
          ) : (
            runs.map((run) => (
              <button
                key={run.id}
                className="flex w-full flex-col gap-1 border-b px-4 py-3 text-left hover:bg-accent last:border-0"
                onClick={() => setSelectedRunId(run.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="size-2 rounded-full"
                      style={{ backgroundColor: statusDotColor(run.status) }}
                    />
                    <span className="text-[11px] font-medium capitalize text-foreground">
                      {run.status}
                    </span>
                  </div>
                  <span className="text-[10px] tabular-nums" style={{ color: BRAND.gray2 }}>
                    {(run.total_input_tokens + run.total_output_tokens).toLocaleString()} tok
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {formatDateTime(run.started_at)}
                </p>
                {run.error_message && (
                  <p className="line-clamp-1 text-[10px]" style={{ color: BRAND.pink }}>
                    {run.error_message}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function AccountingAutomationsView() {
  const navigate = useNavigate();
  const { files, refreshFiles, setFocusFileId } = useFileStore();
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<"all" | "ready" | "running">("all");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [running, setRunning] = useState(false);
  const [showMassUpload, setShowMassUpload] = useState(false);
  const [showRunsPanel, setShowRunsPanel] = useState(false);
  const [showFiscalYearDialog, setShowFiscalYearDialog] = useState(false);

  const { data: runs = [] } = useQuery({
    queryKey: ["pipeline-runs", "accounting-automations"],
    queryFn: () => listPipelineRuns(100),
    refetchInterval: 10_000,
  });

  const { data: gmailStatus } = useQuery({
    queryKey: ["gmail-status", "accounting-automations"],
    queryFn: () => getGmailStatus(),
  });

  const allRows = useMemo<AutomationRow[]>(() => {
    const runsByProcess = new Map(runs.map((run) => [run.process_id, run]));
    return [...files]
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .map((file) => {
        const run = file.processId ? runsByProcess.get(file.processId) ?? null : null;
        const status = resolveAutomationStatus(file.documentStatus, file.bookkeepingStatus);
        return {
          id: file.id,
          documentId: file.id,
          processId: file.processId,
          name: file.name,
          fileFormat: inferFileFormat(file.name),
          supplier: file.supplier,
          uploadedAt: file.uploadedAt.toISOString(),
          statusLabel: status.label,
          statusTone: status.tone,
          reviewReady: file.bookkeepingStatus === "pending" || status.label === "Ready for Review",
          bookkeepingStatus: file.bookkeepingStatus,
          documentStatus: file.documentStatus,
          run,
          // Audit fields
          voucherLines: file.voucherLines,
          fxCurrency: file.fxCurrency,
          fxRate: file.fxRate,
          fxRateDate: file.fxRateDate,
          fxOriginalAmount: file.fxOriginalAmount,
          fxConvertedSek: file.fxConvertedSek,
          amount: file.amount,
          currency: file.currency,
          invoiceNumber: file.invoiceNumber,
          ledgerEntryId: file.ledgerEntryId,
        };
      });
  }, [files, runs]);

  const rows = useMemo(() => allRows.filter((r) => r.bookkeepingStatus !== "processed"), [allRows]);

  const filteredRows = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !term ||
        [row.name, row.supplier, row.fileFormat, row.statusLabel].some((value) =>
          value.toLowerCase().includes(term),
        );
      const matchesView =
        viewFilter === "all" ||
        (viewFilter === "ready" && row.reviewReady) ||
        (viewFilter === "running" && !row.reviewReady);
      return matchesSearch && matchesView;
    });
  }, [deferredSearch, rows, viewFilter]);

  const isFilterActive = viewFilter !== "all" || deferredSearch.trim() !== "";

  async function handleRunFiltered() {
    // Pre-check: ensure at least one fiscal period exists before running the pipeline
    try {
      const periods = await listFiscalPeriods();
      if (!periods || periods.length === 0) {
        setShowFiscalYearDialog(true);
        return;
      }
    } catch {
      // If we can't fetch periods, let the pipeline proceed — backend will validate
    }

    setRunning(true);
    try {
      if (isFilterActive) {
        await Promise.all(filteredRows.map((row) => rerunDocument(row.documentId)));
        toast({ title: "Pipeline queued", description: `${filteredRows.length} documents sent to automations.` });
      } else {
        const result = await runAllUploaded();
        toast({ title: "Pipeline queued", description: `${result.queued} documents sent to automations.` });
      }
      await refreshFiles();
    } catch (error) {
      toast({ title: "Could not queue pipeline", description: String(error), variant: "destructive" });
    } finally {
      setRunning(false);
    }
  }

  async function handleRunDocument(documentId: string) {
    try {
      await rerunDocument(documentId);
      toast({ title: "Document queued", description: "Document sent to pipeline." });
      await refreshFiles();
    } catch (error) {
      toast({ title: "Could not queue document", description: String(error), variant: "destructive" });
    }
  }

  function handleMassUploadDone() {
    refreshFiles();
  }

  async function handleEmailIntegration() {
    try {
      if (gmailStatus?.connected) {
        toast({ title: "Email integration connected", description: "Gmail sync is already active for this company." });
        return;
      }
      const url = await getGmailAuthorizationUrl({ returnTo: "/accounting/automations" });
      window.location.href = url;
    } catch (error) {
      toast({ title: "Could not open Gmail integration", description: String(error), variant: "destructive" });
    }
  }

  function openReview(documentId: string) {
    setFocusFileId(documentId);
    navigate("/accounting/automations/review");
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background shadow-sm">
            <Inbox className="size-3.5 text-muted-foreground" />
          </div>
          <h1 className="text-base font-semibold tracking-tight">Inbox</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={polarisSecondaryButton} onClick={handleEmailIntegration}>
            <Mail className="h-3.5 w-3.5" />
            <span>{gmailStatus?.connected ? "Email Connected" : "Email Integration"}</span>
          </button>
          <button type="button" className={polarisSecondaryButton} onClick={() => setShowMassUpload(true)}>
            <FileUp className="h-3.5 w-3.5" />
            <span>Mass Upload</span>
          </button>
          <button type="button" className={polarisSecondaryButton} onClick={() => setShowRunsPanel((v) => !v)}>
            <History className="h-3.5 w-3.5" />
            <span>Runs log</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="mt-0 flex flex-1 flex-col gap-4">
          <Card className="flex flex-1 flex-col">
            <CardContent className="flex flex-1 overflow-hidden p-0">
              <div className="flex flex-1 flex-col overflow-auto">
                <TableFilterBar
                  search={search}
                  onSearchChange={setSearch}
                  placeholder="Search documents…"
                  leadingSlot={<AccountingAutomationTabs activeTab="documents" />}
                  trailingSlot={
                    <Button
                      size="sm"
                      style={{ backgroundColor: BRAND.green, color: "#1a1a1a", borderColor: BRAND.green }}
                      onClick={handleRunFiltered}
                      disabled={running}
                      className="shrink-0"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {running ? "Running..." : isFilterActive ? `Run Selected (${filteredRows.length})` : "Run"}
                    </Button>
                  }
                  activeFilters={
                    viewFilter !== "all"
                      ? [{ id: "status", label: "Status", value: viewFilter, onRemove: () => setViewFilter("all") }]
                      : []
                  }
                  filterDimensions={[
                    {
                      id: "status",
                      label: "Status",
                      options: [
                        { value: "ready", label: "Ready" },
                        { value: "running", label: "Running" },
                      ],
                      currentValue: viewFilter !== "all" ? viewFilter : undefined,
                      onSelect: (v) => setViewFilter(v as typeof viewFilter),
                    },
                  ]}
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>Document</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row) => {
                      const expanded = expandedRowId === row.id;
                      return (
                        <Fragment key={row.id}>
                          <TableRow
                            className="cursor-pointer"
                            onClick={() => setExpandedRowId(expanded ? null : row.id)}
                          >
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedRowId(expanded ? null : row.id);
                                }}
                              >
                                {expanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              <span className="block truncate font-medium">{row.name}</span>
                            </TableCell>
                            <TableCell>{row.fileFormat}</TableCell>
                            <TableCell>{row.supplier}</TableCell>
                            <TableCell>
                              <Badge className={`border ${toneClasses(row.statusTone)}`}>
                                {row.statusLabel}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {!row.reviewReady ? (
                                <Button
                                  size="icon"
                                  className="size-8"
                                  style={{ backgroundColor: BRAND.green, color: "#1a1a1a", borderColor: BRAND.green }}
                                  onClick={(e) => { e.stopPropagation(); handleRunDocument(row.documentId); }}
                                  title="Run pipeline"
                                  aria-label="Run pipeline"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="icon"
                                  className="size-8"
                                  style={{ backgroundColor: BRAND.pink, color: "#1a1a1a", borderColor: BRAND.pink }}
                                  onClick={(e) => { e.stopPropagation(); openReview(row.documentId); }}
                                  title="Review document"
                                  aria-label="Review document"
                                >
                                  <ScanSearch className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                          {expanded && (
                            <TableRow>
                              <TableCell colSpan={6} className="bg-muted/20 px-6 py-4">
                                <DocumentAuditPanel row={row} />
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })}
                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-12 text-center text-sm text-muted-foreground"
                        >
                          No documents matched the current filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SidePanel open={showRunsPanel} onOpenChange={setShowRunsPanel} title="Runs Log">
        <InboxRunsPanel />
      </SidePanel>

      <MassUploadView
        open={showMassUpload}
        onClose={() => setShowMassUpload(false)}
        onUploaded={handleMassUploadDone}
      />

      <AlertDialog open={showFiscalYearDialog} onOpenChange={setShowFiscalYearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Räkenskapsår saknas</AlertDialogTitle>
            <AlertDialogDescription>
              Inga räkenskapsperioder har skapats för detta företag. Ställ in räkenskapsåret
              under företagsprofilen i Inställningar innan du kör automationspipelinen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/settings/company")}>
              Gå till Inställningar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
