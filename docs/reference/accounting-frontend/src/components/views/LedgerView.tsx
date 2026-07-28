import { startTransition, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronDown, BookOpen, ArrowRightLeft, ArrowUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { listLedgerEntries, type LedgerEntry } from "@/lib/uploadApi";
import { runLedgerTableAssistant } from "@/lib/tableAssistant";
import { cn } from "@/lib/utils";

const SEK = (v: number) => v.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

const DOC_TYPE_LABEL: Record<string, string> = {
  AP: "Leverantörsreskontra",
  AR: "Kundreskontra",
  JE: "Journalpost",
  BP: "Bankbetalning",
  CT: "Kortbetalning",
  CN: "Kreditnota",
  FX: "Valutaomvärdering",
  OB: "Ingående balans",
  YC: "Bokslut",
};

type SortKey = "date" | "amount";
type SortDir = "asc" | "desc";

// ── Entry detail panel ────────────────────────────────────────────────────

function EntryDetail({ entry }: { entry: LedgerEntry }) {
  const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = entry.lines.reduce((s, l) => s + l.credit, 0);
  const hasFx = !!entry.original_currency;
  const hasCostCenter = entry.lines.some((l) => l.cost_center);
  const hasProject = entry.lines.some((l) => l.project);
  const hasTransInfo = entry.lines.some((l) => l.transaction_info);
  const extraColCount = 3 + (hasCostCenter ? 1 : 0) + (hasProject ? 1 : 0) + (hasTransInfo ? 1 : 0);

  return (
    <div className="border-t border-border/50 bg-muted/20">
      {/* Metadata strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-0.5 px-4 py-1.5 text-[11px] border-b border-border/40">
        {entry.customer_name && (
          <span>
            <span className="text-muted-foreground">Leverantör: </span>
            <span className="font-medium">{entry.customer_name}</span>
          </span>
        )}
        {entry.document_type && (
          <span>
            <span className="text-muted-foreground">Typ: </span>
            <span className="font-medium">{DOC_TYPE_LABEL[entry.document_type] ?? entry.document_type}</span>
          </span>
        )}
        {entry.document_date && (
          <span>
            <span className="text-muted-foreground">Fakturadatum: </span>
            <span className="font-medium">{entry.document_date}</span>
          </span>
        )}
        {hasFx && (
          <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
            <ArrowRightLeft className="size-2.5" />
            {entry.original_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })} {entry.original_currency}
            <span className="text-muted-foreground">→ kurs {entry.exchange_rate?.toFixed(4)}</span>
          </span>
        )}
      </div>

      {/* GL lines table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/40">
            <th className="text-left px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-16">Konto</th>
            <th className="text-left px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Kontonamn</th>
            <th className="text-left px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground max-w-[140px]">Beskrivning</th>
            {hasCostCenter && (
              <th className="text-left px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-24">Kostn.ställe</th>
            )}
            {hasProject && (
              <th className="text-left px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-24">Projekt</th>
            )}
            {hasTransInfo && (
              <th className="text-left px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground max-w-[120px]">Trans.info</th>
            )}
            <th className="text-right px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-28">Debet</th>
            <th className="text-right px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-28">Kredit</th>
            {hasFx && (
              <th className="text-right px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-24">
                {entry.original_currency}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {entry.lines.map((line, i) => (
            <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-accent/20">
              <td className="px-4 py-1 font-mono text-[11px] tabular-nums text-muted-foreground">{line.account_number}</td>
              <td className="px-3 py-1 text-xs">{line.account_name}</td>
              <td className="px-3 py-1 text-[11px] text-muted-foreground truncate max-w-[140px]">{line.description ?? ""}</td>
              {hasCostCenter && (
                <td className="px-3 py-1 text-[11px] text-muted-foreground">{line.cost_center ?? ""}</td>
              )}
              {hasProject && (
                <td className="px-3 py-1 text-[11px] text-muted-foreground">{line.project ?? ""}</td>
              )}
              {hasTransInfo && (
                <td className="px-3 py-1 text-[11px] text-muted-foreground truncate max-w-[120px]">{line.transaction_info ?? ""}</td>
              )}
              <td className="px-4 py-1 text-right tabular-nums text-xs">{line.debit > 0 ? SEK(line.debit) : ""}</td>
              <td className="px-4 py-1 text-right tabular-nums text-xs">{line.credit > 0 ? SEK(line.credit) : ""}</td>
              {hasFx && (
                <td className="px-4 py-1 text-right tabular-nums text-[11px] text-muted-foreground">
                  {(line.original_debit || line.original_credit) > 0
                    ? (line.original_debit > 0 ? line.original_debit : -line.original_credit).toLocaleString(undefined, { minimumFractionDigits: 2 })
                    : ""}
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border/50 bg-muted/30">
            <td colSpan={extraColCount} className="px-4 py-1 text-[11px] font-medium text-muted-foreground">Summa</td>
            <td className="px-4 py-1 text-right tabular-nums text-xs font-medium">{SEK(totalDebit)}</td>
            <td className="px-4 py-1 text-right tabular-nums text-xs font-medium">{SEK(totalCredit)}</td>
            {hasFx && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── Entry row ─────────────────────────────────────────────────────────────

function EntryRow({ entry }: { entry: LedgerEntry }) {
  const [open, setOpen] = useState(false);
  const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = entry.lines.reduce((s, l) => s + l.credit, 0);
  const accountsSummary = entry.lines.map((l) => l.account_number).join(" · ");

  return (
    <>
      <TableRow
        className={cn(
          "cursor-pointer select-none transition-colors",
          open ? "bg-accent/30 hover:bg-accent/30" : "hover:bg-accent/40",
        )}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Verification number */}
        <TableCell className="py-1 pl-3 pr-1 w-[72px]">
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
            {entry.voucher_series}&thinsp;{entry.voucher_number}
          </span>
        </TableCell>

        {/* Chevron */}
        <TableCell className="py-1 w-5 px-0">
          {open
            ? <ChevronDown className="size-3 text-muted-foreground/50" />
            : <ChevronRight className="size-3 text-muted-foreground/30" />}
        </TableCell>

        {/* Date */}
        <TableCell className="py-1 w-24 text-xs tabular-nums text-muted-foreground">
          {entry.entry_date}
        </TableCell>

        {/* Description / partner */}
        <TableCell className="py-1 text-xs font-medium">
          <span className="truncate block max-w-[240px]">
            {entry.customer_name ?? entry.description ?? "—"}
          </span>
        </TableCell>

        {/* Accounts preview */}
        <TableCell className="py-1 hidden md:table-cell">
          <span className="truncate block font-mono text-[10px] text-muted-foreground/60 max-w-[160px]">
            {accountsSummary}
          </span>
        </TableCell>

        {/* Debet */}
        <TableCell className="py-1 text-right tabular-nums text-xs w-28">
          {totalDebit > 0 ? SEK(totalDebit) : ""}
        </TableCell>

        {/* Kredit */}
        <TableCell className="py-1 text-right tabular-nums text-xs w-28 text-muted-foreground">
          {totalCredit > 0 ? SEK(totalCredit) : ""}
        </TableCell>
      </TableRow>

      {open && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={7} className="p-0">
            <EntryDetail entry={entry} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ── Sortable header ───────────────────────────────────────────────────────

function SortableHead({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = currentSort === sortKey;
  return (
    <TableHead
      className={cn("cursor-pointer select-none hover:text-foreground", className)}
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn("size-3", active ? "text-foreground" : "text-muted-foreground/40")} />
      </span>
    </TableHead>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────

export function LedgerView() {
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [assistantPrompt, setAssistantPrompt] = useState("");

  // Only fetch posted entries — the ledger is the book of finalized accounting records
  const { data: rawEntries = [], isLoading } = useQuery({
    queryKey: ["ledger-entries"],
    queryFn: () => listLedgerEntries({
      status: "posted",
      limit: 200,
    }),
    staleTime: 30_000,
  });

  const entries = useMemo(() => {
    const searchLower = search.toLowerCase();
    const filtered = rawEntries.filter((e) => {
      // Account filter: match against any line's account_number
      if (accountFilter && !e.lines.some((l) => l.account_number === accountFilter)) {
        return false;
      }
      // Date range filter
      if (fromDate && e.entry_date < fromDate) return false;
      if (toDate && e.entry_date > toDate) return false;
      // Search filter: match against customer_name, description, or line account_number/account_name
      if (searchLower) {
        const matchesTop =
          (e.customer_name ?? "").toLowerCase().includes(searchLower) ||
          (e.description ?? "").toLowerCase().includes(searchLower);
        const matchesLine = e.lines.some(
          (l) =>
            (l.account_number ?? "").toLowerCase().includes(searchLower) ||
            (l.account_name ?? "").toLowerCase().includes(searchLower),
        );
        if (!matchesTop && !matchesLine) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") {
        cmp = a.entry_date.localeCompare(b.entry_date) || (a.voucher_number - b.voucher_number);
      } else if (sortKey === "amount") {
        const aAmt = a.lines.reduce((s, l) => s + l.debit, 0);
        const bAmt = b.lines.reduce((s, l) => s + l.debit, 0);
        cmp = aAmt - bAmt;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [rawEntries, search, accountFilter, fromDate, toDate, sortDir, sortKey]);

  const assistantResult = useMemo(
    () => runLedgerTableAssistant(entries, assistantPrompt),
    [assistantPrompt, entries],
  );
  const visibleEntries = assistantResult?.rows ?? entries;

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const totalDebitAll = visibleEntries.reduce((s, e) => s + e.lines.reduce((ls, l) => ls + l.debit, 0), 0);
  const totalCreditAll = visibleEntries.reduce((s, e) => s + e.lines.reduce((ls, l) => ls + l.credit, 0), 0);

  const activeFilters = [
    ...(accountFilter ? [{ id: "account", label: "Konto", value: accountFilter, onRemove: () => setAccountFilter("") }] : []),
    ...(fromDate ? [{ id: "fromDate", label: "Från", value: fromDate, onRemove: () => setFromDate("") }] : []),
    ...(toDate ? [{ id: "toDate", label: "Till", value: toDate, onRemove: () => setToDate("") }] : []),
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background shadow-sm">
          <BookOpen className="size-3.5 text-muted-foreground" />
        </div>
        <h1 className="text-base font-semibold tracking-tight">Ledger</h1>
      </div>

      {/* Wise Owl assistant */}
      {!isLoading && rawEntries.length > 0 && (
        <InlineTableAssistant
          tableId="ledger-entries"
          metricLabel="Ledger volume"
          metricValue={SEK(totalDebitAll)}
          metricMeta={`${visibleEntries.length} entries, credit ${SEK(totalCreditAll)}`}
          promptPlaceholder="Refine this table, for example: entries after 2026-01-01"
          result={assistantResult}
          onSubmitPrompt={(prompt) => startTransition(() => setAssistantPrompt(prompt))}
          onClear={() => startTransition(() => setAssistantPrompt(""))}
          totalRowCount={rawEntries.length}
        />
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <TableFilterBar
            search={search}
            onSearchChange={setSearch}
            placeholder="Sök leverantör, beskrivning…"
            activeFilters={activeFilters}
            filterDimensions={[
              {
                id: "account",
                label: "Konto",
                type: "text-input",
                currentValue: accountFilter,
                onSelect: setAccountFilter,
              },
              {
                id: "date-range",
                label: "Datumintervall",
                type: "date-range",
                fromValue: fromDate,
                toValue: toDate,
                onFromChange: setFromDate,
                onToChange: setToDate,
              },
            ]}
          />

          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-full" />
              ))}
            </div>
          ) : visibleEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <BookOpen className="size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {rawEntries.length === 0 ? "Inga bokföringsposter ännu" : "Inga poster matchade sökningen"}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {rawEntries.length === 0
                  ? "Godkänn dokument under Granska för att bokföra."
                  : "Justera sökning, kontofiltret eller datumintervallet ovan."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[72px] pl-3 text-[10px] font-semibold uppercase tracking-wider">Ver.</TableHead>
                  <TableHead className="w-5 px-0" />
                  <SortableHead label="Datum" sortKey="date" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="w-24 text-[10px] font-semibold uppercase tracking-wider" />
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Beskrivning</TableHead>
                  <TableHead className="hidden md:table-cell text-[10px] font-semibold uppercase tracking-wider">Konton</TableHead>
                  <SortableHead label="Debet" sortKey="amount" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="w-28 text-right text-[10px] font-semibold uppercase tracking-wider" />
                  <TableHead className="w-28 text-right text-[10px] font-semibold uppercase tracking-wider">Kredit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleEntries.map((entry) => (
                  <EntryRow key={entry.id} entry={entry} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
