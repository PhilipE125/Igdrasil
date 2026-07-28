import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, LayoutGrid, X } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppSidebar } from "./AppSidebar";
import { GlobalSearch } from "./GlobalSearch";
import { useCompany } from "@/contexts/CompanyContext";
import { useChatSession, CHAT_WIDTH_BOUNDS } from "@/contexts/ChatSessionContext";
import { toast } from "@/hooks/use-toast";
import { OnboardingWizard } from "@/components/auth/OnboardingWizard";
import type { CompanyResponse } from "@/lib/uploadApi";
import { useLocation } from "react-router-dom";
import { ChatAssistantView } from "@/components/views/ChatAssistantView";
import { TimeTrackingView } from "@/components/views/TimeTrackingView";
import { cn } from "@/lib/utils";
import owlWise from "@/assets/igdrasil-characters/owl_wise.png";

type ActiveTool = "timeTracking" | null;

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/automations": "Accounting",
  "/automations/pipeline": "Pipeline Builder",
  "/automations/review": "Review",
  "/automations/card-rules": "Card Rules",
  "/accounting": "Accounting",
  "/accounting/automations": "Accounting Automations",
  "/accounting/automations/review": "Review",
  "/accounting/automations/legacy": "Legacy",
  "/accounting/customers": "Customers",
  "/accounting/suppliers": "Suppliers",
  "/accounting/employees": "Employees",
  "/accounting/ledger": "Ledger",
  "/files": "File Archive",
  "/bank-transactions": "Bank Transactions",
  "/ledger": "Huvudbok",
  "/analytics": "Analytics",
  "/audit-trail": "Audit Trail",
  "/profile": "Profile",
  "/employees": "Anställda",
  "/settings": "Settings",
};

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const { setActiveCompany, refreshCompanies } = useCompany();
  const { open: chatOpen, toggleChat, closeChat, width: chatWidth, setWidth: setChatWidth } = useChatSession();
  const { pathname } = useLocation();

  const pageTitle = PAGE_TITLES[pathname] ?? "";

  useEffect(() => {
    if (!activeTool) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveTool(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTool]);

  async function handleWizardComplete(company: CompanyResponse) {
    await refreshCompanies();
    setActiveCompany({ id: company.id, name: company.name, org_number: company.org_number ?? null, created_at: "", updated_at: "" });
    setWizardOpen(false);
    toast({ title: "Företag tillagt", description: company.name });
  }

  return (
    <div className="flex h-dvh w-full flex-col">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm text-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Skip to main content
      </a>

      {/* ── Top bar — full width, always on top ── */}
      <header className="flex h-12 shrink-0 items-center gap-4 bg-[#1a1a1a] px-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white/70 text-sm font-medium">{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-1 justify-center">
          <GlobalSearch />
        </div>

        <div className="flex w-24 items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Open tools menu"
                className="group flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-white/85 outline-none transition-all duration-150 hover:bg-white/14 focus-visible:ring-2 focus-visible:ring-white/30 data-[state=open]:bg-white/25 data-[state=open]:text-white data-[state=open]:ring-1 data-[state=open]:ring-white/30"
              >
                <LayoutGrid
                  className="size-[18px] transition-transform duration-200 ease-out group-data-[state=open]:rotate-45 group-data-[state=open]:scale-90"
                  aria-hidden
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6} className="w-52">
              <DropdownMenuItem
                onSelect={() => setActiveTool("timeTracking")}
                className="gap-2"
              >
                <Clock className="size-4" aria-hidden />
                <span>Time Tracking</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={toggleChat}
            aria-label={chatOpen ? "Close chat assistant" : "Open chat assistant"}
            aria-pressed={chatOpen}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/30",
              chatOpen ? "bg-white/20 ring-1 ring-white/30" : "bg-white/8 hover:bg-white/14",
            )}
          >
            <img src={owlWise} alt="Chat assistant" className="size-[22px] object-contain" />
          </button>
        </div>
      </header>

      {/* ── Below top bar: sidebar + content + chat drawer, all inside the
           dark tray so the rounded-t-xl cutout shows on both panes. ── */}
      <div className="flex min-h-0 flex-1 gap-2 bg-[#1a1a1a] pr-2">
        {/* Main pane (sidebar + content) */}
        <div className="flex min-h-0 flex-1 rounded-t-xl bg-background overflow-hidden">
          <SidebarProvider>
            <AppSidebar onAddCompany={() => setWizardOpen(true)} />
            <SidebarInset>
              <main id="main-content" className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
                <div className="flex min-w-0 flex-1 flex-col overflow-auto">
                  {children}
                </div>
                {activeTool === "timeTracking" && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Time Tracking"
                    className="absolute inset-0 z-30 flex flex-col overflow-auto bg-background animate-in fade-in-0 duration-150"
                  >
                    <button
                      onClick={() => setActiveTool(null)}
                      aria-label="Close time tracking"
                      className="absolute right-3 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background/90 text-muted-foreground backdrop-blur transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                    <TimeTrackingView />
                  </div>
                )}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </div>

        {/* Chat drawer — sibling column, takes horizontal space. */}
        {chatOpen && (
          <ChatDrawerPane
            width={chatWidth}
            onWidthChange={setChatWidth}
            onClose={closeChat}
          />
        )}
      </div>

      {/* Add Company Wizard */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogTitle className="sr-only">Lägg till företag</DialogTitle>
          <OnboardingWizard mode="add-company" onComplete={handleWizardComplete} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Chat drawer + resize handle ────────────────────────────────────────────────

function ChatDrawerPane({
  width,
  onWidthChange,
  onClose,
}: {
  width: number;
  onWidthChange: (w: number) => void;
  onClose: () => void;
}) {
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragState.current = { startX: e.clientX, startWidth: width };
    setDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [width]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    // Dragging left (clientX decreasing) increases width (handle lives on the
    // left edge of a right-docked panel).
    const delta = dragState.current.startX - e.clientX;
    onWidthChange(dragState.current.startWidth + delta);
  }, [onWidthChange]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = null;
    setDragging(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }, []);

  const onDoubleClick = useCallback(() => {
    onWidthChange(CHAT_WIDTH_BOUNDS.default);
  }, [onWidthChange]);

  return (
    <div
      className="relative flex min-h-0 shrink-0 rounded-t-xl bg-background overflow-hidden"
      style={{ width }}
    >
      {/* Drag handle — hair-line that thickens on hover/drag. */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize chat drawer (double-click to reset)"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        className={cn(
          "absolute left-0 top-0 z-20 h-full w-1.5 cursor-col-resize touch-none",
          "transition-colors",
          dragging ? "bg-[#ee8fe0]/60" : "hover:bg-border",
        )}
      />
      <div className="flex flex-1 min-w-0">
        <ChatAssistantView onClose={onClose} />
      </div>
    </div>
  );
}
