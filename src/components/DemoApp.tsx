"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpFromLine,
  Bell,
  Box,
  Calculator,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleCheck,
  FileBarChart,
  FileText,
  Filter,
  FolderOpen,
  LayoutDashboard,
  type LucideIcon,
  Grid2x2,
  Landmark,
  Mail,
  Menu,
  MessageSquare,
  Play,
  Plus,
  Scale,
  ScanLine,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";

type ViewKey =
  | "dashboard"
  | "automations"
  | "customers"
  | "suppliers"
  | "employees"
  | "ledger"
  | "fileArchive"
  | "bank"
  | "reportsFinancial"
  | "reportsRegulatory"
  | "reportsCustom";

const ACCOUNTING_SUBS: { key: ViewKey; label: string }[] = [
  { key: "automations", label: "Automations" },
  { key: "customers", label: "Customers" },
  { key: "suppliers", label: "Suppliers" },
  { key: "employees", label: "Employees" },
  { key: "ledger", label: "Ledger" },
];

const ACCOUNTING_KEYS: ViewKey[] = ACCOUNTING_SUBS.map((s) => s.key);

const REPORTS_SUBS: { key: ViewKey; label: string }[] = [
  { key: "reportsFinancial", label: "Financial Position" },
  { key: "reportsRegulatory", label: "Regulatory" },
  { key: "reportsCustom", label: "Custom" },
];

const REPORTS_KEYS: ViewKey[] = REPORTS_SUBS.map((s) => s.key);

const DATA: {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
  expandable?: boolean;
}[] = [
  { key: "fileArchive", label: "File Archive", icon: FolderOpen },
  { key: "bank", label: "Bank Transactions", icon: Landmark },
];

