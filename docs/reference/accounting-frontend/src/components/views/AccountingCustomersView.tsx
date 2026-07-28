import { startTransition, useEffect, useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Columns2,
  FilePlus2,
  MoreHorizontal,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  TableToolbar,
} from "@/components/ui/table";
import {
  listAccountingCustomers,
  type AccountingCustomer,
  type CustomerInvoiceRecord,
} from "@/lib/uploadApi";
import { runCustomerTableAssistant } from "@/lib/tableAssistant";
import { CustomerDetailSheet } from "./accounting/CustomerDetailSheet";
import { CustomerInvoiceEditorSheet } from "./accounting/CustomerInvoiceEditorSheet";

// ─── Utilities ────────────────────────────────────────────────────────────────

function fmtMoney(value: number) {
  if (value === 0) return "—";
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtRelative(value: string | null) {
  if (!value) return "—";
  try {
    return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
  } catch {
    return "—";
  }
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function CustomerAvatar({ name }: { name: string }) {
  return (
    <div className="size-5 shrink-0 rounded-[5px] bg-[#F2F1EF] dark:bg-[#1D1D1D] flex items-center justify-center">
      <span className="text-[9px] font-medium leading-none text-[#878787]">
        {name.trim()[0]?.toUpperCase() ?? "?"}
      </span>
    </div>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────

type ColKey = "email" | "total_invoiced" | "outstanding_amount" | "invoice_count" | "last_invoice_date";

const COLUMNS: { key: ColKey; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "total_invoiced", label: "Total invoiced" },
  { key: "outstanding_amount", label: "Outstanding" },
  { key: "invoice_count", label: "Invoices" },
  { key: "last_invoice_date", label: "Last invoice" },
];

// ─── Sort helpers ─────────────────────────────────────────────────────────────

type SortKey = "name" | "total_invoiced" | "outstanding_amount" | "invoice_count" | "last_invoice_date";

function SortHead({
  label,
  sortKey,
  current,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  current: { key: SortKey; dir: "asc" | "desc" };
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {label}
        {current.key === sortKey && (
          <span className="text-[10px] opacity-60">{current.dir === "asc" ? "↑" : "↓"}</span>
        )}
      </button>
    </TableHead>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

export function AccountingCustomersView() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "settled">("all");
  const [cityFilter, setCityFilter] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "total_invoiced", dir: "desc" });
  const [page, setPage] = useState(0);
  const [hiddenCols, setHiddenCols] = useState<Set<ColKey>>(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<CustomerInvoiceRecord | null>(null);
  const [presetCustomerId, setPresetCustomerId] = useState<string | null>(null);
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["accounting-customers"],
    queryFn: () => listAccountingCustomers(300),
    staleTime: 30_000,
  });

  // Reset to page 0 when filters/sort change
  useEffect(() => { setPage(0); }, [deferredSearch, statusFilter, cityFilter, sort, assistantPrompt]);

  function toggleSort(key: SortKey) {
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));
  }

  function toggleCol(key: ColKey) {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function openInvoice(customerId?: string | null) {
    setEditingInvoice(null);
    setPresetCustomerId(customerId ?? null);
    setSheetOpen(true);
  }

  function openCustomerDetail(customerId: string) {
    setEditingCustomerId(customerId);
    setDetailOpen(true);
  }

  const filtered = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    const city = cityFilter.trim().toLowerCase();

    const base = customers.filter((c) => {
      if (term && ![c.name, c.email ?? "", c.org_number ?? "", c.city ?? ""].some((v) => v.toLowerCase().includes(term))) return false;
      if (statusFilter === "open" && c.open_invoice_count === 0) return false;
      if (statusFilter === "settled" && c.open_invoice_count > 0) return false;
      if (city && !(c.city ?? "").toLowerCase().includes(city)) return false;
      return true;
    });

    return [...base].sort((a, b) => {
      const d = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "total_invoiced":      return (a.total_invoiced - b.total_invoiced) * d;
        case "outstanding_amount":  return (a.outstanding_amount - b.outstanding_amount) * d;
        case "invoice_count":       return (a.invoice_count - b.invoice_count) * d;
        case "last_invoice_date":   return (((a.last_invoice_date && Date.parse(a.last_invoice_date)) || 0) - ((b.last_invoice_date && Date.parse(b.last_invoice_date)) || 0)) * d;
        default:                    return a.name.localeCompare(b.name, "sv") * d;
      }
    });
  }, [customers, deferredSearch, statusFilter, cityFilter, sort]);

  const activeFilters = [
    ...(statusFilter !== "all"
      ? [{ id: "status", label: "Status", value: statusFilter === "open" ? "Open" : "Settled", onRemove: () => setStatusFilter("all") }]
      : []),
    ...(cityFilter
      ? [{ id: "city", label: "City", value: cityFilter, onRemove: () => setCityFilter("") }]
      : []),
  ];

  const assistantResult = useMemo(
    () => runCustomerTableAssistant(filtered, assistantPrompt),
    [assistantPrompt, filtered],
  );
  const visibleCustomers = assistantResult?.rows ?? filtered;
  const visibleOutstanding = visibleCustomers.reduce((sum, c) => sum + c.outstanding_amount, 0);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(visibleCustomers.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = visibleCustomers.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const pageStart = visibleCustomers.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const pageEnd = Math.min((safePage + 1) * PAGE_SIZE, visibleCustomers.length);

  // Column span for empty state
  const visibleColCount = 1 + COLUMNS.filter((c) => !hiddenCols.has(c.key)).length + 1; // name + optional + actions

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background shadow-sm">
            <Users className="size-3.5 text-muted-foreground" />
          </div>
          <h1 className="text-base font-semibold tracking-tight">Customers</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => openInvoice(null)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New invoice
          </Button>
        </div>
      </div>

      {/* ── Wise Owl assistant ── */}
      <InlineTableAssistant
        tableId="accounting-customers"
        metricLabel="Outstanding receivables"
        metricValue={fmtMoney(visibleOutstanding)}
        metricMeta={`${visibleCustomers.length} customers in view`}
        promptPlaceholder="Refine this table, for example: open customers in stockholm"
        result={assistantResult}
        onSubmitPrompt={(prompt) => startTransition(() => setAssistantPrompt(prompt))}
        onClear={() => startTransition(() => setAssistantPrompt(""))}
        totalRowCount={customers.length}
      />

      {/* ── Table card ── */}
      <Card>
        <CardContent className="p-0">
          <TableFilterBar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search customers…"
            activeFilters={activeFilters}
            filterDimensions={[
              {
                id: "status",
                label: "Status",
                options: [
                  { value: "open", label: "Open invoices" },
                  { value: "settled", label: "Fully settled" },
                ],
                currentValue: statusFilter !== "all" ? statusFilter : undefined,
                onSelect: (v) => setStatusFilter(v as "open" | "settled"),
              },
              {
                id: "city",
                label: "City",
                type: "text-input",
                currentValue: cityFilter,
                onSelect: setCityFilter,
              },
            ]}
          />

          {/* ── Toolbar ── */}
          <TableToolbar>
            <span className="text-xs text-muted-foreground tabular-nums">
              {visibleCustomers.length === 0
                ? "No customers"
                : `Showing ${pageStart}–${pageEnd} of ${visibleCustomers.length} customer${visibleCustomers.length !== 1 ? "s" : ""}`}
            </span>
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5 text-xs">
                    <Columns2 className="size-3.5" />
                    Edit columns
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-1.5">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Toggle columns
                  </p>
                  {COLUMNS.map((col) => (
                    <button
                      key={col.key}
                      type="button"
                      onClick={() => toggleCol(col.key)}
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-accent/30 transition-colors"
                    >
                      <span className={hiddenCols.has(col.key) ? "text-muted-foreground" : "text-foreground"}>
                        {col.label}
                      </span>
                      <span className={`size-4 rounded border flex items-center justify-center text-[10px] transition-colors ${hiddenCols.has(col.key) ? "border-border/60 bg-transparent" : "border-primary bg-primary text-primary-foreground"}`}>
                        {!hiddenCols.has(col.key) && "✓"}
                      </span>
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 gap-1.5 text-xs"
                onClick={() => toggleSort(sort.key)}
              >
                <ArrowUpDown className="size-3.5" />
                Sort
              </Button>
            </div>
          </TableToolbar>

          <div className="overflow-auto">
            <Table>
              <TableHeader className="[&_tr]:bg-muted/30 [&_tr]:hover:bg-muted/30">
                <TableRow>
                  <TableHead className="min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("name")}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Customer
                      {sort.key === "name" && (
                        <span className="text-[10px] opacity-60">{sort.dir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </TableHead>
                  {!hiddenCols.has("email") && <TableHead className="min-w-[180px]">Email</TableHead>}
                  {!hiddenCols.has("total_invoiced") && (
                    <SortHead label="Total invoiced" sortKey="total_invoiced" current={sort} onSort={toggleSort} className="w-[160px] text-right" />
                  )}
                  {!hiddenCols.has("outstanding_amount") && (
                    <SortHead label="Outstanding" sortKey="outstanding_amount" current={sort} onSort={toggleSort} className="w-[140px] text-right" />
                  )}
                  {!hiddenCols.has("invoice_count") && (
                    <SortHead label="Invoices" sortKey="invoice_count" current={sort} onSort={toggleSort} className="w-[120px]" />
                  )}
                  {!hiddenCols.has("last_invoice_date") && (
                    <SortHead label="Last invoice" sortKey="last_invoice_date" current={sort} onSort={toggleSort} className="w-[130px]" />
                  )}
                  <TableHead className="w-[52px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="size-5 rounded-[5px] bg-muted animate-pulse" />
                          <div className="h-2.5 w-28 rounded bg-muted animate-pulse" />
                        </div>
                      </TableCell>
                      {Array.from({ length: visibleColCount - 2 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
                        </TableCell>
                      ))}
                      <TableCell />
                    </TableRow>
                  ))
                ) : visibleCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColCount} className="py-10 text-center text-sm text-muted-foreground">
                      {activeFilters.length > 0 || search
                        ? "No customers matched. Try adjusting the search or filters."
                        : "No customers yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((customer) => (
                    <CustomerRow key={customer.id} customer={customer} onInvoice={openInvoice} onEdit={openCustomerDetail} hiddenCols={hiddenCols} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ── */}
          {!isLoading && pageCount > 1 && (
            <div className="flex items-center justify-between border-t border-border/70 px-3 py-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                Page {safePage + 1} of {pageCount}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs gap-1"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs gap-1"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Invoice sheet ── */}
      <CustomerInvoiceEditorSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        customers={customers}
        draftInvoice={editingInvoice}
        presetCustomerId={presetCustomerId}
      />

      {/* ── Customer detail sheet ── */}
      <CustomerDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        customerId={editingCustomerId}
      />
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function CustomerRow({
  customer,
  onInvoice,
  onEdit,
  hiddenCols,
}: {
  customer: AccountingCustomer;
  onInvoice: (id: string) => void;
  onEdit: (id: string) => void;
  hiddenCols: Set<ColKey>;
}) {
  return (
    <TableRow className="group">
      <TableCell className="max-w-[240px]">
        <div className="flex items-center gap-2.5">
          <CustomerAvatar name={customer.name} />
          <span className="truncate font-medium">{customer.name}</span>
        </div>
      </TableCell>
      {!hiddenCols.has("email") && (
        <TableCell className="max-w-[200px] text-muted-foreground">
          {customer.email
            ? <a href={`mailto:${customer.email}`} onClick={(e) => e.stopPropagation()} className="block truncate hover:text-foreground hover:underline transition-colors">{customer.email}</a>
            : "—"}
        </TableCell>
      )}
      {!hiddenCols.has("total_invoiced") && (
        <TableCell className="text-right tabular-nums font-medium">
          {fmtMoney(customer.total_invoiced)}
        </TableCell>
      )}
      {!hiddenCols.has("outstanding_amount") && (
        <TableCell className="text-right tabular-nums">
          {customer.outstanding_amount > 0
            ? <span className="font-medium">{fmtMoney(customer.outstanding_amount)}</span>
            : <span className="text-muted-foreground">—</span>}
        </TableCell>
      )}
      {!hiddenCols.has("invoice_count") && (
        <TableCell className="tabular-nums">
          <span>{customer.invoice_count || "—"}</span>
          {customer.open_invoice_count > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">· {customer.open_invoice_count} open</span>
          )}
        </TableCell>
      )}
      {!hiddenCols.has("last_invoice_date") && (
        <TableCell className="text-muted-foreground tabular-nums">
          {fmtRelative(customer.last_invoice_date)}
        </TableCell>
      )}
      <TableCell className="text-center p-0 w-[52px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Customer actions"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(customer.id)}>
              Edit customer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInvoice(customer.id)}>
              <FilePlus2 className="mr-2 h-3.5 w-3.5" />
              Create invoice
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[#FF3638] focus:text-[#FF3638]">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
