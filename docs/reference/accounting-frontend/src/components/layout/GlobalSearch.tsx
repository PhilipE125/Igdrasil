import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Building2,
  ChevronRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Search,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authenticatedApiRequest, searchAccountingEntries } from "@/lib/uploadApi";
import { useCompany } from "@/contexts/CompanyContext";
import type { Company } from "@/contexts/CompanyContext";
import type { BackendDocument } from "@/lib/uploadApi";

// ── Navigation items ──────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard",          href: "/",                   icon: LayoutDashboard },
  { label: "Chat Assistant",     href: "/chat",               icon: MessageSquare },
  { label: "Accounting",         href: "/accounting/automations", icon: BookOpen },
  { label: "Customers",          href: "/accounting/customers", icon: Building2 },
  { label: "Suppliers",          href: "/accounting/suppliers", icon: Building2 },
  { label: "Employees",          href: "/accounting/employees", icon: User },
  { label: "Ledger",             href: "/accounting/ledger", icon: BookOpen },
  { label: "Pipeline Builder",   href: "/automations/pipeline", icon: BookOpen },
  { label: "Review",             href: "/accounting/automations/review", icon: BookOpen },
  { label: "File Archive",       href: "/files",              icon: FileText },
  { label: "Bank Transactions",  href: "/bank-transactions",  icon: CreditCard },
  { label: "Profile",            href: "/profile",            icon: User },
  { label: "Settings",           href: "/settings",           icon: Settings },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type ResultType = "nav" | "document" | "journal" | "company";

interface SearchResult {
  id: string;
  type: ResultType;
  label: string;
  sub?: string;
  href: string;
  companyData?: Company;
}

const CRUMB_LABEL: Record<ResultType, string> = {
  nav:      "Navigation",
  document: "Files",
  journal:  "Bookkeeping",
  company:  "Companies",
};

