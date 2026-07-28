import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus, X, RefreshCw } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import {
  useArchiveThread,
  useChatThreads,
} from "@/lib/hooks/useChatThreads";
import type { ChatThread } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  currentThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  /**
   * `rail` — docks as a sibling column that pushes content (standalone mode).
   * `overlay` — absolutely positioned within its parent, covering the chat
   * column (drawer mode where there isn't horizontal room to push).
   */
  variant?: "rail" | "overlay";
}

function relativeDate(dateStr?: string): string {
  if (!dateStr) return "Older";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return d.toLocaleDateString("sv-SE");
}

function groupByDate(threads: ChatThread[]): Array<{ label: string; threads: ChatThread[] }> {
  const groups: Map<string, ChatThread[]> = new Map();
  for (const t of threads) {
    const label = relativeDate(t.createdAt);
    const existing = groups.get(label) ?? [];
    existing.push(t);
    groups.set(label, existing);
  }
  return Array.from(groups.entries()).map(([label, threads]) => ({ label, threads }));
}

/** Strip the [CompanyName] prefix from a thread title for display. */
function displayName(name: string | undefined | null): string {
  if (!name) return "New chat";
  return name.replace(/^\[.*?\]\s*/, "") || "New chat";
}

export function ThreadHistorySidebar({
  open,
  onClose,
  currentThreadId,
  onSelectThread,
  onNewThread,
  variant = "rail",
}: Props) {
  const { activeCompany } = useCompany();

  // Scope is per-(user, company). Backend already filters on company_id.
  const { data, isLoading, isError, refetch } = useChatThreads(activeCompany?.id, open);
  const archive = useArchiveThread();

  const grouped = useMemo(() => {
    return groupByDate(data ?? []);
  }, [data]);

  const handleDelete = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    try {
      await archive.mutateAsync(threadId);
      if (threadId === currentThreadId) {
        onNewThread();
      }
    } catch {
      // best-effort
    }
  };

  const handleSelect = (threadId: string) => {
    onSelectThread(threadId);
    if (variant === "overlay") onClose();
  };

  if (variant === "overlay") {
    // Overlay mode: covers the chat column within a `relative` parent.
    // The caller is responsible for positioning this inside the chat area.
    return (
      <div
        className={cn(
          "absolute inset-0 z-30 flex flex-col bg-background",
          "transition-[opacity,transform] duration-200",
          open
            ? "pointer-events-auto opacity-100 translate-x-0"
            : "pointer-events-none opacity-0 -translate-x-2",
        )}
        aria-hidden={!open}
      >
        <SidebarChrome
          onClose={onClose}
          onNewThread={onNewThread}
        />
        <SidebarBody
          isLoading={isLoading}
          isError={isError}
          grouped={grouped}
          currentThreadId={currentThreadId}
          onSelect={handleSelect}
          onDelete={handleDelete}
          refetch={() => void refetch()}
        />
      </div>
    );
  }

  // Rail mode (default): animates width; pushes adjacent content.
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "flex flex-col shrink-0 border-r border-border bg-background",
          "transition-all duration-200 overflow-hidden",
          open ? "w-60 opacity-100" : "w-0 opacity-0",
        )}
      >
        <SidebarChrome
          onClose={onClose}
          onNewThread={onNewThread}
        />
        <SidebarBody
          isLoading={isLoading}
          isError={isError}
          grouped={grouped}
          currentThreadId={currentThreadId}
          onSelect={handleSelect}
          onDelete={handleDelete}
          refetch={() => void refetch()}
        />
      </div>
    </>
  );
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function SidebarChrome({
  onClose,
  onNewThread,
}: {
  onClose: () => void;
  onNewThread: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-3 border-b border-border shrink-0">
      <span className="text-sm font-medium text-foreground">History</span>
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={onNewThread}
          className="h-7 w-7"
          aria-label="New chat"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="h-7 w-7"
          aria-label="Close history"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function SidebarBody({
  isLoading,
  isError,
  grouped,
  currentThreadId,
  onSelect,
  onDelete,
  refetch,
}: {
  isLoading: boolean;
  isError: boolean;
  grouped: Array<{ label: string; threads: ChatThread[] }>;
  currentThreadId: string | null;
  onSelect: (threadId: string) => void;
  onDelete: (e: React.MouseEvent, threadId: string) => void;
  refetch: () => void;
}) {
  return (
    <ScrollArea className="flex-1">
      {isLoading ? (
        <div className="px-3 py-3 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      ) : isError ? (
        <div className="px-3 py-6 text-center space-y-2">
          <p className="text-xs text-muted-foreground">Could not load history.</p>
          <Button
            size="sm"
            variant="ghost"
            onClick={refetch}
            className="h-7 text-xs gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </div>
      ) : grouped.length === 0 ? (
        <div className="px-3 py-6 text-center text-xs text-muted-foreground leading-relaxed">
          No past threads yet.
          <br />Start a conversation to build history.
        </div>
      ) : (
        <div className="py-2">
          {grouped.map(({ label, threads: group }) => (
            <div key={label}>
              <p className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase">
                {label}
              </p>
              {group.map((thread) => {
                const title = displayName(thread.title);
                const isActive = thread.id === currentThreadId;
                return (
                  <div
                    key={thread.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(thread.id)}
                    onKeyDown={(e) => e.key === "Enter" && onSelect(thread.id)}
                    className={cn(
                      "group flex items-center gap-1 mx-1 px-2 py-2 rounded-md cursor-pointer",
                      "text-xs text-foreground hover:bg-muted transition-colors",
                      isActive && "bg-muted font-medium",
                    )}
                  >
                    <span className="flex-1 truncate">{title}</span>
                    <button
                      onClick={(e) => onDelete(e, thread.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-destructive"
                      aria-label="Delete thread"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
