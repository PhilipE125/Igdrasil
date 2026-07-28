import { supabase } from "@/lib/supabase";
import { runtimeConfig } from "@/lib/runtimeConfig";

const API_BASE_URL = runtimeConfig.apiBaseUrl.replace(/\/$/, "");

// ── Active company ────────────────────────────────────────────────────────
// Set by CompanyContext on every company switch so all API calls carry the
// correct X-Company-Id header without prop-drilling.
let _activeCompanyId: string | null = null;
let _signingOut = false;
export function setActiveCompanyId(id: string | null) {
  _activeCompanyId = id;
}

interface UploadPresignResponse {
  process_id: string;
  presigned_url: string;
  s3_key: string;
}

interface UploadConfirmResponse {
  status: "uploaded" | "duplicate";
  message: string;
}

export interface FortnoxStatusResponse {
  connected: boolean;
  scopes: string | null;
  expires_at: string | null;
  bureau_client_tenant_id?: string | null;
}

export interface ProviderStatusResponse {
  connected: boolean;
  scopes: string | null;
}

interface FortnoxConnectResponse {
  authorization_url: string;
}

interface VismaConnectResponse {
  authorization_url: string;
}

export interface BackendDocument {
  id: string;
  process_id: string;
  s3_key: string;
  file_type: "pdf" | "jpeg" | "png" | string;
  original_filename: string;
  status: string;
  error_message: string | null;
  import_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendVoucherLine {
  account_number: number | string;
  account_name?: string | null;
  debit: number;
  credit: number;
  description?: string | null;
  cost_center?: string | null;
  project?: string | null;
  transaction_info?: string | null;
}

interface AccountingEntryApi {
  id: string;
  source_id: string | null;
  source_document_id?: string | null;
  source_document_ids?: string[];
  voucher_number: number;
  voucher_series: string;
  entry_date: string;
  document_date: string | null;
  posting_date?: string | null;
  description: string | null;
  llm_description?: string | null;
  source_type: string | null;
  intent?: string | null;
  entry_kind?: string | null;
  needs_input?: boolean | null;
  ready_to_post?: boolean | null;
  invoice_number?: string | null;
  payment_reference?: string | null;
  document_type: string | null;
  customer_id?: string | null;
  customer_name: string | null;
  status: string;
  fortnox_voucher_number?: string | null;
  fortnox_attachment_status?: string | null;
  fortnox_attachment_documents?: Array<{
    document_id: string;
    filename?: string | null;
    file_id?: string | null;
    archive_file_id?: string | null;
    status?: string | null;
    error?: string | null;
    voucher_number?: string | null;
    voucher_series?: string | null;
    voucher_year?: number | null;
    uploaded_at?: string | null;
    verified_at?: string | null;
    removed_at?: string | null;
  }>;
  exported_at?: string | null;
  export_provider?: string | null;
  original_currency: string | null;
  exchange_rate: number | null;
  exchange_rate_date: string | null;
  original_amount: number | null;
  base_amount?: number | null;
  supplier_id: string | null;
  buyer_name: string | null;
  source_text?: string | null;
  entry_context?: Record<string, unknown> | null;
  links?: Array<Record<string, unknown>>;
  lines: Array<{
    account_number: string;
    account_name?: string | null;
    debit: number;
    credit: number;
    original_debit?: number;
    original_credit?: number;
    description?: string | null;
    vat_code?: string | null;
    vat_rate?: number | null;
    quantity?: number | null;
    unit_price?: number | null;
    transaction_info?: string | null;
    line_type?: string | null;
    accrual_start?: string | null;
    accrual_end?: string | null;
    period_index?: number | null;
    period_count?: number | null;
  }>;
}

export interface BackendReviewAccountingEntry {
  id: string;
  source_id: string | null;
  source_document_id?: string | null;
  source_document_ids?: string[];
  voucher_number: number;
  voucher_series: string;
  entry_date: string;
  document_date: string | null;
  posting_date?: string | null;
  description: string | null;
  llm_description?: string | null;
  source_type: string | null;
  intent?: string | null;
  entry_kind?: string | null;
  needs_input?: boolean | null;
  ready_to_post?: boolean | null;
  document_type: string | null;
  customer_id?: string | null;
  customer_name: string | null;
  status: string;
  fortnox_voucher_number?: string | null;
  fortnox_attachment_status?: string | null;
  fortnox_attachment_documents?: Array<{
    document_id: string;
    filename?: string | null;
    file_id?: string | null;
    archive_file_id?: string | null;
    status?: string | null;
    error?: string | null;
    voucher_number?: string | null;
    voucher_series?: string | null;
    voucher_year?: number | null;
    uploaded_at?: string | null;
    verified_at?: string | null;
    removed_at?: string | null;
  }>;
  exported_at?: string | null;
  export_provider?: string | null;
  original_currency: string | null;
  exchange_rate: number | null;
  exchange_rate_date: string | null;
  original_amount: number | null;
  base_amount?: number | null;
  supplier_id: string | null;
  buyer_name: string | null;
  source_text?: string | null;
  entry_context?: Record<string, unknown> | null;
  document_status?: string | null;
  invoice_metadata?: {
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
    payment_reference?: string;
    card_last_four?: string;
    line_items?: unknown[];
    fx_currency?: string;
    fx_rate?: number;
    fx_rate_date?: string;
    fx_original_amount?: number;
    fx_converted_sek?: number;
  } | null;
  lines: {
    account_number: string;
    account_name?: string | null;
    debit: number;
    credit: number;
    original_debit?: number;
    original_credit?: number;
    description?: string | null;
    vat_code?: string | null;
    vat_rate?: number | null;
    quantity?: number | null;
    unit_price?: number | null;
    transaction_info?: string | null;
    line_type?: string | null;
    accrual_start?: string | null;
    accrual_end?: string | null;
    period_index?: number | null;
    period_count?: number | null;
  }[];
}

interface AccountingEntryInvoiceMetadata {
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
  payment_reference?: string;
  card_last_four?: string;
  line_items?: unknown[];
  fx_currency?: string;
  fx_rate?: number;
  fx_rate_date?: string;
  fx_original_amount?: number;
  fx_converted_sek?: number;
}

interface BackendDocumentListResponse {
  items: BackendDocument[];
  total: number;
  page: number;
  page_size: number;
}

interface BackendDocumentViewUrlResponse {
  url: string;
  expires_in: number;
}

function getStructuredInvoice(entry: AccountingEntryApi): Record<string, unknown> {
  const structured = entry.entry_context?.structured_invoice;
  return structured && typeof structured === "object" ? structured as Record<string, unknown> : {};
}

function getWorkflow(entry: AccountingEntryApi): Record<string, unknown> {
  const workflow = entry.entry_context?.workflow;
  return workflow && typeof workflow === "object" ? workflow as Record<string, unknown> : {};
}

function getSupplierSnapshot(entry: AccountingEntryApi): Record<string, unknown> {
  const supplier = entry.entry_context?.supplier;
  return supplier && typeof supplier === "object" ? supplier as Record<string, unknown> : {};
}

function buildAccountingEntryInvoiceMetadata(entry: AccountingEntryApi): AccountingEntryInvoiceMetadata {
  const structured = getStructuredInvoice(entry);
  const supplier = getSupplierSnapshot(entry);
  return {
    supplier_name: typeof supplier.name === "string" ? supplier.name : entry.customer_name ?? undefined,
    supplier_org_number: typeof supplier.org_number === "string" ? supplier.org_number : undefined,
    supplier_vat_number: typeof supplier.vat_number === "string" ? supplier.vat_number : undefined,
    supplier_address: typeof supplier.address === "string" ? supplier.address : undefined,
    supplier_city: typeof supplier.city === "string" ? supplier.city : undefined,
    supplier_zip_code: typeof supplier.zip_code === "string" ? supplier.zip_code : undefined,
    supplier_country_code: typeof supplier.country_code === "string" ? supplier.country_code : undefined,
    invoice_number: typeof structured.invoice_number === "string" ? structured.invoice_number : undefined,
    invoice_date: typeof structured.invoice_date === "string" ? structured.invoice_date : undefined,
    due_date: typeof structured.due_date === "string" ? structured.due_date : undefined,
    total_amount: typeof structured.total_amount === "number" ? structured.total_amount : undefined,
    vat_amount: typeof structured.total_vat === "number" ? structured.total_vat : undefined,
    payment_reference: typeof structured.payment_reference === "string" ? structured.payment_reference : undefined,
    card_last_four: typeof structured.card_last_four === "string" ? structured.card_last_four : undefined,
    line_items: Array.isArray(structured.line_items) ? structured.line_items : undefined,
    fx_currency: entry.original_currency ?? undefined,
    fx_rate: entry.exchange_rate ?? undefined,
    fx_rate_date: entry.exchange_rate_date ?? undefined,
    fx_original_amount: entry.original_amount ?? undefined,
    fx_converted_sek: entry.base_amount ?? undefined,
  };
}

function mapAccountingEntryToReviewItem(entry: AccountingEntryApi): BackendReviewAccountingEntry {
  const workflow = getWorkflow(entry);
  return {
    id: entry.id,
    source_id: entry.source_id,
    source_document_id: entry.source_document_id,
    source_document_ids: entry.source_document_ids,
    voucher_number: entry.voucher_number,
    voucher_series: entry.voucher_series,
    entry_date: entry.entry_date,
    document_date: entry.document_date,
    posting_date: entry.posting_date,
    description: entry.description,
    llm_description: entry.llm_description,
    source_type: entry.source_type,
    intent: entry.intent,
    entry_kind: entry.entry_kind,
    needs_input: entry.needs_input,
    ready_to_post: entry.ready_to_post,
    document_type: entry.document_type,
    customer_id: entry.customer_id,
    customer_name: entry.customer_name,
    status: entry.status,
    fortnox_voucher_number: entry.fortnox_voucher_number,
    fortnox_attachment_status: entry.fortnox_attachment_status,
    fortnox_attachment_documents: entry.fortnox_attachment_documents,
    exported_at: entry.exported_at,
    export_provider: entry.export_provider,
    original_currency: entry.original_currency,
    exchange_rate: entry.exchange_rate,
    exchange_rate_date: entry.exchange_rate_date,
    original_amount: entry.original_amount,
    base_amount: entry.base_amount,
    supplier_id: entry.supplier_id,
    buyer_name: entry.buyer_name,
    source_text: entry.source_text,
    entry_context: entry.entry_context,
    document_status: typeof workflow.document_status === "string" ? workflow.document_status : null,
    invoice_metadata: buildAccountingEntryInvoiceMetadata(entry),
    lines: entry.lines,
  };
}

function mapAccountingEntryToLedgerEntry(entry: AccountingEntryApi): LedgerEntry {
  return {
    id: entry.id,
    voucher_number: entry.voucher_number,
    voucher_series: entry.voucher_series,
    entry_date: entry.entry_date,
    document_date: entry.document_date,
    description: entry.description,
    source_type: entry.source_type,
    document_type: entry.document_type,
    customer_name: entry.customer_name,
    status: entry.status,
    original_currency: entry.original_currency,
    exchange_rate: entry.exchange_rate,
    exchange_rate_date: entry.exchange_rate_date,
    original_amount: entry.original_amount,
    supplier_id: entry.supplier_id,
    buyer_name: entry.buyer_name,
    lines: entry.lines.map((line) => ({
      account_number: line.account_number,
      account_name: line.account_name ?? "",
      debit: line.debit,
      credit: line.credit,
      original_debit: line.original_debit ?? 0,
      original_credit: line.original_credit ?? 0,
      description: line.description ?? null,
      vat_code: line.vat_code ?? null,
      line_type: line.line_type ?? null,
    })),
  };
}

const SUPPORTED_CONTENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

function inferContentType(file: File): string {
  if (SUPPORTED_CONTENT_TYPES.has(file.type)) {
    return file.type;
  }

  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".pdf")) return "application/pdf";
  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg";
  if (lowerName.endsWith(".png")) return "image/png";

  throw new Error(`Unsupported file type for ${file.name}. Only PDF, JPG/JPEG, and PNG are allowed.`);
}

