// React Query wrappers for /api/chat/sessions.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/uploadApi";
import type { ChatMessage, ChatThread } from "@/lib/chat/types";
import { fromStoredRow } from "@/lib/chat/parseEnvelope";

interface ThreadRow {
  id: string;
  title: string | null;
  goose_session_id: string;
  last_activity_at: string;
  created_at: string;
  archived_at: string | null;
}

function rowToThread(r: ThreadRow): ChatThread {
  return {
    id: r.id,
    title: r.title,
    gooseSessionId: r.goose_session_id,
    lastActivityAt: r.last_activity_at,
    createdAt: r.created_at,
    archivedAt: r.archived_at,
  };
}

export function useChatThreads(companyId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["chatThreads", companyId],
    enabled: !!companyId && enabled,
    retry: 2,
    queryFn: async () => {
      const rows = await authenticatedApiRequest<ThreadRow[]>("/chat/sessions");
      return rows.map(rowToThread);
    },
  });
}

export function useChatThreadMessages(threadId: string | null) {
  return useQuery({
    queryKey: ["chatThreadMessages", threadId],
    enabled: !!threadId,
    queryFn: async () => {
      const rows = await authenticatedApiRequest<Array<{
        id: string;
        role: string;
        sequence: number;
        content: Record<string, unknown>;
        created_at: string;
        tool_call_id?: string | null;
        tool_name?: string | null;
      }>>(`/chat/sessions/${threadId}/messages`);
      return coalesceAssistantText(rows.map(fromStoredRow) as ChatMessage[]);
    },
  });
}

// Backend persistence writes one row per streamed text chunk. Merge
// consecutive assistant-only-text messages into a single bubble so
// reload shows the same shape as the live stream.
function coalesceAssistantText(msgs: ChatMessage[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const m of msgs) {
    const last = out[out.length - 1];
    const mIsAssistantText =
      m.role === "assistant" &&
      m.blocks.length === 1 &&
      m.blocks[0].type === "text";
    const lastIsAssistantText =
      last &&
      last.role === "assistant" &&
      last.blocks.length === 1 &&
      last.blocks[0].type === "text";
    if (mIsAssistantText && lastIsAssistantText) {
      const merged: ChatMessage = {
        ...last,
        blocks: [
          {
            type: "text",
            text: (last.blocks[0] as { text: string }).text + (m.blocks[0] as { text: string }).text,
          },
        ],
      };
      out[out.length - 1] = merged;
    } else {
      out.push(m);
    }
  }
  return out;
}

export function useRenameThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ threadId, title }: { threadId: string; title: string }) => {
      return authenticatedApiRequest<ThreadRow>(`/chat/sessions/${threadId}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatThreads"] });
    },
  });
}

export function useArchiveThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) => {
      return authenticatedApiRequest<{ archived: boolean }>(
        `/chat/sessions/${threadId}`,
        { method: "DELETE" },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatThreads"] });
    },
  });
}
