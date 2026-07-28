import { startTransition, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ChevronDown, Trash2, Upload, Landmark, Plus, X, AlertTriangle, Link2, Image as ImageIcon } from "lucide-react";
import { useFileStore } from "@/contexts/FileStoreContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TableFilterBar } from "@/components/ui/table-filter-bar";
import { InlineTableAssistant } from "@/components/ui/inline-table-assistant";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  listBankAccounts,
  createBankAccount,
  deleteBankAccount,
  listImports,
  importCsv,
  deleteImport,
  listTransactions,
  createManualMatch,
  rejectBankMatch,
  type BankAccount,
  type BankImport,
  type BankTransaction,
} from "@/lib/bankApi";
import { runBankImportTableAssistant } from "@/lib/tableAssistant";

// ── Number formatting (Swedish locale: thousands as nbsp, comma decimals) ────

function formatAmount(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Confirm delete dialog ─────────────────────────────────────────────────────

function ConfirmDeleteDialog({
  bank,
  onConfirm,
  onCancel,
}: {
  bank: BankAccount;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const meta = bankMeta(bank.bank_name);
  return (
    <Dialog open onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Remove {meta.label}?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground text-pretty">
          This will permanently delete the bank account and all its imported transactions and imports. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Bank definitions ──────────────────────────────────────────────────────────

const BANK_FORMATS = [
  { value: "seb",           label: "SEB",             logo: "/assets/logos/integrations/seb.png",           color: "bg-green-100 text-green-800 border-green-200" },
  { value: "swedbank",      label: "Swedbank",        logo: "/assets/logos/integrations/swedbank.webp",     color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "nordea",        label: "Nordea",          logo: "/assets/logos/integrations/nordea.png",        color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "handelsbanken", label: "Handelsbanken",   logo: "/assets/logos/integrations/handelsbanken.png", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "lunar",         label: "Lunar",           logo: "/assets/logos/integrations/lunar.svg",         color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "juni",          label: "Juni",            logo: "/assets/logos/integrations/juni.svg",          color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "skatteverket",  label: "Skatteverket",    logo: "/assets/logos/integrations/skatteverket.svg",  color: "bg-slate-100 text-slate-700 border-slate-200" },
] as const;

type BankFormat = typeof BANK_FORMATS[number];

function bankMeta(bankName: string): BankFormat {
  return BANK_FORMATS.find((b) => b.value === bankName) ?? {
    value: bankName,
    label: bankName,
    logo: "",
    color: "bg-muted text-muted-foreground border-muted",
  };
}

// ── Bank card (onboarding / add bank picker) ──────────────────────────────────

function BankCard({ bank, onClick }: { bank: BankFormat; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-16 w-full items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-background px-3 py-2 transition-colors duration-150 hover:border-border hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
      aria-label={bank.label}
      title={bank.label}
    >
      {bank.logo ? (
        <img
          src={bank.logo}
          alt={bank.label}
          loading="lazy"
          className="max-h-8 max-w-full object-contain"
        />
      ) : (
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ImageIcon className="size-4 text-muted-foreground/60" />
          <span className="truncate">{bank.label}</span>
        </div>
      )}
    </button>
  );
}

// ── File picker dialog ────────────────────────────────────────────────────────

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading" }
  | { phase: "done"; row_count: number; new_count: number; duplicate_count: number };

function FilePickerDialog({
  account,
  onClose,
  onImported,
}: {
  account: BankAccount | null;
  onClose: () => void;
  onImported: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ phase: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!account) return null;
  const meta = bankMeta(account.bank_name);

  async function handleFile(file: File) {
    setUploadState({ phase: "uploading" });
    try {
      const res = await importCsv(file, account!.id, account!.bank_name);
      setUploadState({
        phase: "done",
        row_count: res.row_count,
        new_count: res.new_count,
        duplicate_count: res.duplicate_count,
      });
      onImported();
    } catch (e: unknown) {
      setUploadState({ phase: "idle" });
      toast({ title: "Import failed", description: String(e), variant: "destructive" });
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleClose() {
    setUploadState({ phase: "idle" });
    onClose();
  }

  return (
    <Dialog open onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={`rounded-md px-2 py-0.5 text-xs font-semibold border ${meta.color}`}>
              {meta.label}
            </span>
            <span>Upload CSV</span>
          </DialogTitle>
        </DialogHeader>

        {uploadState.phase === "done" ? (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rows parsed</span>
                <span className="font-medium tabular-nums">{uploadState.row_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">New transactions</span>
                <span className="font-medium tabular-nums text-[#2a7a0f]">+{uploadState.new_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duplicates skipped</span>
                <span className="font-medium tabular-nums text-muted-foreground">{uploadState.duplicate_count}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setUploadState({ phase: "idle" })}>
                Upload another
              </Button>
              <Button size="sm" onClick={handleClose}>Done</Button>
            </div>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors cursor-pointer ${
              dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
            } ${uploadState.phase === "uploading" ? "pointer-events-none opacity-60" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mb-3 size-8 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              {uploadState.phase === "uploading" ? "Importing…" : "Drop CSV here or click to browse"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Add bank dialog ───────────────────────────────────────────────────────────

function AddBankDialog({
  existingBankNames,
  onSelect,
  onClose,
}: {
  existingBankNames: string[];
  onSelect: (bank: BankFormat) => void;
  onClose: () => void;
}) {
  const available = BANK_FORMATS.filter((b) => !existingBankNames.includes(b.value));

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a bank</DialogTitle>
        </DialogHeader>
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">All supported banks are already connected.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 py-2">
            {available.map((b) => (
              <BankCard key={b.value} bank={b} onClick={() => onSelect(b)} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Reconciliation status badge ───────────────────────────────────────────────

function ReconciliationBadge({
  tx,
  onNavigate,
  onUnmatch,
}: {
  tx: BankTransaction;
  onNavigate?: (docId: string) => void;
  onUnmatch?: (matchId: string) => void;
}) {
  if (tx.reconciliation_status === "matched") {
    return (
      <button
        onClick={() => tx.matched_document_id && onNavigate?.(tx.matched_document_id)}
        className={`rounded-full px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 ${tx.matched_document_id ? "hover:bg-green-200 cursor-pointer" : "cursor-default"}`}
      >
        Matched
      </button>
    );
  }
  if (tx.reconciliation_status === "partially_matched") {
    const canUnmatch = !!tx.match_id && !!onUnmatch;
    return (
      <span className="inline-flex h-5 items-center overflow-hidden rounded-full bg-yellow-100 text-xs font-semibold text-yellow-800">
        <button
          onClick={() => tx.matched_document_id && onNavigate?.(tx.matched_document_id)}
          className={`flex h-full items-center px-2 ${tx.matched_document_id ? "hover:bg-yellow-200 cursor-pointer" : "cursor-default"}`}
        >
          Proposed
        </button>
        {canUnmatch && (
          <button
            type="button"
            aria-label="Unmatch (set to unmatched)"
            title="Unmatch"
            onClick={(e) => {
              e.stopPropagation();
              onUnmatch!(tx.match_id!);
            }}
            className="flex h-full items-center border-l border-yellow-200 px-1.5 text-yellow-800 hover:bg-yellow-200"
          >
            <X className="size-2.5" />
          </button>
        )}
      </span>
    );
  }
  return (
    <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">
      Unmatched
    </span>
  );
}

// ── Import row (collapsible) ──────────────────────────────────────────────────

function ImportRow({
  imp,
  onDeleted,
  onNavigateToDoc,
  onUnmatch,
  selectionMode,
  selectedTxIds,
  onToggleSelect,
}: {
  imp: BankImport;
  onDeleted: () => void;
  onNavigateToDoc?: (docId: string) => void;
  onUnmatch?: (matchId: string) => void;
  selectionMode?: boolean;
  selectedTxIds?: Set<string>;
  onToggleSelect?: (txId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data: txnData, isLoading } = useQuery({
    queryKey: ["bank-transactions", imp.id, page],
    queryFn: () => listTransactions(imp.id, page, pageSize),
    enabled: open,
  });

  async function handleDelete() {
    try {
      await deleteImport(imp.id);
      onDeleted();
      toast({ title: "Import deleted" });
    } catch (e: unknown) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    }
  }

  const meta = bankMeta(imp.account.bank_name);
  const dateRange =
    imp.date_from && imp.date_to
      ? `${imp.date_from} → ${imp.date_to}`
      : (imp.date_from ?? imp.date_to ?? "");

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 hover:bg-accent/50 cursor-pointer select-none">
          {open ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
          <Landmark className="size-4 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-sm">
              {meta.label} — {imp.account.account_label}
            </span>
            {dateRange && (
              <span className="ml-2 text-xs text-muted-foreground tabular-nums">{dateRange}</span>
            )}
            <span className="ml-2 text-xs text-muted-foreground tabular-nums">
              · {imp.row_count} transactions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs tabular-nums">
              +{imp.new_count} new · {imp.duplicate_count} skipped
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-destructive hover:text-destructive"
              aria-label="Delete import"
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-t-0 rounded-b-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading transactions…</div>
          ) : txnData && txnData.items.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectionMode && <TableHead className="w-10" />}
                    <TableHead className="w-28">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right w-32">Amount</TableHead>
                    <TableHead className="text-right w-32">Balance</TableHead>
                    <TableHead className="text-right w-28">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txnData.items.map((t: BankTransaction) => {
                    const amount = parseFloat(t.amount);
                    const isPositive = amount >= 0;
                    const isSelected = selectedTxIds?.has(t.id) ?? false;
                    return (
                      <TableRow
                        key={t.id}
                        className={selectionMode ? "cursor-pointer hover:bg-accent/50" : ""}
                        onClick={selectionMode ? () => onToggleSelect?.(t.id) : undefined}
                      >
                        {selectionMode && (
                          <TableCell className="w-10">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onToggleSelect?.(t.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border-border"
                            />
                          </TableCell>
                        )}
                        <TableCell className="text-sm tabular-nums">{t.transaction_date}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{t.description}</TableCell>
                        <TableCell
                          className={`text-right text-sm tabular-nums font-medium ${
                            isPositive ? "text-[#2a7a0f]" : "text-destructive"
                          }`}
                        >
                          {amount > 0 ? "+" : ""}
                          {formatAmount(t.amount)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                          {formatAmount(t.balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ReconciliationBadge tx={t} onNavigate={onNavigateToDoc} onUnmatch={onUnmatch} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {txnData.total > page * pageSize && (
                <div className="flex justify-center p-3 border-t">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
                    Load more ({txnData.total - page * pageSize} remaining)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">No transactions in this import.</div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function BankTransactionsView() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setFocusFileId } = useFileStore();

  const matchForDocId = searchParams.get("matchFor");
  const matchForDocName = searchParams.get("docName") ?? "document";

  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [uploadTarget, setUploadTarget] = useState<BankAccount | null>(null);
  const [addBankOpen, setAddBankOpen] = useState(false);
  const [creatingBank, setCreatingBank] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null);
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [matchingLoading, setMatchingLoading] = useState(false);

  function handleNavigateToDoc(docId: string) {
    setFocusFileId(docId);
    navigate("/accounting/automations/review");
  }

  function handleToggleSelect(txId: string) {
    setSelectedTxIds((prev) => {
      const next = new Set(prev);
      if (next.has(txId)) next.delete(txId);
      else next.add(txId);
      return next;
    });
  }

  async function handleConfirmManualMatch() {
    if (!matchForDocId || selectedTxIds.size === 0) return;
    setMatchingLoading(true);
    try {
      await createManualMatch(matchForDocId, [...selectedTxIds]);
      toast({ title: "Matched successfully", description: `${selectedTxIds.size} transaction(s) linked.` });
      navigate("/accounting/automations/review");
    } catch (e: unknown) {
      toast({ title: "Match failed", description: String(e), variant: "destructive" });
    } finally {
      setMatchingLoading(false);
    }
  }

  async function handleUnmatch(matchId: string) {
    try {
      await rejectBankMatch(matchId);
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      toast({ title: "Match removed", description: "Transaction marked as unmatched." });
    } catch (e: unknown) {
      toast({ title: "Failed to unmatch", description: String(e), variant: "destructive" });
    }
  }

  const { data: accounts = [] } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: listBankAccounts,
  });

  const { data: importsData } = useQuery({
    queryKey: ["bank-imports", accountFilter],
    queryFn: () => listImports(accountFilter === "all" ? undefined : accountFilter),
  });

  const imports = useMemo(() => importsData?.items ?? [], [importsData]);
  const filteredImports = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return imports;
    return imports.filter((imp) => {
      const meta = bankMeta(imp.account.bank_name);
      return [
        meta.label,
        imp.account.account_label,
        imp.date_from ?? "",
        imp.date_to ?? "",
      ].some((value) => value.toLowerCase().includes(term));
    });
  }, [imports, search]);
  const assistantResult = useMemo(
    () => runBankImportTableAssistant(filteredImports, assistantPrompt),
    [assistantPrompt, filteredImports],
  );
  const visibleImports = assistantResult?.rows ?? filteredImports;
  const existingBankNames = accounts.map((a) => a.bank_name);
  const availableBanks = BANK_FORMATS.filter((b) => !existingBankNames.includes(b.value));
  const visibleTransactionCount = visibleImports.reduce((sum, imp) => sum + imp.row_count, 0);

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    queryClient.invalidateQueries({ queryKey: ["bank-imports"] });
  }

  async function confirmDeleteAccount() {
    if (!deleteTarget) return;
    try {
      await deleteBankAccount(deleteTarget.id);
      toast({ title: `${bankMeta(deleteTarget.bank_name).label} removed` });
      if (accountFilter === deleteTarget.id) setAccountFilter("all");
      invalidateAll();
    } catch (e: unknown) {
      toast({ title: "Failed to remove bank", description: String(e), variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleBankSelected(bank: BankFormat) {
    setAddBankOpen(false);
    setCreatingBank(bank.value);
    try {
      const account = await createBankAccount({
        bank_name: bank.value,
        account_label: bank.label,
      });
      invalidateAll();
      setUploadTarget(account);
    } catch (e: unknown) {
      toast({ title: "Failed to add bank", description: String(e), variant: "destructive" });
    } finally {
      setCreatingBank(null);
    }
  }

  // ── Empty / onboarding state ──────────────────────────────────────────────

  if (accounts.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background shadow-sm">
            <Landmark className="size-3.5 text-muted-foreground" />
          </div>
          <h1 className="text-base font-semibold tracking-tight">Bank Transactions</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Choose a bank</CardTitle>
            <CardDescription>Select your bank to connect the first statement.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {BANK_FORMATS.map((b) => (
                <BankCard key={b.value} bank={b} onClick={() => handleBankSelected(b)} />
              ))}
            </div>
            {creatingBank && (
              <p className="mt-4 text-sm text-muted-foreground">
                Setting up {bankMeta(creatingBank).label}…
              </p>
            )}
          </CardContent>
        </Card>

        {uploadTarget && (
          <FilePickerDialog
            account={uploadTarget}
            onClose={() => setUploadTarget(null)}
            onImported={() => { invalidateAll(); }}
          />
        )}
      </div>
    );
  }

  // ── Active state ──────────────────────────────────────────────────────────

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background shadow-sm">
            <Landmark className="size-3.5 text-muted-foreground" />
          </div>
          <h1 className="text-base font-semibold tracking-tight">Bank Transactions</h1>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-background px-3 text-[13px] font-medium text-foreground shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border"
            >
              <Landmark className="size-3.5" />
              Manage banks
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-1.5">
            <div className="flex flex-col gap-1">
              {accounts.map((account) => {
                const meta = bankMeta(account.bank_name);
                return (
                  <div
                    key={account.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/40"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded border border-border/60 bg-muted/40">
                      <ImageIcon className="size-3 text-muted-foreground/60" />
                    </div>
                    <span className="flex-1 truncate text-sm font-medium">{meta.label}</span>
                    <button
                      type="button"
                      onClick={() => setUploadTarget(account)}
                      aria-label={`Upload CSV for ${meta.label}`}
                      title="Upload CSV"
                      className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Upload className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(account)}
                      aria-label={`Remove ${meta.label}`}
                      title="Remove bank"
                      className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              })}
              {availableBanks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAddBankOpen(true)}
                  disabled={!!creatingBank}
                  className="mt-1 flex items-center gap-2 rounded-md border-t border-border/60 px-2 pt-2 pb-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  <Plus className="size-3.5" />
                  {creatingBank ? `Adding ${bankMeta(creatingBank).label}…` : "Add bank"}
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selection mode banner */}
      {matchForDocId && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Link2 className="size-4 shrink-0" />
          <span className="flex-1">
            Matching for: <span className="font-semibold">{decodeURIComponent(matchForDocName)}</span> — select one or more transactions below, then click <strong>Match</strong>.
          </span>
          <button
            className="text-xs text-blue-600 hover:underline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Import history */}
      <div className="flex flex-col gap-3">
        {/* Wise Owl assistant */}
        <InlineTableAssistant
          tableId="bank-import-history"
          metricLabel="Imported transactions"
          metricValue={visibleTransactionCount.toLocaleString("sv-SE")}
          metricMeta={`${visibleImports.length} statement imports in view`}
          promptPlaceholder="Refine this table, for example: seb imports after 2026-01-01"
          result={assistantResult}
          onSubmitPrompt={(prompt) => startTransition(() => setAssistantPrompt(prompt))}
          onClear={() => startTransition(() => setAssistantPrompt(""))}
          totalRowCount={imports.length}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Import history</CardTitle>
            <CardDescription>Search and filter statement imports inside the same table shell.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TableFilterBar
              search={search}
              onSearchChange={setSearch}
              placeholder="Search bank, account, date…"
              activeFilters={
                accountFilter !== "all"
                  ? [{ id: "bank", label: "Bank", value: bankMeta(accounts.find((a) => a.id === accountFilter)?.bank_name ?? "").label, onRemove: () => setAccountFilter("all") }]
                  : []
              }
              filterDimensions={
                accounts.length > 0
                  ? [
                      {
                        id: "bank",
                        label: "Bank",
                        options: accounts.map((a) => ({ value: a.id, label: bankMeta(a.bank_name).label })),
                        currentValue: accountFilter !== "all" ? accountFilter : undefined,
                        onSelect: setAccountFilter,
                      },
                    ]
                  : []
              }
            />

            {visibleImports.length > 0 ? (
              <div className="flex flex-col gap-2 p-3">
                {visibleImports.map((imp) => (
                  <ImportRow
                    key={imp.id}
                    imp={imp}
                    onDeleted={invalidateAll}
                    onNavigateToDoc={handleNavigateToDoc}
                    onUnmatch={handleUnmatch}
                    selectionMode={!!matchForDocId}
                    selectedTxIds={selectedTxIds}
                    onToggleSelect={handleToggleSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 py-16 gap-3 m-3">
                <Landmark className="size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground text-pretty">
                  No statements imported yet — upload a CSV from a connected bank above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {uploadTarget && (
        <FilePickerDialog
          account={uploadTarget}
          onClose={() => setUploadTarget(null)}
          onImported={invalidateAll}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteDialog
          bank={deleteTarget}
          onConfirm={confirmDeleteAccount}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {addBankOpen && (
        <AddBankDialog
          existingBankNames={existingBankNames}
          onSelect={handleBankSelected}
          onClose={() => setAddBankOpen(false)}
        />
      )}

      {/* Floating footer for manual match confirmation */}
      {matchForDocId && selectedTxIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-blue-200 bg-white shadow-lg px-5 py-3 text-sm">
          <span className="text-muted-foreground">
            {selectedTxIds.size} transaction{selectedTxIds.size !== 1 ? "s" : ""} selected
          </span>
          <Button
            size="sm"
            onClick={handleConfirmManualMatch}
            disabled={matchingLoading}
          >
            {matchingLoading ? "Matching…" : "Match"}
          </Button>
          <button
            className="text-xs text-muted-foreground hover:underline"
            onClick={() => setSelectedTxIds(new Set())}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