export async function getAuthToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(`Failed to get auth session: ${error.message}`);
  }

  const token = data.session?.access_token;
  if (!token) {
    throw new Error("Not authenticated. Please sign in again.");
  }

  return token;
}

// Paths that do NOT require X-Company-Id (user-scoped or company-management endpoints).
const COMPANY_OPTIONAL_PREFIXES = ["/companies", "/uploads/known-hashes", "/pipeline/graph-definition"];

export async function authenticatedApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Fail fast if the request needs a company but none is active yet.
  if (!_activeCompanyId && !COMPANY_OPTIONAL_PREFIXES.some((p) => path.startsWith(p))) {
    throw new Error("No active company selected");
  }

  const token = await getAuthToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (_activeCompanyId) headers.set("X-Company-Id", _activeCompanyId);

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (!_signingOut) {
        _signingOut = true;
        try { await supabase.auth.signOut(); } finally { _signingOut = false; }
      }
      throw new Error("Session expired. Please sign in again.");
    }
    let detail = `${response.status} ${response.statusText}`;
    const rawBody = await response.text();
    if (rawBody) {
      try {
        const parsedBody = JSON.parse(rawBody) as {
          detail?: string | { msg?: string } | Array<{ msg?: string }>;
          message?: string;
        };

        if (typeof parsedBody.detail === "string") {
          detail = parsedBody.detail;
        } else if (Array.isArray(parsedBody.detail)) {
          const messages = parsedBody.detail
            .map((entry) => entry?.msg)
            .filter((msg): msg is string => Boolean(msg));
          detail = messages.length > 0 ? messages.join("; ") : JSON.stringify(parsedBody.detail);
        } else if (parsedBody.detail && typeof parsedBody.detail === "object") {
          detail = parsedBody.detail.msg || JSON.stringify(parsedBody.detail);
        } else if (parsedBody.message) {
          detail = parsedBody.message;
        } else {
          detail = rawBody;
        }
      } catch {
        detail = rawBody;
      }
    }
    throw new Error(`API request failed: ${detail}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const rawBody = await response.text();
    const snippet = rawBody.slice(0, 200).replace(/\s+/g, " ").trim();
    const url = `${API_BASE_URL}${path}`;
    throw new Error(
      `API returned non-JSON response (content-type: ${contentType || "<missing>"}) for ${url}. ` +
      `This usually means VITE_API_BASE_URL is wrong or the request is being routed to the frontend instead of the backend. ` +
      `Body starts with: ${JSON.stringify(snippet)}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function listDocuments(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<BackendDocument[]> {
  const search = new URLSearchParams();
  search.set("page", String(params?.page ?? 1));
  search.set("page_size", String(params?.pageSize ?? 100));
  if (params?.status) {
    search.set("status", params.status);
  }

  const response = await authenticatedApiRequest<BackendDocumentListResponse>(`/documents?${search.toString()}`);
  return response.items;
}

export async function getDocumentViewUrl(documentId: string): Promise<string> {
  const response = await authenticatedApiRequest<BackendDocumentViewUrlResponse>(`/documents/${documentId}/view-url`);
  return response.url;
}

export async function deleteDocument(documentId: string): Promise<void> {
  await authenticatedApiRequest(`/documents/${documentId}`, {
    method: "DELETE",
  });
}

export async function rerunDocument(
  documentId: string,
  stages?: string[],
): Promise<{ processId: string }> {
  const res = await authenticatedApiRequest<{ process_id: string }>(
    `/pipeline/rerun/${documentId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stages: stages ?? ["classify", "match"] }),
    },
  );
  return { processId: res.process_id };
}

export async function runAllUploaded(
  stages?: string[],
): Promise<{ queued: number; processIds: string[] }> {
  const res = await authenticatedApiRequest<{ queued: number; process_ids: string[] }>(
    "/pipeline/run-all",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stages: stages ?? ["classify", "match"] }),
    },
  );
  return { queued: res.queued, processIds: res.process_ids };
}

export async function listReviewAccountingEntries(params?: {
  status?: string;
  limit?: number;
}): Promise<BackendReviewAccountingEntry[]> {
  const search = new URLSearchParams();
  search.set("limit", String(params?.limit ?? 200));
  if (params?.status) search.set("status", params.status);
  const entries = await authenticatedApiRequest<AccountingEntryApi[]>(`/accounting-entries?${search.toString()}`);
  return entries
    .filter((entry) => entry.source_type === "pipeline")
    .map(mapAccountingEntryToReviewItem);
}

export async function updateLedgerDraft(
  entryId: string,
  payload: {
    lines: BackendVoucherLine[];
    description?: string;
    correction_reason?: string;
    invoice_metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const invoiceMetadata = payload.invoice_metadata ?? {};
  const customerData =
    invoiceMetadata.supplier_name ||
    invoiceMetadata.supplier_org_number ||
    invoiceMetadata.supplier_vat_number
      ? {
          partner_type: "supplier",
          name: typeof invoiceMetadata.supplier_name === "string" ? invoiceMetadata.supplier_name : null,
          org_number: typeof invoiceMetadata.supplier_org_number === "string" ? invoiceMetadata.supplier_org_number : null,
          vat_number: typeof invoiceMetadata.supplier_vat_number === "string" ? invoiceMetadata.supplier_vat_number : null,
          address: typeof invoiceMetadata.supplier_address === "string" ? invoiceMetadata.supplier_address : null,
          city: typeof invoiceMetadata.supplier_city === "string" ? invoiceMetadata.supplier_city : null,
          zip_code: typeof invoiceMetadata.supplier_zip_code === "string" ? invoiceMetadata.supplier_zip_code : null,
          country_code: typeof invoiceMetadata.supplier_country_code === "string" ? invoiceMetadata.supplier_country_code : null,
        }
      : undefined;

  await authenticatedApiRequest(`/accounting-entries/${entryId}`, {
    method: "PATCH",
    body: JSON.stringify({
      description: payload.description,
      lines: payload.lines,
      ...(customerData ? { customer: customerData } : {}),
      context_patch: {
        structured_invoice: invoiceMetadata,
        supplier: {
          name: invoiceMetadata.supplier_name ?? null,
          org_number: invoiceMetadata.supplier_org_number ?? null,
          vat_number: invoiceMetadata.supplier_vat_number ?? null,
          address: invoiceMetadata.supplier_address ?? null,
          city: invoiceMetadata.supplier_city ?? null,
          zip_code: invoiceMetadata.supplier_zip_code ?? null,
          country_code: invoiceMetadata.supplier_country_code ?? null,
        },
      },
    }),
  });
}

export async function approveLedgerDraft(entryId: string, _exportExternal = true): Promise<void> {
  await authenticatedApiRequest(`/accounting-entries/${entryId}/post`, { method: "POST" });
}

export async function rejectLedgerDraft(entryId: string): Promise<void> {
  await authenticatedApiRequest(`/accounting-entries/${entryId}/reject`, {
    method: "POST",
  });
}

export async function resolveDocumentMatch(
  documentId: string,
  method: "employee" | "tax",
  note?: string,
): Promise<void> {
  await authenticatedApiRequest(`/documents/${documentId}/resolve-match`, {
    method: "POST",
    body: JSON.stringify({ method, note: note ?? null }),
  });
}

export async function getFortnoxStatus(): Promise<FortnoxStatusResponse> {
  return authenticatedApiRequest<FortnoxStatusResponse>("/integrations/fortnox/status");
}

export interface ActiveProviderResponse {
  connected: boolean;
  provider: string | null;
  label: string;
}

export async function getActiveProvider(): Promise<ActiveProviderResponse> {
  return authenticatedApiRequest<ActiveProviderResponse>("/accounting-entries/active-provider");
}

export async function getFortnoxAuthorizationUrl(opts?: { returnTo?: "/settings" | "/onboarding"; serviceAccount?: boolean }): Promise<string> {
  const params = new URLSearchParams();
  if (opts?.returnTo) params.set("return_to", opts.returnTo);
  if (opts?.serviceAccount) params.set("service_account", "true");
  const qs = params.toString() ? `?${params.toString()}` : "";
  const response = await authenticatedApiRequest<FortnoxConnectResponse>(`/integrations/fortnox/connect${qs}`);
  return response.authorization_url;
}

export interface FortnoxBureauClient {
  tenant_id: string;
  company_name: string;
  client_id: string | null;
}

export async function getFortnoxBureauClients(): Promise<FortnoxBureauClient[]> {
  return authenticatedApiRequest<FortnoxBureauClient[]>("/integrations/fortnox/bureau-clients");
}

export async function selectFortnoxBureauClient(tenantId: string): Promise<void> {
  await authenticatedApiRequest("/integrations/fortnox/bureau-clients/select", {
    method: "POST",
    body: JSON.stringify({ tenant_id: tenantId }),
  });
}

export async function disconnectFortnox(): Promise<void> {
  await authenticatedApiRequest("/integrations/fortnox/disconnect", {
    method: "DELETE",
  });
}

// ── Visma ──────────────────────────────────────────────────────────────────

export async function getVismaStatus(): Promise<ProviderStatusResponse> {
  return authenticatedApiRequest<ProviderStatusResponse>("/integrations/visma/status");
}

export async function getVismaAuthorizationUrl(opts?: { returnTo?: "/settings" | "/onboarding" }): Promise<string> {
  const qs = opts?.returnTo ? `?return_to=${encodeURIComponent(opts.returnTo)}` : "";
  const response = await authenticatedApiRequest<VismaConnectResponse>(`/integrations/visma/connect${qs}`);
  return response.authorization_url;
}

export async function disconnectVisma(): Promise<void> {
  await authenticatedApiRequest("/integrations/visma/disconnect", {
    method: "DELETE",
  });
}

// ── Björn Lundén ───────────────────────────────────────────────────────────

export async function getBjornLundenStatus(): Promise<ProviderStatusResponse> {
  return authenticatedApiRequest<ProviderStatusResponse>("/integrations/bjornlunden/status");
}

export async function connectBjornLunden(credentials: {
  client_id: string;
  client_secret: string;
  user_key: string;
}): Promise<void> {
  await authenticatedApiRequest("/integrations/bjornlunden/connect", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function disconnectBjornLunden(): Promise<void> {
  await authenticatedApiRequest("/integrations/bjornlunden/disconnect", {
    method: "DELETE",
  });
}

// ── Briox ─────────────────────────────────────────────────────────────────

export async function getBrioxStatus(): Promise<ProviderStatusResponse> {
  return authenticatedApiRequest<ProviderStatusResponse>("/integrations/briox/status");
}

export async function connectBriox(credentials: {
  application_token: string;
}): Promise<void> {
  await authenticatedApiRequest("/integrations/briox/connect", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function disconnectBriox(): Promise<void> {
  await authenticatedApiRequest("/integrations/briox/disconnect", {
    method: "DELETE",
  });
}

// ── Bokio ─────────────────────────────────────────────────────────────────

export async function getBokioStatus(): Promise<ProviderStatusResponse> {
  return authenticatedApiRequest<ProviderStatusResponse>("/integrations/bokio/status");
}

export async function connectBokio(credentials: {
  api_token: string;
  company_id: string;
}): Promise<void> {
  await authenticatedApiRequest("/integrations/bokio/connect", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function disconnectBokio(): Promise<void> {
  await authenticatedApiRequest("/integrations/bokio/disconnect", {
    method: "DELETE",
  });
}

// ── Companies ────────────────────────────────────────────────────────────────

export interface CompanyResponse {
  id: string;
  name: string;
  org_number: string | null;
  fiscal_year_start: string | null;
  business_form: string | null;
  accounting_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyOptions {
  name: string;
  orgNumber?: string;
  fiscalYearStart?: string;  // MM-DD, e.g. "01-01" or "07-01"
  firstFiscalYear?: number;  // e.g. 2024
  businessForm?: string;
  accountingMethod?: string; // "accrual" or "cash"
}

export async function listCompanies(): Promise<CompanyResponse[]> {
  const response = await authenticatedApiRequest<{ items: CompanyResponse[] }>("/companies");
  return response.items ?? [];
}

export async function createCompany(opts: CreateCompanyOptions): Promise<CompanyResponse> {
  return authenticatedApiRequest<CompanyResponse>("/companies", {
    method: "POST",
    body: JSON.stringify({
      name: opts.name,
      org_number: opts.orgNumber ?? null,
      fiscal_year_start: opts.fiscalYearStart ?? "01-01",
      first_fiscal_year: opts.firstFiscalYear ?? null,
      business_form: opts.businessForm ?? null,
      accounting_method: opts.accountingMethod ?? null,
    }),
  });
}

// ── Accounting Hub ──────────────────────────────────────────────────────────

export interface AccountingCustomer {
  id: string;
  name: string;
  email: string | null;
  org_number: string | null;
  city: string | null;
  country_code: string | null;
  invoice_count: number;
  open_invoice_count: number;
  total_invoiced: number;
  outstanding_amount: number;
  last_invoice_date: string | null;
}

export interface AccountingSupplier {
  id: string;
  name: string;
  email: string | null;
  org_number: string | null;
  city: string | null;
  country_code: string | null;
  invoice_count: number;
  open_invoice_count: number;
  total_spend: number;
  settled_amount: number;
  outstanding_amount: number;
  last_invoice_date: string | null;
}

export async function listAccountingCustomers(limit = 200): Promise<AccountingCustomer[]> {
  return authenticatedApiRequest<AccountingCustomer[]>(`/accounting-hub/customers?limit=${limit}`);
}

export interface CustomerDetail {
  id: string;
  name: string;
  org_number: string | null;
  vat_number: string | null;
  fortnox_customer_number: string | null;
  customer_type: string | null;
  vat_type: string | null;
  currency: string | null;
  is_active: boolean;
  comments: string | null;
  // Billing address
  address: string | null;
  address2: string | null;
  city: string | null;
  zip_code: string | null;
  country_code: string | null;
  // Delivery address
  delivery_name: string | null;
  delivery_address1: string | null;
  delivery_address2: string | null;
  delivery_city: string | null;
  delivery_zip_code: string | null;
  delivery_country: string | null;
  delivery_country_code: string | null;
  delivery_phone1: string | null;
  delivery_phone2: string | null;
  // Visiting address
  visiting_address: string | null;
  visiting_city: string | null;
  visiting_zip_code: string | null;
  visiting_country: string | null;
  visiting_country_code: string | null;
  // Contact
  email: string | null;
  phone: string | null;
  phone2: string | null;
  fax: string | null;
  www: string | null;
  email_invoice: string | null;
  email_invoice_cc: string | null;
  email_invoice_bcc: string | null;
  email_offer: string | null;
  email_offer_cc: string | null;
  email_offer_bcc: string | null;
  email_order: string | null;
  email_order_cc: string | null;
  email_order_bcc: string | null;
  // Accounting defaults
  sales_account: string | null;
  terms_of_payment: string | null;
  terms_of_delivery: string | null;
  way_of_delivery: string | null;
  price_list: string | null;
  cost_center: string | null;
  project: string | null;
  our_reference: string | null;
  your_reference: string | null;
  // Invoice defaults
  invoice_administration_fee: string | null;
  invoice_discount: number | null;
  invoice_freight: string | null;
  invoice_remark: string | null;
  show_price_vat_included: boolean | null;
  // Identification
  external_reference: string | null;
  gln: string | null;
  gln_delivery: string | null;
  // Timestamps
  created_at: string | null;
  updated_at: string | null;
}

export type CustomerUpdateInput = Partial<Omit<CustomerDetail, "id" | "created_at" | "updated_at" | "fortnox_customer_number">>;

export async function getCustomerDetail(customerId: string): Promise<CustomerDetail> {
  return authenticatedApiRequest<CustomerDetail>(`/accounting-hub/customers/${customerId}`);
}

export async function updateCustomer(customerId: string, data: CustomerUpdateInput): Promise<CustomerDetail> {
  return authenticatedApiRequest<CustomerDetail>(`/accounting-hub/customers/${customerId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function listAccountingSuppliers(limit = 200): Promise<AccountingSupplier[]> {
  return authenticatedApiRequest<AccountingSupplier[]>(`/accounting-hub/suppliers?limit=${limit}`);
}

export interface CustomerInvoiceItemInput {
  description: string;
  quantity: number;
  unit?: string | null;
  unit_price: number;
  vat_rate?: number | null;
  revenue_account_number?: string | null;
  line_metadata?: Record<string, unknown>;
}

export interface CustomerInvoiceRecord {
  id: string;
  company_id: string;
  customer_id: string | null;
  invoice_number: string;
  status: string;
  document_type: string;
  accounting_method_snapshot: string;
  invoice_date: string;
  due_date: string;
  issued_at: string | null;
  sent_at: string | null;
  paid_at: string | null;
  currency: string;
  subtotal: number;
  vat_amount: number;
  total: number;
  paid_amount: number;
  remaining_amount: number;
  payment_reference: string | null;
  our_reference: string | null;
  your_reference: string | null;
  notes: string | null;
  source_document_id: string | null;
  issue_entry_id: string | null;
  last_settlement_entry_id: string | null;
  credited_invoice_id: string | null;
  fortnox_document_number: string | null;
  entry_context: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
  items: Array<{
    id: string;
    sort_order: number;
    description: string;
    quantity: number;
    unit: string | null;
    unit_price: number;
    line_total: number;
    vat_rate: number | null;
    vat_amount: number;
    revenue_account_number: string | null;
    line_metadata: Record<string, unknown>;
  }>;
}

export async function listCustomerInvoices(params?: {
  status?: string;
  customer_id?: string;
  limit?: number;
}): Promise<CustomerInvoiceRecord[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.customer_id) qs.set("customer_id", params.customer_id);
  qs.set("limit", String(params?.limit ?? 200));
  return authenticatedApiRequest<CustomerInvoiceRecord[]>(`/customer-invoices?${qs.toString()}`);
}

export async function createCustomerInvoice(payload: {
  customer?: {
    id?: string | null;
    partner_type?: string;
    name?: string | null;
    org_number?: string | null;
    vat_number?: string | null;
    address?: string | null;
    city?: string | null;
    zip_code?: string | null;
    country_code?: string | null;
    email?: string | null;
    phone?: string | null;
    payment_details?: Record<string, unknown> | null;
    metadata?: Record<string, unknown> | null;
  } | null;
  invoice_date: string;
  due_date: string;
  currency?: string;
  document_type?: string;
  payment_reference?: string | null;
  our_reference?: string | null;
  your_reference?: string | null;
  reference_type?: string | null;
  reference_number?: string | null;
  notes?: string | null;
  source_document_id?: string | null;
  entry_context?: Record<string, unknown>;
  items: CustomerInvoiceItemInput[];
}): Promise<{ invoice: CustomerInvoiceRecord }> {
  return authenticatedApiRequest<{ invoice: CustomerInvoiceRecord }>("/customer-invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCustomerInvoice(
  invoiceId: string,
  payload: {
    due_date?: string;
    payment_reference?: string | null;
    our_reference?: string | null;
    your_reference?: string | null;
    reference_type?: string | null;
    reference_number?: string | null;
    notes?: string | null;
    entry_context_patch?: Record<string, unknown>;
    items?: CustomerInvoiceItemInput[];
  },
): Promise<{ invoice: CustomerInvoiceRecord }> {
  return authenticatedApiRequest<{ invoice: CustomerInvoiceRecord }>(`/customer-invoices/${invoiceId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateCompany(id: string, data: Record<string, unknown>): Promise<CompanyResponse> {
  return authenticatedApiRequest<CompanyResponse>(`/companies/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCompany(id: string): Promise<void> {
  await authenticatedApiRequest(`/companies/${id}`, { method: "DELETE" });
}

// ── MCP Key Management ───────────────────────────────────────────────────────

export interface McpKeyOut {
  api_key: string;
  note: string;
}

export interface McpKeyStatus {
  has_key: boolean;
}

export async function generateMcpKey(companyId: string): Promise<McpKeyOut> {
  return authenticatedApiRequest<McpKeyOut>(`/companies/${companyId}/mcp-key`, {
    method: "POST",
  });
}

export async function revokeMcpKey(companyId: string): Promise<void> {
  await authenticatedApiRequest(`/companies/${companyId}/mcp-key`, { method: "DELETE" });
}

export async function getMcpKeyStatus(companyId: string): Promise<McpKeyStatus> {
  return authenticatedApiRequest<McpKeyStatus>(`/companies/${companyId}/mcp-key/status`);
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export interface MonthlyBreakdown {
  month: string;
  revenue: number;
  expenses: number;
}

export interface DashboardSummary {
  period: string;
  from_date: string;
  to_date: string;
  revenue: number;
  expenses: number;
  net_profit: number;
  invoice_count: number;
  supplier_invoice_count: number;
  document_count: number;
  monthly_breakdown: MonthlyBreakdown[];
  pipeline: Record<string, number>;
  fortnox_connected: boolean;
  sql_query?: string;
  source?: "cached" | "live";
  computed_at?: string;
}

export interface DashboardSupplier {
  name: string;
  total: number;
  invoice_count: number;
}

export interface DashboardCustomer {
  name: string;
  total: number;
  invoice_count: number;
}

export interface DashboardEntityResponse<T> {
  suppliers?: T[];
  customers?: T[];
  period: string;
  sql_query: string;
}

export interface DashboardActivity {
  id: string;
  filename: string;
  status: string;
  file_type: string;
  updated_at: string;
  created_at: string;
}

function dashboardParams(period: string, customFrom?: string, customTo?: string, extra?: Record<string, string>): string {
  const p = new URLSearchParams({ period, ...extra });
  if (period === "custom" && customFrom && customTo) {
    p.set("custom_from", customFrom);
    p.set("custom_to", customTo);
  }
  return `?${p.toString()}`;
}

export async function getDashboardSummary(
  period = "ytd",
  customFrom?: string,
  customTo?: string,
): Promise<DashboardSummary> {
  return authenticatedApiRequest<DashboardSummary>(`/dashboard/summary${dashboardParams(period, customFrom, customTo)}`);
}

export async function getDashboardSuppliers(
  period = "ytd",
  limit = 10,
  customFrom?: string,
  customTo?: string,
): Promise<{ suppliers: DashboardSupplier[]; period: string; sql_query: string }> {
  return authenticatedApiRequest(`/dashboard/suppliers${dashboardParams(period, customFrom, customTo, { limit: String(limit) })}`);
}

export async function getDashboardCustomers(
  period = "ytd",
  limit = 10,
  customFrom?: string,
  customTo?: string,
): Promise<{ customers: DashboardCustomer[]; period: string; sql_query: string }> {
  return authenticatedApiRequest(`/dashboard/customers${dashboardParams(period, customFrom, customTo, { limit: String(limit) })}`);
}

export async function getDashboardActivity(
  limit = 20,
): Promise<{ activity: DashboardActivity[] }> {
  return authenticatedApiRequest(`/dashboard/activity?limit=${limit}`);
}

export async function uploadFileToPipeline(
  file: File,
  precomputedHash?: string,
): Promise<{ processId: string; s3Key: string }> {
  const contentType = inferContentType(file);

  const presign = await authenticatedApiRequest<UploadPresignResponse>("/uploads/presign", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      content_type: contentType,
    }),
  });

  const uploadResponse = await fetch(presign.presigned_url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`S3 upload failed for ${file.name}: ${uploadResponse.status} ${uploadResponse.statusText}`);
  }

  const confirmBody: Record<string, string> = { process_id: presign.process_id };
  if (precomputedHash) confirmBody.file_hash = precomputedHash;

  const confirmResult = await authenticatedApiRequest<UploadConfirmResponse>("/uploads/confirm", {
    method: "POST",
    body: JSON.stringify(confirmBody),
  });

  if (confirmResult.status === "duplicate") {
    throw new Error(confirmResult.message || "This document has already been uploaded.");
  }

  return {
    processId: presign.process_id,
    s3Key: presign.s3_key,
  };
}

export async function getKnownHashes(): Promise<string[]> {
  return authenticatedApiRequest<string[]>("/uploads/known-hashes");
}

export { API_BASE_URL };


// ── Telegram ─────────────────────────────────────────────────────────────────

export interface TelegramStatusResponse {
  connected: boolean;
  bot_username: string | null;
  bot_name: string | null;
}

export interface TelegramConnectResponse {
  connected: boolean;
  bot_username: string;
  bot_name: string;
}

export interface TelegramLinkCodeResponse {
  code: string;
  bot_username: string | null;
  expires_in: number;
}

export interface TelegramLinkedUser {
  user_id: string;
  telegram_chat_id: number;
  telegram_username: string | null;
  telegram_first_name: string | null;
  linked_at: string;
}

export async function getTelegramStatus(): Promise<TelegramStatusResponse> {
  return authenticatedApiRequest<TelegramStatusResponse>("/telegram/status");
}

export async function connectTelegram(bot_token: string): Promise<TelegramConnectResponse> {
  return authenticatedApiRequest<TelegramConnectResponse>("/telegram/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bot_token }),
  });
}

export async function disconnectTelegram(): Promise<void> {
  await authenticatedApiRequest("/telegram/disconnect", { method: "DELETE" });
}

export async function generateTelegramLinkCode(): Promise<TelegramLinkCodeResponse> {
  return authenticatedApiRequest<TelegramLinkCodeResponse>("/telegram/generate-link-code", {
    method: "POST",
  });
}

export async function getTelegramLinkedUsers(): Promise<TelegramLinkedUser[]> {
  return authenticatedApiRequest<TelegramLinkedUser[]>("/telegram/linked-users");
}

// ── Fortnox Sync ────────────────────────────────────────────────────────────

export interface SyncStatusEntry {
  sync_type: string;
  status: string;
  records_synced: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export async function startFortnoxSync(): Promise<{ status: string; message: string }> {
  return authenticatedApiRequest("/sync/fortnox/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
}

export async function getFortnoxSyncStatus(): Promise<SyncStatusEntry[]> {
  return authenticatedApiRequest<SyncStatusEntry[]>("/sync/fortnox/status");
}

export interface FortnoxResetResponse {
  status: string;
  message: string;
  deleted: Record<string, number>;
}

export async function resetFortnoxData(): Promise<FortnoxResetResponse> {
  return authenticatedApiRequest("/sync/fortnox/reset", { method: "DELETE" });
}

// ── Fortnox Dimensions (Cost Centers & Projects) ────────────────────────────

export interface FortnoxCostCenter {
  code: string;
  description: string | null;
  active: boolean;
}

export interface FortnoxProject {
  project_number: string;
  description: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
}

export async function listFortnoxCostCenters(): Promise<FortnoxCostCenter[]> {
  return authenticatedApiRequest<FortnoxCostCenter[]>("/sync/ledger/cost-centers");
}

export async function listFortnoxProjects(): Promise<FortnoxProject[]> {
  return authenticatedApiRequest<FortnoxProject[]>("/sync/ledger/projects");
}

export interface ChartOfAccount {
  account_number: string;
  account_name: string;
  account_class: number | null;
  account_type: string | null;
  is_active: boolean;
}

export async function listChartOfAccounts(): Promise<ChartOfAccount[]> {
  return authenticatedApiRequest<ChartOfAccount[]>("/sync/ledger/accounts");
}

// ── Pipeline Runs ───────────────────────────────────────────────────────────

export interface PipelineRun {
  id: string;
  document_id: string | null;
  process_id: string;
  graph_name: string;
  stages: string[];
  status: string;
  node_history: unknown[];
  queries_log: unknown[];
  total_input_tokens: number;
  total_output_tokens: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export async function listPipelineRuns(limit = 50): Promise<PipelineRun[]> {
  return authenticatedApiRequest<PipelineRun[]>(`/pipeline/runs?limit=${limit}`);
}

export async function getPipelineRun(runId: string): Promise<PipelineRun> {
  return authenticatedApiRequest<PipelineRun>(`/pipeline/runs/${runId}`);
}

export async function getPipelineRunByProcess(processId: string): Promise<PipelineRun | null> {
  try {
    return await authenticatedApiRequest<PipelineRun>(`/pipeline/runs/by-process/${processId}`);
  } catch {
    // Returns null when the Lambda hasn't created the run record yet (204/404)
    return null;
  }
}

export async function getGraphDefinition(): Promise<{
  nodes: Array<{ id: string; label: string; type: string }>;
  edges: Array<{ source: string; target: string; condition?: string }>;
}> {
  return authenticatedApiRequest("/pipeline/graph-definition");
}

// ── Ledger ────────────────────────────────────────────────────────────────────

export interface LedgerEntry {
  id: string;
  voucher_number: number;
  voucher_series: string;
  entry_date: string;
  document_date: string | null;
  description: string | null;
  source_type: string | null;
  document_type: string | null;
  customer_name: string | null;
  status: string;
  original_currency: string | null;
  exchange_rate: number | null;
  exchange_rate_date: string | null;
  original_amount: number | null;
  supplier_id: string | null;
  buyer_name: string | null;
  lines: Array<{
    account_number: string;
    account_name: string;
    debit: number;
    credit: number;
    original_debit: number;
    original_credit: number;
    description: string | null;
    cost_center: string | null;
    project: string | null;
    transaction_info: string | null;
    vat_code: string | null;
    line_type: string | null;
  }>;
}

export interface AccountingEntrySearchResult {
  id: string;
  entry_date: string;
  status: string;
  intent: string | null;
  entry_kind: string | null;
  description: string | null;
  llm_description: string | null;
  customer_name: string | null;
  invoice_number: string | null;
  payment_reference: string | null;
  search_text?: string | null;
}

export async function listLedgerEntries(params?: {
  account?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  status?: string;
  limit?: number;
}): Promise<LedgerEntry[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.account) qs.set("account_number", params.account);
  if (params?.from_date) qs.set("from_date", params.from_date);
  if (params?.to_date) qs.set("to_date", params.to_date);
  if (params?.search) qs.set("search", params.search);
  qs.set("limit", String(params?.limit ?? 200));
  const entries = await authenticatedApiRequest<AccountingEntryApi[]>(`/accounting-entries?${qs.toString()}`);
  return entries.map(mapAccountingEntryToLedgerEntry);
}


export async function searchAccountingEntries(query: string, limit = 20): Promise<AccountingEntrySearchResult[]> {
  const qs = new URLSearchParams({ q: query, limit: String(limit) });
  return authenticatedApiRequest<AccountingEntrySearchResult[]>(`/accounting-entries/search?${qs.toString()}`);
}

// ── Saved Analytics Queries ──────────────────────────────────────────────────

export interface SavedAnalyticsQuery {
  id: string;
  title: string;
  sql_query: string;
  chart_config: { type: string; xKey: string; yKeys: string[]; yLabels?: string[] } | null;
  column_config: { key: string; header: string }[];
  last_result: { columns: string[]; data: Record<string, unknown>[]; row_count: number } | null;
  last_refreshed_at: string | null;
  created_at: string | null;
}

export async function listSavedQueries(): Promise<SavedAnalyticsQuery[]> {
  const resp = await authenticatedApiRequest<{ queries: SavedAnalyticsQuery[] }>("/analytics/saved-queries");
  return resp.queries;
}

export async function saveAnalyticsQuery(body: {
  title: string;
  sql_query: string;
  chart_config?: SavedAnalyticsQuery["chart_config"];
  column_config?: { key: string; header: string }[];
}): Promise<SavedAnalyticsQuery> {
  return authenticatedApiRequest<SavedAnalyticsQuery>("/analytics/saved-queries", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteSavedQuery(queryId: string): Promise<void> {
  await authenticatedApiRequest(`/analytics/saved-queries/${queryId}`, { method: "DELETE" });
}

export async function refreshSavedQuery(queryId: string): Promise<SavedAnalyticsQuery> {
  return authenticatedApiRequest<SavedAnalyticsQuery>(`/analytics/saved-queries/${queryId}/refresh`, {
    method: "POST",
  });
}

// ── Audit Log ──────────────────────────────────────────────────────────────

export interface AuditEvent {
  id: string;
  event_type: string;
  actor_type: string;
  user_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  previous_state: Record<string, unknown> | null;
  parent_event_id: string | null;
  hash: string | null;
  created_at: string;
}

export interface AuditLogResponse {
  items: AuditEvent[];
  total: number;
  page: number;
  page_size: number;
}

export interface ChainVerificationResponse {
  valid: boolean;
  entries: number;
  error: string | null;
}

export async function getAuditLog(params?: {
  event_type?: string;
  entity_type?: string;
  entity_id?: string;
  actor_type?: string;
  page?: number;
  page_size?: number;
}): Promise<AuditLogResponse> {
  const qs = new URLSearchParams();
  if (params?.event_type) qs.set("event_type", params.event_type);
  if (params?.entity_type) qs.set("entity_type", params.entity_type);
  if (params?.entity_id) qs.set("entity_id", params.entity_id);
  if (params?.actor_type) qs.set("actor_type", params.actor_type);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  const query = qs.toString();
  return authenticatedApiRequest<AuditLogResponse>(`/audit-log${query ? `?${query}` : ""}`);
}

export async function verifyAuditChain(): Promise<ChainVerificationResponse> {
  return authenticatedApiRequest<ChainVerificationResponse>("/audit-log/verify-chain");
}

// ── Gmail ────────────────────────────────────────────────────────────────────

export interface GmailStatusResponse {
  connected: boolean;
  last_synced_at: string | null;
  schedule_type: string | null;
  schedule_enabled: boolean | null;
  total_emails_processed: number | null;
  total_attachments_extracted: number | null;
  last_error: string | null;
}

export interface GmailSyncConfigResponse {
  schedule_type: string;
  schedule_cron: string | null;
  schedule_hour: number;
  schedule_enabled: boolean;
  label_filter: string | null;
  lookback_days: number;
}

export interface GmailSyncTriggerResponse {
  status: string;
  message: string;
  emails_scanned: number | null;
  attachments_extracted: number | null;
  documents_created: number | null;
}

export interface GmailEmailItem {
  id: string;
  gmail_message_id: string;
  sender_email: string;
  sender_name: string | null;
  subject: string | null;
  received_at: string;
  has_attachments: boolean;
  attachment_count: number;
  status: string;
  skip_reason: string | null;
  matched_employee_id: string | null;
  created_at: string;
}

export async function getGmailStatus(): Promise<GmailStatusResponse> {
  return authenticatedApiRequest<GmailStatusResponse>("/integrations/gmail/status");
}

export async function getGmailAuthorizationUrl(opts?: { returnTo?: string }): Promise<string> {
  const qs = opts?.returnTo ? `?return_to=${encodeURIComponent(opts.returnTo)}` : "";
  const response = await authenticatedApiRequest<{ authorization_url: string }>(`/integrations/gmail/connect${qs}`);
  return response.authorization_url;
}

export async function disconnectGmail(): Promise<void> {
  await authenticatedApiRequest("/integrations/gmail/disconnect", { method: "DELETE" });
}

export async function getGmailSyncConfig(): Promise<GmailSyncConfigResponse> {
  return authenticatedApiRequest<GmailSyncConfigResponse>("/integrations/gmail/sync/config");
}

export async function updateGmailSyncConfig(config: {
  schedule_type?: string;
  schedule_cron?: string;
  schedule_hour?: number;
  schedule_enabled?: boolean;
  label_filter?: string;
  lookback_days?: number;
}): Promise<GmailSyncConfigResponse> {
  return authenticatedApiRequest<GmailSyncConfigResponse>("/integrations/gmail/sync/config", {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

export async function triggerGmailSync(forceFull = false): Promise<GmailSyncTriggerResponse> {
  const qs = forceFull ? "?force_full=true" : "";
  return authenticatedApiRequest<GmailSyncTriggerResponse>(`/integrations/gmail/sync/trigger${qs}`, {
    method: "POST",
  });
}

export async function getGmailEmails(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<GmailEmailItem[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  const query = qs.toString();
  return authenticatedApiRequest<GmailEmailItem[]>(`/integrations/gmail/emails${query ? `?${query}` : ""}`);
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface FiscalPeriod {
  id: string;
  company_id: string;
  period_start: string;
  period_end: string;
  is_locked: boolean;
  is_closed: boolean;
  opening_balances_set: boolean;
  closed_at: string | null;
}

export interface ReportRow {
  account_number: string;
  account_name: string;
  amount: number;
}

export interface ReportSection {
  label: string;
  rows: ReportRow[];
  subtotal: number;
}

export interface BalanceSheetReport {
  assets: ReportSection[];
  equity_and_liabilities: ReportSection[];
  total_assets: number;
  total_equity_and_liabilities: number;
  period_result: number;
  is_balanced: boolean;
}

export interface IncomeStatementReport {
  revenue: ReportSection;
  cost_of_goods: ReportSection;
  external_expenses: ReportSection;
  personnel_costs: ReportSection;
  financial_items: ReportSection;
  total_revenue: number;
  total_operating_expenses: number;
  operating_result: number;
  result_after_financial: number;
  net_result: number;
}

export interface TrialBalanceRow {
  account_number: string;
  account_name: string;
  account_class: number;
  opening_debit: number;
  opening_credit: number;
  period_debit: number;
  period_credit: number;
  closing_debit: number;
  closing_credit: number;
}

export interface TrialBalanceReport {
  rows: TrialBalanceRow[];
  total_opening_debit: number;
  total_opening_credit: number;
  total_period_debit: number;
  total_period_credit: number;
  total_closing_debit: number;
  total_closing_credit: number;
  is_balanced: boolean;
}

export interface MomsRuta {
  ruta: number;
  label: string;
  amount: number;
}

export interface Momsdeklaration {
  rutor: MomsRuta[];
  moms_att_betala: number;
  breakdown: Array<{
    ruta: number;
    accounts: Array<{ account_number: string; debit: number; credit: number; net: number }>;
  }>;
}

export interface YearEndReadinessReport {
  ready: boolean;
  period_id: string;
  period_start: string;
  period_end: string;
  checks: Record<string, unknown>;
}

export async function listFiscalPeriods(): Promise<FiscalPeriod[]> {
  return authenticatedApiRequest<FiscalPeriod[]>("/fiscal-periods");
}

export async function getBalanceSheet(asOfDate: string): Promise<BalanceSheetReport> {
  return authenticatedApiRequest<BalanceSheetReport>(
    `/reports/${_activeCompanyId}/balance-sheet?as_of_date=${asOfDate}`,
  );
}

export async function getIncomeStatement(
  periodStart: string,
  periodEnd: string,
): Promise<IncomeStatementReport> {
  return authenticatedApiRequest<IncomeStatementReport>(
    `/reports/${_activeCompanyId}/income-statement?period_start=${periodStart}&period_end=${periodEnd}`,
  );
}

export async function getTrialBalance(
  periodStart: string,
  periodEnd: string,
): Promise<TrialBalanceReport> {
  return authenticatedApiRequest<TrialBalanceReport>(
    `/reports/${_activeCompanyId}/trial-balance?period_start=${periodStart}&period_end=${periodEnd}`,
  );
}

export async function getMomsdeklaration(
  periodStart: string,
  periodEnd: string,
): Promise<Momsdeklaration> {
  return authenticatedApiRequest<Momsdeklaration>(
    `/reports/${_activeCompanyId}/momsdeklaration?period_start=${periodStart}&period_end=${periodEnd}`,
  );
}

export async function getYearEndReadiness(fiscalPeriodId: string): Promise<YearEndReadinessReport> {
  return authenticatedApiRequest<YearEndReadinessReport>(
    `/reports/${_activeCompanyId}/year-end-readiness?fiscal_period_id=${fiscalPeriodId}`,
  );
}

// ── Regulatory report types ────────────────────────────────────────────────

export type VatPeriodType = "monthly" | "quarterly" | "yearly";

export interface VatDeclarationReport extends Momsdeklaration {
  period_type: VatPeriodType;
  year: number;
  period: number;
  period_start: string;
  period_end: string;
}

export interface NeBilagaSummary {
  totalRevenue: number;
  totalExpenses: number;
  netResult: number;
}

export interface NeBilagaReport {
  fiscalYear: { id: string; start: string; end: string; isClosed: boolean };
  rutor: Record<string, number>;
  breakdown: Record<string, { accounts: { accountNumber: string; accountName: string; amount: number }[]; total: number }>;
  companyInfo: { companyName: string; orgNumber: string | null };
  warnings: string[];
  summary: NeBilagaSummary;
}

export interface Ink2Summary {
  totalAssets: number;
  totalEquityAndLiabilities: number;
  revenue: number;
  expenses: number;
  resultAfterFinancial: number;
  beraknadBolagsskatt: number;
}

export interface Ink2Report {
  fiscalYear: { id: string; start: string; end: string; isClosed: boolean };
  rutor: Record<string, number>;
  breakdown: Record<string, { accounts: { accountNumber: string; accountName: string; amount: number }[]; total: number; description: string }>;
  companyInfo: { companyName: string; orgNumber: string | null };
  warnings: string[];
  summary: Ink2Summary;
}

// ── Regulatory API functions ───────────────────────────────────────────────

export async function getVatDeclaration(
  periodType: VatPeriodType,
  year: number,
  period: number,
): Promise<VatDeclarationReport> {
  return authenticatedApiRequest<VatDeclarationReport>(
    `/reports/${_activeCompanyId}/vat-declaration?period_type=${periodType}&year=${year}&period=${period}`,
  );
}

export async function getNeBilaga(periodId: string): Promise<NeBilagaReport> {
  return authenticatedApiRequest<NeBilagaReport>(
    `/reports/${_activeCompanyId}/ne-bilaga?period_id=${periodId}&format=json`,
  );
}

export async function getInk2(periodId: string): Promise<Ink2Report> {
  return authenticatedApiRequest<Ink2Report>(
    `/reports/${_activeCompanyId}/ink2?period_id=${periodId}&format=json`,
  );
}

/** Trigger a browser download for an authenticated file endpoint. */
async function _downloadFile(path: string, filename: string): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? "";
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (_activeCompanyId) headers["X-Company-Id"] = _activeCompanyId;
  const res = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadNeBilagaSru(periodId: string, year: string): Promise<void> {
  return _downloadFile(
    `/reports/${_activeCompanyId}/ne-bilaga?period_id=${periodId}&format=sru`,
    `NE_${year}.sru`,
  );
}

export function downloadInk2Sru(periodId: string, year: string): Promise<void> {
  return _downloadFile(
    `/reports/${_activeCompanyId}/ink2?period_id=${periodId}&format=sru`,
    `INK2_${year}.sru`,
  );
}

export function downloadAuditTrail(format: "json" | "csv", filters?: {
  eventType?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<void> {
  const p = new URLSearchParams({ format });
  if (filters?.eventType) p.set("event_type", filters.eventType);
  if (filters?.entityType) p.set("entity_type", filters.entityType);
  if (filters?.fromDate) p.set("from_date", filters.fromDate);
  if (filters?.toDate) p.set("to_date", filters.toDate);
  return _downloadFile(
    `/reports/${_activeCompanyId}/audit-trail?${p}`,
    `audit_trail.${format}`,
  );
}

export function downloadFullArchive(periodId: string, includeDocuments = true): Promise<void> {
  return _downloadFile(
    `/reports/${_activeCompanyId}/full-archive?period_id=${periodId}&include_documents=${includeDocuments}`,
    `arkiv_${periodId}.zip`,
  );
}
