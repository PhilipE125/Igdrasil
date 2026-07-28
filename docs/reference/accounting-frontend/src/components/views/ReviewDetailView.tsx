import { lazy, Suspense, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { validateBalanceSync, round2Sync } from "@/lib/accounting-engine";
import { Button } from "@/components/ui/button";
import { FileText, Image, Loader2, X, Send, Plus, Trash2, PartyPopper, ChevronDown, ChevronRight, ChevronLeft, CheckCircle, XCircle, Link2, AlertTriangle, Users } from "lucide-react";
import { FileIcon } from "@/components/ui/FileIcon";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFileStore } from "@/contexts/FileStoreContext";
import { PixelSquirrelLoader } from "@/components/PixelSquirrelLoader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { approveLedgerDraft, getActiveProvider, getDocumentViewUrl, listFiscalPeriods, listChartOfAccounts, rejectLedgerDraft, resolveDocumentMatch, updateLedgerDraft, type ChartOfAccount } from "@/lib/uploadApi";
import { listEmployees, type Employee } from "@/lib/employeeApi";
import { useCompany } from "@/contexts/CompanyContext";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const PdfViewer = lazy(() =>
  import("@/components/PdfViewer").then((module) => ({ default: module.PdfViewer })),
);

interface ThinkingStep {
  id: string;
  text: string;
}

interface TransactionLine {
  account: string;
  description: string;
  debit: number | null;
  credit: number | null;
  cost_center: string;
  project: string;
  transaction_info: string;
}

