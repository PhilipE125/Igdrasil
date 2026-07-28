import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { toast as uiToast } from "@/hooks/use-toast";
import { streamChatTurn } from "@/lib/chat/sseClient";
import { applyEnvelope, finalizeMessage, makeEmptyAssistant } from "@/lib/chat/parseEnvelope";
import type { ChatMessage, SSEEnvelope, ToastPayload } from "@/lib/chat/types";
import { useChatThreadMessages } from "@/lib/hooks/useChatThreads";

export interface UseAcpSessionResult {
  messages: ChatMessage[];
  isStreaming: boolean;
  isWaiting: boolean;
  currentThreadId: string | null;
  input: string;
  setInput: (v: string | ((prev: string) => string)) => void;
  submit: (text?: string) => Promise<void>;
  startNewThread: () => void;
  switchThread: (id: string | null) => void;
  isDisabled: boolean;
}

export function useAcpSession(companyId: string | undefined): UseAcpSessionResult {
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [input, setInputState] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const qc = useQueryClient();

  const stored = useChatThreadMessages(currentThreadId);

  const messages = useMemo(() => {
    const base = stored.data ?? [];
    if (liveMessages.length === 0) return base;
    return [...base, ...liveMessages];
  }, [stored.data, liveMessages]);

  // Pre-first-event UX: streaming with no assistant content yet.
  const isWaiting = useMemo(() => {
    if (!isStreaming) return false;
    const lastAssistant = [...liveMessages].reverse().find((m) => m.role === "assistant");
    return !lastAssistant || lastAssistant.blocks.length === 0;
  }, [isStreaming, liveMessages]);

  const setInput = useCallback((v: string | ((prev: string) => string)) => {
    setInputState((prev) => (typeof v === "function" ? (v as (p: string) => string)(prev) : v));
  }, []);

  const resetStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLiveMessages([]);
    setIsStreaming(false);
  }, []);

  const startNewThread = useCallback(() => {
    resetStream();
    setCurrentThreadId(null);
  }, [resetStream]);

  const switchThread = useCallback(
    (id: string | null) => {
      resetStream();
      setCurrentThreadId(id);
    },
    [resetStream],
  );

  useEffect(() => {
    // Tear down any in-flight stream when the active company changes.
    return () => abortRef.current?.abort();
  }, [companyId]);

  const submit = useCallback(
    async (override?: string) => {
      if (!companyId) return;
      const text = (override ?? input).trim();
      if (!text) return;

      const controller = new AbortController();
      abortRef.current = controller;

      const userSeq = (stored.data?.length ?? 0) + liveMessages.length + 1;
      const optimisticUser: ChatMessage = {
        id: `local-user-${Date.now()}`,
        role: "user",
        sequence: userSeq,
        blocks: [{ type: "text", text }],
        createdAt: new Date().toISOString(),
      };

      const assistantId = `local-assistant-${Date.now()}`;
      const liveAssistant = makeEmptyAssistant(assistantId, userSeq + 1);

      setLiveMessages([optimisticUser, liveAssistant]);
      setInputState("");
      setIsStreaming(true);

      // Track the stream's thread id in a local variable so the finally
      // block reads the value set mid-stream, not the stale closure capture.
      let streamThreadId: string | null = currentThreadId;

      try {
        const iter = streamChatTurn({
          companyId,
          body: { thread_id: currentThreadId, prompt: text, attachments: [] },
          signal: controller.signal,
        });
        for await (const env of iter) {
          if (env.type === "thread") {
            const newThreadId = String((env.data as { thread_id?: string }).thread_id ?? "");
            if (newThreadId) {
              streamThreadId = newThreadId;
              if (newThreadId !== currentThreadId) setCurrentThreadId(newThreadId);
            }
            continue;
          }
          if (env.type === "toast") {
            showToastFromSSE(env);
            continue;
          }
          if (env.type === "done") {
            setLiveMessages((prev) => {
              const idx = prev.findIndex((m) => m.id === assistantId);
              if (idx === -1) return prev;
              const next = prev.slice();
              next[idx] = finalizeMessage(next[idx]);
              return next;
            });
            break;
          }
          setLiveMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === assistantId);
            if (idx === -1) return prev;
            const next = prev.slice();
            next[idx] = applyEnvelope(next[idx], env as SSEEnvelope);
            return next;
          });
        }
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") {
          setLiveMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === assistantId);
            if (idx === -1) return prev;
            const next = prev.slice();
            const msg = err instanceof Error ? err.message : String(err);
            next[idx] = {
              ...next[idx],
              blocks: [...next[idx].blocks, { type: "text", text: `\n\n_Error: ${msg}_` }],
            };
            return next;
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        qc.invalidateQueries({ queryKey: ["chatThreads"] });
        if (streamThreadId) {
          // refetchQueries (not invalidateQueries) ignores `enabled`, so the
          // brand-new thread's messages are fetched even before React
          // re-renders with the updated currentThreadId.
          try {
            await qc.refetchQueries({ queryKey: ["chatThreadMessages", streamThreadId] });
          } catch {
            /* tolerate fetch failures; liveMessages still shows the reply */
          }
        }
        setLiveMessages([]);
      }
    },
    [companyId, input, currentThreadId, stored.data, liveMessages.length, qc],
  );

  return {
    messages,
    isStreaming,
    isWaiting,
    currentThreadId,
    input,
    setInput,
    submit,
    startNewThread,
    switchThread,
    isDisabled: !companyId || isStreaming,
  };
}

function showToastFromSSE(env: SSEEnvelope): void {
  const p = env.data as unknown as ToastPayload;
  uiToast({
    title: p.title,
    description: p.subtitle,
    variant: p.level === "error" ? "destructive" : "default",
  });
}
