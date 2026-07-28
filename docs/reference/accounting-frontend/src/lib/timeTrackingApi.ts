import { authenticatedApiRequest } from "@/lib/uploadApi";

export interface TimeEntry {
  id: string;
  user_id: string;
  client_company_id: string | null;
  client_name: string | null;
  description: string | null;
  start_time: string;
  stop_time: string | null;
  duration: number | null; // seconds
  date: string; // YYYY-MM-DD
  billable: boolean;
  billed: boolean;
  rate: string | null;
  currency: string;
  invoice_item_id: string | null;
  created_at: string;
  updated_at: string;
  elapsed_seconds: number | null;
}

export interface TimeEntryCreate {
  client_company_id?: string | null;
  description?: string | null;
  start_time: string;
  stop_time?: string | null;
  date: string;
  billable?: boolean;
  rate?: string | null;
  currency?: string;
}

export interface TimeEntryUpdate {
  client_company_id?: string | null;
  description?: string | null;
  start_time?: string;
  stop_time?: string | null;
  date?: string;
  billable?: boolean;
  rate?: string | null;
  currency?: string;
}

export interface TimerStartRequest {
  client_company_id?: string | null;
  description?: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TimeTrackingMeta {
  // Kept for API compatibility — fields are now empty
}

export interface NLParseResult {
  client_company_id: string | null;
  client_name_matched: string | null;
  description: string;
  duration_seconds: number;
  date: string;
  start_time: string | null;
}

export interface CreateInvoiceFromEntriesRequest {
  time_entry_ids: string[];
  invoice_date: string;
  due_date: string;
}

export interface CreateInvoiceResult {
  invoice_id: string;
  invoice_number: string;
}

export async function listTimeEntries(params?: {
  date_from?: string;
  date_to?: string;
  client_company_id?: string;
}): Promise<TimeEntry[]> {
  const qs = new URLSearchParams();
  if (params?.date_from) qs.set("date_from", params.date_from);
  if (params?.date_to) qs.set("date_to", params.date_to);
  if (params?.client_company_id) qs.set("client_company_id", params.client_company_id);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return authenticatedApiRequest<TimeEntry[]>(`/time-entries${query}`);
}

export async function createTimeEntry(data: TimeEntryCreate): Promise<TimeEntry> {
  return authenticatedApiRequest<TimeEntry>("/time-entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTimeEntry(id: string, data: TimeEntryUpdate): Promise<TimeEntry> {
  return authenticatedApiRequest<TimeEntry>(`/time-entries/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTimeEntry(id: string): Promise<void> {
  await authenticatedApiRequest<void>(`/time-entries/${id}`, { method: "DELETE" });
}

export async function startTimer(data: TimerStartRequest): Promise<TimeEntry> {
  return authenticatedApiRequest<TimeEntry>("/time-entries/timer/start", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function stopTimer(): Promise<TimeEntry | null> {
  return authenticatedApiRequest<TimeEntry | null>("/time-entries/timer/stop", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function getCurrentTimer(): Promise<TimeEntry | null> {
  return authenticatedApiRequest<TimeEntry | null>("/time-entries/timer/current");
}

export async function getTimeTrackingMeta(): Promise<TimeTrackingMeta> {
  return authenticatedApiRequest<TimeTrackingMeta>("/time-entries/meta");
}

export async function parseNaturalLanguage(text: string): Promise<NLParseResult> {
  return authenticatedApiRequest<NLParseResult>("/time-entries/parse", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function createInvoiceFromEntries(
  data: CreateInvoiceFromEntriesRequest
): Promise<CreateInvoiceResult> {
  return authenticatedApiRequest<CreateInvoiceResult>("/time-entries/create-invoice", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