export function DemoApp() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSetView = (v: ViewKey) => {
    setView(v);
    setSidebarOpen(false);
  };

  return (
    <section className="relative z-10 pt-6 pb-12 sm:py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="rounded-xl sm:rounded-2xl shadow-2xl bg-white border border-black/10 overflow-hidden flex flex-col h-[600px] sm:h-[680px] md:h-[700px] relative">
          <div className="flex flex-1 min-h-0">
            {sidebarOpen && (
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setSidebarOpen(false)}
                className="md:hidden absolute inset-0 z-20 bg-black/30"
              />
            )}
            <div
              className={`absolute md:static inset-y-0 left-0 z-30 transition-transform md:transition-none duration-200 md:translate-x-0 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <Sidebar view={view} setView={handleSetView} />
            </div>

            <div className="flex-1 flex flex-col min-w-0 bg-white">
              <TopBar
                view={view}
                onOpenSidebar={() => setSidebarOpen(true)}
                onToggleChat={() => setChatOpen((c) => !c)}
              />
              <div className="flex flex-1 min-h-0 relative">
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                  {view === "dashboard" && (
                    <DashboardView onOpenChat={() => setChatOpen(true)} />
                  )}
                  {view === "automations" && (
                    <InboxView onUpload={() => setUploadOpen(true)} />
                  )}
                  {view === "customers" && <CustomersView />}
                  {view === "suppliers" && <SuppliersView />}
                  {view === "employees" && <EmployeesView />}
                  {view === "ledger" && <LedgerView />}
                  {view === "fileArchive" && (
                    <FileArchiveView
                      onMassUpload={() => setUploadOpen(true)}
                    />
                  )}
                  {view === "bank" && <BankView />}
                  {view === "reportsFinancial" && <ReportsFinancialView />}
                  {view === "reportsRegulatory" && <ReportsRegulatoryView />}
                  {view === "reportsCustom" && <ReportsCustomView />}
                </div>
                {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
              </div>
            </div>
          </div>
        </div>

        {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
      </div>
    </section>
  );
}

/* ────────────────────────────── sidebar ────────────────────────────── */

function Sidebar({
  view,
  setView,
}: {
  view: ViewKey;
  setView: (v: ViewKey) => void;
}) {
  return (
    <aside className="w-[260px] md:w-[230px] h-full shrink-0 bg-white border-r border-black/[0.06] flex flex-col shadow-lg md:shadow-none">
      {/* Company switcher */}
      <div className="px-3 pt-3 pb-2">
        <button
          type="button"
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-gray-50 text-left"
        >
          <span className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-gray-700">
            <Box size={14} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-gray-900 truncate">
              Igdrasil AB
            </div>
            <div className="text-[10px] text-gray-500 truncate">Bokföring</div>
          </div>
          <ChevronsUpDown size={12} className="text-gray-400 shrink-0" />
        </button>
      </div>

      <div className="px-3 mt-2 flex-1 overflow-y-auto space-y-4">
        <Section label="Platform">
          <NavButton
            item={{
              key: "dashboard",
              label: "Dashboard",
              icon: LayoutDashboard,
            }}
            active={view === "dashboard"}
            onClick={() => setView("dashboard")}
          />
          <AccountingNav view={view} setView={setView} />
        </Section>

        <Section label="Data">
          {DATA.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={view === item.key}
              onClick={() => setView(item.key)}
            />
          ))}
          <ReportsNav view={view} setView={setView} />
        </Section>
      </div>

      {/* User card */}
      <div className="px-3 py-3 border-t border-black/[0.06]">
        <button
          type="button"
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-gray-50 text-left"
        >
          <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-700">
            IG
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-gray-900 truncate">
              igdrasilab
            </div>
            <div className="text-[10px] text-gray-500 truncate">
              igdrasilab@gmail.com
            </div>
          </div>
          <ChevronsUpDown size={12} className="text-gray-400 shrink-0" />
        </button>
      </div>
    </aside>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-gray-400 px-2 mb-1.5">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: { key: ViewKey; label: string; icon: LucideIcon; expandable?: boolean };
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] transition-colors text-left ${
        active
          ? "bg-gray-100 text-gray-900 font-medium"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon size={14} className="text-gray-500" />
      <span className="flex-1">{item.label}</span>
      {item.expandable && (
        <ChevronRight size={12} className="text-gray-400" />
      )}
    </button>
  );
}

function AccountingNav({
  view,
  setView,
}: {
  view: ViewKey;
  setView: (v: ViewKey) => void;
}) {
  const childActive = ACCOUNTING_KEYS.includes(view);
  const [open, setOpen] = useState(childActive);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] transition-colors text-left ${
          childActive
            ? "text-gray-900 font-medium"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Calculator size={14} className="text-gray-500" />
        <span className="flex-1">Accounting</span>
        <ChevronDown
          size={12}
          className={`text-gray-400 transition-transform ${
            open ? "" : "-rotate-90"
          }`}
        />
      </button>
      {open && (
        <div className="relative pl-5 mt-0.5 space-y-0.5">
          <div className="absolute left-3 top-1 bottom-1 w-px bg-black/[0.08]" />
          {ACCOUNTING_SUBS.map((sub) => {
            const active = view === sub.key;
            return (
              <button
                key={sub.key}
                type="button"
                onClick={() => setView(sub.key)}
                className={`w-full text-left px-2 py-1 rounded-md text-[12px] transition-colors ${
                  active
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReportsNav({
  view,
  setView,
}: {
  view: ViewKey;
  setView: (v: ViewKey) => void;
}) {
  const childActive = REPORTS_KEYS.includes(view);
  const [open, setOpen] = useState(childActive);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] transition-colors text-left ${
          childActive
            ? "text-gray-900 font-medium"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <FileBarChart size={14} className="text-gray-500" />
        <span className="flex-1">Reports</span>
        <ChevronDown
          size={12}
          className={`text-gray-400 transition-transform ${
            open ? "" : "-rotate-90"
          }`}
        />
      </button>
      {open && (
        <div className="relative pl-5 mt-0.5 space-y-0.5">
          <div className="absolute left-3 top-1 bottom-1 w-px bg-black/[0.08]" />
          {REPORTS_SUBS.map((sub) => {
            const active = view === sub.key;
            return (
              <button
                key={sub.key}
                type="button"
                onClick={() => setView(sub.key)}
                className={`w-full text-left px-2 py-1 rounded-md text-[12px] transition-colors ${
                  active
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────── top bar ────────────────────────────── */

function TopBar({
  view,
  onOpenSidebar,
  onToggleChat,
}: {
  view: ViewKey;
  onOpenSidebar: () => void;
  onToggleChat: () => void;
}) {
  const titleMap: Record<ViewKey, string> = {
    dashboard: "Dashboard",
    automations: "Automations",
    customers: "Customers",
    suppliers: "Suppliers",
    employees: "Employees",
    ledger: "Ledger",
    fileArchive: "File Archive",
    bank: "Bank Transactions",
    reportsFinancial: "Financial Position",
    reportsRegulatory: "Regulatory",
    reportsCustom: "Custom Reports",
  };
  return (
    <div className="flex items-center gap-2 px-3 sm:px-5 h-[52px] border-b border-black/[0.06] bg-white">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open menu"
        className="md:hidden text-gray-600 hover:text-gray-900 -ml-1 p-1"
      >
        <Menu size={18} />
      </button>
      <span className="text-[13px] font-medium text-gray-900 truncate">
        {titleMap[view]}
      </span>
      <div className="flex-1 max-w-md mx-auto hidden sm:block">
        <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors border border-black/[0.06] rounded-md px-3 py-1.5 cursor-text">
          <Search size={13} className="text-gray-400" />
          <span className="text-[12px] text-gray-400 flex-1 truncate">
            Search pages, documents, bookkeeping…
          </span>
          <kbd className="text-[10px] font-mono bg-white border border-black/10 rounded px-1.5 py-0.5 text-gray-500">
            ⌘K
          </kbd>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3 text-gray-500">
        <button
          type="button"
          onClick={onToggleChat}
          aria-label="Toggle chat"
          className="md:hidden text-gray-600 hover:text-gray-900 p-1"
        >
          <MessageSquare size={16} />
        </button>
        <Grid2x2
          size={15}
          className="cursor-pointer hover:text-gray-800 hidden sm:block"
        />
        <span className="w-7 h-7 rounded-full bg-orange-200 flex items-center justify-center text-[11px] font-semibold text-gray-800 cursor-pointer">
          I
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────── dashboard ────────────────────────────── */

function DashboardView({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 max-w-5xl mx-auto">
      <div className="mb-1">
        <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-[12px] text-gray-500 mt-0.5">Igdrasil AB</p>
      </div>

      {/* KPI strip with date range */}
      <div className="mt-5 border border-black/10 rounded-xl bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.06]">
          <button
            type="button"
            className="flex items-center gap-1.5 text-[11.5px] text-gray-700 hover:text-gray-900"
          >
            <span className="w-4 h-4 rounded border border-black/15 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-gray-700 rounded-sm" />
            </span>
            <span>1Å</span>
            <ChevronDown size={11} className="text-gray-400" />
          </button>
          <div className="text-[11.5px] text-gray-700">
            2026-01-01 → 2026-04-29
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: "Försäljning", value: "—" },
            { label: "Kostnader", value: "—" },
            { label: "Leverantörer", value: "—" },
            { label: "Kunder", value: "—" },
          ].map((kpi, i) => (
            <div
              key={kpi.label}
              className={`px-4 sm:px-5 py-4 sm:py-5 border-black/[0.06] ${
                i % 2 === 0 ? "border-r" : ""
              } ${i < 2 ? "border-b md:border-b-0" : ""} ${
                i < 3 ? "md:border-r" : "md:border-r-0"
              }`}
            >
              <div className="text-[11px] text-gray-500">{kpi.label}</div>
              <div className="text-[16px] text-gray-900 mt-1">{kpi.value}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center py-2 border-t border-black/[0.06] cursor-pointer hover:bg-gray-50">
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>

      {/* Things to do */}
      <h2 className="text-[14px] font-semibold text-gray-900 mt-7 mb-2">
        Things to do
      </h2>
      <div className="border border-black/10 rounded-xl bg-white px-4 py-3 flex items-center gap-2.5">
        <CircleCheck
          size={16}
          className="text-green-500 fill-green-100"
          strokeWidth={2}
        />
        <span className="text-[12.5px] text-gray-700">
          You&apos;re all caught up
        </span>
      </div>

      {/* Ask me anything */}
      <h2 className="text-[14px] font-semibold text-gray-900 mt-7 mb-2">
        Ask me anything about your business
      </h2>
      <button
        type="button"
        onClick={onOpenChat}
        className="w-full flex items-center gap-2 bg-white border border-[#ee8fe0]/50 hover:border-[#ee8fe0] rounded-xl px-3.5 py-3 shadow-sm transition-colors text-left"
      >
        <Image
          src="/owl.png"
          alt=""
          aria-hidden
          width={22}
          height={22}
          className="w-[22px] h-[22px] shrink-0 object-contain"
        />
        <span className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
          <Plus size={14} />
        </span>
        <span className="flex-1 text-[12.5px] text-gray-400">
          Ask anything — your chat opens on the right
        </span>
        <span className="w-7 h-7 rounded-full bg-[#ee8fe0] flex items-center justify-center shrink-0">
          <Send size={12} className="text-white -ml-0.5" />
        </span>
      </button>
    </div>
  );
}

/* ────────────────────────────── inbox / accounting ────────────────────────────── */

const INBOX_ROWS = [
  {
    id: "1",
    name: "Marmar-Ads-Q2-Faktura.pdf",
    format: "PDF",
    supplier: "Marmar Annonser AB",
    status: "Ready for Review" as const,
  },
  {
    id: "2",
    name: "Skogen-Pay-April.pdf",
    format: "PDF",
    supplier: "Skogen Pay AB",
    status: "Matched" as const,
  },
  {
    id: "3",
    name: "Molnverk-Mars-Faktura.pdf",
    format: "PDF",
    supplier: "Molnverk Sverige AB",
    status: "Matching With Bank" as const,
  },
  {
    id: "4",
    name: "Konstverk-Studio-Mthly.pdf",
    format: "PDF",
    supplier: "Konstverk Studio AB",
    status: "Ready for Review" as const,
  },
  {
    id: "5",
    name: "granit-domaner-kvitto.jpg",
    format: "JPG",
    supplier: "Granit Domäner AB",
    status: "Uploading" as const,
  },
];

const STATUS_STYLE: Record<string, string> = {
  "Ready for Review": "bg-orange-50 text-orange-700 border-orange-200",
  Matched: "bg-green-50 text-green-700 border-green-200",
  "Matching With Bank": "bg-blue-50 text-blue-700 border-blue-200",
  Uploading: "bg-gray-100 text-gray-600 border-gray-200",
};

function InboxView({ onUpload }: { onUpload: () => void }) {
  const [tab, setTab] = useState<"inbox" | "review">("inbox");
  const [selected, setSelected] = useState<string | null>(null);
  const selectedDoc = INBOX_ROWS.find((r) => r.id === selected);

  if (tab === "review") {
    return <ReviewView onSwitchInbox={() => setTab("inbox")} />;
  }

  return (
    <div className="flex h-full relative">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-[#f4f3f1] border-b border-black/5">
          <div className="flex bg-white rounded-lg border border-black/5 p-0.5 text-[12px]">
            <button
              type="button"
              onClick={() => setTab("inbox")}
              className="px-3 py-0.5 rounded bg-gray-100 text-gray-900 font-medium"
            >
              Inbox
            </button>
            <button
              type="button"
              onClick={() => setTab("review")}
              className="px-3 py-0.5 rounded text-gray-500 hover:text-gray-800"
            >
              Review
            </button>
          </div>
          <button
            type="button"
            onClick={onUpload}
            className="ml-auto flex items-center gap-1 bg-[#ee8fe0] hover:bg-[#e57bd1] text-white rounded-md px-2.5 sm:px-3 py-1 text-[11px] font-medium"
          >
            <ArrowUpFromLine size={11} />
            <span className="hidden sm:inline">Upload</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 bg-green-300 hover:bg-green-400 text-gray-900 rounded-md px-2.5 sm:px-3 py-1 text-[11px] font-medium"
          >
            <Play size={11} fill="currentColor" />
            <span className="hidden sm:inline">Run</span>
          </button>
          <Filter size={14} className="text-gray-400 hidden sm:block" />
        </div>

        <div className="flex-1 overflow-auto bg-white">
          <div className="hidden sm:grid grid-cols-[1fr_60px_140px_140px_36px] gap-2 px-5 py-2 text-[10px] font-mono uppercase tracking-[0.15em] text-gray-400 border-b border-black/5 sticky top-0 bg-white">
            <span>Document</span>
            <span>Format</span>
            <span>Supplier</span>
            <span>Status</span>
            <span></span>
          </div>
          {INBOX_ROWS.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSelected(row.id)}
              className={`w-full sm:grid sm:grid-cols-[1fr_60px_140px_140px_36px] gap-2 px-3 sm:px-5 py-3 text-[12px] border-b border-black/5 sm:items-center text-left transition-colors flex items-start ${
                selected === row.id ? "bg-[#ee8fe0]/10" : "hover:bg-gray-50"
              }`}
            >
              <span className="text-gray-900 truncate flex items-center gap-1.5 min-w-0 flex-1">
                <ChevronRight size={12} className="text-gray-400 shrink-0" />
                <span className="truncate">{row.name}</span>
              </span>
              <span className="text-gray-700 hidden sm:block">{row.format}</span>
              <span className="text-gray-700 truncate hidden sm:block">{row.supplier}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium border w-fit whitespace-nowrap shrink-0 ${STATUS_STYLE[row.status]}`}
              >
                {row.status}
              </span>
              <span className="w-7 h-7 rounded-md bg-[#ee8fe0]/30 hidden sm:flex items-center justify-center">
                <ScanLine size={12} className="text-gray-700" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedDoc && (
        <div className="absolute md:static inset-0 md:inset-auto z-10 w-full md:w-[320px] shrink-0 border-l border-black/10 bg-[#fafaf8] p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-semibold text-gray-900">
              Review
            </span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
          <div className="border border-black/10 rounded-lg bg-white p-4 mb-3">
            <FileText size={20} className="text-[#ee8fe0] mb-2" />
            <div className="text-[12px] text-gray-900 font-medium truncate">
              {selectedDoc.name}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {selectedDoc.supplier}
            </div>
          </div>
          <div className="space-y-2 text-[11px]">
            <Field label="Supplier" value={selectedDoc.supplier} />
            <Field label="Invoice #" value="INV-2026-1042" />
            <Field label="Invoice date" value="2026-04-18" />
            <Field label="Due date" value="2026-05-26" />
            <Field label="Total" value="755.00 SEK" />
            <Field label="VAT" value="151.00 SEK (25%)" />
          </div>
          <button className="w-full mt-4 bg-[#ee8fe0] hover:bg-[#e57bd1] text-white text-[11px] font-medium rounded-md py-2">
            Approve & post
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 text-right">{value}</span>
    </div>
  );
}

/* ────────────────────────────── review ────────────────────────────── */

const REVIEW_DOCS = [
  {
    name: "Clean-Gradient-Purple-Invoice-Template.pdf",
    supplier: "Albert Sort",
    invoiceNumber: "123451",
    invoiceDate: "2027-04-18",
    dueDate: "2027-05-26",
    total: "755",
    country: "SE",
  },
];

function ReviewView({ onSwitchInbox }: { onSwitchInbox: () => void }) {
  const [page, setPage] = useState(1);
  const totalDocs = 3;
  const [zoom, setZoom] = useState(150);
  const doc = REVIEW_DOCS[0];

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-[#f4f3f1] border-b border-black/5">
        <div className="flex bg-white rounded-lg border border-black/5 p-0.5 text-[12px]">
          <button
            type="button"
            onClick={onSwitchInbox}
            className="px-3 py-0.5 rounded text-gray-500 hover:text-gray-800"
          >
            Inbox
          </button>
          <button
            type="button"
            className="px-3 py-0.5 rounded bg-gray-100 text-gray-900 font-medium"
          >
            Review
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left pane: invoice preview */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#f4f3f1] border-r border-black/[0.06]">
          {/* Document toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-black/5 bg-white">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              className="size-6 rounded grid place-items-center hover:bg-gray-50"
              aria-label="Previous"
            >
              <ChevronRight size={12} className="rotate-180 text-gray-500" />
            </button>
            <span className="text-[12px] text-gray-700">
              {page} of {totalDocs}
            </span>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalDocs, page + 1))}
              className="size-6 rounded grid place-items-center hover:bg-gray-50"
              aria-label="Next"
            >
              <ChevronRight size={12} className="text-gray-500" />
            </button>

            <div className="mx-3 h-4 w-px bg-black/10" />
            <FileText size={13} className="text-red-400 shrink-0" />
            <span className="text-[12px] text-gray-900 truncate">
              {doc.name}
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-700 border border-black/10">
              ready
            </span>
          </div>

          {/* Page + zoom row */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-black/5 text-[11px] text-gray-500 bg-white">
            <span>1 / 1</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoom(Math.max(50, zoom - 25))}
                className="size-5 rounded grid place-items-center hover:bg-gray-50"
                aria-label="Zoom out"
              >
                <Search size={11} />
              </button>
              <span>{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom(Math.min(300, zoom + 25))}
                className="size-5 rounded grid place-items-center hover:bg-gray-50"
                aria-label="Zoom in"
              >
                <Plus size={11} />
              </button>
            </div>
          </div>

          {/* Invoice preview */}
          <div className="flex-1 overflow-auto p-6">
            <div
              className="bg-white rounded shadow-sm border border-black/10 mx-auto"
              style={{
                width: `${(zoom / 100) * 380}px`,
                maxWidth: "100%",
              }}
            >
              <div
                className="h-12 rounded-t"
                style={{
                  background:
                    "linear-gradient(90deg, #f8d4ff 0%, #b89cff 60%, #6e5cff 100%)",
                }}
              />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-gray-500">
                      YOUR
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-gray-500">
                      LOGO
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-700">NO. 123451</div>
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-3">
                  INVOICE
                </h1>

                <div className="grid grid-cols-2 gap-3 text-[9px] mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 mb-0.5">
                      Sender:
                    </div>
                    <div className="text-gray-700">Albert Sort</div>
                    <div className="text-gray-700">
                      Albert1@invoicefly.com
                    </div>
                  </div>
                  <div className="text-right text-gray-700 leading-relaxed">
                    <div>Date: 18 April, 2027</div>
                    <div>Due Date: 26 May, 2027</div>
                    <div>P.O. Number: 0123</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[9px] mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 mb-0.5">
                      Billed to:
                    </div>
                    <div className="text-gray-700">Client Name</div>
                    <div className="text-gray-700">Client Address</div>
                    <div className="text-gray-700">Client Contact Details</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-0.5">
                      Ship to:
                    </div>
                    <div className="text-gray-700">Client Name</div>
                    <div className="text-gray-700">Client Address</div>
                    <div className="text-gray-700">Client Contact Details</div>
                  </div>
                </div>

                <div className="text-[8px] text-gray-500 italic mb-2 border-t border-black/[0.06] pt-2">
                  Payment terms: Payment is due within 15 / 30 days of the
                  invoice date.
                </div>

                <div>
                  <div
                    className="grid grid-cols-[1fr_60px_60px_70px] gap-2 text-[9px] uppercase tracking-wider text-white px-2.5 py-1.5 rounded-t"
                    style={{ background: "#3a2a6a" }}
                  >
                    <span>Item</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-center">Price</span>
                    <span className="text-right">Amount</span>
                  </div>
                  {[
                    { name: "Item 1", qty: 1, price: "$500", amount: "$500" },
                    { name: "Item 2", qty: 2, price: "$45", amount: "$90" },
                    { name: "Item 3", qty: 3, price: "$55", amount: "$165" },
                  ].map((it) => (
                    <div
                      key={it.name}
                      className="grid grid-cols-[1fr_60px_60px_70px] gap-2 px-2.5 py-1.5 text-[10px] border-b border-black/[0.04] text-gray-700"
                    >
                      <span>{it.name}</span>
                      <span className="text-center">{it.qty}</span>
                      <span className="text-center">{it.price}</span>
                      <span className="text-right">{it.amount}</span>
                    </div>
                  ))}
                  <div className="px-2.5 py-2 text-[10px] text-right space-y-0.5 text-gray-700">
                    <div>
                      Sub Total <span className="ml-3">$755</span>
                    </div>
                    <div>
                      Tax (%) <span className="ml-3">$0</span>
                    </div>
                    <div>
                      Shipping <span className="ml-3">$0</span>
                    </div>
                    <div>
                      Discount <span className="ml-3">$0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: review form */}
        <div className="w-[420px] shrink-0 bg-white overflow-y-auto">
          <div className="px-4 py-3 flex items-center justify-end border-b border-black/5">
            <span className="text-[11px] text-gray-500">0 of 3 reviewed</span>
          </div>

          <div className="p-4 space-y-5">
            {/* Supplier & Invoice */}
            <section>
              <h3 className="text-[12.5px] font-semibold text-gray-800 mb-3">
                Supplier &amp; Invoice
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <ReviewField label="Supplier name" value={doc.supplier} />
                <ReviewField label="Org. number" value="" />
                <ReviewField label="VAT number" value="" />
                <ReviewField
                  label="Invoice number"
                  value={doc.invoiceNumber}
                />
                <ReviewField
                  label="Invoice date"
                  value={doc.invoiceDate}
                  type="date"
                />
                <ReviewField
                  label="Due date"
                  value={doc.dueDate}
                  type="date"
                />
                <ReviewField label="Total amount" value={doc.total} />
                <ReviewField label="Street address" value="" />
                <ReviewField label="Zip code" value="" />
                <ReviewField label="City" value="" />
                <ReviewField label="Country" value={doc.country} />
              </div>
            </section>

            {/* Proposed Journal Entry */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[12.5px] font-semibold text-gray-800">
                  Proposed Journal Entry
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-[11px] text-gray-700 hover:text-gray-900 inline-flex items-center gap-0.5"
                  >
                    <ChevronRight size={11} className="text-gray-400" />
                    Cost center / project
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 border border-black/10 rounded-md px-2 py-0.5 text-[11px] text-gray-700 hover:bg-gray-50"
                  >
                    <Plus size={11} />
                    Add Row
                  </button>
                </div>
              </div>

              <div className="border border-black/10 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[150px_1fr_70px_70px] gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-500 bg-gray-50/60 border-b border-black/[0.06]">
                  <span>Account</span>
                  <span>Description</span>
                  <span className="text-right">Debit</span>
                  <span className="text-right">Credit</span>
                </div>
                <div className="grid grid-cols-[150px_1fr_70px_70px] gap-2 px-3 py-2 text-[11px] border-b border-black/[0.04] items-center">
                  <span className="text-gray-800">6540 IT-tjänster</span>
                  <span className="text-gray-700 truncate">
                    Inköp av digitala tjänster från Alt
                  </span>
                  <span className="text-right text-gray-900">755</span>
                  <span className="text-right text-gray-400">0</span>
                </div>
                <div className="grid grid-cols-[150px_1fr_70px_70px] gap-2 px-3 py-2 text-[11px] border-b border-black/[0.04] items-center">
                  <span className="text-gray-800">
                    2440 Leverantörsskulder
                  </span>
                  <span className="text-gray-700 truncate">
                    Skuld till leverantör Albert Sort (l…
                  </span>
                  <span className="text-right text-gray-400">0</span>
                  <span className="text-right text-gray-900">755</span>
                </div>
                <div className="grid grid-cols-[150px_1fr_70px_70px] gap-2 px-3 py-2 text-[11px] font-semibold bg-gray-50/40">
                  <span className="text-gray-900">Total</span>
                  <span></span>
                  <span className="text-right text-gray-900">755 kr</span>
                  <span className="text-right text-gray-900">755 kr</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewField({
  label,
  value,
  type,
}: {
  label: string;
  value: string;
  type?: "date";
}) {
  return (
    <div>
      <label className="block text-[10.5px] text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type={type ?? "text"}
          defaultValue={value}
          className="w-full border border-black/10 rounded-md px-2 py-1 text-[12px] text-gray-900 bg-white focus:outline-none focus:border-[#ee8fe0]"
        />
      </div>
    </div>
  );
}

/* ────────────────────────────── bank ────────────────────────────── */

function BankView() {
  const [refineOpen, setRefineOpen] = useState(false);
  const [refine, setRefine] = useState("");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl border border-black/10 grid place-items-center bg-white">
            <Landmark size={18} className="text-gray-700" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Bank Transactions</h2>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 border border-black/10 rounded-lg px-3 py-2 bg-white text-[12.5px] text-gray-800 hover:border-[#ee8fe0]/50 hover:bg-[#ee8fe0]/5 transition-colors"
        >
          <Landmark size={14} className="text-gray-600" />
          Manage banks
        </button>
      </div>

      {/* Stats / Wise Owl */}
      <div className="border border-black/10 rounded-xl bg-white overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="size-2 rounded-full bg-gray-300 mt-2 shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                Imported transactions
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-semibold text-gray-900">0</span>
                <span className="text-[12px] text-gray-500">
                  0 statement imports in view
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRefineOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            <Sparkles size={13} className="text-[#ee8fe0]" />
            <span className="text-[12.5px] text-gray-800">Wise Owl</span>
            <ChevronDown
              size={12}
              className={`text-gray-400 transition-transform ${
                refineOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {refineOpen && (
          <div className="border-t border-black/[0.06] px-4 py-3 bg-white">
            <div className="flex items-center gap-3 border border-black/10 rounded-xl bg-white px-3 py-2.5">
              <div className="size-9 shrink-0 rounded-full bg-white border border-black/10 overflow-hidden grid place-items-center">
                <Image
                  src="/owl.png"
                  alt=""
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              </div>
              <input
                type="text"
                value={refine}
                onChange={(e) => setRefine(e.target.value)}
                placeholder="Refine this table, for example: seb imports after 2026-01-01"
                className="flex-1 bg-transparent text-[13px] text-gray-700 placeholder:text-gray-400 outline-none"
              />
              <button
                type="button"
                aria-label="Send"
                className="size-9 shrink-0 rounded-full bg-[#ee8fe0]/30 hover:bg-[#ee8fe0]/45 grid place-items-center transition-colors"
              >
                <Send size={14} className="text-[#ee8fe0]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import history panel */}
      <div className="border border-black/10 rounded-xl bg-white p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-[14px] font-semibold text-gray-900">
              Import history
            </h3>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Search and filter statement imports inside the same table shell.
            </p>
          </div>
          <div className="flex items-center gap-1 border border-black/10 rounded-lg p-1 self-start">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen((o) => !o)}
              className={`size-7 rounded grid place-items-center transition-colors ${
                searchOpen ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <Search size={13} className="text-gray-500" />
            </button>
            <button
              type="button"
              aria-label="Filter"
              className="size-7 rounded grid place-items-center hover:bg-gray-50"
            >
              <Filter size={13} className="text-gray-500" />
            </button>
          </div>
        </div>

        {searchOpen && (
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search statement imports…"
            className="w-full border border-black/10 rounded-lg px-3 py-2 text-[12.5px] mb-3 focus:outline-none focus:border-[#ee8fe0]"
          />
        )}

        <div className="border border-dashed border-black/15 rounded-lg flex flex-col items-center justify-center py-12 px-4 text-center">
          <Landmark size={28} className="text-gray-300 mb-3" />
          <p className="text-[12.5px] text-gray-500">
            No statements imported yet — upload a CSV from a connected bank
            above.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────── reports ────────────────────────────── */

type ReportItem = {
  name: string;
  desc: string;
  status: "Ready" | "Draft" | "Closed" | "Generated";
};

const FINANCIAL_REPORTS: ReportItem[] = [
  { name: "Trial balance", desc: "Apr 2026", status: "Ready" },
  { name: "Income statement", desc: "Q1 2026", status: "Ready" },
  { name: "Balance sheet", desc: "Apr 2026", status: "Ready" },
  { name: "Cash flow statement", desc: "Q1 2026", status: "Ready" },
];

const REGULATORY_REPORTS: ReportItem[] = [
  { name: "VAT declaration", desc: "Q2 2026 — due 12 May", status: "Draft" },
  { name: "Year-end close", desc: "Fiscal 2025", status: "Closed" },
  {
    name: "Skatteverket NE-bilaga",
    desc: "Sole proprietor 2025",
    status: "Generated",
  },
  { name: "AGI submission", desc: "Apr 2026", status: "Generated" },
];

function ReportCardGrid({ items }: { items: ReportItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((r) => (
        <button
          key={r.name}
          type="button"
          className="text-left border border-black/10 rounded-lg bg-white p-4 hover:border-[#ee8fe0]/50 transition-colors group"
        >
          <div className="flex items-start justify-between mb-2">
            <FileBarChart size={18} className="text-[#ee8fe0]" />
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                r.status === "Ready"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : r.status === "Draft"
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : "bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {r.status}
            </span>
          </div>
          <div className="text-[13px] font-semibold text-gray-900">
            {r.name}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">{r.desc}</div>
          <div className="mt-3 text-[11px] text-[#ee8fe0] group-hover:underline">
            Open report →
          </div>
        </button>
      ))}
    </div>
  );
}

const FINANCIAL_TABS: { id: string; label: string; sub: string }[] = [
  { id: "balance", label: "Balance Sheet", sub: "Balansräkning" },
  { id: "income", label: "Income Statement", sub: "Resultaträkning" },
  { id: "trial", label: "Trial Balance", sub: "Saldobalans" },
];

function ReportsFinancialView() {
  const [tab, setTab] = useState("balance");
  const [date, setDate] = useState("2026-04-29");

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl border border-black/10 grid place-items-center bg-white">
          <FileBarChart size={18} className="text-gray-700" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Financial Position</h2>
      </div>

      {/* Tabs + as-of date + generate */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="border border-black/10 rounded-full p-1 flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
          {FINANCIAL_TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[#ee8fe0] text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="font-medium">{t.label}</span>
                <span
                  className={
                    active ? "text-white/80 ml-1" : "text-gray-400 ml-1"
                  }
                >
                  · {t.sub}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12.5px] text-gray-700">As of</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-black/10 rounded-lg px-2.5 py-1.5 bg-white text-[12px] text-gray-800 focus:outline-none focus:border-[#ee8fe0]"
          />
          <button
            type="button"
            className="border border-black/10 rounded-lg px-3 py-1.5 bg-white text-[12.5px] text-gray-800 hover:border-[#ee8fe0]/50 hover:bg-[#ee8fe0]/5 transition-colors"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Content */}
      {tab === "balance" && <BalanceSheetPanel />}
      {tab === "income" && <IncomeStatementPanel />}
      {tab === "trial" && <TrialBalancePanel />}
    </div>
  );
}

function StatementBlock({
  heading,
  totalLabel,
  total = "0,00",
}: {
  heading: string;
  totalLabel: string;
  total?: string;
}) {
  return (
    <div className="border border-black/10 rounded-lg bg-white p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] font-mono text-gray-500 pb-2 border-b border-black/[0.06]">
        {heading}
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[11px] uppercase tracking-[0.18em] font-mono text-gray-700">
          {totalLabel}
        </span>
        <span className="text-[14px] font-mono text-gray-900">{total}</span>
      </div>
    </div>
  );
}

function StatusBar({ text }: { text: string }) {
  return (
    <div className="border border-black/[0.06] rounded-lg bg-white px-3 py-2 flex items-center gap-2">
      <CircleCheck size={14} className="text-emerald-500" />
      <span className="text-[12px] text-gray-600">{text}</span>
    </div>
  );
}

function BalanceSheetPanel() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <StatementBlock
          heading="Tillgångar (Assets)"
          totalLabel="Summa tillgångar"
        />
        <StatementBlock
          heading="Eget Kapital & Skulder"
          totalLabel="Summa eget kapital & skulder"
        />
      </div>
      <StatusBar text="Balansräkningen balanserar · Periodens resultat: 0,00 SEK" />
    </>
  );
}

function IncomeStatementPanel() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <StatementBlock
          heading="Intäkter (Revenue)"
          totalLabel="Summa intäkter"
        />
        <StatementBlock
          heading="Kostnader (Expenses)"
          totalLabel="Summa kostnader"
        />
      </div>
      <StatusBar text="Periodens resultat: 0,00 SEK" />
    </>
  );
}

function TrialBalancePanel() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <StatementBlock heading="Debet" totalLabel="Summa debet" />
        <StatementBlock heading="Kredit" totalLabel="Summa kredit" />
      </div>
      <StatusBar text="Saldobalansen balanserar · Differens: 0,00 SEK" />
    </>
  );
}

const REGULATORY_TABS: { id: string; label: string; sub: string }[] = [
  { id: "moms", label: "Momsdeklaration", sub: "SKV 4700" },
  { id: "ne", label: "NE-bilaga", sub: "Enskild firma" },
  { id: "ink2", label: "INK2", sub: "Aktiebolag" },
  { id: "audit", label: "Audit Trail", sub: "Export" },
  { id: "full", label: "Full Archive", sub: "BFL 7 kap." },
  { id: "bokslut", label: "Bokslut", sub: "Year-end" },
];

function ReportsRegulatoryView() {
  const [activeTab, setActiveTab] = useState("moms");
  const [periodType, setPeriodType] = useState("Monthly");
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("4");

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl border border-black/10 grid place-items-center bg-white">
          <Scale size={18} className="text-gray-700" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Regulatory</h2>
      </div>

      {/* Tab pills */}
      <div className="border border-black/10 rounded-full p-1 flex items-center gap-1 overflow-x-auto">
        {REGULATORY_TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] whitespace-nowrap transition-colors ${
                active
                  ? "bg-[#ee8fe0] text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">{t.label}</span>
              <span className={active ? "text-white/80 ml-1" : "text-gray-400 ml-1"}>
                · {t.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Form row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-gray-700">
        <label className="flex items-center gap-2">
          <span>Period type</span>
          <div className="relative">
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value)}
              className="appearance-none border border-black/10 rounded-lg pl-3 pr-8 py-1.5 bg-white text-[12.5px] text-gray-800 hover:border-black/20 focus:outline-none focus:border-[#ee8fe0]"
            >
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </label>

        <label className="flex items-center gap-2">
          <span>Year</span>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-black/10 rounded-lg px-3 py-1.5 bg-white text-[12.5px] text-gray-800 w-24 hover:border-black/20 focus:outline-none focus:border-[#ee8fe0]"
          />
        </label>

        <label className="flex items-center gap-2">
          <span>Month</span>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-black/10 rounded-lg px-3 py-1.5 bg-white text-[12.5px] text-gray-800 w-16 hover:border-black/20 focus:outline-none focus:border-[#ee8fe0]"
          />
        </label>

        <button
          type="button"
          className="border border-black/10 rounded-lg px-4 py-1.5 bg-white text-[12.5px] text-gray-800 hover:border-[#ee8fe0]/50 hover:bg-[#ee8fe0]/5 transition-colors"
        >
          Generate
        </button>
      </div>

      {/* Placeholder */}
      <div className="flex items-center justify-center pt-16 pb-8">
        <p className="text-sm text-gray-400">
          Select a period and click &ldquo;Generate&rdquo;.
        </p>
      </div>
    </div>
  );
}

function ReportsCustomView() {
  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500 mb-2">
          <Sparkles size={12} className="text-[#ee8fe0]" />
          Custom reports
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug max-w-xl">
          Create custom reports that grab data directly from your database.
        </h2>
        <p className="text-[12.5px] text-gray-500 mt-1.5 max-w-xl leading-relaxed">
          Write SQL when you need to, or describe the report in plain English —
          Igdrasil queries your ledger and renders the chart.
        </p>
      </div>

      <SqlCustomReport />
    </div>
  );
}

/* ────────────────────────────── SQL custom report ────────────────────────────── */

function SqlCustomReport() {
  const data = [80, 100, 60, 90, 200, 1200, 1400, 1100, 1700, 800, 600, 400, 7500];
  const labels = [
    "2025-10-19", "2025-10-24", "2025-10-27", "2025-10-30", "2025-10-31",
    "2025-11-13", "2025-11-21", "2025-11-25", "2025-11-30", "2025-12-03",
    "2025-12-06", "2025-12-08", "2025-12-31",
  ];
  const maxY = 8000;
  const W = 720;
  const H = 240;
  const padX = 44;
  const padY = 20;

  const points = data.map((v, i) => ({
    x: padX + ((W - padX * 2) * i) / (data.length - 1),
    y: H - padY - ((H - padY * 2) * v) / maxY,
  }));

  const linePath = (() => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpx1 = p0.x + (p1.x - p0.x) / 3;
      const cpy1 = p0.y;
      const cpx2 = p1.x - (p1.x - p0.x) / 3;
      const cpy2 = p1.y;
      d += ` C ${cpx1.toFixed(2)} ${cpy1.toFixed(2)}, ${cpx2.toFixed(2)} ${cpy2.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
    }
    return d;
  })();
  const baseY = H - padY;
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${baseY} L ${points[0].x.toFixed(2)} ${baseY} Z`;

  return (
    <div className="space-y-3">
      {/* SQL editor card */}
      <div className="border border-black/10 rounded-lg bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-black/[0.06]">
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-gray-500">
            SQL
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="size-7 rounded grid place-items-center hover:bg-gray-50"
              aria-label="Undo"
            >
              <ChevronRight size={13} className="rotate-180 text-gray-400" />
            </button>
            <button
              type="button"
              className="size-7 rounded grid place-items-center hover:bg-gray-50"
              aria-label="Redo"
            >
              <ChevronRight size={13} className="text-gray-400" />
            </button>
            <button
              type="button"
              className="size-7 rounded-full bg-[#ee8fe0]/15 grid place-items-center hover:bg-[#ee8fe0]/25"
              aria-label="Run"
            >
              <Play size={11} className="text-[#ee8fe0] translate-x-[1px]" />
            </button>
            <button
              type="button"
              className="size-7 rounded grid place-items-center hover:bg-gray-50"
              aria-label="Collapse"
            >
              <ChevronDown size={13} className="rotate-180 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="px-4 py-3 font-mono text-[11px] leading-relaxed text-gray-700 bg-white">
          <div>
            <span className="text-blue-600">SELECT</span> e.entry_date,{" "}
            <span className="text-blue-600">SUM</span>(l.debit_amount{" "}
            <span className="text-pink-600">−</span> l.credit_amount){" "}
            <span className="text-blue-600">AS</span> daily_expenses
          </div>
          <div>
            <span className="text-blue-600">FROM</span> ledger_entry_lines{" "}
            <span className="text-blue-600">AS</span> l
          </div>
          <div>
            <span className="text-blue-600">JOIN</span> ledger_entries{" "}
            <span className="text-blue-600">AS</span> e
          </div>
          <div>
            <span className="text-blue-600">ON</span> e.id = l.entry_id
          </div>
          <div>
            <span className="text-blue-600">WHERE</span> e.status ={" "}
            <span className="text-orange-600">&apos;posted&apos;</span>{" "}
            <span className="text-blue-600">AND</span> e.entry_date{" "}
            <span className="text-pink-600">&gt;=</span>{" "}
            <span className="text-orange-600">&apos;2025-01-01&apos;</span>{" "}
            <span className="text-blue-600">AND</span> e.entry_date{" "}
            <span className="text-pink-600">&lt;=</span>{" "}
            <span className="text-orange-600">&apos;2025-12-31&apos;</span>
          </div>
          <div>
            <span className="text-blue-600">GROUP BY</span> e.entry_date
          </div>
          <div>
            <span className="text-blue-600">ORDER BY</span> e.entry_date
          </div>
          <div>
            <span className="text-blue-600">LIMIT</span> 10000
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-black/[0.06] bg-gray-50/60">
          <div className="size-6 shrink-0 rounded-full bg-white border border-black/10 overflow-hidden grid place-items-center">
            <Image
              src="/owl.png"
              alt=""
              width={24}
              height={24}
              className="h-full w-full object-cover"
            />
          </div>
          <input
            type="text"
            placeholder="Edit this report in plain English…"
            className="flex-1 bg-transparent text-[12px] text-gray-700 placeholder:text-gray-400 outline-none"
          />
          <button
            type="button"
            aria-label="Send"
            className="size-7 rounded-full bg-[#ee8fe0]/15 hover:bg-[#ee8fe0]/25 grid place-items-center"
          >
            <Send size={12} className="text-[#ee8fe0]" />
          </button>
        </div>
      </div>

      {/* Chart card */}
      <div className="border border-black/10 rounded-lg bg-white px-4 py-4">
        <div className="text-[11px] uppercase tracking-wider text-gray-500">
          Daily expenses · sum
        </div>
        <div className="text-2xl font-display text-gray-900 tracking-tight mt-0.5">
          14 771 kr
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-[240px] mt-3"
          aria-hidden
        >
          <defs>
            <linearGradient id="sql-detail-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ee8fe0" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#ee8fe0" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y axis grid + labels */}
          {[0, 2, 4, 6, 8].map((v) => {
            const y = baseY - ((H - padY * 2) * v) / 8;
            return (
              <g key={v}>
                <line
                  x1={padX}
                  y1={y}
                  x2={W - padX}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="2 3"
                  strokeWidth="0.8"
                />
                <text
                  x={padX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#9ca3af"
                  fontFamily="ui-monospace,SFMono-Regular,monospace"
                >
                  {v === 0 ? "0" : `${v}.0k`}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#sql-detail-fill)" />
          <path
            d={linePath}
            fill="none"
            stroke="#ee8fe0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx={last.x}
            cy={last.y}
            r="4"
            fill="#ee8fe0"
            stroke="white"
            strokeWidth="2"
          />
        </svg>

        <div className="flex justify-between mt-2 text-[9px] font-mono text-gray-400 px-1">
          {labels.map((l, i) => {
            if (
              i === 0 ||
              i === labels.length - 1 ||
              i % 2 === 1
            ) {
              return (
                <span
                  key={l}
                  className="-rotate-45 origin-top-left whitespace-nowrap"
                >
                  {l}
                </span>
              );
            }
            return <span key={l} />;
          })}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 pt-3 border-t border-black/[0.04]">
          <span className="size-2 rounded-full bg-[#ee8fe0]" />
          <span className="text-[11px] text-gray-600">daily_expenses</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 text-[11px] text-gray-500">
        <span>13 of 13 rows</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-black/10 hover:bg-gray-50"
        >
          <ArrowUpFromLine size={11} />
          CSV
        </button>
        <button
          type="button"
          aria-label="Search"
          className="size-7 rounded grid place-items-center border border-black/10 hover:bg-gray-50"
        >
          <Search size={12} />
        </button>
        <button
          type="button"
          aria-label="Filter"
          className="size-7 rounded grid place-items-center border border-black/10 hover:bg-gray-50"
        >
          <Filter size={12} />
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────── file archive ────────────────────────────── */

type ArchiveFile = {
  name: string;
  supplier: string;
  date: string;
  amount: string;
  status: "pending" | "matched" | "review";
  year: string;
  month: string;
};

const SUPPLIER_FILES: ArchiveFile[] = [
  {
    name: "Clean-Gradient-Purple-Invoice-Template.pdf",
    supplier: "Albert Sort",
    date: "Apr 2027",
    amount: "755 SEK",
    status: "pending",
    year: "2027",
    month: "April",
  },
  {
    name: "invoice demo.pdf",
    supplier: "COMPANY NAME",
    date: "Apr 2026",
    amount: "0 USD",
    status: "pending",
    year: "2026",
    month: "April",
  },
  {
    name: "simple-invoice-template-orange-en.jpg",
    supplier: "Your Company Name",
    date: "Apr 2026",
    amount: "18 SEK",
    status: "pending",
    year: "2026",
    month: "April",
  },
];

const CUSTOMER_FILES: ArchiveFile[] = [];

function FileArchiveView({ onMassUpload }: { onMassUpload: () => void }) {
  const [tab, setTab] = useState<"supplier" | "customer">("supplier");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [statusOpen, setStatusOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "2027": true,
    "2026": true,
  });

  const files = tab === "supplier" ? SUPPLIER_FILES : CUSTOMER_FILES;
  const filtered = files.filter((f) => {
    if (statusFilter !== "All status" && f.status !== statusFilter.toLowerCase()) {
      return false;
    }
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      f.name.toLowerCase().includes(q) ||
      f.supplier.toLowerCase().includes(q)
    );
  });

  const grouped: Record<string, Record<string, number>> = {};
  for (const f of files) {
    if (!grouped[f.year]) grouped[f.year] = {};
    grouped[f.year][f.month] = (grouped[f.year][f.month] || 0) + 1;
  }
  const yearKeys = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  const toggleYear = (y: string) =>
    setExpanded((e) => ({ ...e, [y]: !e[y] }));

  return (
    <div className="p-4 sm:p-6 space-y-3">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab("supplier")}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] transition-colors ${
              tab === "supplier"
                ? "bg-gray-900 text-white"
                : "border border-black/10 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Leverantörsfakturor
          </button>
          <button
            type="button"
            onClick={() => setTab("customer")}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] transition-colors ${
              tab === "customer"
                ? "bg-gray-900 text-white"
                : "border border-black/10 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Kundfakturor
          </button>
        </div>

        <div className="flex items-center gap-1.5 border border-black/10 rounded-lg bg-white px-2.5 py-1.5 flex-1 min-w-[200px] max-w-md">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files, suppliers, invoice numbers…"
            className="flex-1 bg-transparent text-[12.5px] text-gray-700 placeholder:text-gray-400 outline-none"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setStatusOpen((o) => !o)}
            className="inline-flex items-center gap-2 border border-black/10 rounded-lg px-3 py-1.5 bg-white text-[12.5px] text-gray-700 hover:bg-gray-50"
          >
            {statusFilter}
            <ChevronDown size={12} className="text-gray-400" />
          </button>
          {statusOpen && (
            <div className="absolute right-0 mt-1 w-36 border border-black/10 rounded-lg bg-white shadow-lg z-10 py-1">
              {["All status", "Pending", "Matched", "Review"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s);
                    setStatusOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 ${
                    statusFilter === s
                      ? "text-gray-900 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center border border-black/10 rounded-lg bg-white p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className={`size-7 grid place-items-center rounded ${
              viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            <Menu size={13} className="text-gray-600" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            className={`size-7 grid place-items-center rounded ${
              viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            <Grid2x2 size={13} className="text-gray-600" />
          </button>
        </div>

        <button
          type="button"
          onClick={onMassUpload}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 bg-[#ee8fe0] text-white text-[12.5px] hover:bg-[#e57bd1]"
        >
          <ArrowUpFromLine size={13} />
          Mass Upload
        </button>
        <button
          type="button"
          onClick={onMassUpload}
          className="inline-flex items-center gap-2 border border-black/10 rounded-lg px-3 py-1.5 bg-white text-[12.5px] text-gray-700 hover:bg-gray-50"
        >
          <ArrowUpFromLine size={13} className="text-gray-600" />
          Quick Upload
        </button>
      </div>

      {/* Body: sidebar tree + main table */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-0 border border-black/10 rounded-lg bg-white overflow-hidden">
        {/* Tree sidebar */}
        <aside className="border-b md:border-b-0 md:border-r border-black/[0.06] p-3">
          <div className="text-[12px] font-semibold text-gray-900">
            {tab === "supplier" ? "Leverantörsfakturor" : "Kundfakturor"}
          </div>
          <div className="text-[10.5px] text-gray-500 mt-0.5">
            {files.length} files · 7yr retention
          </div>

          <div className="mt-3 space-y-0.5">
            {yearKeys.length === 0 ? (
              <div className="text-[11px] text-gray-400 italic px-1.5">
                No folders yet
              </div>
            ) : (
              yearKeys.map((y) => {
                const months = grouped[y];
                const isOpen = expanded[y] ?? false;
                const yearTotal = Object.values(months).reduce(
                  (a, b) => a + b,
                  0,
                );
                return (
                  <div key={y}>
                    <button
                      type="button"
                      onClick={() => toggleYear(y)}
                      className="w-full flex items-center gap-1 px-1.5 py-1 rounded text-[12px] text-gray-700 hover:bg-gray-50"
                    >
                      <ChevronRight
                        size={11}
                        className={`text-gray-400 transition-transform ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                      <FolderOpen size={12} className="text-[#ee8fe0]" />
                      <span className="flex-1 text-left">{y}</span>
                      <span className="text-gray-400 text-[10.5px]">
                        {yearTotal}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="ml-5 space-y-0.5 mt-0.5">
                        {Object.entries(months).map(([m, count]) => (
                          <div
                            key={m}
                            className="flex items-center gap-1 px-1.5 py-1 rounded text-[12px] text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <ChevronRight
                              size={11}
                              className="text-gray-400"
                            />
                            <FolderOpen size={12} className="text-gray-400" />
                            <span className="flex-1">{m}</span>
                            <span className="text-gray-400 text-[10.5px]">
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Main table */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[minmax(220px,1fr)_140px_100px_100px_90px] min-w-[680px] px-4 py-2.5 text-[10.5px] uppercase tracking-[0.12em] text-gray-400 bg-gray-50/60 border-b border-black/[0.06]">
            <span>File</span>
            <span>Supplier</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-[12.5px] text-gray-400">
              {files.length === 0
                ? "No files in this folder yet."
                : "No files match your search."}
            </div>
          ) : (
            filtered.map((f) => (
              <div
                key={f.name}
                className="grid grid-cols-[minmax(220px,1fr)_140px_100px_100px_90px] min-w-[680px] px-4 py-3 text-[12.5px] items-center border-b border-black/[0.04] last:border-0 hover:bg-gray-50/60 cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-red-400 shrink-0" />
                  <span className="text-gray-900 truncate">{f.name}</span>
                </span>
                <span className="text-gray-700 truncate">{f.supplier}</span>
                <span className="text-gray-500">{f.date}</span>
                <span className="text-gray-700">{f.amount}</span>
                <span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10.5px] border border-black/10 text-gray-600 bg-white">
                    {f.status}
                  </span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────── accounting subviews ────────────────────────────── */

function CustomersView() {
  return (
    <div className="p-4 sm:p-6">
      <div className="border border-black/10 rounded-lg bg-white overflow-x-auto">
        <div className="grid grid-cols-[1fr_120px_120px_100px] min-w-[640px] px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] text-gray-400 border-b border-black/5 bg-gray-50">
          <span>Customer</span>
          <span>Org. number</span>
          <span className="text-right">YTD revenue</span>
          <span className="text-right">Invoices</span>
        </div>
        {[
          { name: "Volvo AB", org: "556012-5790", rev: "184 200", count: 6 },
          { name: "H&M Hennes & Mauritz", org: "556042-7220", rev: "92 480", count: 4 },
          { name: "Spotify Sverige", org: "556703-7485", rev: "52 100", count: 3 },
          { name: "Klarna Bank", org: "556737-0431", rev: "28 990", count: 2 },
          { name: "Tink AB", org: "556898-2192", rev: "14 200", count: 2 },
        ].map((c) => (
          <div
            key={c.name}
            className="grid grid-cols-[1fr_120px_120px_100px] min-w-[640px] px-5 py-3 text-[12px] border-b border-black/5 last:border-0 hover:bg-gray-50/60 cursor-pointer items-center"
          >
            <span className="text-gray-900">{c.name}</span>
            <span className="text-gray-500 font-mono">{c.org}</span>
            <span className="text-right text-gray-900 font-medium">
              {c.rev} SEK
            </span>
            <span className="text-right text-gray-500">{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuppliersView() {
  return (
    <div className="p-4 sm:p-6">
      <div className="border border-black/10 rounded-lg bg-white overflow-x-auto">
        <div className="grid grid-cols-[1fr_120px_100px] min-w-[480px] px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] text-gray-400 border-b border-black/5 bg-gray-50">
          <span>Supplier</span>
          <span className="text-right">YTD spend</span>
          <span className="text-right">Invoices</span>
        </div>
        {[
          { name: "Marmar Annonser AB", spend: "12 480", count: 14 },
          { name: "Skogen Pay AB", spend: "8 240", count: 4 },
          { name: "Konstverk Studio AB", spend: "3 990", count: 12 },
          { name: "Molnverk Sverige AB", spend: "2 480", count: 4 },
          { name: "Granit Domäner AB", spend: "1 240", count: 2 },
        ].map((s) => (
          <div
            key={s.name}
            className="grid grid-cols-[1fr_120px_100px] min-w-[480px] px-5 py-3 text-[12px] border-b border-black/5 last:border-0 hover:bg-gray-50/60 cursor-pointer"
          >
            <span className="text-gray-900">{s.name}</span>
            <span className="text-right text-gray-900 font-medium">
              {s.spend} SEK
            </span>
            <span className="text-right text-gray-500">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeesView() {
  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { name: "Anna Lindberg", role: "CEO", salary: "55 000" },
          { name: "Erik Johansson", role: "CTO", salary: "52 000" },
          { name: "Maja Karlsson", role: "Designer", salary: "42 000" },
          { name: "Oskar Nilsson", role: "Engineer", salary: "48 000" },
        ].map((e) => (
          <div
            key={e.name}
            className="border border-black/10 rounded-lg bg-white p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-[#ee8fe0]/30 flex items-center justify-center text-[14px] font-semibold text-gray-700">
              {e.name.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-gray-900 truncate">
                {e.name}
              </div>
              <div className="text-[11px] text-gray-500">{e.role}</div>
            </div>
            <div className="text-right">
              <div className="text-[12px] font-medium text-gray-900">
                {e.salary}
              </div>
              <div className="text-[10px] text-gray-500">SEK / month</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LedgerView() {
  return (
    <div className="p-4 sm:p-6">
      <div className="border border-black/10 rounded-lg bg-white overflow-x-auto">
        <div className="grid grid-cols-[80px_1fr_120px_120px] min-w-[560px] px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] text-gray-400 border-b border-black/5 bg-gray-50">
          <span>Account</span>
          <span>Name</span>
          <span className="text-right">Debit</span>
          <span className="text-right">Credit</span>
        </div>
        {[
          { acc: "1930", name: "Bank — SEB löpande", debit: "284 500", credit: "92 340" },
          { acc: "2440", name: "Leverantörsskulder", debit: "0", credit: "12 480" },
          { acc: "3010", name: "Försäljning Sverige 25%", debit: "0", credit: "212 400" },
          { acc: "5410", name: "Förbrukningsinventarier", debit: "8 220", credit: "0" },
          { acc: "6540", name: "IT-tjänster", debit: "16 740", credit: "0" },
          { acc: "7210", name: "Löner till tjänstemän", debit: "197 000", credit: "0" },
          { acc: "2611", name: "Utgående moms 25%", debit: "0", credit: "53 100" },
          { acc: "2641", name: "Ingående moms", debit: "4 880", credit: "0" },
        ].map((row) => (
          <div
            key={row.acc}
            className="grid grid-cols-[80px_1fr_120px_120px] min-w-[560px] px-5 py-2.5 text-[12px] border-b border-black/5 last:border-0 hover:bg-gray-50/60"
          >
            <span className="font-mono text-gray-700">{row.acc}</span>
            <span className="text-gray-900 truncate">{row.name}</span>
            <span className="text-right text-gray-900">{row.debit}</span>
            <span className="text-right text-gray-900">{row.credit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────── chat side panel ────────────────────────────── */

const DEMO_CHAT = [
  { from: "user" as const, text: "What's my VAT this quarter?" },
  {
    from: "bot" as const,
    text: "Q2 2026 VAT is 48 220 SEK. Sales VAT 60 100 SEK − input VAT 11 880 SEK. Filing window opens 1 May, due 12 May.",
  },
  { from: "user" as const, text: "Can I deduct the Molnverk invoice?" },
  {
    from: "bot" as const,
    text: "Yes — Molnverk Sverige AB charges 1 240 SEK as a B2B EU service (reverse charge). I'll book it under 6540 IT-tjänster with 25% reverse-charge VAT.",
  },
];

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  return (
    <div className="absolute md:static inset-0 md:inset-auto z-10 w-full md:w-[340px] shrink-0 border-l border-black/[0.06] bg-white flex flex-col">
      <div className="flex items-center px-4 py-3 border-b border-black/[0.06]">
        <span className="text-[12.5px] font-semibold text-gray-900 flex items-center gap-1.5">
          <MessageSquare size={13} className="text-[#ee8fe0]" />
          Chat Assistant
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-700"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {DEMO_CHAT.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[12.5px] leading-relaxed ${
                m.from === "user"
                  ? "bg-[#ee8fe0] text-gray-900 rounded-tr-md"
                  : "bg-gray-100 text-gray-900 rounded-tl-md"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-black/[0.06] p-3 bg-[#fafaf8]">
        <div className="flex items-center gap-2 bg-white border border-[#ee8fe0]/40 rounded-2xl px-3 py-2 shadow-sm">
          <Image
            src="/owl.png"
            alt=""
            aria-hidden
            width={18}
            height={18}
            className="w-[18px] h-[18px] shrink-0 object-contain"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            className="flex-1 bg-transparent text-[12.5px] text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="button"
            className="w-7 h-7 rounded-full bg-[#ee8fe0] hover:bg-[#e57bd1] flex items-center justify-center"
          >
            <Send size={11} className="text-white -ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────── modal ────────────────────────────── */

function UploadModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[15px] font-semibold text-gray-900">
              Mass upload
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Drop files below. Duplicates are detected instantly.
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
        <div className="border-2 border-dashed border-black/10 rounded-lg py-8 text-center mb-3">
          <ArrowUpFromLine
            size={22}
            className="text-gray-400 mx-auto mb-1.5"
          />
          <div className="text-[12px] text-gray-700 font-medium">
            Drop files here or click to browse
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            PDF, JPG, PNG supported
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-[12px] px-3 py-1.5 rounded-md border border-black/10 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="text-[12px] px-3 py-1.5 rounded-md bg-[#ee8fe0] hover:bg-[#e57bd1] text-white font-medium flex items-center gap-1.5"
          >
            <ArrowUpFromLine size={11} />
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
