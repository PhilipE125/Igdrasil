// Shape mirrors the SSE events produced by backend/app/chat/sse.py and the
// ChatMessageOut schema from backend/app/chat/schemas.py.

export type ChatRole = "user" | "assistant" | "tool" | "subagent" | "system";

export interface TextBlock {
  type: "text";
  text: string;
}

export interface ToolCallBlock {
  type: "tool_call";
  tool_call_id: string;
  tool_name: string;
  args: Record<string, unknown>;
  hasCompleted?: boolean;
}

export interface ToolResultBlock {
  type: "tool_result";
  tool_call_id: string;
  result: Record<string, unknown>;
}

export interface ComponentBlock {
  type: "component";
  id: string;
  name: string;
  props: Record<string, unknown>;
}

export interface SubagentBlockContent {
  type: "subagent";
  role: string;
  turn: number;
  parent_tool_call: string | null;
  thought: string | null;
  tool_call: Record<string, unknown> | null;
}

// Streaming agent reasoning. Merges chunks like a text block; not persisted
// across turns — surfaced live in AgentThinkingThread to give the user
// visible progress during long multi-tool runs.
export interface ThoughtBlock {
  type: "thought";
  text: string;
}

export type ChatBlock =
  | TextBlock
  | ToolCallBlock
  | ToolResultBlock
  | ComponentBlock
  | SubagentBlockContent
  | ThoughtBlock;

export interface ChatMessage {
  id: string;
  role: ChatRole;
  sequence: number;
  blocks: ChatBlock[];
  createdAt: string;
}

export interface ChatThread {
  id: string;
  title: string | null;
  gooseSessionId: string;
  lastActivityAt: string;
  createdAt: string;
  archivedAt: string | null;
}

// ── SSE envelope shapes (matches backend/app/chat/sse.py) ──────────────────

export type SSEEventType =
  | "text"
  | "tool_call"
  | "tool_result"
  | "component"
  | "subagent_update"
  | "toast"
  | "error"
  | "done"
  | "thread"
  | "thought"
  | "plan"
  | "usage"
  | "permission_request";

export interface SSEEnvelope {
  type: SSEEventType;
  data: Record<string, unknown>;
}

export interface ToastPayload {
  level: "success" | "error" | "info";
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}