function ResultIcon({ result }: { result: SearchResult }) {
  if (result.type === "nav") {
    const nav = NAV_ITEMS.find((n) => n.href === result.href);
    if (nav) {
      const Icon = nav.icon;
      return <Icon className="size-3.5 shrink-0 text-muted-foreground" />;
    }
  }
  if (result.type === "document") return <FileText className="size-3.5 shrink-0 text-violet-500" />;
  if (result.type === "journal")  return <BookOpen  className="size-3.5 shrink-0 text-emerald-500" />;
  if (result.type === "company")  return <Building2  className="size-3.5 shrink-0 text-blue-500" />;
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

export function GlobalSearch() {
  const navigate = useNavigate();
  const { companies, setActiveCompany } = useCompany();

  const [query, setQuery]             = useState("");
  const [results, setResults]         = useState<SearchResult[]>([]);
  const [loading, setLoading]         = useState(false);
  const [isOpen, setIsOpen]           = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef    = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Global keyboard shortcut ─────────────────────────────────────────────

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ── Search logic ─────────────────────────────────────────────────────────

  const search = useCallback(
    async (q: string) => {
      const lower = q.trim().toLowerCase();
      if (!lower) { setResults([]); setLoading(false); return; }

      const items: SearchResult[] = [];

      for (const nav of NAV_ITEMS) {
        if (nav.label.toLowerCase().includes(lower)) {
          items.push({ id: `nav-${nav.href}`, type: "nav", label: nav.label, href: nav.href });
        }
      }

      for (const company of companies) {
        if (company.name.toLowerCase().includes(lower)) {
          items.push({ id: `company-${company.id}`, type: "company", label: company.name, href: "/", companyData: company });
        }
      }

      try {
        const [docsRes, ledgersRes] = await Promise.allSettled([
          authenticatedApiRequest<{ items: BackendDocument[] }>(`/documents?page=1&page_size=50`),
          searchAccountingEntries(lower, 50),
        ]);

        if (docsRes.status === "fulfilled") {
          for (const doc of docsRes.value.items) {
            if (doc.original_filename.toLowerCase().includes(lower)) {
              items.push({ id: `doc-${doc.id}`, type: "document", label: doc.original_filename, sub: doc.status, href: "/files" });
            }
          }
        }

        if (ledgersRes.status === "fulfilled") {
          for (const entry of ledgersRes.value) {
            const displayLabel =
              entry.customer_name ??
              entry.description ??
              entry.llm_description ??
              "Accounting entry";
            items.push({
              id: `ledger-${entry.id}`,
              type: "journal",
              label: displayLabel,
              sub: entry.status,
              href: "/bookkeeping",
            });
          }
        }
      } catch {
        // Silent — nav + company results still show
      }

      setResults(items);
      setLoading(false);
      setActiveIndex(-1);
    },
    [companies],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 200);
  };

  // ── Keyboard navigation ──────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    }
  };

  // ── Selection ────────────────────────────────────────────────────────────

  function handleSelect(result: SearchResult) {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
    if (result.companyData) {
      setActiveCompany(result.companyData);
      navigate("/");
    } else {
      navigate(result.href);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  }

  // ── Grouped results ───────────────────────────────────────────────────────

  const grouped = results.reduce<Record<string, (SearchResult & { _idx: number })[]>>(
    (acc, r, idx) => {
      const key = CRUMB_LABEL[r.type];
      (acc[key] ??= []).push({ ...r, _idx: idx });
      return acc;
    },
    {},
  );

  return (
    <>
      {/* Backdrop — subtle grey wash over the rest of the page */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 animate-in fade-in-0 duration-150"
          onMouseDown={handleClose}
        />
      )}

      {/* Search wrapper — stays at fixed height in header flow */}
      <div className="relative z-50 flex-1" style={{ maxWidth: "480px" }}>

        {/* Input row — always in-flow, never resizes */}
        <div
          className={cn(
            "flex h-10 items-center gap-2 px-3 border bg-white/10",
            isOpen
              ? "rounded-t-lg rounded-b-none border-b-0 border-white/15"
              : "rounded-lg border-white/15",
          )}
        >
          {loading
            ? <Loader2 className="size-4 shrink-0 animate-spin text-white/50 pointer-events-none" />
            : <Search  className="size-4 shrink-0 text-white/50 pointer-events-none" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, documents, bookkeeping…"
            aria-label="Global search"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          {!query && (
            <kbd className="hidden rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-sans text-[10px] font-semibold tabular-nums text-white/50 sm:inline-flex pointer-events-none">
              ⌘K
            </kbd>
          )}
        </div>

        {/* Results panel — absolutely positioned so it never shifts the header */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full overflow-hidden rounded-b-lg border border-t-0 border-border bg-background shadow-xl animate-in fade-in-0 slide-in-from-top-2 duration-150">

            {/* Empty hint */}
            {!query.trim() && (
              <p className="px-4 py-5 text-center text-sm text-muted-foreground">
                Start typing to search pages, files, and bookkeeping entries.
              </p>
            )}

            {/* No results */}
            {query.trim() && !loading && results.length === 0 && (
              <p className="px-4 py-5 text-center text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}

            {/* Grouped results */}
            <div className="max-h-[360px] overflow-y-auto" role="listbox">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="px-3.5 pb-1 pt-2.5 text-[10px] font-semibold uppercase text-muted-foreground">
                    {category}
                  </p>
                  {items.map((result) => {
                    const isActive = result._idx === activeIndex;
                    return (
                      <button
                        key={result.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onMouseDown={() => handleSelect(result)}
                        onMouseEnter={() => setActiveIndex(result._idx)}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors duration-75",
                          isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
                        )}
                      >
                        <ResultIcon result={result} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium leading-none text-foreground">
                            {result.label}
                          </p>
                          {result.sub && (
                            <p className="mt-0.5 truncate text-[11px] capitalize text-muted-foreground">
                              {result.sub.replace(/_/g, " ")}
                            </p>
                          )}
                        </div>
                        <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-muted-foreground">
                          <ChevronRight className="size-2.5 opacity-50" />
                          {CRUMB_LABEL[result.type]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer keyboard hints */}
            {results.length > 0 && (
              <div className="flex items-center gap-4 border-t border-border px-3.5 py-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 font-sans text-[10px]">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 font-sans text-[10px]">↵</kbd>
                  open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 font-sans text-[10px]">Esc</kbd>
                  close
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
