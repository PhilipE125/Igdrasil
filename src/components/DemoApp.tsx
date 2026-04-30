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
  | "reports";

const ACCOUNTING_SUBS: { key: ViewKey; label: string }[] = [
  { key: "automations", label: "Automations" },
  { key: "customers", label: "Customers" },
  { key: "suppliers", label: "Suppliers" },
  { key: "employees", label: "Employees" },
  { key: "ledger", label: "Ledger" },
];

const ACCOUNTING_KEYS: ViewKey[] = ACCOUNTING_SUBS.map((s) => s.key);

const DATA: {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
  expandable?: boolean;
}[] = [
  { key: "fileArchive", label: "File Archive", icon: FolderOpen },
  { key: "bank", label: "Bank Transactions", icon: Landmark },
  { key: "reports", label: "Reports", icon: FileBarChart, expandable: true },
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
                  {view === "fileArchive" && <FileArchiveView />}
                  {view === "bank" && <BankView />}
                  {view === "reports" && <ReportsView />}
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
    reports: "Reports",
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
  const [selected, setSelected] = useState<string | null>(null);
  const selectedDoc = INBOX_ROWS.find((r) => r.id === selected);

  return (
    <div className="flex h-full relative">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-[#f4f3f1] border-b border-black/5">
          <div className="flex bg-white rounded-lg border border-black/5 p-0.5 text-[12px]">
            <span className="px-3 py-0.5 rounded bg-gray-100 text-gray-900 font-medium">
              Inbox
            </span>
            <span className="px-3 py-0.5 rounded text-gray-500 cursor-pointer hover:text-gray-800">
              Review
            </span>
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

/* ────────────────────────────── bank ────────────────────────────── */

const BANK_MATCHES = [
  {
    bank: "MARMAR*ADS456789",
    vendor: "Marmar Annonser AB",
    amount: "499.00",
    fuzzy: true,
  },
  {
    bank: "MOLNVERK*K2H7",
    vendor: "Molnverk Sverige AB",
    amount: "1 240.00",
    fuzzy: true,
  },
  {
    bank: "SKOGEN PAY 4D",
    vendor: "Skogen Pay AB",
    amount: "8 240.00",
    fuzzy: false,
  },
  {
    bank: "KONSTV*MTHLY 65A",
    vendor: "Konstverk Studio AB",
    amount: "529.00",
    fuzzy: false,
  },
  {
    bank: "GRANIT*ANNUAL",
    vendor: "Granit Domäner AB",
    amount: "99.00",
    fuzzy: true,
  },
];

function BankView() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-start sm:items-center justify-between gap-3 mb-4 flex-col sm:flex-row">
        <div>
          <div className="text-[13px] font-semibold text-gray-900">
            5 of 5 transactions matched
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            April 1 → April 28, 2026
          </div>
        </div>
        <button className="flex items-center gap-1 bg-[#ee8fe0] hover:bg-[#e57bd1] text-white text-[11px] font-medium rounded-md px-3 py-1.5 self-start">
          <Sparkles size={11} />
          Re-run AI matching
        </button>
      </div>

      <div className="bg-white border border-black/10 rounded-lg overflow-x-auto">
        <div className="grid grid-cols-[1fr_60px_1fr_120px] min-w-[520px] gap-3 px-4 py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] text-gray-400 border-b border-black/5 bg-gray-50">
          <span className="flex items-center gap-1.5">
            <Landmark size={10} />
            Bank
          </span>
          <span></span>
          <span className="flex items-center gap-1.5">
            <FileText size={10} />
            Invoice
          </span>
          <span className="text-right">Amount</span>
        </div>
        {BANK_MATCHES.map((m) => (
          <div
            key={m.bank}
            className="grid grid-cols-[1fr_60px_1fr_120px] min-w-[520px] gap-3 px-4 py-3 items-center border-b border-black/5 last:border-0 hover:bg-gray-50/60 cursor-pointer"
          >
            <div className="font-mono text-[12px] text-gray-700 truncate">
              {m.bank}
            </div>
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#ee8fe0]/15 border border-[#ee8fe0]/50">
                <Sparkles size={9} className="text-[#ee8fe0]" />
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-gray-700">
                  AI
                </span>
                <ArrowRight size={9} className="text-[#ee8fe0]" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[12px] text-gray-900 truncate">
                {m.vendor}
              </div>
              {m.fuzzy && (
                <div className="text-[9px] uppercase tracking-[0.12em] text-orange-700 mt-0.5">
                  Fuzzy match
                </div>
              )}
            </div>
            <div className="text-[12px] text-gray-900 font-medium text-right">
              {m.amount} SEK
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────── reports ────────────────────────────── */

const REPORTS = [
  { name: "Trial balance", desc: "Apr 2026", status: "Ready" },
  { name: "Income statement", desc: "Q1 2026", status: "Ready" },
  { name: "Balance sheet", desc: "Apr 2026", status: "Ready" },
  { name: "VAT declaration", desc: "Q2 2026 — due 12 May", status: "Draft" },
  { name: "Year-end close", desc: "Fiscal 2025", status: "Closed" },
  {
    name: "Skatteverket NE-bilaga",
    desc: "Sole proprietor 2025",
    status: "Generated",
  },
];

function ReportsView() {
  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REPORTS.map((r) => (
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
    </div>
  );
}

/* ────────────────────────────── file archive ────────────────────────────── */

function FileArchiveView() {
  return (
    <div className="p-4 sm:p-6">
      <div className="border border-black/10 rounded-lg bg-white overflow-x-auto">
        <div className="grid grid-cols-[1fr_120px_120px_80px] min-w-[600px] px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] text-gray-400 border-b border-black/5 bg-gray-50">
          <span>File</span>
          <span>Supplier</span>
          <span>Date</span>
          <span className="text-right">Size</span>
        </div>
        {[
          { name: "Marmar-Ads-Q2-Faktura.pdf", supplier: "Marmar", date: "2026-04-18", size: "92 KB" },
          { name: "Skogen-Pay-April.pdf", supplier: "Skogen Pay", date: "2026-04-15", size: "48 KB" },
          { name: "Molnverk-Mars-Faktura.pdf", supplier: "Molnverk", date: "2026-04-02", size: "120 KB" },
          { name: "Konstverk-Studio-Mthly.pdf", supplier: "Konstverk Studio", date: "2026-04-01", size: "32 KB" },
          { name: "granit-domaner-kvitto.jpg", supplier: "Granit", date: "2026-03-28", size: "210 KB" },
        ].map((f) => (
          <div
            key={f.name}
            className="grid grid-cols-[1fr_120px_120px_80px] min-w-[600px] px-5 py-3 text-[12px] border-b border-black/5 last:border-0 hover:bg-gray-50/60 cursor-pointer items-center"
          >
            <span className="flex items-center gap-2 min-w-0">
              <FileText size={13} className="text-[#ee8fe0] shrink-0" />
              <span className="text-gray-900 truncate">{f.name}</span>
            </span>
            <span className="text-gray-700 truncate">{f.supplier}</span>
            <span className="text-gray-500">{f.date}</span>
            <span className="text-gray-500 text-right">{f.size}</span>
          </div>
        ))}
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
