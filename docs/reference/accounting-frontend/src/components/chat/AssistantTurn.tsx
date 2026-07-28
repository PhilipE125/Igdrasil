import { memo } from "react";
import { ExternalLink } from "lucide-react";
import { AssistantMarkdown } from "@/components/chat/AssistantMarkdown";
import { ComponentDispatcher } from "@/components/chat/ComponentDispatcher";
import { SubagentBlock } from "@/components/chat/SubagentBlock";
import { StepsSummary } from "@/components/chat/StepsSummary";
import { MessageFooter } from "@/components/chat/MessageFooter";
import { ThinkingDots } from "@/components/chat/ThinkingDots";
import type { ChatMessage } from "@/lib/chat/types";

export interface Citation {
  label: string;
  url: string;
}

interface Props {
  message: ChatMessage;
  threadId: string | null;
  citations: Citation[];
  /** Outer streaming flag (applies to any live message). */
  isStreaming: boolean;
  /** True when this specific message is the one currently streaming. */
  isCurrent: boolean;
}

function hasVisibleContent(msg: ChatMessage): boolean {
  return msg.blocks.some((b) => {
    if (b.type === "text") return !!b.text.trim();
    if (b.type === "component") return true;
    if (b.type === "subagent") return true;
    if (b.type === "tool_call") return true;
    return false;
  });
}

function SourceCitations({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {citations.map((src, i) => (
        <a
          key={i}
          href={src.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="size-2.5 shrink-0" />
          {src.label}
        </a>
      ))}
    </div>
  );
}

/**
 * One assistant message: steps summary above, typographic body in the middle,
 * citations + feedback footer at the bottom. No avatar, no card shell — the
 * content flows directly on the panel background.
 */
export const AssistantTurn = memo(function AssistantTurn({
  message,
  threadId,
  citations,
  isStreaming,
  isCurrent,
}: Props) {
  if (!hasVisibleContent(message)) return null;

  const textBlocks = message.blocks.filter((b) => b.type === "text");
  const hasComponent = message.blocks.some((b) => b.type === "component");

  // Find the index of the last non-empty text block so we can attach the
  // inline streaming dots only to it.
  let lastNonEmptyTextIdx = -1;
  for (let i = 0; i < message.blocks.length; i++) {
    const b = message.blocks[i];
    if (b.type === "text" && b.text.trim()) lastNonEmptyTextIdx = i;
  }
  const showInlineDots = isCurrent && isStreaming && textBlocks.some((b) => b.text.trim());

  return (
    <div className="flex w-full flex-col">
      <StepsSummary
        message={message}
        isStreaming={isStreaming}
        isCurrent={isCurrent}
      />

      <div className="space-y-2">
        {message.blocks.map((block, i) => {
          if (block.type === "text") {
            const trimmed = block.text.trim();
            if (!trimmed) return null;
            // When a component is present, suppress long text narration — the
            // component IS the answer.
            if (hasComponent && trimmed.length > 150) return null;
            const attachDots = showInlineDots && i === lastNonEmptyTextIdx;
            return (
              <div key={i} className="assistant-prose">
                <AssistantMarkdown>{trimmed}</AssistantMarkdown>
                {attachDots && <ThinkingDots inline className="-mt-1" />}
              </div>
            );
          }
          if (block.type === "component") {
            return (
              <ComponentDispatcher
                key={block.id ?? i}
                block={block}
                threadId={threadId}
                messageId={message.id}
                fallback={<div className="text-xs text-muted-foreground">Component unavailable</div>}
              />
            );
          }
          if (block.type === "subagent") {
            return <SubagentBlock key={i} block={block} />;
          }
          return null;
        })}
      </div>

      <SourceCitations citations={citations} />

      {(!isCurrent || !isStreaming) && <MessageFooter message={message} />}
    </div>
  );
});
