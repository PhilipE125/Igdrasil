import type { ChatMessage, ThoughtBlock, ToolCallBlock } from "@/lib/chat/types";

const THOUGHT_TAIL_CHARS = 240;

/**
 * Derive AgentThinkingThread props from a raw message list — used by callers
 * that want to aggregate tool calls across many streaming assistant messages.
 */
export function extractThinkingProps(messages: ChatMessage[]): {
  toolCalls: ToolCallBlock[];
  latestThought: string;
} {
  const calls: ToolCallBlock[] = [];
  let thought = "";
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    for (const block of msg.blocks) {
      if (block.type === "tool_call") calls.push(block);
      else if (block.type === "thought") {
        thought = (block as ThoughtBlock).text;
      }
    }
  }
  const tail = thought.length > THOUGHT_TAIL_CHARS
    ? "…" + thought.slice(-THOUGHT_TAIL_CHARS).trimStart()
    : thought;
  return { toolCalls: calls, latestThought: tail };
}
