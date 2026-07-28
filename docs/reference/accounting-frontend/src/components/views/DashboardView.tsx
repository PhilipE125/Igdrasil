import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Send,
  FileText,
  Receipt,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Bell,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SidePanel } from "@/components/ui/side-panel";
import { ComposerActionsPopover } from "@/components/chat/ComposerActionsPopover";
import { useChatSession } from "@/contexts/ChatSessionContext";
import { useCompany } from "@/contexts/CompanyContext";
import { cn } from "@/lib/utils";
import {
  getDashboardSummary,
  getDashboardActivity,
} from "@/lib/uploadApi";
import { KpiMetricsBar } from "@/components/dashboard/KpiMetricsBar";
import { useNavigate } from "react-router-dom";
import owlWise from "@/assets/igdrasil-characters/owl_wise.png";

// ── Types ────────────────────────────────────────────────────────────────────

interface ActivityDoc {
  id: string;
  filename: string;
  status: string;
  updated_at: string;
}

// ── Status group config ───────────────────────────────────────────────────────

interface StatusGroupConfig {
  statuses: string[];
  label: string;
  color: string;
  bg: string;
  icon: React.ElementType;
  href: string | null;
  actionLabel: string | null;
}

const STATUS_GROUPS: StatusGroupConfig[] = [
  {
    statuses: ["pending_review"],
    label: "Redo för granskning",
    color: "#eedd8f",
    bg: "#eedd8f18",
    icon: FileText,
    href: "/automations/review",
    actionLabel: "Granska",
  },
  {
    statuses: ["needs_match"],
    label: "Väntar på matchning",
    color: "#8fd4ee",
    bg: "#8fd4ee18",
    icon: Receipt,
    href: "/accounting/automations",
    actionLabel: "Matcha",
  },
  {
    statuses: ["failed", "duplicate"],
    label: "Misslyckades",
    color: "#ee8f8f",
    bg: "#ee8f8f18",
    icon: AlertCircle,
    href: "/files",
    actionLabel: "Se filer",
  },
  {
    statuses: ["uploaded", "extracting", "structuring", "classifying"],
    label: "Bearbetar",
    color: "#ee8fe0",
    bg: "#ee8fe018",
    icon: Loader2,
    href: null,
    actionLabel: null,
  },
];

// ── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  icon: Icon,
  count,
  label,
  href,
}: {
  icon: React.ElementType;
  count: number;
  label: string;
  href: string;
}) {
  const navigate = useNavigate();
  if (count === 0) return null;
  return (
    <button
      onClick={() => navigate(href)}
      className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left hover:bg-muted/40 transition-colors group w-full"
    >
      <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#eedd8f30" }}>
        <Icon className="size-4" style={{ color: "#c4a83a" }} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground">
          {count} {label}
        </span>
      </div>
      <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </button>
  );
}

// ── Notifications Panel ───────────────────────────────────────────────────────

