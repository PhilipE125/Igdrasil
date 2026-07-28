import { startTransition, useEffect, useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Building2, ChevronLeft, ChevronRight, Columns2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InlineTableAssistant } from "@/components/ui/inline-table-assistant";
import { TableFilterBar } from "@/components/ui/table-filter-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
} from "@/components/ui/table";
import { listAccountingSuppliers } from "@/lib/uploadApi";
import { runSupplierTableAssistant } from "@/lib/tableAssistant";

const SEK = (value: number) =>
  value.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("sv-SE");
}

// ─── Column definitions ───────────────────────────────────────────────────────

type ColKey = "contact" | "invoice_count" | "settled_amount" | "outstanding_amount" | "last_invoice_date";

const COLUMNS: { key: ColKey; label: string }[] = [
  { key: "contact", label: "Contact" },
  { key: "invoice_count", label: "Invoices" },
  { key: "settled_amount", label: "Settled" },
  { key: "outstanding_amount", label: "Outstanding" },
  { key: "last_invoice_date", label: "Last invoice" },
];

const PAGE_SIZE = 25;

export function AccountingSuppliersView() {
  const [search, setSearch] = useState("");
  const [supplierView, setSupplierView] = useState<"all" | "open" | "settled">("all");
  const deferredSearch = useDeferredValue(search);
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [page, setPage] = useState(0);
  const [hiddenCols, setHiddenCols] = useState<Set<ColKey>>(new Set());

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["accounting-suppliers"],
    queryFn: () => listAccountingSuppliers(400),
  });

  useEffect(() => { setPage(0); }, [deferredSearch, supplierView, assistantPrompt]);

  function toggleCol(key: ColKey) {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const filteredSuppliers = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    const baseResults = !term
      ? suppliers
      : suppliers.filter((supplier) =>
          [supplier.name, supplier.email ?? "", supplier.org_number ?? "", supplier.city ?? ""].some((value) =>
            value.toLowerCase().includes(term),
          ),
        );

    return baseResults.filter(
      (supplier) =>
        supplierView === "all" ||
        (supplierView === "open" && supplier.open_invoice_count > 0) ||
        (supplierView === "settled" && supplier.open_invoice_count === 0),
    );
  }, [deferredSearch, supplierView, suppliers]);

  const assistantResult = useMemo(
    () => runSupplierTableAssistant(filteredSuppliers, assistantPrompt),
    [assistantPrompt, filteredSuppliers],
  );
  const visibleSuppliers = assistantResult?.rows ?? filteredSuppliers;
  const visibleOutstanding = visibleSuppliers.reduce((sum, supplier) => sum + supplier.outstanding_amount, 0);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(visibleSuppliers.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = visibleSuppliers.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const pageStart = visibleSuppliers.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const pageEnd = Math.min((safePage + 1) * PAGE_SIZE, visibleSuppliers.length);

  const visibleColCount = 1 + COLUMNS.filter((c) => !hiddenCols.has(c.key)).length;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background shadow-sm">
            <Building2 className="size-3.5 text-muted-foreground" />
          </div>
          <h1 className="text-base font-semibold tracking-tight">Suppliers</h1>
        </div>
      </div>

      {/* ── Wise Owl assistant ── */}
      <InlineTableAssistant
        tableId="accounting-suppliers"
        metricLabel="Outstanding payables"
        metricValue={`${SEK(visibleOutstanding)} SEK`}
        metricMeta={`${visibleSuppliers.length} suppliers in view`}
        promptPlaceholder="Refine this table, for example: open suppliers in gothenburg"
        result={assistantResult}
        onSubmitPrompt={(prompt) => startTransition(() => setAssistantPrompt(prompt))}
        onClear={() => startTransition(() => setAssistantPrompt(""))}
        totalRowCount={suppliers.length}
      />

      <Card>
        <CardContent className="p-0">
          <TableFilterBar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search suppliers…"
            activeFilters={
              supplierView !== "all"
                ? [{ id: "status", label: "Status", value: supplierView === "open" ? "Open" : "Settled", onRemove: () => setSupplierView("all") }]
                : []
            }
            filterDimensions={[
              {
                id: "status",
                label: "Status",
                options: [
                  { value: "open", label: "Open" },
                  { value: "settled", label: "Settled" },
                ],
                currentValue: supplierView !== "all" ? supplierView : undefined,
                onSelect: (v) => setSupplierView(v as "open" | "settled"),
              },
            ]}
          />

          {/* ── Toolbar ── */}
          <TableToolbar>
            <span className="text-xs text-muted-foreground tabular-nums">
              {visibleSuppliers.length === 0
                ? "No suppliers"
                : `Showing ${pageStart}–${pageEnd} of ${visibleSuppliers.length} supplier${visibleSuppliers.length !== 1 ? "s" : ""}`}
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
              <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5 text-xs">
                <ArrowUpDown className="size-3.5" />
                Sort
              </Button>
            </div>
          </TableToolbar>

          <div className="overflow-auto">
            <Table>
              <TableHeader className="[&_tr]:bg-muted/30 [&_tr]:hover:bg-muted/30">
                <TableRow>
                  <TableHead className="min-w-[180px]">Supplier</TableHead>
                  {!hiddenCols.has("contact") && <TableHead className="min-w-[180px]">Contact</TableHead>}
                  {!hiddenCols.has("invoice_count") && <TableHead className="w-[140px]">Invoices</TableHead>}
                  {!hiddenCols.has("settled_amount") && <TableHead className="w-[140px] text-right">Settled</TableHead>}
                  {!hiddenCols.has("outstanding_amount") && <TableHead className="w-[160px] text-right">Outstanding</TableHead>}
                  {!hiddenCols.has("last_invoice_date") && <TableHead className="w-[120px]">Last invoice</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="max-w-[220px]">
                      <span className="block truncate font-medium">{supplier.name}</span>
                    </TableCell>
                    {!hiddenCols.has("contact") && (
                      <TableCell className="max-w-[200px] text-muted-foreground">
                        <span className="block truncate">{supplier.email || "—"}</span>
                      </TableCell>
                    )}
                    {!hiddenCols.has("invoice_count") && (
                      <TableCell>
                        <span className="tabular-nums">{supplier.invoice_count}</span>
                        {supplier.open_invoice_count > 0 && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            · {supplier.open_invoice_count} open
                          </span>
                        )}
                      </TableCell>
                    )}
                    {!hiddenCols.has("settled_amount") && (
                      <TableCell className="text-right tabular-nums">
                        {SEK(supplier.settled_amount)}
                      </TableCell>
                    )}
                    {!hiddenCols.has("outstanding_amount") && (
                      <TableCell className="text-right tabular-nums">
                        {SEK(supplier.outstanding_amount)}
                      </TableCell>
                    )}
                    {!hiddenCols.has("last_invoice_date") && (
                      <TableCell className="tabular-nums">{formatDate(supplier.last_invoice_date)}</TableCell>
                    )}
                  </TableRow>
                ))}
                {!isLoading && visibleSuppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={visibleColCount} className="py-10 text-center text-sm text-muted-foreground">
                      No suppliers matched the current filter.
                    </TableCell>
                  </TableRow>
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
    </div>
  );
}
