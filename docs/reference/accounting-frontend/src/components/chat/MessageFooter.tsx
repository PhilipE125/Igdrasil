import { useState } from "react";
import { Copy, ThumbsDown, ThumbsUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage, TextBlock } from "@/lib/chat/types";

interface Props {
  message: ChatMessage;
  onFeedback?: (messageId: string, feedback: "up" | "down") => void;
}

function concatText(msg: ChatMessage): string {
  return msg.blocks
    .filter((b): b is TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

/**
 * Minimal icon-only feedback row. Hidden during streaming by the caller.
 */
export function MessageFooter({ message, onFeedback }: Props) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    const text = concatText(message);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be denied; silent no-op.
    }
  };

  const handleVote = (v: "up" | "down") => {
    const next = vote === v ? null : v;
    setVote(next);
    if (next && onFeedback) onFeedback(message.id, next);
  };

  const btn =
    "inline-flex items-center justify-center size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors";

  return (
    <div className="mt-1 flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
      <button
        type="button"
        onClick={handleCopy}
        className={btn}
        aria-label={copied ? "Copied" : "Copy message"}
        title={copied ? "Copied" : "Copy"}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
      <button
        type="button"
        onClick={() => handleVote("up")}
        className={cn(btn, vote === "up" && "text-foreground bg-muted")}
        aria-label="Helpful"
        aria-pressed={vote === "up"}
        title="Helpful"
      >
        <ThumbsUp className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => handleVote("down")}
        className={cn(btn, vote === "down" && "text-foreground bg-muted")}
        aria-label="Unhelpful"
        aria-pressed={vote === "down"}
        title="Unhelpful"
      >
        <ThumbsDown className="size-3.5" />
      </button>
    </div>
  );
}
