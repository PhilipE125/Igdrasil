import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThoughtBlock, ToolCallBlock } from "@/lib/chat/types";
import type { ChatMessage } from "@/lib/chat/types";
import { AgentThinkingThread } from "@/components/chat/AgentThinkingThread";
import { ThinkingDots } from "@/components/chat/ThinkingDots";

const THOUGHT_TAIL_CHARS = 240;

function extractFromMessage(msg: ChatMessage): {
  toolCalls: ToolCallBlock[];
  latestThought: string;
} {
  const calls: ToolCallBlock[] = [];
  let thought = "";
  for (const block of msg.blocks) {
    if (block.type === "tool_call") calls.push(block);
    else if (block.type === "thought") {
      thought = (block as ThoughtBlock).text;
    }
  }
  const tail = thought.length > THOUGHT_TAIL_CHARS
    ? "…" + thought.slice(-THOUGHT_TAIL_CHARS).trimStart()
    : thought;
  return { toolCalls: calls, latestThought: tail };
}

interface Props {
  /** The single assistant message this summary belongs to. */
  message: ChatMessage;
  /** True while the overall stream is open (may be generating other messages). */
  isStreaming?: boolean;
  /** True when this specific message is the one still streaming. */
  isCurrent?: boolean;
}

/**
 * Collapsible "N steps completed" row that renders above the assistant prose.
 * Open during streaming, auto-collapses once the turn completes.
 */
export function StepsSummary({ message, isStreaming, isCurrent }: Props) {
  const { toolCalls, latestThought } = useMemo(() => extractFromMessage(message), [message]);

  const allDone = toolCalls.length > 0 && toolCalls.every((t) => t.hasCompleted);
  const showLiveIndicator = !!isCurrent && !!isStreaming && !allDone;

  // Auto-open while actively working; collapse when the turn is done.
  // We allow the user to override with a manual toggle.
  const [userToggled, setUserToggled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (userToggled) return;
    setOpen(showLiveIndicator);
  }, [showLiveIndicator, userToggled]);

  // Nothing to summarize yet — don't render an empty row.
  if (toolCalls.length === 0 && !showLiveIndicator) return null;

  const count = toolCalls.length;
  const label = showLiveIndicator
    ? count === 0
      ? "Thinking"
      : `${count} ${count === 1 ? "step" : "steps"} in progress`
    : `${count} ${count === 1 ? "step" : "steps"} completed`;

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => {
          setUserToggled(true);
          setOpen((o) => !o);
        }}
        className={cn(
          "group flex w-full items-center gap-1.5 rounded-md py-1 text-left",
          "text-xs text-muted-foreground hover:text-foreground transition-colors",
        )}
        aria-expanded={open}
      >
        {showLiveIndicator && count === 0 ? (
          <ThinkingDots inline className="ml-0" />
        ) : showLiveIndicator ? (
          <span
            className="size-3 rounded-full border-[1.5px] border-muted-foreground/30 border-t-[#ee8fe0] animate-spin shrink-0"
            aria-hidden="true"
          />
        ) : (
          <Check className="size-3 shrink-0 text-[#ee8fe0]" strokeWidth={3} />
        )}
        <span className="truncate">{label}</span>
        {count > 0 && (
          open
            ? <ChevronDown className="size-3 shrink-0 opacity-60 group-hover:opacity-100" />
            : <ChevronRight className="size-3 shrink-0 opacity-60 group-hover:opacity-100" />
        )}
      </button>

      {open && count > 0 && (
        <div className="mt-1 pl-1">
          <AgentThinkingThread
            toolCalls={toolCalls}
            latestThought={showLiveIndicator ? latestThought : undefined}
            isStreaming={showLiveIndicator}
            hideLabelWhenEmpty
          />
        </div>
      )}
      {open && count === 0 && showLiveIndicator && latestThought && (
        <p className="mt-1 pl-5 text-[11px] leading-snug text-muted-foreground/60 italic max-w-prose whitespace-pre-wrap">
          {latestThought}
        </p>
      )}
    </div>
  );
}
