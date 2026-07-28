"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowUpFromLine,
  Bell,
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  FileText,
  Filter,
  FolderOpen,
  Landmark,
  LayoutDashboard,
  Mail,
  Play,
  ScanLine,
  Search,
  Send,
  Upload,
  X,
} from "lucide-react";

const STEP_DURATIONS = [1100, 1300, 1000, 1800, 1000, 1200, 1200, 3500];

function SidebarItem({
  icon,
  label,
  active,
  expandable,
  expanded,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  expandable?: boolean;
  expanded?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11px] ${
        active ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {expandable && (
        <ChevronRight
          size={11}
          className={`text-gray-400 transition-transform duration-300 ${
            expanded ? "rotate-90" : ""
          }`}
        />
      )}
    </div>
  );
}

export function InboxWorkflowCard({ active = true }: { active?: boolean }) {
  const [step, setStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReducedMotion(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (active && !reducedMotion) setStep(0);
  }, [active, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      setStep(7);
      return;
    }
    if (!active) return;
    const id = window.setTimeout(
      () => setStep((s) => (s + 1) % STEP_DURATIONS.length),
      STEP_DURATIONS[step],
    );
    return () => window.clearTimeout(id);
  }, [step, reducedMotion, active]);

  const showDashboard = step === 0 || step === 1;
  const accountingOpen = step >= 1;
  const automationsActive = step >= 2;
  const showInbox = step >= 2 && step <= 6;
  const showModal = step === 3;
  const newRowVisible = step >= 4 && step <= 6;
  const showReview = step === 7;

  const newRowStatus =
    step === 4
      ? {
          label: "Uploading",
          cls: "bg-blue-50 text-blue-700 border-blue-200",
        }
      : step === 5
        ? {
            label: "Matching With Bank",
            cls: "bg-orange-50 text-orange-700 border-orange-200",
          }
        : {
            label: "Ready for Review",
            cls: "bg-orange-50 text-orange-700 border-orange-200",
          };

  return (
    <div className="relative w-full">
      <div className="relative rounded-2xl overflow-hidden border border-black/10 shadow-2xl bg-[#f4f3f1] h-[540px] flex flex-col">
        {/* Top header bar */}
        <div className="flex items-center px-4 py-3 border-b border-black/5 bg-[#f4f3f1] relative z-10">
          <span className="text-[13px] font-medium text-gray-900">
            {showReview ? "Review" : showInbox ? "Inbox" : "Dashboard"}
          </span>
          <div className="ml-auto flex items-center gap-1.5 text-[10px]">
            {showInbox && !showModal && (
              <>
                <span className="px-2 py-1 rounded-md bg-white border border-black/5 text-gray-700 flex items-center gap-1">
                  <Mail size={11} />
                  Email
                </span>
                <span
                  className={`px-2 py-1 rounded-md border flex items-center gap-1 transition-all ${
                    step === 2
                      ? "bg-[#ee8fe0]/20 border-[#ee8fe0]/60 text-gray-900 ring-2 ring-[#ee8fe0]/40 animate-pulse"
                      : "bg-white border-black/5 text-gray-700"
                  }`}
                >
                  <Upload size={11} />
                  Mass Upload
                </span>
                <span className="px-2 py-1 rounded-md bg-white border border-black/5 text-gray-700 flex items-center gap-1">
                  <Activity size={11} />
                  Runs log
                </span>
              </>
            )}
            {!showInbox && !showReview && (
              <Bell size={14} className="text-gray-500" />
            )}
          </div>
        </div>

        <div className="relative bg-white flex-1">
          {/* DASHBOARD VIEW */}
          <div
            className={`absolute inset-0 flex transition-opacity duration-500 ${
              showDashboard ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="w-[140px] bg-[#fafaf8] border-r border-black/5 px-2 py-3 space-y-3">
              <div className="text-[9px] uppercase tracking-[0.18em] text-gray-400 px-2">
                Platform
              </div>
              <div className="space-y-0.5">
                <SidebarItem
                  icon={<LayoutDashboard size={12} />}
                  label="Dashboard"
                  active={!automationsActive}
                />
                <SidebarItem
                  icon={<Calculator size={12} />}
                  label="Accounting"
                  expandable
                  expanded={accountingOpen}
                  active={automationsActive}
                />
                {accountingOpen && (
                  <div className="pl-5 space-y-0.5 transition-all">
                    <div
                      className={`px-2 py-1 rounded text-[11px] ${
                        automationsActive
                          ? "bg-[#ee8fe0]/20 text-gray-900 font-medium ring-1 ring-[#ee8fe0]/50"
                          : "text-gray-600"
                      }`}
                    >
                      Automations
                    </div>
                    <div className="px-2 py-1 text-[11px] text-gray-500">
                      Customers
                    </div>
                    <div className="px-2 py-1 text-[11px] text-gray-500">
                      Suppliers
                    </div>
                    <div className="px-2 py-1 text-[11px] text-gray-500">
                      Employees
                    </div>
                    <div className="px-2 py-1 text-[11px] text-gray-500">
                      Ledger
                    </div>
                  </div>
                )}
              </div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-gray-400 px-2 pt-2">
                Data
              </div>
              <div className="space-y-0.5">
                <SidebarItem
                  icon={<FolderOpen size={12} />}
                  label="File Archive"
                />
                <SidebarItem
                  icon={<Landmark size={12} />}
                  label="Bank Transactions"
                />
                <SidebarItem
                  icon={<FileBarChart size={12} />}
                  label="Reports"
                  expandable
                />
              </div>
            </div>

            <div className="flex-1 px-4 py-4 overflow-y-auto">
              <div className="mb-3">
                <div className="text-[15px] font-medium text-gray-900">
                  Dashboard
                </div>
              </div>
              <div className="bg-white border border-black/10 rounded-lg p-3 mb-3">
                <div className="text-[10px] text-gray-500 mb-2">
                  2026-01-01 → 2026-04-28
                </div>
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <div className="text-gray-400 mb-0.5">Försäljning</div>
                    <div className="text-gray-700">—</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-0.5">Kostnader</div>
                    <div className="text-gray-700">—</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-0.5">Leverantörer</div>
                    <div className="text-gray-700">—</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-0.5">Kunder</div>
                    <div className="text-gray-700">—</div>
                  </div>
                </div>
              </div>
              <div className="text-[11px] font-medium text-gray-900 mb-1.5">
                Things to do
              </div>
              <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-[11px] text-green-700 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                You&apos;re all caught up
              </div>
              <div className="text-[12px] font-medium text-gray-900 mb-1.5">
                Ask me anything about your business
              </div>
              <div className="flex items-center gap-2 bg-white border border-[#ee8fe0]/60 rounded-xl px-2.5 py-2 shadow-sm">
                <Image
                  src="/owl.png"
                  alt=""
                  aria-hidden
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <span className="flex-1 text-[11px] text-gray-400">
                  Ask anything — your chat opens on the right
                </span>
                <span className="w-6 h-6 rounded-full bg-[#ee8fe0] flex items-center justify-center">
                  <Send size={11} className="text-white -ml-0.5" />
                </span>
              </div>
            </div>
          </div>

          {/* INBOX VIEW */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              showInbox ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center px-4 py-2 bg-[#f4f3f1] border-b border-black/5">
              <div className="flex bg-white rounded-lg border border-black/5 p-0.5 text-[12px]">
                <span className="px-3 py-0.5 rounded bg-gray-100 text-gray-900 font-medium">
                  Inbox
                </span>
                <span className="px-3 py-0.5 rounded text-gray-500">
                  Review
                </span>
              </div>
              <button
                type="button"
                className="ml-auto flex items-center gap-1 bg-green-300 text-gray-900 rounded-md px-3 py-1 text-[11px] font-medium"
              >
                <Play size={11} fill="currentColor" />
                Run
              </button>
              <Search size={14} className="text-gray-400 ml-2" />
              <Filter size={14} className="text-gray-400 ml-2" />
            </div>

            <div className="bg-white">
              <div className="grid grid-cols-[1fr_46px_110px_120px_36px] gap-2 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.15em] text-gray-400 border-b border-black/5">
                <span>Document</span>
                <span>Format</span>
                <span>Supplier</span>
                <span>Status</span>
                <span></span>
              </div>

              <div
                className={`grid grid-cols-[1fr_46px_110px_120px_36px] gap-2 px-4 text-[12px] border-b border-black/5 items-center transition-all duration-500 ease-out overflow-hidden ${
                  newRowVisible
                    ? "opacity-100 py-3 max-h-12"
                    : "opacity-0 py-0 max-h-0 border-b-0"
                }`}
              >
                <span className="text-gray-900 font-light truncate flex items-center gap-1.5 min-w-0">
                  <ChevronRight
                    size={12}
                    className="text-gray-400 shrink-0"
                  />
                  <span className="truncate">
                    Clean-Gradient-Purple-Invoice-Template.pdf
                  </span>
                </span>
                <span className="text-gray-700">PDF</span>
                <span className="text-gray-700 truncate">
                  Clean Gradient Purple
                </span>
                <span
                  key={newRowStatus.label}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium border w-fit whitespace-nowrap ${newRowStatus.cls}`}
                >
                  {newRowStatus.label}
                </span>
                <span className="w-7 h-7 rounded-md bg-[#ee8fe0]/40 flex items-center justify-center">
                  <ScanLine size={12} className="text-gray-700" />
                </span>
              </div>

              <div className="grid grid-cols-[1fr_46px_110px_120px_36px] gap-2 px-4 py-3 text-[12px] border-b border-black/5 items-center">
                <span className="text-gray-900 font-light truncate flex items-center gap-1.5 min-w-0">
                  <ChevronRight
                    size={12}
                    className="text-gray-400 shrink-0"
                  />
                  <span className="truncate">invoice demo.pdf</span>
                </span>
                <span className="text-gray-700">PDF</span>
                <span className="text-gray-700 truncate">COMPANY NAME</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200 w-fit whitespace-nowrap">
                  Matching With Bank
                </span>
                <span className="w-7 h-7 rounded-md bg-[#ee8fe0]/40 flex items-center justify-center">
                  <ScanLine size={12} className="text-gray-700" />
                </span>
              </div>

              <div className="grid grid-cols-[1fr_46px_110px_120px_36px] gap-2 px-4 py-3 text-[12px] border-b border-black/5 items-center">
                <span className="text-gray-900 font-light truncate flex items-center gap-1.5 min-w-0">
                  <ChevronRight
                    size={12}
                    className="text-gray-400 shrink-0"
                  />
                  <span className="truncate">
                    simple-invoice-template-orange-en.jpg
                  </span>
                </span>
                <span className="text-gray-700">JPG</span>
                <span className="text-gray-700 truncate">
                  Your Company Name
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200 w-fit whitespace-nowrap">
                  Ready for Review
                </span>
                <span className="w-7 h-7 rounded-md bg-[#ee8fe0]/40 flex items-center justify-center">
                  <ScanLine size={12} className="text-gray-700" />
                </span>
              </div>
            </div>
          </div>

          {/* MASS UPLOAD MODAL */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              showModal ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative bg-white rounded-xl shadow-2xl w-[88%] max-w-[420px] p-4 mx-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[14px] font-medium text-gray-900">
                    Mass Upload
                  </div>
                  <div className="text-[10.5px] text-gray-500 mt-0.5">
                    Drop files below. Duplicates are detected instantly before
                    uploading.
                  </div>
                </div>
                <X size={14} className="text-gray-400 cursor-pointer" />
              </div>
              <div className="border-2 border-dashed border-black/10 rounded-lg py-6 text-center mb-3">
                <ArrowUpFromLine
                  size={20}
                  className="text-gray-400 mx-auto mb-1"
                />
                <div className="text-[11px] text-gray-700 font-medium">
                  Drop files here or click to browse
                </div>
                <div className="text-[10px] text-gray-400">
                  PDF, JPG, PNG supported
                </div>
              </div>
              <div className="text-[10px] text-gray-500 mb-1.5 flex items-center justify-between">
                <span>1 file staged</span>
                <span className="text-gray-400">Clear all</span>
              </div>
              <div className="flex items-center gap-2 border border-black/10 rounded-md px-2.5 py-1.5 mb-3">
                <FileText size={12} className="text-[#ee8fe0]" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-900 truncate">
                    Clean-Gradient-Purple-Invoice-Template.pdf
                  </div>
                  <div className="text-[9px] text-gray-400">153.0 KB</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#ee8fe0]/20 text-gray-700 border border-[#ee8fe0]/40">
                  Ready
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button className="text-[11px] px-3 py-1.5 rounded-md border border-black/10 text-gray-700">
                  Cancel
                </button>
                <button className="text-[11px] px-3 py-1.5 rounded-md bg-[#ee8fe0] text-white font-medium flex items-center gap-1.5">
                  <ArrowUpFromLine size={11} />
                  Upload 1 file
                </button>
              </div>
            </div>
          </div>

          {/* REVIEW VIEW */}
          <div
            className={`absolute inset-0 px-4 py-4 bg-white overflow-y-auto transition-opacity duration-500 ${
              showReview ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-black/5">
              <ChevronLeft size={14} className="text-gray-500 shrink-0" />
              <FileText size={14} className="text-gray-500 shrink-0" />
              <span className="text-[12px] text-gray-900 truncate flex-1">
                Clean-Gradient-Purple-Invoice-Template.pdf
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#ee8fe0]/30 border border-[#ee8fe0]/50 text-gray-800 whitespace-nowrap">
                ready
              </span>
            </div>

            <div className="grid grid-cols-3 gap-x-3 gap-y-2.5 mb-4">
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-0.5">
                  Supplier
                </div>
                <div className="text-[12px] text-gray-900">Albert Sort</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-0.5">
                  Invoice #
                </div>
                <div className="text-[12px] text-gray-900">123451</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-0.5">
                  Country
                </div>
                <div className="text-[12px] text-gray-900">SE</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-0.5">
                  Invoice date
                </div>
                <div className="text-[12px] text-gray-900">2027-04-18</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-0.5">
                  Due date
                </div>
                <div className="text-[12px] text-gray-900">2027-05-26</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-0.5">
                  Total
                </div>
                <div className="text-[12px] font-medium text-gray-900">
                  755 SEK
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-2 font-medium">
                Proposed Journal Entry
              </div>
              <div className="border border-black/10 rounded-md overflow-hidden text-[11px]">
                <div className="grid grid-cols-[1fr_60px_60px] gap-2 px-3 py-1.5 bg-gray-50 text-[9px] uppercase tracking-[0.15em] text-gray-400">
                  <span>Account</span>
                  <span className="text-right">Debit</span>
                  <span className="text-right">Credit</span>
                </div>
                <div className="grid grid-cols-[1fr_60px_60px] gap-2 px-3 py-2 border-t border-black/5">
                  <span className="text-gray-800 truncate">
                    6540 IT-tjänster
                  </span>
                  <span className="text-right text-gray-900">755</span>
                  <span className="text-right text-gray-300">0</span>
                </div>
                <div className="grid grid-cols-[1fr_60px_60px] gap-2 px-3 py-2 border-t border-black/5">
                  <span className="text-gray-800 truncate">
                    2440 Leverantörsskulder
                  </span>
                  <span className="text-right text-gray-300">0</span>
                  <span className="text-right text-gray-900">755</span>
                </div>
                <div className="grid grid-cols-[1fr_60px_60px] gap-2 px-3 py-2 border-t border-black/5 bg-gray-50 text-gray-900 font-medium">
                  <span>Total</span>
                  <span className="text-right">755 kr</span>
                  <span className="text-right">755 kr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="mt-5 px-1">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          Automated
        </h3>
        <p className="text-sm text-gray-500 font-light mt-1 leading-relaxed">
          Drop in an invoice and the AI extracts, matches, and books it for
          you.
        </p>
      </div>
    </div>
  );
}
