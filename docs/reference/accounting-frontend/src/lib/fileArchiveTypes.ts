export type LedgerType = "payable" | "receivable";

export interface ArchivedFile {
  id: string;
  name: string;
  file: File;
  url: string;
  processId?: string;
  s3Key?: string;
  ledgerEntryId?: string;
  voucherDescription?: string;
  voucherLines?: Array<{
    account_number: number;
    account_name?: string | null;
    debit: number;
    credit: number;
    description?: string | null;
  }>;
  supplier: string;
  supplierOrgNumber?: string;
  supplierVatNumber?: string;
  supplierAddress?: string;
  supplierCity?: string;
  supplierZipCode?: string;
  supplierCountryCode?: string;
  invoiceDate: Date;
  invoiceNumber?: string;
  amount?: number;
  vatAmount?: number;
  dueDate?: Date;
  currency?: string;
  fxCurrency?: string;
  fxRate?: number;
  fxRateDate?: string;
  fxOriginalAmount?: number;
  fxConvertedSek?: number;
  sourceText?: string;
  category: string;
  bookkeepingStatus: "pending" | "processed" | "flagged";
  /** Raw backend document status (e.g. "extracting", "structuring", "classifying") */
  documentStatus?: string;
  /** Source of the document: "uploaded" (manual) | "gmail" | etc. */
  importSource?: string;
  uploadedAt: Date;
  retentionExpiry: Date;
  ledgerType: LedgerType;
}

export interface BackendDocumentLike {
  id: string;
  process_id: string;
  s3_key: string;
  file_type: string;
  original_filename: string;
  status: string;
  import_source?: string | null;
  created_at: string;
}

export interface BackendReviewAccountingEntryLike {
  id: string;
  source_id: string | null;
  description?: string | null;
  status: string;
  document_status?: string | null;
  lines: Array<{
    account_number: string | number;
    account_name?: string | null;
    debit: number;
    credit: number;
    description?: string | null;
  }>;
  invoice_metadata?: {
    description?: string;
    supplier_name?: string;
    supplier_org_number?: string;
    supplier_vat_number?: string;
    supplier_address?: string;
    supplier_city?: string;
    supplier_zip_code?: string;
    supplier_country_code?: string;
    invoice_number?: string;
    invoice_date?: string;
    due_date?: string;
    total_amount?: number;
    vat_amount?: number;
    fx_currency?: string;
    fx_rate?: number;
    fx_rate_date?: string;
    fx_original_amount?: number;
    fx_converted_sek?: number;
  } | null;
}

export interface TreeNode {
  label: string;
  type: "year" | "month" | "supplier" | "file";
  children?: TreeNode[];
  file?: ArchivedFile;
  fileCount: number;
  totalAmount: number;
}

const FILENAME_EXTENSION_REGEX = /\.[^/.]+$/;
const INVOICE_NUMBER_REGEX = /(inv(?:oice)?[-_\s]?[a-z0-9-]{3,})/i;
const AMOUNT_REGEX = /(^|[^\d])(\d{2,6}[.,]\d{2})([^\d]|$)/g;

function sanitizeName(value: string): string {
  return value.replace(FILENAME_EXTENSION_REGEX, "").replace(/[_-]+/g, " ").trim();
}

function inferSupplier(fileName: string): string {
  const base = sanitizeName(fileName);
  if (!base) return "Unknown Supplier";

  const [firstChunk] = base.split(/\s{2,}|\b(invoice|faktura|receipt|kvitto)\b/i);
  const candidate = (firstChunk ?? base).trim();
  return candidate.length > 2 ? candidate : "Unknown Supplier";
}

function inferInvoiceNumber(fileName: string): string | undefined {
  const base = sanitizeName(fileName);
  const match = base.match(INVOICE_NUMBER_REGEX);
  return match?.[1]?.toUpperCase();
}

