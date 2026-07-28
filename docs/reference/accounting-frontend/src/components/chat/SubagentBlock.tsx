import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { SubagentBlockContent } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

interface Props {
  block: SubagentBlockContent;
}

export function SubagentBlock({ block }: Props) {
  const [open, setOpen] = useState(false);
  const toolLabel =
    block.tool_call && typeof block.tool_call === "object"
      ? String((block.tool_call as { tool_name?: string }).tool_name ?? "")
      : "";

  return (
    <div className="text-xs text-muted-foreground">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group flex w-full items-center gap-1.5 py-1 text-left",
          "hover:text-foreground transition-colors",
        )}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="size-3 shrink-0 opacity-60 group-hover:opacity-100" />
        ) : (
          <ChevronRight className="size-3 shrink-0 opacity-60 group-hover:opacity-100" />
        )}
        <span className="font-medium text-foreground/80">
          Subagent · {block.role || "delegate"} · turn {block.turn}
        </span>
        {toolLabel && <span className="truncate">→ {toolLabel}</span>}
      </button>
      {open && block.thought && (
        <p className="mt-1 whitespace-pre-wrap pl-4 text-muted-foreground/80">
          {block.thought}
        </p>
      )}
    </div>
  );
}
