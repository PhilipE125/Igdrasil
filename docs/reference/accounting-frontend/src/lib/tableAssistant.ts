import type { BankImport } from "@/lib/bankApi";
import type {
  AccountingCustomer,
  AccountingSupplier,
  LedgerEntry,
} from "@/lib/uploadApi";

export interface InlineAssistantResult<Row> {
  prompt: string;
  interpretation: string;
  sql: string;
  rows: Row[];
  rowCount: number;
}

const STOP_WORDS = [
  " with ",
  " where ",
  " sorted ",
  " order ",
  " showing ",
  " show ",
  " and ",
];

function normalizePrompt(prompt: string) {
  return prompt.trim().replace(/\s+/g, " ");
}

function escapeSql(value: string) {
  return value.replace(/'/g, "''");
}

function stripTrailingClause(value: string) {
  let output = value.trim();
  for (const marker of STOP_WORDS) {
    const index = output.indexOf(marker);
    if (index >= 0) {
      output = output.slice(0, index).trim();
    }
  }
  return output.replace(/[.,]$/, "").trim();
}

function extractMoneyComparison(prompt: string) {
  const match = prompt.match(
    /\b(over|above|more than|greater than|under|below|less than)\s+([0-9][0-9\s.,]*)/i,
  );
  if (!match) return null;
  const value = Number(match[2].replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(value)) return null;
  return {
    operator: /under|below|less than/i.test(match[1]) ? "<" : ">",
    value,
  } as const;
}

function extractCountComparison(prompt: string) {
  const match = prompt.match(
    /\b(over|above|more than|greater than|under|below|less than)\s+(\d+)\s+(?:invoice|invoices|faktura|fakturor|transaction|transactions)/i,
  );
  if (!match) return null;
  return {
    operator: /under|below|less than/i.test(match[1]) ? "<" : ">",
    value: Number(match[2]),
  } as const;
}

function extractDateRange(prompt: string) {
  const between = prompt.match(/\bbetween\s+(\d{4}-\d{2}-\d{2})\s+and\s+(\d{4}-\d{2}-\d{2})/i);
  if (between) {
    return { from: between[1], to: between[2] };
  }
  const after = prompt.match(/\b(?:after|since|from)\s+(\d{4}-\d{2}-\d{2})/i);
  const before = prompt.match(/\b(?:before|until|to)\s+(\d{4}-\d{2}-\d{2})/i);
  if (!after && !before) return null;
  return { from: after?.[1] ?? null, to: before?.[1] ?? null };
}

function includesAny(haystack: string, needles: string[]) {
  return needles.some((needle) => haystack.includes(needle));
}

function findPhraseAfter(prompt: string, token: string) {
  const normalized = ` ${prompt.toLowerCase()} `;
  const marker = ` ${token.toLowerCase()} `;
  const start = normalized.indexOf(marker);
  if (start < 0) return null;
  return stripTrailingClause(normalized.slice(start + marker.length));
}

function formatConditionSummary(parts: string[], fallback: string) {
  return parts.length > 0 ? parts.join(", ") : fallback;
}

export function runCustomerTableAssistant(
  rows: AccountingCustomer[],
  rawPrompt: string,
): InlineAssistantResult<AccountingCustomer> | null {
  const prompt = normalizePrompt(rawPrompt);
  if (!prompt) return null;

  const lower = prompt.toLowerCase();
  let filtered = [...rows];
  const conditions: string[] = [];
  const notes: string[] = [];

  if (includesAny(lower, ["open", "outstanding", "unpaid", "overdue"])) {
    filtered = filtered.filter((row) => row.open_invoice_count > 0);
    conditions.push("open_invoice_count > 0");
    notes.push("customers with open invoices");
  } else if (includesAny(lower, ["settled", "paid", "closed"])) {
    filtered = filtered.filter((row) => row.open_invoice_count === 0);
    conditions.push("open_invoice_count = 0");
    notes.push("fully settled customers");
  }

  const cityTerm =
    findPhraseAfter(prompt, "city") ??
    (lower.includes(" in ") ? findPhraseAfter(prompt, "in") : null);
  if (cityTerm && !includesAny(cityTerm, ["invoice", "invoices", "customer", "customers"])) {
    filtered = filtered.filter((row) => (row.city ?? "").toLowerCase().includes(cityTerm));
    conditions.push(`LOWER(city) LIKE '%${escapeSql(cityTerm)}%'`);
    notes.push(`city containing "${cityTerm}"`);
  }

  const comparison = extractMoneyComparison(prompt);
  if (comparison) {
    const targetColumn = includesAny(lower, ["outstanding", "open", "receivable", "unpaid"])
      ? "outstanding_amount"
      : "total_invoiced";
    filtered = filtered.filter((row) =>
      comparison.operator === ">"
        ? row[targetColumn] > comparison.value
        : row[targetColumn] < comparison.value,
    );
    conditions.push(`${targetColumn} ${comparison.operator} ${comparison.value}`);
    notes.push(`${targetColumn.replace(/_/g, " ")} ${comparison.operator === ">" ? "over" : "under"} ${comparison.value}`);
  }

  const invoiceCount = extractCountComparison(prompt);
  if (invoiceCount) {
    filtered = filtered.filter((row) =>
      invoiceCount.operator === ">"
        ? row.invoice_count > invoiceCount.value
        : row.invoice_count < invoiceCount.value,
    );
    conditions.push(`invoice_count ${invoiceCount.operator} ${invoiceCount.value}`);
    notes.push(`invoice count ${invoiceCount.operator === ">" ? "over" : "under"} ${invoiceCount.value}`);
  }

  if (conditions.length === 0) {
    filtered = filtered.filter((row) =>
      [row.name, row.email ?? "", row.org_number ?? "", row.city ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(lower),
    );
    conditions.push(
      `LOWER(CONCAT_WS(' ', name, email, org_number, city)) LIKE '%${escapeSql(lower)}%'`,
    );
    notes.push(`text matching "${prompt}"`);
  }

  if (includesAny(lower, ["top", "highest", "largest"])) {
    filtered.sort((a, b) => b.total_invoiced - a.total_invoiced);
  }

  return {
    prompt,
    interpretation: `Showing ${formatConditionSummary(notes, "customers matching the search")}.`,
    sql: [
      "SELECT *",
      "FROM accounting_customers",
      `WHERE ${conditions.join("\n  AND ")}`,
      includesAny(lower, ["top", "highest", "largest"])
        ? "ORDER BY total_invoiced DESC"
        : "ORDER BY LOWER(name) ASC",
      ";",
    ].join("\n"),
    rows: filtered,
    rowCount: filtered.length,
  };
}

export function runSupplierTableAssistant(
  rows: AccountingSupplier[],
  rawPrompt: string,
): InlineAssistantResult<AccountingSupplier> | null {
  const prompt = normalizePrompt(rawPrompt);
  if (!prompt) return null;

  const lower = prompt.toLowerCase();
  let filtered = [...rows];
  const conditions: string[] = [];
  const notes: string[] = [];

  if (includesAny(lower, ["open", "outstanding", "unpaid", "due"])) {
    filtered = filtered.filter((row) => row.open_invoice_count > 0);
    conditions.push("open_invoice_count > 0");
    notes.push("suppliers with open invoices");
  } else if (includesAny(lower, ["settled", "paid", "closed"])) {
    filtered = filtered.filter((row) => row.open_invoice_count === 0);
    conditions.push("open_invoice_count = 0");
    notes.push("fully settled suppliers");
  }

  const cityTerm =
    findPhraseAfter(prompt, "city") ??
    (lower.includes(" in ") ? findPhraseAfter(prompt, "in") : null);
  if (cityTerm && !includesAny(cityTerm, ["invoice", "invoices", "supplier", "suppliers"])) {
    filtered = filtered.filter((row) => (row.city ?? "").toLowerCase().includes(cityTerm));
    conditions.push(`LOWER(city) LIKE '%${escapeSql(cityTerm)}%'`);
    notes.push(`city containing "${cityTerm}"`);
  }

  const comparison = extractMoneyComparison(prompt);
  if (comparison) {
    const targetColumn = includesAny(lower, ["outstanding", "open", "payable", "unpaid"])
      ? "outstanding_amount"
      : "total_spend";
    filtered = filtered.filter((row) =>
      comparison.operator === ">"
        ? row[targetColumn] > comparison.value
        : row[targetColumn] < comparison.value,
    );
    conditions.push(`${targetColumn} ${comparison.operator} ${comparison.value}`);
    notes.push(`${targetColumn.replace(/_/g, " ")} ${comparison.operator === ">" ? "over" : "under"} ${comparison.value}`);
  }

  const invoiceCount = extractCountComparison(prompt);
  if (invoiceCount) {
    filtered = filtered.filter((row) =>
      invoiceCount.operator === ">"
        ? row.invoice_count > invoiceCount.value
        : row.invoice_count < invoiceCount.value,
    );
    conditions.push(`invoice_count ${invoiceCount.operator} ${invoiceCount.value}`);
    notes.push(`invoice count ${invoiceCount.operator === ">" ? "over" : "under"} ${invoiceCount.value}`);
  }

  if (conditions.length === 0) {
    filtered = filtered.filter((row) =>
      [row.name, row.email ?? "", row.org_number ?? "", row.city ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(lower),
    );
    conditions.push(
      `LOWER(CONCAT_WS(' ', name, email, org_number, city)) LIKE '%${escapeSql(lower)}%'`,
    );
    notes.push(`text matching "${prompt}"`);
  }

  if (includesAny(lower, ["top", "highest", "largest"])) {
    filtered.sort((a, b) => b.total_spend - a.total_spend);
  }

  return {
    prompt,
    interpretation: `Showing ${formatConditionSummary(notes, "suppliers matching the search")}.`,
    sql: [
      "SELECT *",
      "FROM accounting_suppliers",
      `WHERE ${conditions.join("\n  AND ")}`,
      includesAny(lower, ["top", "highest", "largest"])
        ? "ORDER BY total_spend DESC"
        : "ORDER BY LOWER(name) ASC",
      ";",
    ].join("\n"),
    rows: filtered,
    rowCount: filtered.length,
  };
}

function ledgerTotal(entry: LedgerEntry) {
  return entry.lines.reduce((sum, line) => sum + line.debit, 0);
}

export function runLedgerTableAssistant(
  rows: LedgerEntry[],
  rawPrompt: string,
): InlineAssistantResult<LedgerEntry> | null {
  const prompt = normalizePrompt(rawPrompt);
  if (!prompt) return null;

  const lower = prompt.toLowerCase();
  let filtered = [...rows];
  const conditions: string[] = [];
  const notes: string[] = [];

  const accountMatch = prompt.match(/\b(?:account|konto)\s+(\d{3,5})\b/i);
  if (accountMatch) {
    const account = accountMatch[1];
    filtered = filtered.filter((row) => row.lines.some((line) => line.account_number.startsWith(account)));
    conditions.push(
      `EXISTS (SELECT 1 FROM ledger_entry_lines l WHERE l.entry_id = e.id AND l.account_number LIKE '${escapeSql(account)}%')`,
    );
    notes.push(`account ${account}`);
  }

  if (includesAny(lower, ["posted", "bokförd"])) {
    filtered = filtered.filter((row) => row.status === "posted");
    conditions.push("e.status = 'posted'");
    notes.push("posted entries");
  } else if (includesAny(lower, ["draft", "utkast"])) {
    filtered = filtered.filter((row) => row.status === "draft");
    conditions.push("e.status = 'draft'");
    notes.push("draft entries");
  } else if (includesAny(lower, ["cancelled", "makulerad"])) {
    filtered = filtered.filter((row) => row.status === "cancelled");
    conditions.push("e.status = 'cancelled'");
    notes.push("cancelled entries");
  }

  const dateRange = extractDateRange(prompt);
  if (dateRange?.from) {
    filtered = filtered.filter((row) => row.entry_date >= dateRange.from!);
    conditions.push(`e.entry_date >= DATE '${dateRange.from}'`);
    notes.push(`from ${dateRange.from}`);
  }
  if (dateRange?.to) {
    filtered = filtered.filter((row) => row.entry_date <= dateRange.to!);
    conditions.push(`e.entry_date <= DATE '${dateRange.to}'`);
    notes.push(`until ${dateRange.to}`);
  }

  const comparison = extractMoneyComparison(prompt);
  if (comparison) {
    filtered = filtered.filter((row) =>
      comparison.operator === ">"
        ? ledgerTotal(row) > comparison.value
        : ledgerTotal(row) < comparison.value,
    );
    conditions.push(`COALESCE(SUM(l.debit_amount), 0) ${comparison.operator} ${comparison.value}`);
    notes.push(`entry amount ${comparison.operator === ">" ? "over" : "under"} ${comparison.value}`);
  }

  if (conditions.length === 0) {
    filtered = filtered.filter((row) =>
      [
        row.customer_name ?? "",
        row.description ?? "",
        row.buyer_name ?? "",
        row.document_type ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(lower),
    );
    conditions.push(
      `LOWER(CONCAT_WS(' ', e.customer_name, e.description, e.buyer_name, e.document_type)) LIKE '%${escapeSql(lower)}%'`,
    );
    notes.push(`text matching "${prompt}"`);
  }

  if (includesAny(lower, ["largest", "highest", "biggest"])) {
    filtered.sort((a, b) => ledgerTotal(b) - ledgerTotal(a));
  } else if (includesAny(lower, ["oldest"])) {
    filtered.sort((a, b) => a.entry_date.localeCompare(b.entry_date));
  } else {
    filtered.sort((a, b) => b.entry_date.localeCompare(a.entry_date));
  }

  return {
    prompt,
    interpretation: `Showing ${formatConditionSummary(notes, "ledger entries matching the search")}.`,
    sql: [
      "SELECT e.id, e.entry_date, e.customer_name, e.description, e.status,",
      "       COALESCE(SUM(l.debit_amount), 0) AS total_amount",
      "FROM ledger_entries e",
      "LEFT JOIN ledger_entry_lines l ON l.entry_id = e.id",
      `WHERE ${conditions.join("\n  AND ")}`,
      "GROUP BY e.id, e.entry_date, e.customer_name, e.description, e.status",
      includesAny(lower, ["largest", "highest", "biggest"])
        ? "ORDER BY total_amount DESC"
        : includesAny(lower, ["oldest"])
          ? "ORDER BY e.entry_date ASC"
          : "ORDER BY e.entry_date DESC",
      ";",
    ].join("\n"),
    rows: filtered,
    rowCount: filtered.length,
  };
}

export function runBankImportTableAssistant(
  rows: BankImport[],
  rawPrompt: string,
): InlineAssistantResult<BankImport> | null {
  const prompt = normalizePrompt(rawPrompt);
  if (!prompt) return null;

  const lower = prompt.toLowerCase();
  let filtered = [...rows];
  const conditions: string[] = [];
  const notes: string[] = [];

  const matchedAccount = rows.find((row) =>
    `${row.account.bank_name} ${row.account.account_label}`.toLowerCase().includes(lower),
  );
  if (matchedAccount) {
    filtered = filtered.filter((row) => row.account_id === matchedAccount.account_id);
    conditions.push(`bi.account_id = '${matchedAccount.account_id}'`);
    notes.push(`${matchedAccount.account.account_label}`);
  }

  const dateRange = extractDateRange(prompt);
  if (dateRange?.from) {
    filtered = filtered.filter((row) => (row.date_from ?? row.imported_at.slice(0, 10)) >= dateRange.from!);
    conditions.push(`COALESCE(bi.date_from, bi.imported_at::date) >= DATE '${dateRange.from}'`);
    notes.push(`from ${dateRange.from}`);
  }
  if (dateRange?.to) {
    filtered = filtered.filter((row) => (row.date_to ?? row.imported_at.slice(0, 10)) <= dateRange.to!);
    conditions.push(`COALESCE(bi.date_to, bi.imported_at::date) <= DATE '${dateRange.to}'`);
    notes.push(`until ${dateRange.to}`);
  }

  const comparison = extractCountComparison(prompt);
  if (comparison) {
    filtered = filtered.filter((row) =>
      comparison.operator === ">" ? row.row_count > comparison.value : row.row_count < comparison.value,
    );
    conditions.push(`bi.row_count ${comparison.operator} ${comparison.value}`);
    notes.push(`transaction count ${comparison.operator === ">" ? "over" : "under"} ${comparison.value}`);
  }

  if (conditions.length === 0) {
    filtered = filtered.filter((row) =>
      [
        row.account.account_label,
        row.account.bank_name,
        row.filename,
        row.date_from ?? "",
        row.date_to ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(lower),
    );
    conditions.push(
      `LOWER(CONCAT_WS(' ', ba.account_label, ba.bank_name, bi.filename, bi.date_from::text, bi.date_to::text)) LIKE '%${escapeSql(lower)}%'`,
    );
    notes.push(`text matching "${prompt}"`);
  }

  filtered.sort((a, b) => b.imported_at.localeCompare(a.imported_at));

  return {
    prompt,
    interpretation: `Showing ${formatConditionSummary(notes, "statement imports matching the search")}.`,
    sql: [
      "SELECT bi.*, ba.bank_name, ba.account_label",
      "FROM bank_transaction_imports bi",
      "JOIN bank_accounts ba ON ba.id = bi.account_id",
      `WHERE ${conditions.join("\n  AND ")}`,
      "ORDER BY bi.imported_at DESC",
      ";",
    ].join("\n"),
    rows: filtered,
    rowCount: filtered.length,
  };
}