function inferAmount(fileName: string): number | undefined {
  const base = sanitizeName(fileName);
  const matches = Array.from(base.matchAll(AMOUNT_REGEX));
  if (matches.length === 0) return undefined;

  const lastValue = matches[matches.length - 1]?.[2];
  if (!lastValue) return undefined;

  const parsed = Number.parseFloat(lastValue.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function createArchivedFileFromUpload({
  id,
  file,
  url,
  ledgerType,
  processId,
  s3Key,
  uploadedAt = new Date(),
}: {
  id: string;
  file: File;
  url: string;
  ledgerType: LedgerType;
  processId?: string;
  s3Key?: string;
  uploadedAt?: Date;
}): ArchivedFile {
  const invoiceDate = new Date(uploadedAt);

  return {
    id,
    name: file.name,
    file,
    url,
    processId,
    s3Key,
    supplier: inferSupplier(file.name),
    invoiceDate,
    invoiceNumber: inferInvoiceNumber(file.name),
    amount: inferAmount(file.name),
    currency: "SEK",
    category: ledgerType === "payable" ? "Uncategorized Expense" : "Uncategorized Revenue",
    bookkeepingStatus: "pending",
    uploadedAt,
    retentionExpiry: new Date(uploadedAt.getFullYear() + 7, uploadedAt.getMonth(), uploadedAt.getDate()),
    ledgerType,
  };
}

function mapBackendStatusToBookkeepingStatus(status: string): ArchivedFile["bookkeepingStatus"] {
  if (status === "approved" || status === "exported") {
    return "processed";
  }
  if (status === "failed" || status === "duplicate") {
    return "flagged";
  }
  return "pending";
}

function mapLedgerReviewStatusToBookkeepingStatus(status: string): ArchivedFile["bookkeepingStatus"] {
  if (status === "approved" || status === "exported") {
    return "processed";
  }
  if (status === "rejected") {
    return "flagged";
  }
  return "pending";
}

function mapBackendFileTypeToMime(fileType: string): string {
  if (fileType === "pdf") return "application/pdf";
  if (fileType === "jpeg" || fileType === "jpg") return "image/jpeg";
  if (fileType === "png") return "image/png";
  return "application/octet-stream";
}

export function createArchivedFileFromAccountingDocument({
  document,
  accountingEntry,
  url,
  ledgerType,
}: {
  document: BackendDocumentLike;
  accountingEntry?: BackendReviewAccountingEntryLike;
  url: string;
  ledgerType: LedgerType;
}): ArchivedFile {
  const createdAt = new Date(document.created_at);
  const uploadedAt = Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;
  const fileMimeType = mapBackendFileTypeToMime(document.file_type);

  const invoiceMeta = accountingEntry?.invoice_metadata;

  const supplierName = (invoiceMeta?.supplier_name || "").trim();
  const supplierOrgNumber = (invoiceMeta?.supplier_org_number || "").trim() || undefined;
  const supplierVatNumber = (invoiceMeta?.supplier_vat_number || "").trim() || undefined;
  const supplierAddress = (invoiceMeta?.supplier_address || "").trim() || undefined;
  const supplierCity = (invoiceMeta?.supplier_city || "").trim() || undefined;
  const supplierZipCode = (invoiceMeta?.supplier_zip_code || "").trim() || undefined;
  const supplierCountryCode = (invoiceMeta?.supplier_country_code || "").trim() || undefined;

  const invoiceNumber = (invoiceMeta?.invoice_number || "").trim() || undefined;
  const invoiceDateValue = (invoiceMeta?.invoice_date || "").trim();
  const parsedInvoiceDate = invoiceDateValue ? new Date(invoiceDateValue) : null;
  const resolvedInvoiceDate = parsedInvoiceDate && !Number.isNaN(parsedInvoiceDate.getTime())
    ? parsedInvoiceDate
    : uploadedAt;

  const dueDateValue = (invoiceMeta?.due_date || "").trim();
  const parsedDueDate = dueDateValue ? new Date(dueDateValue) : null;
  const dueDate = parsedDueDate && !Number.isNaN(parsedDueDate.getTime()) ? parsedDueDate : undefined;

  const totalAmount = typeof invoiceMeta?.total_amount === "number" ? invoiceMeta.total_amount : undefined;
  const vatAmount = typeof invoiceMeta?.vat_amount === "number" ? invoiceMeta.vat_amount : undefined;

  return {
    id: document.id,
    name: document.original_filename,
    file: new File([], document.original_filename, { type: fileMimeType }),
    url,
    processId: document.process_id,
    s3Key: document.s3_key,
    ledgerEntryId: accountingEntry?.id,
    voucherDescription: accountingEntry?.description || undefined,
    voucherLines: accountingEntry?.lines?.map((line) => ({
      account_number: Number(line.account_number),
      account_name: line.account_name,
      debit: line.debit,
      credit: line.credit,
      description: line.description,
    })),
    supplier: supplierName || inferSupplier(document.original_filename),
    supplierOrgNumber,
    supplierVatNumber,
    supplierAddress,
    supplierCity,
    supplierZipCode,
    supplierCountryCode,
    invoiceDate: resolvedInvoiceDate,
    dueDate,
    invoiceNumber: invoiceNumber || inferInvoiceNumber(document.original_filename),
    amount: totalAmount ?? inferAmount(document.original_filename),
    vatAmount,
    currency: invoiceMeta?.fx_currency || "SEK",
    fxCurrency: invoiceMeta?.fx_currency,
    fxRate: invoiceMeta?.fx_rate,
    fxRateDate: invoiceMeta?.fx_rate_date,
    fxOriginalAmount: invoiceMeta?.fx_original_amount,
    fxConvertedSek: invoiceMeta?.fx_converted_sek,
    sourceText: undefined,
    category: ledgerType === "payable" ? "Uncategorized Expense" : "Uncategorized Revenue",
    bookkeepingStatus: accountingEntry
      ? mapLedgerReviewStatusToBookkeepingStatus(accountingEntry.status === "posted" ? "approved" : "pending")
      : mapBackendStatusToBookkeepingStatus(document.status),
    documentStatus: accountingEntry?.document_status || document.status,
    importSource: document.import_source ?? undefined,
    uploadedAt,
    retentionExpiry: new Date(uploadedAt.getFullYear() + 7, uploadedAt.getMonth(), uploadedAt.getDate()),
    ledgerType,
  };
}


export function buildTree(files: ArchivedFile[]): TreeNode[] {
  const yearMap = new Map<number, Map<string, Map<string, ArchivedFile[]>>>();

  for (const f of files) {
    const year = f.invoiceDate.getFullYear();
    const month = f.invoiceDate.toLocaleString("default", { month: "long" });
    if (!yearMap.has(year)) yearMap.set(year, new Map());
    const monthMap = yearMap.get(year)!;
    if (!monthMap.has(month)) monthMap.set(month, new Map());
    const supplierMap = monthMap.get(month)!;
    if (!supplierMap.has(f.supplier)) supplierMap.set(f.supplier, []);
    supplierMap.get(f.supplier)!.push(f);
  }

  const tree: TreeNode[] = [];
  const sortedYears = [...yearMap.keys()].sort((a, b) => b - a);

  for (const year of sortedYears) {
    const monthMap = yearMap.get(year)!;
    const monthNodes: TreeNode[] = [];

    for (const [month, supplierMap] of monthMap) {
      const supplierNodes: TreeNode[] = [];

      for (const [supplier, sFiles] of supplierMap) {
        const fileNodes: TreeNode[] = sFiles.map((f) => ({
          label: f.name,
          type: "file" as const,
          file: f,
          fileCount: 1,
          totalAmount: f.amount ?? 0,
        }));
        supplierNodes.push({
          label: supplier,
          type: "supplier",
          children: fileNodes,
          fileCount: sFiles.length,
          totalAmount: sFiles.reduce((s, f) => s + (f.amount ?? 0), 0),
        });
      }

      monthNodes.push({
        label: month,
        type: "month",
        children: supplierNodes,
        fileCount: supplierNodes.reduce((s, n) => s + n.fileCount, 0),
        totalAmount: supplierNodes.reduce((s, n) => s + n.totalAmount, 0),
      });
    }

    tree.push({
      label: String(year),
      type: "year",
      children: monthNodes,
      fileCount: monthNodes.reduce((s, n) => s + n.fileCount, 0),
      totalAmount: monthNodes.reduce((s, n) => s + n.totalAmount, 0),
    });
  }

  return tree;
}
