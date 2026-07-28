import { authenticatedApiRequest } from "@/lib/uploadApi";

export interface BankAccount {
  id: string;
  bank_name: string;
  account_label: string;
  account_number: string | null;
  currency: string;
  created_at: string;
}

export interface CreateBankAccountInput {
  bank_name: string;
  account_label: string;
  account_number?: string | null;
  currency?: string;
}

export interface BankImport {
  id: string;
  account_id: string;
  filename: string;
  row_count: number;
  new_count: number;
  duplicate_count: number;
  date_from: string | null;
  date_to: string | null;
  imported_at: string;
  account: BankAccount;
}

export interface ImportListOut {
  items: BankImport[];
  total: number;
  page: number;
  page_size: number;
}

export interface ImportResultOut {
  import_id: string;
  row_count: number;
  new_count: number;
  duplicate_count: number;
  date_from: string | null;
  date_to: string | null;
}

export interface BankTransaction {
  id: string;
  transaction_date: string;
  description: string;
  amount: string;
  balance: string | null;
  reconciliation_status: string;
  matched_document_id: string | null;
  match_id: string | null;
}

export interface TransactionListOut {
  items: BankTransaction[];
  total: number;
  page: number;
  page_size: number;
}

export async function listBankAccounts(): Promise<BankAccount[]> {
  const res = await authenticatedApiRequest<{ items: BankAccount[] }>("/bank-transactions/accounts");
  return res.items;
}

export async function createBankAccount(data: CreateBankAccountInput): Promise<BankAccount> {
  return authenticatedApiRequest<BankAccount>("/bank-transactions/accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteBankAccount(id: string): Promise<void> {
  await authenticatedApiRequest(`/bank-transactions/accounts/${id}`, { method: "DELETE" });
}

export async function listImports(accountId?: string, page = 1, pageSize = 50): Promise<ImportListOut> {
  const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (accountId) qs.set("account_id", accountId);
  return authenticatedApiRequest<ImportListOut>(`/bank-transactions/imports?${qs}`);
}

export async function importCsv(file: File, accountId: string, bankFormat: string): Promise<ImportResultOut> {
  const form = new FormData();
  form.append("file", file);
  form.append("account_id", accountId);
  form.append("bank_format", bankFormat);
  return authenticatedApiRequest<ImportResultOut>("/bank-transactions/import", {
    method: "POST",
    body: form,
  });
}

export async function deleteImport(id: string): Promise<void> {
  await authenticatedApiRequest(`/bank-transactions/imports/${id}`, { method: "DELETE" });
}

export async function listTransactions(importId: string, page = 1, pageSize = 50): Promise<TransactionListOut> {
  const qs = new URLSearchParams({ import_id: importId, page: String(page), page_size: String(pageSize) });
  return authenticatedApiRequest<TransactionListOut>(`/bank-transactions/transactions?${qs}`);
}

export async function createManualMatch(
  documentId: string,
  bankTransactionIds: string[],
): Promise<{ created: number; match_ids: string[] }> {
  return authenticatedApiRequest("/bank-matching/manual-match", {
    method: "POST",
    body: JSON.stringify({ document_id: documentId, bank_transaction_ids: bankTransactionIds }),
  });
}

export async function rejectBankMatch(matchId: string): Promise<void> {
  await authenticatedApiRequest(`/bank-matching/matches/${matchId}`, {
    method: "DELETE",
    body: JSON.stringify({}),
  });
}