/** Format a number for SEK display using sv-SE locale */
function formatSEK(value: number): string {
  return value.toLocaleString("sv-SE", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** Parse a display string back to a financially-rounded number */
function parseSEK(display: string): number | null {
  const cleaned = display.replace(/[\s,]/g, "").replace(/\u00a0/g, "").trim();
  if (cleaned === "" || cleaned === "-") return null;
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return round2Sync(num) ?? num;
}

interface QueueItem {
  id: string;
  fileId: string;
  fileName: string;
  file: File;
  fileUrl?: string;
  ledgerEntryId?: string;
  status: "processing" | "ready" | "accepted" | "declined";
  /** Raw backend document status for richer processing labels */
  documentStatus?: string;
  steps: ThinkingStep[];
  transactions: TransactionLine[];
  visibleSteps: number;
}

const getThinkingStepsForInvoice = (fileName: string): ThinkingStep[] => {
  const lower = fileName.toLowerCase();
  if (lower.includes("receipt")) {
    return [
      { id: "1", text: "Scanning receipt…" },
      { id: "2", text: "Detected: Office Supplies purchase" },
      { id: "3", text: "Amount: $89.00" },
      { id: "4", text: "Generating entry" },
    ];
  }
  if (lower.includes("contract") || lower.includes("engagement")) {
    return [
      { id: "1", text: "Extracting document text and metadata…" },
      { id: "2", text: "Detecting document type: Service Agreement" },
      { id: "3", text: "Identifying parties: Edith & Philip, Contractor Inc." },
      { id: "4", text: "Parsing contract terms and payment schedule…" },
      { id: "5", text: "Detecting recurring payment: Monthly retainer" },
      { id: "6", text: "Calculating annual commitment: $24,000" },
      { id: "7", text: "Classifying expense: Professional Services" },
      { id: "8", text: "Generating journal entries" },
    ];
  }
  // Check if image
  if (/\.(jpe?g|png|webp)$/i.test(lower)) {
    return [
      { id: "1", text: "Running OCR on image…" },
      { id: "2", text: "Extracting text from scanned invoice" },
      { id: "3", text: "Identifying vendor and amounts" },
      { id: "4", text: "Classifying expense" },
      { id: "5", text: "Generating journal entry" },
    ];
  }
  return [
    { id: "1", text: "Extracting document text…" },
    { id: "2", text: "Identifying vendor" },
    { id: "3", text: "Parsing invoice date and amounts" },
    { id: "4", text: "Classifying expense categories" },
    { id: "5", text: "Generating journal entry" },
  ];
};

const getTransactionsForInvoice = (fileName: string): TransactionLine[] => {
  const defaults = { cost_center: "", project: "", transaction_info: "" };
  if (fileName.toLowerCase().includes("receipt")) {
    return [
      { account: "6100 - Office Supplies", description: "Misc office items", debit: 89.00, credit: null, ...defaults },
      { account: "1000 - Cash", description: "Payment", debit: null, credit: 89.00, ...defaults },
    ];
  }
  if (fileName.toLowerCase().includes("contract") || fileName.toLowerCase().includes("engagement")) {
    return [
      { account: "6500 - Professional Services", description: "Consulting retainer - January", debit: 2000.00, credit: null, ...defaults },
      { account: "2100 - Accounts Payable", description: "Contractor Inc.", debit: null, credit: 2000.00, ...defaults },
    ];
  }
  return [
    { account: "6100 - Office Supplies", description: "Printer paper, pens, folders", debit: 245.00, credit: null, ...defaults },
    { account: "6200 - Equipment", description: "USB keyboard", debit: 89.00, credit: null, ...defaults },
    { account: "2100 - Accounts Payable", description: "Acme Supplies Ltd", debit: null, credit: 334.00, ...defaults },
  ];
};

const mapVoucherLinesToTransactions = (
  voucherLines?: Array<{
    account_number: number;
    account_name?: string | null;
    debit: number;
    credit: number;
    description?: string | null;
    cost_center?: string | null;
    project?: string | null;
    transaction_info?: string | null;
  }>,
): TransactionLine[] => {
  if (!voucherLines || voucherLines.length === 0) {
    return [];
  }

  return voucherLines.map((line) => ({
    account: line.account_name
      ? `${line.account_number} - ${line.account_name}`
      : String(line.account_number),
    description: line.description ?? "",
    debit: typeof line.debit === "number" ? line.debit : null,
    credit: typeof line.credit === "number" ? line.credit : null,
    cost_center: line.cost_center ?? "",
    project: line.project ?? "",
    transaction_info: line.transaction_info ?? "",
  }));
};

function getProcessingLabel(documentStatus?: string): string {
  switch (documentStatus) {
    case "extracting": return "Reading document…";
    case "structuring": return "Parsing invoice data…";
    case "classifying": return "Classifying accounts…";
    default: return "Processing…";
  }
}

const FLOATING_INPUT_CLASS =
  "h-8 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border";

function _normalizeCountryCode(value: string): string {
  const raw = (value || "").trim();
  if (!raw) return "";
  const upper = raw.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) return upper;

  const mapping: Record<string, string> = {
    "SWEDEN": "SE",
    "SVERIGE": "SE",
    "UNITED STATES": "US",
    "UNITED STATES OF AMERICA": "US",
    "USA": "US",
    "UNITED KINGDOM": "GB",
    "UK": "GB",
    "NORWAY": "NO",
    "DENMARK": "DK",
    "FINLAND": "FI",
  };
  const key = raw.replace(/\./g, "").toUpperCase();
  return mapping[key] || "";
}

function parseAddressParts(rawAddress: string): {
  street: string;
  zip: string;
  city: string;
  countryCode: string;
} {
  const raw = (rawAddress || "").trim();
  if (!raw) return { street: "", zip: "", city: "", countryCode: "" };

  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  // Look for a ZIP/postcode in any chunk.
  // Supports SE style (NNN NN) and generic 5-digit ZIP.
  const zipRegex = /\b(\d{3}\s?\d{2}|\d{5}(?:-\d{4})?)\b/;
  let zip = "";
  let zipPartIndex = -1;

  for (let i = 0; i < parts.length; i++) {
    const m = parts[i].match(zipRegex);
    if (m) {
      zip = m[1].replace(/\s+/, " ").trim();
      zipPartIndex = i;
      break;
    }
  }

  // Country: typically last part.
  let countryCode = "";
  if (parts.length > 0) {
    const last = parts[parts.length - 1];
    countryCode = _normalizeCountryCode(last);
  }

  // City: best-effort.
  let city = "";
  if (zipPartIndex >= 0) {
    const zipPart = parts[zipPartIndex];
    const withoutZip = zipPart.replace(zipRegex, "").replace(/\s+/g, " ").trim();
    if (withoutZip) city = withoutZip;
    if (!city && zipPartIndex > 0) {
      city = parts[zipPartIndex - 1];
    }
  } else if (parts.length >= 2) {
    city = parts[parts.length - 2];
  }

  // Street: everything before the (city/zip/country) tail.
  let streetEndIndex = parts.length;
  if (countryCode) streetEndIndex = Math.max(0, streetEndIndex - 1);
  if (zipPartIndex >= 0) streetEndIndex = Math.min(streetEndIndex, zipPartIndex);
  else if (city) streetEndIndex = Math.max(0, streetEndIndex - 1);

  const street = parts.slice(0, streetEndIndex).join(", ").trim();

  return { street, zip, city, countryCode };
}

function parseAccountValue(value: string): { number: string; name: string } {
  const match = value.match(/^\s*(\d{3,6})\s*(?:[-–]\s*(.+?))?\s*$/);
  if (!match) return { number: value.trim(), name: "" };
  return { number: match[1], name: (match[2] ?? "").trim() };
}

const toBackendVoucherLine = (transaction: TransactionLine) => {
  const { number, name } = parseAccountValue(transaction.account);
  if (!number) {
    throw new Error(`Invalid account code in row: ${transaction.account || "(empty)"}`);
  }
  return {
    account_number: number,
    account_name: name || null,
    debit: transaction.debit ?? 0,
    credit: transaction.credit ?? 0,
    description: transaction.description || null,
    cost_center: transaction.cost_center || null,
    project: transaction.project || null,
    transaction_info: transaction.transaction_info || null,
  };
};

function isImageFile(file: File): boolean {
  return /\.(jpe?g|png)$/i.test(file.name) || ["image/jpeg", "image/jpg", "image/png"].includes(file.type);
}

interface AccountPickerCellProps {
  value: string;
  rowIndex: number;
  disabled: boolean;
  accounts: ChartOfAccount[];
  nameByNumber: Map<string, string>;
  onChange: (value: string) => void;
  autoOpen?: boolean;
  onAutoOpenConsumed?: () => void;
}

function AccountPickerCell({ value, rowIndex, disabled, accounts, nameByNumber, onChange, autoOpen, onAutoOpenConsumed }: AccountPickerCellProps) {
  const [open, setOpen] = useState(false);
  const { number: accNumber, name: accName } = parseAccountValue(value);

  const hasAccountNumber = accNumber.length > 0;
  // Stored value may be just the number (after reload); fall back to the lookup
  // so the inline label can still render the description.
  const resolvedName = accName || nameByNumber.get(accNumber) || "";
  const showTooltip = hasAccountNumber && resolvedName.length > 0 && !open;

  useEffect(() => {
    if (autoOpen && !disabled) {
      setOpen(true);
      onAutoOpenConsumed?.();
    }
  }, [autoOpen, disabled, onAutoOpenConsumed]);

  return (
    <TooltipProvider delayDuration={150}>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <button
                type="button"
                role="combobox"
                aria-label={`Account for row ${rowIndex + 1}`}
                aria-expanded={open}
                disabled={disabled}
                className={cn(
                  "flex w-full items-baseline gap-1.5 rounded px-1 py-0.5 text-left text-xs",
                  "focus:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
                  disabled && "cursor-default opacity-60",
                  !disabled && "hover:bg-muted/40 cursor-text",
                )}
              >
                {hasAccountNumber ? (
                  <>
                    <span className="shrink-0 font-medium tabular-nums text-foreground">{accNumber}</span>
                    {resolvedName && (
                      <span className="truncate text-muted-foreground">{resolvedName}</span>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">Account code…</span>
                )}
              </button>
            </TooltipTrigger>
          </PopoverTrigger>
          {showTooltip && (
            <TooltipContent side="top" align="start" className="text-xs">
              {resolvedName}
            </TooltipContent>
          )}
        </Tooltip>
        <PopoverContent align="start" className="w-80 p-0">
          <Command
            filter={(itemValue, search) => {
              if (!search) return 1;
              return itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
            }}
          >
            <CommandInput placeholder="Search account number or name…" autoFocus />
            <CommandList className="max-h-72">
              {accounts.length === 0 ? (
                <div className="px-3 py-4 text-xs text-muted-foreground">
                  Loading chart of accounts…
                </div>
              ) : (
                <>
                  <CommandEmpty>No accounts match.</CommandEmpty>
                  <CommandGroup>
                    {accounts.map((a) => (
                      <CommandItem
                        key={a.account_number}
                        value={`${a.account_number} ${a.account_name}`}
                        onSelect={() => {
                          onChange(`${a.account_number} - ${a.account_name}`);
                          setOpen(false);
                        }}
                        className="gap-2 text-xs"
                      >
                        <span className="font-medium tabular-nums text-foreground w-12">{a.account_number}</span>
                        <span className="truncate text-muted-foreground">{a.account_name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}

export const ReviewDetailView = () => {
  const navigate = useNavigate();
  const { activeCompany } = useCompany();
  const { files, updateFile, focusFileId, setFocusFileId, processing, refreshFiles } = useFileStore();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [pushLabel, setPushLabel] = useState("Ledger");
  const [showFiscalYearDialog, setShowFiscalYearDialog] = useState(false);
  const knownFileIds = useRef<Set<string>>(new Set());

  // FileStoreContext already polls every 5s — no need to force refresh on mount
  useEffect(() => {
    let cancelled = false;

    void getActiveProvider()
      .then((provider) => {
        if (!cancelled) {
          setPushLabel(provider.label || "Ledger");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPushLabel("Ledger");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [jumpOpen, setJumpOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [autoOpenRowIndex, setAutoOpenRowIndex] = useState<number | null>(null);
  const [showExtraCols, setShowExtraCols] = useState(false);
  const [matchResolutionByFileId, setMatchResolutionByFileId] = useState<
    Record<
      string,
      { method: "employee"; label: string; targetIdx: number; original: TransactionLine } | undefined
    >
  >({});
  const [employeePickerOpen, setEmployeePickerOpen] = useState(false);

  const { data: employees = [] } = useQuery({
    queryKey: ["employees", activeCompany?.id],
    queryFn: listEmployees,
    enabled: !!activeCompany?.id,
    staleTime: 60_000,
  });

  const { data: chartOfAccounts = [] } = useQuery({
    queryKey: ["chart-of-accounts", activeCompany?.id],
    queryFn: listChartOfAccounts,
    enabled: !!activeCompany?.id,
    staleTime: 5 * 60_000,
    select: (accounts) => accounts.filter((a) => a.is_active),
  });

  const accountNameByNumber = useMemo(
    () => new Map(chartOfAccounts.map((a) => [a.account_number, a.account_name])),
    [chartOfAccounts],
  );

  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [metaEditsByFileId, setMetaEditsByFileId] = useState<Record<string, {
    supplier?: string;
    supplierOrgNumber?: string;
    supplierVatNumber?: string;
    supplierAddress?: string;
    supplierCity?: string;
    supplierZipCode?: string;
    supplierCountryCode?: string;
    invoiceNumber?: string;
    invoiceDate?: string; // YYYY-MM-DD
    dueDate?: string; // YYYY-MM-DD
    amount?: string; // numeric
    vatAmount?: string; // numeric
  }>>({});

  const getTransactionsForFile = useCallback((file: (typeof files)[number]) => {
    const backendTransactions = mapVoucherLinesToTransactions(file.voucherLines);
    if (backendTransactions.length > 0) {
      return backendTransactions;
    }
    // Wait for backend LLM output; do not show placeholder transactions.
    return [];
  }, []);

  // Sync: when shared store gets new files, add them to the queue
  useEffect(() => {
    const newFiles = files.filter(
      (f) => f.bookkeepingStatus === "pending" && !knownFileIds.current.has(f.id)
    );
    if (newFiles.length === 0) return;

    const newItems: QueueItem[] = newFiles.map((f) => {
      knownFileIds.current.add(f.id);
      const hasBackendClassification = Boolean(
        f.ledgerEntryId || (f.voucherLines && f.voucherLines.length > 0),
      );
      const initialSteps = hasBackendClassification ? getThinkingStepsForInvoice(f.name) : [];
      return {
        id: `q-${f.id}`,
        fileId: f.id,
        fileName: f.name,
        file: f.file,
        fileUrl: f.url,
        ledgerEntryId: f.ledgerEntryId,
        status: hasBackendClassification ? ("ready" as const) : ("processing" as const),
        documentStatus: f.documentStatus,
        steps: initialSteps,
        transactions: getTransactionsForFile(f),
        visibleSteps: hasBackendClassification ? initialSteps.length : 0,
      };
    });

    setQueue((prev) => {
      const existing = new Set(prev.map((q) => q.fileId));
      const toAdd = newItems.filter((q) => !existing.has(q.fileId));
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
  }, [files, getTransactionsForFile]);

  // Sync updates: when backend LLM results arrive (journal entry / voucher lines), promote queue items to ready.
  useEffect(() => {
    const byId = new Map(files.map((f) => [f.id, f] as const));
    setQueue((prev) =>
      prev
        // If the backend no longer returns the document (e.g. it was deleted), remove it from the queue.
        .filter((item) => byId.has(item.fileId))
        .map((item) => {
        const file = byId.get(item.fileId);
        if (!file) return item;

        const hasBackendClassification = Boolean(
          file.ledgerEntryId || (file.voucherLines && file.voucherLines.length > 0),
        );

        const nextStatus: QueueItem["status"] =
          file.bookkeepingStatus === "processed" ? "accepted"
          : item.status === "accepted" || item.status === "declined" ? item.status
          : hasBackendClassification ? "ready"
          : "processing";

        const nextTransactions = mapVoucherLinesToTransactions(file.voucherLines);
        const shouldPopulateSteps = item.steps.length === 0 && hasBackendClassification;
        const nextSteps = shouldPopulateSteps ? getThinkingStepsForInvoice(file.name) : item.steps;
        const nextVisible = shouldPopulateSteps ? nextSteps.length : item.visibleSteps;

        return {
          ...item,
          fileName: file.name,
          fileUrl: file.url || item.fileUrl,
          ledgerEntryId: file.ledgerEntryId,
          status: nextStatus,
          documentStatus: file.documentStatus,
          steps: nextSteps,
          visibleSteps: nextVisible,
          transactions: nextTransactions.length > 0 ? nextTransactions : item.transactions,
        };
      })
    );
  }, [files]);

  // Handle focusFileId from File Archive — ensure file is in queue and select it
  useEffect(() => {
    if (!focusFileId) return;
    const file = files.find((f) => f.id === focusFileId);
    if (!file) { setFocusFileId(null); return; }

    // Ensure it's in the queue (might already be there from a previous review)
    const existingIdx = queue.findIndex((q) => q.fileId === focusFileId);
    if (existingIdx !== -1) {
      setCurrentIndex(existingIdx);
      setFocusFileId(null);
      return;
    }

    // Not in queue yet — add it with its previous state preserved (no re-analysis)
    knownFileIds.current.add(file.id);
    const previousStatus = file.bookkeepingStatus;
    const hasBackendClassification = Boolean(
      file.ledgerEntryId || (file.voucherLines && file.voucherLines.length > 0),
    );
    const steps = hasBackendClassification ? getThinkingStepsForInvoice(file.name) : [];
    const transactions = getTransactionsForFile(file);

    const queueStatus: QueueItem["status"] =
      previousStatus === "processed" ? "accepted"
      : hasBackendClassification ? "ready"
      : "processing";

    const newItem: QueueItem = {
      id: `q-${file.id}`,
      fileId: file.id,
      fileName: file.name,
      file: file.file,
      fileUrl: file.url,
      ledgerEntryId: file.ledgerEntryId,
      status: queueStatus,
      steps,
      transactions,
      visibleSteps: steps.length,
    };
    setQueue((prev) => {
      const updated = [...prev, newItem];
      setCurrentIndex(updated.length - 1);
      return updated;
    });
    setFocusFileId(null);
  }, [focusFileId, files, getTransactionsForFile, queue, setFocusFileId, updateFile]);

  // Auto-select first ready item when none is selected
  useEffect(() => {
    if (currentIndex !== null && queue[currentIndex]?.status === "ready") return;
    const firstReady = queue.findIndex((q) => q.status === "ready");
    if (firstReady !== -1) setCurrentIndex(firstReady);
  }, [queue, currentIndex]);

  const pendingReview = useMemo(() => queue.filter((q) => q.status === "ready"), [queue]);
  const processingItems = useMemo(() => queue.filter((q) => q.status === "processing"), [queue]);
  const acceptedItems = useMemo(() => queue.filter((q) => q.status === "accepted"), [queue]);
  const declinedItems = useMemo(() => queue.filter((q) => q.status === "declined"), [queue]);
  const reviewedCount = acceptedItems.length + declinedItems.length;
  const totalCount = queue.length;
  const currentItem = currentIndex !== null ? (queue[currentIndex] ?? null) : null;
  const currentFile = useMemo(
    () => (currentItem ? files.find((f) => f.id === currentItem.fileId) ?? null : null),
    [currentItem, files],
  );

  // Fetch presigned view URL lazily for the currently selected item (archived files have a 0-byte placeholder File).
  const viewUrlFetchInFlight = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!currentItem) return;
    if (currentItem.fileUrl) return;
    if (!currentFile) return;

    // Only fetch if we don't already have a usable local file to preview.
    const hasLocalFileContent = Boolean(currentItem.file && currentItem.file.size > 0);
    if (hasLocalFileContent) return;

    if (viewUrlFetchInFlight.current.has(currentItem.fileId)) return;
    viewUrlFetchInFlight.current.add(currentItem.fileId);

    (async () => {
      try {
        const url = await getDocumentViewUrl(currentItem.fileId);
        setQueue((prev) => prev.map((q) => (q.fileId === currentItem.fileId ? { ...q, fileUrl: url } : q)));
        updateFile(currentItem.fileId, { url });
      } catch {
        // Ignore: UI already handles missing preview.
      } finally {
        viewUrlFetchInFlight.current.delete(currentItem.fileId);
      }
    })();
  }, [currentItem, currentFile, updateFile]);

  const currentMeta = useMemo(() => {
    if (!currentFile) return null;
    const edits = metaEditsByFileId[currentFile.id] || {};
    const invoiceDate = currentFile.invoiceDate ? currentFile.invoiceDate.toISOString().slice(0, 10) : "";
    const dueDate = currentFile.dueDate ? currentFile.dueDate.toISOString().slice(0, 10) : "";
    return {
      supplier: edits.supplier ?? currentFile.supplier ?? "",
      supplierOrgNumber: edits.supplierOrgNumber ?? currentFile.supplierOrgNumber ?? "",
      supplierVatNumber: edits.supplierVatNumber ?? currentFile.supplierVatNumber ?? "",
      supplierAddress: edits.supplierAddress ?? currentFile.supplierAddress ?? "",
      supplierCity: edits.supplierCity ?? currentFile.supplierCity ?? "",
      supplierZipCode: edits.supplierZipCode ?? currentFile.supplierZipCode ?? "",
      supplierCountryCode: edits.supplierCountryCode ?? currentFile.supplierCountryCode ?? "",
      invoiceNumber: edits.invoiceNumber ?? currentFile.invoiceNumber ?? "",
      invoiceDate: edits.invoiceDate ?? invoiceDate,
      dueDate: edits.dueDate ?? dueDate,
      amount: edits.amount ?? (typeof currentFile.amount === "number" ? String(currentFile.amount) : ""),
      vatAmount: edits.vatAmount ?? (typeof currentFile.vatAmount === "number" ? String(currentFile.vatAmount) : ""),
    };
  }, [currentFile, metaEditsByFileId]);

  const updateMetaField = useCallback((fileId: string, field: string, value: string) => {
    // If user pastes a full address into the street field, try to split it for Fortnox.
    if (field === "supplierAddress") {
      const parsed = parseAddressParts(value);
      setMetaEditsByFileId((prev) => ({
        ...prev,
        [fileId]: {
          ...(prev[fileId] || {}),
          supplierAddress: parsed.street || value,
          // Only overwrite the derived fields if user hasn't explicitly set them.
          supplierZipCode: (prev[fileId]?.supplierZipCode ?? "") || parsed.zip,
          supplierCity: (prev[fileId]?.supplierCity ?? "") || parsed.city,
          supplierCountryCode: (prev[fileId]?.supplierCountryCode ?? "") || parsed.countryCode,
        },
      }));
      return;
    }

    setMetaEditsByFileId((prev) => ({
      ...prev,
      [fileId]: {
        ...(prev[fileId] || {}),
        [field]: value,
      },
    }));
  }, []);
  const currentTotals = useMemo(() => {
    if (!currentItem) {
      return { totalDebit: 0, totalCredit: 0, isBalanced: true };
    }
    // Try WASM-backed validation (Decimal-safe); fall back to JS
    const wasmResult = validateBalanceSync(
      currentItem.transactions.map((t) => ({ debit: t.debit || 0, credit: t.credit || 0 })),
    );
    if (wasmResult) {
      return {
        totalDebit: wasmResult.total_debit,
        totalCredit: wasmResult.total_credit,
        isBalanced: wasmResult.is_valid,
      };
    }
    const totalDebit = currentItem.transactions.reduce((sum, transaction) => sum + (transaction.debit || 0), 0);
    const totalCredit = currentItem.transactions.reduce((sum, transaction) => sum + (transaction.credit || 0), 0);
    return {
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    };
  }, [currentItem]);

  useEffect(() => {
    if (!currentItem || !isImageFile(currentItem.file) || currentItem.file.size <= 0) {
      setPreviewObjectUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(currentItem.file);
    setPreviewObjectUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [currentItem]);

  // Intentionally no local simulation: items become ready only when backend LLM results exist.

  const advanceToNextReady = (fromIndex: number, updatedQueue: QueueItem[]) => {
    for (let i = fromIndex + 1; i < updatedQueue.length; i++) {
      if (updatedQueue[i].status === "ready") { setCurrentIndex(i); return; }
    }
    for (let i = 0; i < fromIndex; i++) {
      if (updatedQueue[i].status === "ready") { setCurrentIndex(i); return; }
    }
    // No more ready items
    setCurrentIndex(null);
  };

  const handleAccept = async () => {
    if (currentIndex === null || !currentItem || currentItem.status !== "ready") return;
    if (!currentTotals.isBalanced) return;

    setActionLoading(true);

    try {
      // Check that a fiscal period covers the entry date before posting
      const entryDate = currentMeta?.invoiceDate;
      if (entryDate) {
        const periods = await listFiscalPeriods();
        const coveringPeriod = periods.find(
          (p) => p.period_start <= entryDate && p.period_end >= entryDate,
        );
        if (!coveringPeriod) {
          setActionLoading(false);
          setShowFiscalYearDialog(true);
          return;
        }
      }

      const resolution = matchResolutionByFileId[currentItem.fileId];
      if (resolution) {
        await resolveDocumentMatch(currentItem.fileId, "employee", resolution.label);
      }

      if (currentItem.ledgerEntryId) {
        const voucherLines = currentItem.transactions.map(toBackendVoucherLine);
        const meta = currentMeta;
        const normalizedAddress = meta ? parseAddressParts(meta.supplierAddress || "") : null;
        const countryCode = meta?.supplierCountryCode
          ? _normalizeCountryCode(meta.supplierCountryCode)
          : (normalizedAddress?.countryCode || "");
        const zipCode = meta?.supplierZipCode || normalizedAddress?.zip || "";
        const city = meta?.supplierCity || normalizedAddress?.city || "";
        const street = meta?.supplierAddress || normalizedAddress?.street || "";

        await updateLedgerDraft(currentItem.ledgerEntryId, {
          lines: voucherLines,
          description: currentFile?.voucherDescription,
          invoice_metadata: meta ? {
            ...(meta.supplier ? { supplier_name: meta.supplier } : {}),
            ...(meta.supplierOrgNumber ? { supplier_org_number: meta.supplierOrgNumber } : {}),
            ...(meta.supplierVatNumber ? { supplier_vat_number: meta.supplierVatNumber } : {}),
            ...(street ? { supplier_address: street } : {}),
            ...(city ? { supplier_city: city } : {}),
            ...(zipCode ? { supplier_zip_code: zipCode } : {}),
            ...(countryCode ? { supplier_country_code: countryCode } : {}),
            ...(meta.invoiceNumber ? { invoice_number: meta.invoiceNumber } : {}),
            ...(meta.invoiceDate ? { invoice_date: meta.invoiceDate } : {}),
            ...(meta.dueDate ? { due_date: meta.dueDate } : {}),
            ...(meta.amount && !Number.isNaN(Number(meta.amount)) ? { total_amount: Number(meta.amount) } : {}),
            ...(meta.vatAmount && !Number.isNaN(Number(meta.vatAmount)) ? { vat_amount: Number(meta.vatAmount) } : {}),
          } : undefined,
        });
        await approveLedgerDraft(currentItem.ledgerEntryId);
      }

      const updated = queue.map((q, i) => i === currentIndex ? { ...q, status: "accepted" as const } : q);
      setQueue(updated);
      updateFile(currentItem.fileId, { bookkeepingStatus: "processed" });
      advanceToNextReady(currentIndex, updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to accept and push entry";
      toast({
        title: "Action failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (currentIndex === null || !currentItem || currentItem.status !== "ready") return;

    setActionLoading(true);
    try {
      if (currentItem.ledgerEntryId) {
        await rejectLedgerDraft(currentItem.ledgerEntryId);
      }

      const updated = queue.map((q, i) => i === currentIndex ? { ...q, status: "declined" as const } : q);
      setQueue(updated);
      updateFile(currentItem.fileId, { bookkeepingStatus: "flagged" });
      advanceToNextReady(currentIndex, updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to decline entry";
      toast({
        title: "Action failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateTransaction = (txIndex: number, field: keyof TransactionLine, value: string | number | null) => {
    if (currentIndex === null) return;
    setQueue((prev) =>
      prev.map((q, i) =>
        i === currentIndex
          ? { ...q, transactions: q.transactions.map((tx, ti) => ti === txIndex ? { ...tx, [field]: value } : tx) }
          : q
      )
    );
  };

  const addTransactionRow = () => {
    if (currentIndex === null) return;
    let nextIndex = 0;
    setQueue((prev) =>
      prev.map((q, i) => {
        if (i !== currentIndex) return q;
        nextIndex = q.transactions.length;
        return {
          ...q,
          transactions: [
            ...q.transactions,
            { account: "", description: "", debit: null, credit: null, cost_center: "", project: "", transaction_info: "" },
          ],
        };
      })
    );
    setAutoOpenRowIndex(nextIndex);
  };

  const applyMatchResolution = (label: string) => {
    if (currentIndex === null || !currentItem) return;
    const accountValue = "2890 - Övriga kortfristiga skulder";
    const description = `Utlägg ${label}`;

    // Only touch the "Payment match required" placeholder line. Never
    // rewrite a real account (e.g. VAT, expense) — that would corrupt the
    // entry. parseAccountValue requires 3-6 digits, so the single-digit
    // "0" placeholder bypasses it; match the raw string shape directly.
    const isPendingMatchLine = (tx: TransactionLine) => {
      const raw = (tx.account ?? "").trim();
      if (!raw) return true;
      if (/^0+(\s|$|[-–])/.test(raw)) return true;
      if (/payment\s*match/i.test(raw)) return true;
      return false;
    };

    const txs = currentItem.transactions;
    const targetIdx = txs.findIndex(isPendingMatchLine);
    if (targetIdx === -1) {
      toast({
        title: "No placeholder line found",
        description:
          "This receipt has no '0 - Payment match required' line to replace. Adjust the voucher manually.",
        variant: "destructive",
      });
      return;
    }

    const original = txs[targetIdx];

    // The placeholder line should carry the full receipt cost on its
    // credit side. If it arrived empty, compute it from the imbalance
    // so the voucher actually balances.
    let nextCredit = original.credit;
    let nextDebit = original.debit;
    if ((nextCredit ?? 0) === 0 && (nextDebit ?? 0) === 0) {
      const debitSum = txs.reduce((s, t, i) => (i === targetIdx ? s : s + (t.debit ?? 0)), 0);
      const creditSum = txs.reduce((s, t, i) => (i === targetIdx ? s : s + (t.credit ?? 0)), 0);
      const diff = round2Sync(debitSum - creditSum) ?? (debitSum - creditSum);
      if (diff > 0) nextCredit = diff;
      else if (diff < 0) nextDebit = -diff;
    }

    setQueue((prev) =>
      prev.map((q, i) =>
        i === currentIndex
          ? {
              ...q,
              transactions: q.transactions.map((tx, ti) =>
                ti === targetIdx
                  ? { ...tx, account: accountValue, description, credit: nextCredit, debit: nextDebit }
                  : tx,
              ),
            }
          : q,
      ),
    );

    setMatchResolutionByFileId((prev) => ({
      ...prev,
      [currentItem.fileId]: { method: "employee", label, targetIdx, original },
    }));
  };

  const undoMatchResolution = () => {
    if (currentIndex === null || !currentItem) return;
    const resolution = matchResolutionByFileId[currentItem.fileId];
    if (!resolution) return;

    setQueue((prev) =>
      prev.map((q, i) =>
        i === currentIndex
          ? {
              ...q,
              transactions: q.transactions.map((tx, ti) =>
                ti === resolution.targetIdx ? resolution.original : tx,
              ),
            }
          : q,
      ),
    );
    setMatchResolutionByFileId((prev) => {
      const next = { ...prev };
      delete next[currentItem.fileId];
      return next;
    });
  };

  const removeTransactionRow = (txIndex: number) => {
    if (currentIndex === null) return;
    setQueue((prev) =>
      prev.map((q, i) =>
        i === currentIndex
          ? { ...q, transactions: q.transactions.filter((_, ti) => ti !== txIndex) }
          : q
      )
    );
  };

  const selectItem = (item: QueueItem) => {
    const idx = queue.findIndex((q) => q.id === item.id);
    if (idx !== -1) setCurrentIndex(idx);
  };

  const allReviewed =
    totalCount > 0 &&
    pendingReview.length === 0 &&
    processingItems.length === 0 &&
    currentItem === null;

  const goToIndex = (idx: number) => {
    if (idx < 0 || idx >= queue.length) return;
    setCurrentIndex(idx);
  };

  const renderJumpItem = (item: QueueItem, icon: React.ReactNode) => (
    <CommandItem
      key={item.id}
      value={`${item.fileName} ${item.id}`}
      onSelect={() => {
        selectItem(item);
        setJumpOpen(false);
      }}
      className="gap-2 text-xs"
    >
      {icon}
      <span className="truncate">{item.fileName}</span>
    </CommandItem>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Empty state */}
      {totalCount === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground">No invoices in queue</p>
            <p className="mt-1 text-sm text-muted-foreground">Run documents through the Pipeline Builder to populate this queue</p>
          </div>
        </div>
      )}

      {totalCount > 0 && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Compact navigation bar */}
          <div className="flex items-center justify-between gap-3 border-b border-border bg-background/50 px-4 py-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => goToIndex((currentIndex ?? 0) - 1)}
                disabled={currentIndex === null || currentIndex <= 0}
                aria-label="Previous invoice"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover open={jumpOpen} onOpenChange={setJumpOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2 text-xs tabular-nums"
                  >
                    {currentIndex !== null ? `${currentIndex + 1} of ${totalCount}` : `— of ${totalCount}`}
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80 p-0">
                  <Command>
                    <CommandInput placeholder="Jump to invoice…" />
                    <CommandList className="max-h-72">
                      <CommandEmpty>No invoices found.</CommandEmpty>
                      {pendingReview.length > 0 && (
                        <CommandGroup heading={`Ready for review (${pendingReview.length})`}>
                          {pendingReview.map((item) =>
                            renderJumpItem(item, <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />),
                          )}
                        </CommandGroup>
                      )}
                      {processingItems.length > 0 && (
                        <CommandGroup heading={`Processing (${processingItems.length})`}>
                          {processingItems.map((item) =>
                            renderJumpItem(item, <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />),
                          )}
                        </CommandGroup>
                      )}
                      {acceptedItems.length > 0 && (
                        <CommandGroup heading={`Accepted (${acceptedItems.length})`}>
                          {acceptedItems.map((item) =>
                            renderJumpItem(item, <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />),
                          )}
                        </CommandGroup>
                      )}
                      {declinedItems.length > 0 && (
                        <CommandGroup heading={`Declined (${declinedItems.length})`}>
                          {declinedItems.map((item) =>
                            renderJumpItem(item, <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />),
                          )}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => goToIndex((currentIndex ?? -1) + 1)}
                disabled={currentIndex === null || currentIndex >= queue.length - 1}
                aria-label="Next invoice"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {reviewedCount} of {totalCount} reviewed
              </span>
              <Progress value={(reviewedCount / totalCount) * 100} className="h-1.5 w-24" />
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* All done state */}
            {allReviewed && (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <PartyPopper className="mx-auto mb-4 h-16 w-16 text-primary" />
                  <p className="text-xl font-medium text-foreground">All caught up!</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {acceptedItems.length} accepted, {declinedItems.length} declined
                  </p>
                </div>
              </div>
            )}

            {/* No item selected */}
            {!allReviewed && !currentItem && (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    {processingItems.length > 0 ? "Invoices are being processed…" : "Select an invoice to review"}
                  </p>
                </div>
              </div>
            )}

            {/* Current item review */}
            {currentItem && (
              <ResizablePanelGroup direction="horizontal">
                {/* Document Preview */}
                <ResizablePanel defaultSize={45} minSize={25} maxSize={65} className="flex flex-col border-r border-border">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                    {isImageFile(currentItem.file) ? (
                      <Image className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileIcon name={currentItem.fileName} className="h-4 w-4" />
                    )}
                    <span className="truncate text-sm font-medium text-foreground">{currentItem.fileName}</span>
                    <Badge
                      variant={currentItem.status === "ready" ? "default" : currentItem.status === "accepted" ? "secondary" : "destructive"}
                      className="ml-auto text-[10px]"
                    >
                      {currentItem.status === "accepted" ? "accepted" : currentItem.status === "declined" ? "declined" : currentItem.status}
                    </Badge>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {isImageFile(currentItem.file) ? (
                      <div className="flex h-full items-center justify-center bg-muted/30 p-4">
                        {currentItem.file.size > 0 ? (
                          <img
                            src={previewObjectUrl ?? ""}
                            alt={currentItem.fileName}
                            width={1024}
                            height={1448}
                            loading="lazy"
                            className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
                          />
                        ) : currentItem.fileUrl ? (
                          <img
                            src={currentItem.fileUrl}
                            alt={currentItem.fileName}
                            width={1024}
                            height={1448}
                            loading="lazy"
                            className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
                          />
                        ) : (
                          <FileText className="h-12 w-12 text-muted-foreground/30" />
                        )}
                      </div>
                    ) : currentItem.file.size > 0 ? (
                      <Suspense
                        fallback={
                          <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        }
                      >
                        <PdfViewer file={currentItem.file} className="h-full" />
                      </Suspense>
                    ) : currentItem.fileUrl ? (
                      <Suspense
                        fallback={
                          <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        }
                      >
                        <PdfViewer sourceUrl={currentItem.fileUrl} className="h-full" />
                      </Suspense>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Journal entry panel */}
                <ResizablePanel defaultSize={55} minSize={25} className="flex flex-col overflow-auto">
                  <div className="flex-1 p-6">
                    {/* Squirrel loader while processing */}
                    {currentItem.status === "processing" && (
                      <div className="flex flex-col items-center justify-center gap-3 py-12">
                        <PixelSquirrelLoader />
                        <p className="text-sm text-muted-foreground animate-pulse">
                          {getProcessingLabel(currentItem.documentStatus)}
                        </p>
                      </div>
                    )}

                    {(currentItem.status === "ready" || currentItem.status === "accepted" || currentItem.status === "declined") && currentItem.transactions.length > 0 && (
                      <div>
                        {/* Supplier & invoice metadata */}
                        {currentFile && currentMeta && (
                          <div className="mb-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="text-xs font-medium text-muted-foreground">Supplier & Invoice</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                              <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground">Supplier name</div>
                                <Input
                                  className={FLOATING_INPUT_CLASS}
                                  value={currentMeta.supplier}
                                  onChange={(e) => updateMetaField(currentFile.id, "supplier", e.target.value)}
                                  disabled={currentItem.status !== "ready"}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground">Org. number</div>
                                <Input
                                  className={FLOATING_INPUT_CLASS}
                                  value={currentMeta.supplierOrgNumber}
                                  onChange={(e) => updateMetaField(currentFile.id, "supplierOrgNumber", e.target.value)}
                                  disabled={currentItem.status !== "ready"}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground">VAT number</div>
                                <Input
                                  className={FLOATING_INPUT_CLASS}
                                  value={currentMeta.supplierVatNumber}
                                  onChange={(e) => updateMetaField(currentFile.id, "supplierVatNumber", e.target.value)}
                                  disabled={currentItem.status !== "ready"}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground">Invoice number</div>
                                <Input
                                  className={FLOATING_INPUT_CLASS}
                                  value={currentMeta.invoiceNumber}
                                  onChange={(e) => updateMetaField(currentFile.id, "invoiceNumber", e.target.value)}
                                  disabled={currentItem.status !== "ready"}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground">Invoice date</div>
                                <Input
                                  className={FLOATING_INPUT_CLASS}
                                  type="date"
                                  value={currentMeta.invoiceDate}
                                  onChange={(e) => updateMetaField(currentFile.id, "invoiceDate", e.target.value)}
                                  disabled={currentItem.status !== "ready"}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground">Due date</div>
                                <Input
                                  className={FLOATING_INPUT_CLASS}
                                  type="date"
                                  value={currentMeta.dueDate}
                                  onChange={(e) => updateMetaField(currentFile.id, "dueDate", e.target.value)}
                                  disabled={currentItem.status !== "ready"}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground">Total amount</div>
                                <Input
                                  className={FLOATING_INPUT_CLASS}
                                  inputMode="decimal"
                                  value={currentMeta.amount}
                                  onChange={(e) => updateMetaField(currentFile.id, "amount", e.target.value)}
                                  disabled={currentItem.status !== "ready"}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground">Street address</div>
                                <Input
                                  className={FLOATING_INPUT_CLASS}
                                  value={currentMeta.supplierAddress}
                                  onChange={(e) => updateMetaField(currentFile.id, "supplierAddress", e.target.value)}
                                  disabled={currentItem.status !== "ready"}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground">Zip code</div>
                                <Input
                                  className={FLOATING_INPUT_CLASS}
                                  value={currentMeta.supplierZipCode}
                                  onChange={(e) => updateMetaField(currentFile.id, "supplierZipCode", e.target.value)}
                                  disabled={currentItem.status !== "ready"}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground">City</div>
                                <Input
                                  className={FLOATING_INPUT_CLASS}
                                  value={currentMeta.supplierCity}
                                  onChange={(e) => updateMetaField(currentFile.id, "supplierCity", e.target.value)}
                                  disabled={currentItem.status !== "ready"}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground">Country</div>
                                <Input
                                  className={FLOATING_INPUT_CLASS}
                                  value={currentMeta.supplierCountryCode}
                                  onChange={(e) => updateMetaField(currentFile.id, "supplierCountryCode", e.target.value)}
                                  disabled={currentItem.status !== "ready"}
                                  placeholder="SE"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* FX conversion info */}
                        {currentFile?.fxCurrency && currentFile.fxRate && (
                          <div
                            className="mb-4 flex items-center gap-3 rounded-lg border px-4 py-2.5"
                            style={{ borderColor: "#eedd8f", background: "#eedd8f11" }}
                          >
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-md" style={{ background: "#eedd8f33" }}>
                              <span className="text-xs font-bold" style={{ color: "#6b5e00" }}>{currentFile.fxCurrency}</span>
                            </div>
                            <div className="flex-1 min-w-0 text-xs">
                              <p className="font-medium text-foreground">
                                {currentFile.fxOriginalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currentFile.fxCurrency}
                                <span className="mx-1.5 text-muted-foreground">=</span>
                                {currentFile.fxConvertedSek?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SEK
                              </p>
                              <p className="text-muted-foreground">
                                Rate {currentFile.fxRate?.toFixed(4)} from Riksbanken ({currentFile.fxRateDate})
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-sm font-medium text-foreground">Proposed Journal Entry</h3>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowExtraCols((v) => !v)}
                              className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                              aria-expanded={showExtraCols}
                              aria-label={showExtraCols ? "Hide cost center and project columns" : "Show cost center and project columns"}
                            >
                              {showExtraCols ? (
                                <ChevronLeft className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                              {showExtraCols ? "Hide cost center / project" : "Cost center / project"}
                            </Button>
                            {currentItem.status === "ready" && (
                              <Button variant="outline" size="sm" onClick={addTransactionRow} className="gap-1 text-xs">
                                <Plus className="h-3 w-3" /> Add Row
                              </Button>
                            )}
                          </div>
                        </div>
                        <div
                          className="overflow-hidden rounded-lg border border-border"
                          style={{ contentVisibility: "auto", containIntrinsicSize: "360px" }}
                        >
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/30">
                                <TableHead className="text-xs font-medium">Account</TableHead>
                                <TableHead className="text-xs font-medium">Description</TableHead>
                                {showExtraCols && (
                                  <>
                                    <TableHead className="w-20 text-xs font-medium">Cost Center</TableHead>
                                    <TableHead className="w-20 text-xs font-medium">Project</TableHead>
                                  </>
                                )}
                                <TableHead className="w-24 text-right text-xs font-medium pr-4">Debit</TableHead>
                                <TableHead className="w-24 text-right text-xs font-medium pr-4">Credit</TableHead>
                                {currentItem.status === "ready" && <TableHead className="w-8" />}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentItem.transactions.map((tx, txIdx) => (
                                <TableRow key={txIdx} className="group">
                                  <TableCell className="py-1.5">
                                    <AccountPickerCell
                                      value={tx.account}
                                      rowIndex={txIdx}
                                      disabled={currentItem.status !== "ready"}
                                      accounts={chartOfAccounts}
                                      nameByNumber={accountNameByNumber}
                                      onChange={(next) => updateTransaction(txIdx, "account", next)}
                                      autoOpen={autoOpenRowIndex === txIdx}
                                      onAutoOpenConsumed={() => setAutoOpenRowIndex(null)}
                                    />
                                  </TableCell>
                                  <TableCell className="py-1.5">
                                    <input name={`description-${txIdx}`} autoComplete="off" aria-label={`Description for row ${txIdx + 1}`} value={tx.description} onChange={(e) => updateTransaction(txIdx, "description", e.target.value)} disabled={currentItem.status !== "ready"} className="w-full rounded bg-transparent px-1 py-0.5 text-xs focus:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-60" placeholder="Description…" />
                                  </TableCell>
                                  {showExtraCols && (
                                    <>
                                      <TableCell className="w-20 py-1.5">
                                        <input name={`cost_center-${txIdx}`} autoComplete="off" aria-label={`Cost center for row ${txIdx + 1}`} value={tx.cost_center} onChange={(e) => updateTransaction(txIdx, "cost_center", e.target.value)} disabled={currentItem.status !== "ready"} className="w-full rounded bg-transparent px-1 py-0.5 text-xs focus:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-60" placeholder="—" />
                                      </TableCell>
                                      <TableCell className="w-20 py-1.5">
                                        <input name={`project-${txIdx}`} autoComplete="off" aria-label={`Project for row ${txIdx + 1}`} value={tx.project} onChange={(e) => updateTransaction(txIdx, "project", e.target.value)} disabled={currentItem.status !== "ready"} className="w-full rounded bg-transparent px-1 py-0.5 text-xs focus:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-60" placeholder="—" />
                                      </TableCell>
                                    </>
                                  )}
                                  <TableCell className="w-24 py-1.5 pr-4 text-right">
                                    <input name={`debit-${txIdx}`} type="text" inputMode="decimal" aria-label={`Debit amount for row ${txIdx + 1}`} value={tx.debit != null ? formatSEK(tx.debit) : ""} onChange={(e) => updateTransaction(txIdx, "debit", parseSEK(e.target.value))} disabled={currentItem.status !== "ready"} className="w-full rounded bg-transparent px-1 py-0.5 text-right text-xs tabular-nums focus:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-60" placeholder="—" />
                                  </TableCell>
                                  <TableCell className="w-24 py-1.5 pr-4 text-right">
                                    <input name={`credit-${txIdx}`} type="text" inputMode="decimal" aria-label={`Credit amount for row ${txIdx + 1}`} value={tx.credit != null ? formatSEK(tx.credit) : ""} onChange={(e) => updateTransaction(txIdx, "credit", parseSEK(e.target.value))} disabled={currentItem.status !== "ready"} className="w-full rounded bg-transparent px-1 py-0.5 text-right text-xs tabular-nums focus:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-60" placeholder="—" />
                                  </TableCell>
                                  {currentItem.status === "ready" && (
                                    <TableCell className="px-2 py-1.5">
                                      <button type="button" className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100" onClick={() => removeTransactionRow(txIdx)} aria-label={`Remove transaction row ${txIdx + 1}`}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                              <TableRow className="border-t bg-muted/30">
                                <TableCell colSpan={showExtraCols ? 4 : 2} className="py-2 text-xs font-medium">Total</TableCell>
                                <TableCell className="w-24 py-2 pr-4 text-right text-xs font-medium tabular-nums">{formatSEK(currentTotals.totalDebit)} kr</TableCell>
                                <TableCell className="w-24 py-2 pr-4 text-right text-xs font-medium tabular-nums">{formatSEK(currentTotals.totalCredit)} kr</TableCell>
                                {currentItem.status === "ready" && <TableCell />}
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        {!currentTotals.isBalanced ? (
                          <p className="mt-2 text-xs text-destructive">⚠ Debits and credits must balance (difference: {formatSEK(Math.abs(currentTotals.totalDebit - currentTotals.totalCredit))} kr)</p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {currentItem.status === "ready" && (() => {
                    const needsMatch =
                      currentItem.documentStatus === "needs_match" ||
                      currentItem.documentStatus === "matching";
                    const resolution = matchResolutionByFileId[currentItem.fileId];
                    const canPost =
                      !needsMatch || Boolean(resolution);
                    return (
                      <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
                        {needsMatch && (
                          <div className="mr-auto flex items-center gap-2">
                            <Button
                              variant={resolution ? "ghost" : "outline"}
                              size="sm"
                              className="gap-2"
                              onClick={() => {
                                const name = encodeURIComponent(currentFile?.name ?? "document");
                                navigate(`/bank-transactions?matchFor=${currentItem.fileId}&docName=${name}`);
                              }}
                            >
                              <Link2 className="h-4 w-4" /> Match with bank
                            </Button>
                            <div className="flex items-center">
                            <Popover open={employeePickerOpen} onOpenChange={setEmployeePickerOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={resolution ? "default" : "outline"}
                                  size="sm"
                                  className={cn("gap-2", resolution && "rounded-r-none")}
                                >
                                  <Users className="h-4 w-4" />
                                  {resolution ? `Paid by ${resolution.label}` : "Paid by employee"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="start" className="w-64 p-0">
                                <Command>
                                  <CommandInput placeholder="Search employee…" autoFocus />
                                  <CommandList className="max-h-64">
                                    <CommandEmpty>No employees found.</CommandEmpty>
                                    <CommandGroup>
                                      {employees.map((e: Employee) => {
                                        const label = `${e.first_name} ${e.last_name}`.trim();
                                        return (
                                          <CommandItem
                                            key={e.id}
                                            value={`${label} ${e.role ?? ""}`}
                                            onSelect={() => {
                                              applyMatchResolution(label);
                                              setEmployeePickerOpen(false);
                                            }}
                                            className="flex flex-col items-start gap-0 text-xs"
                                          >
                                            <span className="font-medium text-foreground">{label}</span>
                                            {e.role && (
                                              <span className="text-[11px] text-muted-foreground">{e.role}</span>
                                            )}
                                          </CommandItem>
                                        );
                                      })}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            {resolution && (
                              <Button
                                variant="default"
                                size="sm"
                                aria-label="Undo paid by employee"
                                onClick={undoMatchResolution}
                                className="rounded-l-none border-l border-l-background/30 px-2"
                              >
                                <X className="size-3.5" />
                              </Button>
                            )}
                            </div>
                          </div>
                        )}
                        <Button variant="outline" onClick={handleDecline} className="gap-2" disabled={actionLoading}>
                          <X className="h-4 w-4" /> Decline
                        </Button>
                        <Button
                          onClick={handleAccept}
                          className="gap-2"
                          disabled={
                            actionLoading ||
                            currentItem.transactions.length === 0 ||
                            !currentTotals.isBalanced ||
                            !canPost
                          }
                          title={!canPost ? "Pick a payment source before posting" : undefined}
                        >
                          <Send className="h-4 w-4" /> Accept & Post to {pushLabel}
                        </Button>
                      </div>
                    );
                  })()}

                  {(currentItem.status === "accepted" || currentItem.status === "declined") && (
                    <div className="flex items-center justify-center border-t border-border px-6 py-4">
                      <Badge variant={currentItem.status === "accepted" ? "default" : "destructive"} className="text-sm">
                        {currentItem.status === "accepted" ? `✓ Accepted — Posted to ${pushLabel}` : "✗ Declined"}
                      </Badge>
                    </div>
                  )}
                </ResizablePanel>
              </ResizablePanelGroup>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={showFiscalYearDialog} onOpenChange={setShowFiscalYearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <AlertDialogTitle>Räkenskapsår saknas</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Det finns ingen räkenskapsperiod som täcker fakturadatumet för detta verifikat.
              Kontrollera att räkenskapsåret är korrekt inställt och att räkenskapsperioder
              har skapats under företagsprofilen i Inställningar.
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
};
