import type { ChatBlock, ChatMessage, ComponentBlock, SSEEnvelope, ToolCallBlock } from "./types";

export function makeEmptyAssistant(id: string, sequence: number): ChatMessage {
  return {
    id,
    role: "assistant",
    sequence,
    blocks: [],
    createdAt: new Date().toISOString(),
  };
}

export function applyEnvelope(msg: ChatMessage, env: SSEEnvelope): ChatMessage {
  switch (env.type) {
    case "text": {
      const text = String(env.data.text ?? "");
      if (!text) return msg;
      const last = msg.blocks[msg.blocks.length - 1];
      if (last && last.type === "text") {
        const merged: ChatBlock[] = [
          ...msg.blocks.slice(0, -1),
          { type: "text", text: last.text + text },
        ];
        return { ...msg, blocks: merged };
      }
      return { ...msg, blocks: [...msg.blocks, { type: "text", text }] };
    }
    case "tool_call": {
      const block: ToolCallBlock = {
        type: "tool_call",
        tool_call_id: String(env.data.tool_call_id ?? ""),
        tool_name: String(env.data.tool_name ?? ""),
        args: (env.data.args as Record<string, unknown>) ?? {},
        hasCompleted: false,
      };
      return { ...msg, blocks: [...msg.blocks, block] };
    }
    case "tool_result": {
      const id = String(env.data.tool_call_id ?? "");
      const blocks = msg.blocks.map((b) =>
        b.type === "tool_call" && b.tool_call_id === id
          ? { ...b, hasCompleted: true }
          : b,
      );
      blocks.push({
        type: "tool_result",
        tool_call_id: id,
        result: (env.data.result as Record<string, unknown>) ?? {},
      });
      return { ...msg, blocks };
    }
    case "component": {
      const id = String(env.data.id ?? `c_${Date.now()}`);
      const name = String(env.data.name ?? "");
      const props = (env.data.props as Record<string, unknown>) ?? {};
      if (!name) return msg;
      return {
        ...msg,
        blocks: [...msg.blocks, { type: "component", id, name, props }],
      };
    }
    case "thought": {
      const text = String(env.data.text ?? "");
      if (!text) return msg;
      const last = msg.blocks[msg.blocks.length - 1];
      if (last && last.type === "thought") {
        const merged: ChatBlock[] = [
          ...msg.blocks.slice(0, -1),
          { type: "thought", text: last.text + text },
        ];
        return { ...msg, blocks: merged };
      }
      return { ...msg, blocks: [...msg.blocks, { type: "thought", text }] };
    }
    case "subagent_update": {
      return {
        ...msg,
        blocks: [
          ...msg.blocks,
          {
            type: "subagent",
            role: String(env.data.role ?? ""),
            turn: Number(env.data.turn ?? 0),
            parent_tool_call: (env.data.parent_tool_call as string | null) ?? null,
            thought: (env.data.thought as string | null) ?? null,
            tool_call: (env.data.tool_call as Record<string, unknown> | null) ?? null,
          },
        ],
      };
    }
    case "error": {
      const message = String(env.data.message ?? "Something went wrong.");
      return {
        ...msg,
        blocks: [...msg.blocks, { type: "text", text: `\n\n_Error: ${message}_` }],
      };
    }
    default:
      return msg;
  }
}

// Detect structured JSON the model inlined as text. Gemini occasionally
// emits tool-arg-shaped objects instead of calling the tool, or invents
// its own {title, sources, rules} card shape. Strategy on turn-end:
// balance-match each JSON block, try to classify as a known component
// shape, lift to a component block; unclassified JSON still gets
// stripped from the visible text.
interface JsonRange { start: number; end: number; raw: string }

// Brace-balance scanner that respects string literals. Returns every
// top-level JSON object in `text` along with its source span.
function findJsonObjects(text: string): JsonRange[] {
  const out: JsonRange[] = [];
  let i = 0;
  while (i < text.length) {
    // Skip to a plausible start — ```json fence or a bare `{`.
    const fenceIdx = text.indexOf("```", i);
    const braceIdx = text.indexOf("{", i);
    if (braceIdx === -1) break;
    const fencedFirst = fenceIdx !== -1 && fenceIdx < braceIdx;
    const start = fencedFirst ? text.indexOf("{", fenceIdx) : braceIdx;
    if (start === -1) break;

    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;
    for (let j = start; j < text.length; j++) {
      const ch = text[j];
      if (escape) { escape = false; continue; }
      if (ch === "\\" && inString) { escape = true; continue; }
      if (ch === "\"") { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) { end = j + 1; break; }
      }
    }
    if (end === -1) break;

    // Expand the span to include the surrounding fence markers so the
    // strip leaves no orphaned backticks.
    let spanStart = start;
    let spanEnd = end;
    if (fencedFirst) {
      spanStart = fenceIdx;
      const trailingFence = text.indexOf("```", end);
      if (trailingFence !== -1 && text.slice(end, trailingFence).trim() === "") {
        spanEnd = trailingFence + 3;
      }
    }
    out.push({ start: spanStart, end: spanEnd, raw: text.slice(start, end) });
    i = spanEnd;
  }
  return out;
}