function NotificationsPanel({
  docs,
  pipeline,
}: {
  docs: ActivityDoc[];
  pipeline: Record<string, number>;
}) {
  const navigate = useNavigate();

  const visibleGroups = STATUS_GROUPS.filter((g) => {
    const total = g.statuses.reduce((s, st) => s + (pipeline[st] ?? 0), 0);
    const hasDocs = docs.some((d) => g.statuses.includes(d.status));
    return total > 0 || hasDocs;
  });

  if (visibleGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <CheckCircle2 className="size-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground text-center">Allt är i ordning</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {visibleGroups.map((group) => {
        const Icon = group.icon;
        const count = group.statuses.reduce((s, st) => s + (pipeline[st] ?? 0), 0);
        const items = docs
          .filter((d) => group.statuses.includes(d.status))
          .slice(0, 6);

        return (
          <div
            key={group.label}
            className="rounded-lg border border-border overflow-hidden"
            style={{ backgroundColor: group.bg }}
          >
            {/* Group header */}
            <div className="flex items-center gap-2 px-3 py-2.5">
              <Icon
                className="size-3.5 shrink-0"
                style={{ color: group.color }}
              />
              <span className="text-xs font-semibold text-foreground flex-1 leading-none">
                {group.label}
              </span>
              {count > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                  style={{ backgroundColor: group.color + "30", color: group.color }}
                >
                  {count}
                </span>
              )}
            </div>

            {/* Compact doc list */}
            {items.length > 0 && (
              <div className="border-t border-border/60 divide-y divide-border/40">
                {items.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-background/50"
                  >
                    <span className="text-[11px] text-foreground truncate flex-1 leading-snug">
                      {doc.filename}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 leading-none">
                      {formatRelative(doc.updated_at)}
                    </span>
                  </div>
                ))}
                {count > items.length && (
                  <div className="px-3 py-1.5 bg-background/50">
                    <span className="text-[11px] text-muted-foreground">
                      +{count - items.length} till
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action button */}
            {group.href && (
              <div className="px-3 py-2 border-t border-border/60 flex justify-end">
                <button
                  onClick={() => navigate(group.href!)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium rounded-md px-2.5 py-1 transition-colors hover:bg-background/80"
                  style={{ color: group.color }}
                >
                  {group.actionLabel}
                  <ArrowRight className="size-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Chat Widget ──────────────────────────────────────────────────────────────

/**
 * Dashboard ChatWidget — a thin entry point. Submitting (or focusing + typing)
 * routes input into the shared chat session and opens the drawer, where the
 * thread actually lives. No inline thread, no own useAcpSession — the drawer
 * is the single source of truth.
 */
function ChatWidget({ onOpen }: { onOpen: () => void }) {
  const { session } = useChatSession();
  const { isStreaming, input: value, setInput: setValue, submit } = session;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isStreaming || !value.trim()) return;
    submit();
    onOpen();
  };

  // Auto-resize textarea.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [value]);

  return (
    <div
      className="rounded-2xl border bg-background transition-shadow duration-200"
      style={{
        borderColor: focused ? "#ee8fe060" : undefined,
        boxShadow: focused
          ? "0 0 0 1px #ee8fe050, 0 0 12px 3px #ee8fe030, 0 0 24px 6px #eedd8f20, 0 0 40px 12px #b0ee8f15"
          : undefined,
      }}
    >
      <div className="flex items-end gap-3 px-4 py-3">
        {/* Owl avatar — clicking opens the drawer even without typing. */}
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open chat drawer"
          className="shrink-0 mb-0.5 rounded-full transition-transform hover:scale-105"
        >
          <img src={owlWise} alt="" className="size-7 rounded-full object-cover" />
        </button>

        {/* Actions popover (+) — mirrors the sidebar chat composer. Text
             insertion (targets/skills) feeds directly into the shared chat
             input; upload and document-pick route to the drawer where the
             attachment state lives. */}
        <ComposerActionsPopover
          disabled={isStreaming}
          onUploadClick={onOpen}
          onInsertText={(text) => setValue(value + text)}
          onPickDocument={() => onOpen()}
        />

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask anything — your chat opens on the right"
            rows={1}
            disabled={isStreaming}
            className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none leading-relaxed overflow-hidden"
            style={{ height: "24px" }}
          />
        </div>

        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={isStreaming || !value.trim()}
          className={cn(
            "size-7 shrink-0 rounded-full transition-colors",
            value.trim()
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "bg-muted text-muted-foreground",
          )}
          aria-label="Send and open chat"
        >
          <Send className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}


// ── Main Dashboard ───────────────────────────────────────────────────────────

export const DashboardView = () => {
  const { activeCompany } = useCompany();
  const { openChat } = useChatSession();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: summary = null } = useQuery({
    queryKey: ["dashboard-summary", activeCompany?.id],
    queryFn: getDashboardSummary,
    enabled: !!activeCompany?.id,
    refetchInterval: 120_000, // Safety net — real-time WS handles normal updates
    retry: 1,
  });

  const { data: activityData } = useQuery({
    queryKey: ["dashboard-activity", activeCompany?.id],
    queryFn: () => getDashboardActivity(50),
    enabled: !!activeCompany?.id,
    refetchInterval: 120_000,
    retry: 1,
  });

  const pipeline = summary?.pipeline ?? {};
  const activityDocs: ActivityDoc[] = activityData?.activity ?? [];

  const actionableCount = useMemo(() =>
    ["pending_review", "needs_match", "failed", "duplicate"]
      .reduce((s, st) => s + (pipeline[st] ?? 0), 0),
    [pipeline],
  );

  const pendingReview = pipeline.pending_review ?? 0;
  const pendingMatch = pipeline.needs_match ?? 0;

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          {activeCompany && (
            <p className="text-xs text-muted-foreground mt-0.5">{activeCompany.name}</p>
          )}
        </div>
        <button
          onClick={() => setNotificationsOpen(true)}
          className="relative size-8 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="size-4 text-muted-foreground" />
          {actionableCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 rounded-full bg-[#ee8fe0] px-1 text-[10px] font-semibold text-[#171717] leading-none">
              {actionableCount}
            </span>
          )}
        </button>
      </div>

      {/* KPI Metrics Bar */}
      <KpiMetricsBar />

      {/* Tasks */}
      <div>
        <h2 className="text-sm font-medium text-foreground mb-2">Things to do</h2>
        <div className="space-y-2">
          <TaskCard
            icon={FileText}
            count={pendingReview}
            label="documents to review"
            href="/automations/review"
          />
          <TaskCard
            icon={Receipt}
            count={pendingMatch}
            label="receipts pending match"
            href="/accounting/automations"
          />
          {pendingReview === 0 && pendingMatch === 0 && (
            <div className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "#b0ee8f60", backgroundColor: "#b0ee8f10", color: "#6a9950" }}>
              <CheckCircle2 className="size-4 shrink-0" style={{ color: "#b0ee8f" }} />
              You're all caught up
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Ask me anything about your business</h2>
        <ChatWidget onOpen={openChat} />
      </div>

      {/* Notifications side panel */}
      <SidePanel
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        title="Aktivitet"
      >
        <div className="flex-1 overflow-y-auto">
          <NotificationsPanel docs={activityDocs} pipeline={pipeline} />
        </div>
      </SidePanel>

    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────


function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("sv-SE");
}
