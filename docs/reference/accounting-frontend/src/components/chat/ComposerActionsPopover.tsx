import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AtSign,
  Bolt,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  Search,
  Database,
  Receipt,
  Users,
  Landmark,
  Wallet,
  ScrollText,
  BookOpen,
  Building2,
  Scale,
  TrendingUp,
  Package,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { FileIcon } from "@/components/ui/FileIcon";
import { cn } from "@/lib/utils";
import { listDocuments, type BackendDocument } from "@/lib/uploadApi";
import { useCompany } from "@/contexts/CompanyContext";

// ── Data ─────────────────────────────────────────────────────────────────────

interface TargetOption {
  /** Token written into the input. */
  token: string;
  /** Display label in the menu. */
  label: string;
  /** Short description to hint the agent's scope. */
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Data sources the agent can scope to via @mention. Token is inserted into
 * the composer as plain text — the agent reads it and narrows its tool
 * selection / SQL scope to that source.
 */
const TARGETS: TargetOption[] = [
  { token: "@invoices", label: "Invoices", hint: "Sales & supplier invoices", icon: Receipt },
  { token: "@suppliers", label: "Suppliers", hint: "Vendor records & contact info", icon: Users },
  { token: "@customers", label: "Customers", hint: "Customer records", icon: Users },
  { token: "@ledger", label: "Ledger", hint: "Journal entries & postings", icon: BookOpen },
  { token: "@bank", label: "Bank transactions", hint: "Imported bank feed", icon: Wallet },
  { token: "@vouchers", label: "Vouchers", hint: "Fortnox vouchers", icon: ScrollText },
  { token: "@accounts", label: "Chart of accounts", hint: "BAS accounts 1000-9999", icon: Landmark },
  { token: "@profit-loss", label: "Profit & Loss", hint: "P&L report", icon: TrendingUp },
  { token: "@balance", label: "Balance sheet", hint: "Balance sheet report", icon: Scale },
  { token: "@articles", label: "Articles", hint: "Product / article catalog", icon: Package },
  { token: "@companies", label: "Company info", hint: "Active company settings", icon: Building2 },
  { token: "@skatteverket", label: "Skatteverket", hint: "Swedish tax authority docs", icon: Database },
];

interface SkillOption {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

const SKILLS: SkillOption[] = [
  { id: "net-profit-ytd", icon: "📊", label: "Net profit YTD", prompt: "What is our net profit year to date?" },
  { id: "revenue-vs-expenses", icon: "📈", label: "Revenue vs expenses", prompt: "Show monthly revenue vs expenses as a chart" },
  { id: "unpaid-invoices", icon: "🧾", label: "Unpaid invoices", prompt: "How many unpaid invoices do we have and what is the total amount?" },
  { id: "top-suppliers", icon: "🏆", label: "Top suppliers", prompt: "Show our top 10 suppliers by spend this year" },
  { id: "swedish-vat", icon: "⚖️", label: "Swedish VAT rules", prompt: "What are the Swedish VAT rules for representation meals?" },
  { id: "balance-sheet", icon: "📋", label: "Balance sheet", prompt: "Show me a summary of the balance sheet" },
  { id: "unmatched-bank", icon: "🔍", label: "Unmatched bank tx", prompt: "Find bank transactions that haven't been matched to a ledger entry yet." },
  { id: "suggest-account", icon: "💡", label: "Suggest account", prompt: "For my most recent receipt, suggest the correct BAS account and VAT treatment." },
  { id: "explain-last-entry", icon: "🔎", label: "Explain last entry", prompt: "Explain the most recent journal entry in plain Swedish." },
  { id: "vat-draft", icon: "📤", label: "VAT return draft", prompt: "Draft the VAT return for the current period — show me the breakdown." },
];

type Pane = "root" | "targets" | "skills" | "files";

// ── Props ────────────────────────────────────────────────────────────────────

interface ComposerActionsPopoverProps {
  disabled?: boolean;
  onUploadClick: () => void;
  onInsertText: (text: string) => void;
  onPickDocument: (doc: BackendDocument) => void;
  /** Controlled pane — caller can force-open a specific submenu (e.g. on `@` hotkey). */
  forcedPane?: Pane | null;
  onPaneConsumed?: () => void;
}

// ── Menu primitives ──────────────────────────────────────────────────────────

interface MenuRowProps {
  icon: React.ComponentType<{ className?: string }> | string;
  label: string;
  hint?: string;
  hotkey?: React.ReactNode;
  trailing?: React.ReactNode;
  onSelect: () => void;
}

function MenuRow({ icon, label, hint, hotkey, trailing, onSelect }: MenuRowProps) {
  const Icon = typeof icon === "string" ? null : icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left",
        "text-sm text-foreground hover:bg-muted transition-colors",
        "focus:outline-none focus:bg-muted",
      )}
    >
      <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
        {Icon ? <Icon className="size-4" /> : <span className="text-base leading-none">{icon}</span>}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block truncate">{label}</span>
        {hint && (
          <span className="block truncate text-[11px] text-muted-foreground">{hint}</span>
        )}
      </span>
      {hotkey && (
        <span className="inline-flex items-center gap-0.5 rounded border border-border px-1 py-0 text-[10px] text-muted-foreground">
          {hotkey}
        </span>
      )}
      {trailing}
    </button>
  );
}

function SubmenuHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-1 px-1 pb-1 pt-0.5 border-b border-border/50 mb-1">
      <button
        type="button"
        onClick={onBack}
        className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Back"
      >
        <ChevronLeft className="size-3.5" />
      </button>
      <span className="text-xs font-medium text-foreground">{title}</span>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function ComposerActionsPopover({
  disabled,
  onUploadClick,
  onInsertText,
  onPickDocument,
  forcedPane,
  onPaneConsumed,
}: ComposerActionsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [pane, setPane] = useState<Pane>("root");
  const [filter, setFilter] = useState("");

  // Caller-forced pane (from hotkey) takes precedence.
  useEffect(() => {
    if (forcedPane) {
      setPane(forcedPane);
      setOpen(true);
      setFilter("");
      onPaneConsumed?.();
    }
  }, [forcedPane, onPaneConsumed]);

  // Reset to root whenever the popover opens fresh.
  useEffect(() => {
    if (!open) {
      setPane("root");
      setFilter("");
    }
  }, [open]);

  const close = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label="Add context"
          className={cn(
            "shrink-0 mb-0.5 rounded-lg p-1.5 text-muted-foreground transition-colors",
            "hover:text-foreground hover:bg-muted",
            "disabled:opacity-40",
          )}
        >
          <PlusIcon />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-72 p-1.5"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {pane === "root" && (
          <div className="space-y-0.5">
            <MenuRow
              icon={FileText}
              label="Files"
              hint="Attach a previously uploaded document"
              trailing={<ChevronRight className="size-3.5 text-muted-foreground" />}
              onSelect={() => setPane("files")}
            />
            <MenuRow
              icon={Upload}
              label="Upload from device"
              hint="PDF, JPG, or PNG"
              onSelect={() => {
                close();
                onUploadClick();
              }}
            />
            <MenuRow
              icon={AtSign}
              label="Target"
              hint="Scope the agent to a data source"
              hotkey={<AtSign className="size-2.5" />}
              trailing={<ChevronRight className="size-3.5 text-muted-foreground" />}
              onSelect={() => setPane("targets")}
            />
            <MenuRow
              icon={Bolt}
              label="Skills"
              hint="Pre-built recipes"
              hotkey={<span>/</span>}
              trailing={<ChevronRight className="size-3.5 text-muted-foreground" />}
              onSelect={() => setPane("skills")}
            />
          </div>
        )}

        {pane === "targets" && (
          <TargetsPane
            filter={filter}
            setFilter={setFilter}
            onBack={() => setPane("root")}
            onPick={(t) => {
              close();
              onInsertText(`${t.token} `);
            }}
          />
        )}

        {pane === "skills" && (
          <SkillsPane
            filter={filter}
            setFilter={setFilter}
            onBack={() => setPane("root")}
            onPick={(s) => {
              close();
              onInsertText(s.prompt);
            }}
          />
        )}

        {pane === "files" && (
          <FilesPane
            filter={filter}
            setFilter={setFilter}
            onBack={() => setPane("root")}
            onPick={(doc) => {
              close();
              onPickDocument(doc);
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

// ── Pane: Targets ───────────────────────────────────────────────────────────

function TargetsPane({
  filter,
  setFilter,
  onBack,
  onPick,
}: {
  filter: string;
  setFilter: (v: string) => void;
  onBack: () => void;
  onPick: (t: TargetOption) => void;
}) {
  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return TARGETS;
    return TARGETS.filter(
      (t) =>
        t.label.toLowerCase().includes(f) ||
        t.token.toLowerCase().includes(f) ||
        t.hint.toLowerCase().includes(f),
    );
  }, [filter]);

  return (
    <div>
      <SubmenuHeader title="Target" onBack={onBack} />
      <SearchBox value={filter} onChange={setFilter} placeholder="Search data sources…" />
      <div className="max-h-72 overflow-y-auto mt-1 -mr-1 pr-1">
        {visible.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">No matches.</p>
        ) : (
          <div className="space-y-0.5">
            {visible.map((t) => (
              <MenuRow
                key={t.token}
                icon={t.icon}
                label={t.label}
                hint={t.hint}
                trailing={
                  <span className="text-[10px] font-mono text-muted-foreground/70">
                    {t.token}
                  </span>
                }
                onSelect={() => onPick(t)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pane: Skills ─────────────────────────────────────────────────────────────

function SkillsPane({
  filter,
  setFilter,
  onBack,
  onPick,
}: {
  filter: string;
  setFilter: (v: string) => void;
  onBack: () => void;
  onPick: (s: SkillOption) => void;
}) {
  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return SKILLS;
    return SKILLS.filter(
      (s) =>
        s.label.toLowerCase().includes(f) || s.prompt.toLowerCase().includes(f),
    );
  }, [filter]);

  return (
    <div>
      <SubmenuHeader title="Skills" onBack={onBack} />
      <SearchBox value={filter} onChange={setFilter} placeholder="Search skills…" />
      <div className="max-h-72 overflow-y-auto mt-1 -mr-1 pr-1">
        {visible.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">No matches.</p>
        ) : (
          <div className="space-y-0.5">
            {visible.map((s) => (
              <MenuRow
                key={s.id}
                icon={s.icon}
                label={s.label}
                hint={s.prompt}
                onSelect={() => onPick(s)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pane: Files ──────────────────────────────────────────────────────────────

function FilesPane({
  filter,
  setFilter,
  onBack,
  onPick,
}: {
  filter: string;
  setFilter: (v: string) => void;
  onBack: () => void;
  onPick: (doc: BackendDocument) => void;
}) {
  const { activeCompany } = useCompany();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["chat-files", activeCompany?.id],
    queryFn: () => listDocuments({ pageSize: 30 }),
    enabled: !!activeCompany?.id,
    staleTime: 15_000,
  });

  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const items = data ?? [];
    if (!f) return items;
    return items.filter((d) => d.original_filename.toLowerCase().includes(f));
  }, [data, filter]);

  return (
    <div>
      <SubmenuHeader title="Files" onBack={onBack} />
      <SearchBox value={filter} onChange={setFilter} placeholder="Search filenames…" />
      <div className="max-h-72 overflow-y-auto mt-1 -mr-1 pr-1">
        {isLoading ? (
          <div className="px-1 py-2 space-y-1.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        ) : isError ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            Could not load files.
          </p>
        ) : visible.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            {filter ? "No matches." : "No uploads yet."}
          </p>
        ) : (
          <div className="space-y-0.5">
            {visible.map((doc) => (
              <MenuRow
                key={doc.id}
                icon={(props) => <FileIcon name={doc.original_filename} {...props} />}
                label={doc.original_filename}
                hint={formatDocStatus(doc)}
                onSelect={() => onPick(doc)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDocStatus(doc: BackendDocument): string {
  const parts: string[] = [];
  if (doc.status) parts.push(doc.status.replace(/_/g, " "));
  if (doc.created_at) {
    const d = new Date(doc.created_at);
    const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000);
    parts.push(
      diffDays === 0 ? "today" : diffDays === 1 ? "yesterday" : `${diffDays}d ago`,
    );
  }
  return parts.join(" · ");
}

// ── Shared bits ──────────────────────────────────────────────────────────────

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-md border border-border">
      <Search className="size-3 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="flex-1 bg-transparent text-xs focus:outline-none placeholder:text-muted-foreground/70"
      />
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
      className="size-4"
      fill="currentColor"
    >
      <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5z" />
    </svg>
  );
}