function classifyLeakedEnvelope(
  obj: Record<string, unknown>,
): { name: string; props: Record<string, unknown> } | null {
  // 1. Explicit envelope shape (model sometimes emits the outer wrapper).
  if (obj.kind === "ui-component" && typeof obj.name === "string" && obj.props && typeof obj.props === "object") {
    return { name: obj.name, props: obj.props as Record<string, unknown> };
  }
  // 2. Tool-arg shapes — one per render_* tool in interactive_ui.py.
  if (obj.root && typeof obj.root === "object") {
    const root = obj.root as Record<string, unknown>;
    // Require a question-or-answer marker — "children" alone is too
    // loose and matches any tree-shaped object.
    if ("question" in root || "answer" in root) {
      return { name: "DecisionTree", props: obj };
    }
  }
  if (Array.isArray(obj.metrics) && obj.metrics.every((m) => m && typeof m === "object" && "label" in m && "value" in m)) {
    return { name: "KpiCard", props: obj };
  }
  if (Array.isArray(obj.entries) && obj.entries.some((e) => e && typeof e === "object" && ("debit" in e || "credit" in e || "balance" in e))) {
    return { name: "LedgerTable", props: obj };
  }
  if (Array.isArray(obj.lines) && obj.lines.every((l) => l && typeof l === "object" && "vatAmount" in l)) {
    return { name: "VATBreakdown", props: obj };
  }
  return null;
}

function makeComponentId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c && typeof c.randomUUID === "function") return `c_leaked_${c.randomUUID()}`;
  return `c_leaked_${Math.random().toString(36).slice(2)}`;
}

export function finalizeMessage(msg: ChatMessage): ChatMessage {
  if (msg.role !== "assistant") return msg;
  const lifted: ComponentBlock[] = [];
  const newBlocks: ChatBlock[] = [];
  let changed = false;

  for (const block of msg.blocks) {
    // Fast path: text blocks without `{` can't contain JSON.
    if (block.type !== "text" || !block.text.includes("{")) {
      newBlocks.push(block);
      continue;
    }
    const ranges = findJsonObjects(block.text);
    if (ranges.length === 0) {
      newBlocks.push(block);
      continue;
    }

    const stripSpans: { start: number; end: number }[] = [];
    for (const range of ranges) {
      let parsed: unknown;
      try { parsed = JSON.parse(range.raw); } catch { continue; }
      if (!parsed || typeof parsed !== "object") continue;
      const cls = classifyLeakedEnvelope(parsed as Record<string, unknown>);
      if (cls) {
        lifted.push({ type: "component", id: makeComponentId(), name: cls.name, props: cls.props });
      }
      // Strip both classified and unclassified JSON — the user should
      // never see a raw dump; prose around the block already covers it.
      stripSpans.push({ start: range.start, end: range.end });
    }

    if (stripSpans.length === 0) {
      newBlocks.push(block);
      continue;
    }

    stripSpans.sort((a, b) => a.start - b.start);
    const parts: string[] = [];
    let cursor = 0;
    for (const span of stripSpans) {
      if (span.start > cursor) parts.push(block.text.slice(cursor, span.start));
      cursor = span.end;
    }
    if (cursor < block.text.length) parts.push(block.text.slice(cursor));
    const cleaned = parts.join("").replace(/\n{3,}/g, "\n\n").trim();
    if (cleaned) newBlocks.push({ type: "text", text: cleaned });
    changed = true;
  }

  if (!changed && lifted.length === 0) return msg;
  return { ...msg, blocks: [...newBlocks, ...lifted] };
}

/** Reconstruct a ChatMessage from a persisted chat_messages row. */
export function fromStoredRow(row: {
  id: string;
  role: string;
  sequence: number;
  content: Record<string, unknown>;
  created_at: string;
  tool_call_id?: string | null;
  tool_name?: string | null;
}): ChatMessage {
  const role = (row.role as ChatMessage["role"]) ?? "assistant";
  const base: ChatMessage = {
    id: row.id,
    role,
    sequence: row.sequence,
    blocks: [],
    createdAt: row.created_at,
  };
  if (role === "user") {
    const text = String(row.content.text ?? "");
    return { ...base, blocks: text ? [{ type: "text", text }] : [] };
  }
  if (role === "tool") {
    if (row.content.tool_name) {
      return {
        ...base,
        blocks: [
          {
            type: "tool_call",
            tool_call_id: String(row.tool_call_id ?? ""),
            tool_name: String(row.tool_name ?? row.content.tool_name ?? ""),
            args: (row.content.args as Record<string, unknown>) ?? {},
            hasCompleted: true,
          },
        ],
      };
    }
    return {
      ...base,
      blocks: [
        {
          type: "tool_result",
          tool_call_id: String(row.tool_call_id ?? ""),
          result: (row.content.result as Record<string, unknown>) ?? {},
        },
      ],
    };
  }
  // Assistant rows can carry either text or a component envelope.
  if (role === "assistant" && row.content && typeof row.content.name === "string" && typeof row.content.props === "object") {
    return {
      ...base,
      blocks: [
        {
          type: "component",
          id: String(row.content.id ?? row.id),
          name: String(row.content.name ?? ""),
          props: (row.content.props as Record<string, unknown>) ?? {},
        },
      ],
    };
  }
  if (role === "subagent") {
    return {
      ...base,
      blocks: [
        {
          type: "subagent",
          role: String(row.content.role ?? ""),
          turn: Number(row.content.turn ?? 0),
          parent_tool_call: (row.content.parent_tool_call as string | null) ?? null,
          thought: (row.content.thought as string | null) ?? null,
          tool_call: (row.content.tool_call as Record<string, unknown> | null) ?? null,
        },
      ],
    };
  }
  const text = String(row.content.text ?? "");
  return { ...base, blocks: text ? [{ type: "text", text }] : [] };
}
