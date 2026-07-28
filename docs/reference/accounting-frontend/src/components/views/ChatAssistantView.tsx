import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Send, History, Plus, Paperclip, X, AlertCircle } from "lucide-react";
import { FileIcon } from "@/components/ui/FileIcon";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/contexts/CompanyContext";
import { useChatSession } from "@/contexts/ChatSessionContext";
import { ThreadHistorySidebar } from "@/components/chat/ThreadHistorySidebar";
import { AssistantTurn } from "@/components/chat/AssistantTurn";
import { StepsSummary } from "@/components/chat/StepsSummary";
import { ComposerActionsPopover } from "@/components/chat/ComposerActionsPopover";
import { useCompanyThread } from "@/lib/hooks/useCompanyThread";
import { useRenameThread } from "@/lib/hooks/useChatThreads";
import { uploadFileToPipeline, type BackendDocument } from "@/lib/uploadApi";
import { cn } from "@/lib/utils";
import type { ChatMessage, TextBlock } from "@/lib/chat/types";
import owlWise from "@/assets/igdrasil-characters/owl_wise.png";

// ── Types ─────────────────────────────────────────────────────────────────────

type UploadState =
  | { phase: "uploading"; filename: string }
  | { phase: "ready"; filename: string; processId: string }
  | { phase: "error"; filename: string; error: string };

// ── Composer token highlighter ─────────────────────────────────────────────────

/**
 * Regex for tokens we want visually distinct in the composer: @mentions
 * (e.g. @invoices) and document references (e.g. [Attached document: "foo.pdf"…]).
 */
const COMPOSER_TOKEN_RE = /(@[A-Za-z][\w-]*)|(\[Attached document:[^\]]*\])/g;

function renderComposerTokens(text: string): React.ReactNode[] {
  if (!text) return [];
  const nodes: React.ReactNode[] = [];
  let last = 0;
  COMPOSER_TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = COMPOSER_TOKEN_RE.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <span
        key={`tok-${match.index}`}
        className="rounded px-1 py-0.5 bg-[#ee8fe0]/18 font-semibold text-foreground"
      >
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  // Trailing newline padding — a lone trailing "\n" inside the mirror is trimmed
  // by the browser's line-layout so the mirror ends up one line shorter than
  // the textarea; add a zero-width char so the last line renders.
  if (text.endsWith("\n")) nodes.push("\u200b");
  return nodes;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Collapse every non-user row between two user messages into a single
 * assistant display message. The backend persists one row per streamed
 * chunk: the model may write a preamble ("let me check…"), call some
 * tools, then write the real answer — which arrives as
 * `assistant | tool | tool | assistant | …`. Rendering each row as its
 * own bubble shows the reply split in two (each with a MessageFooter)
 * and loses the steps summary when the final message has no tool_calls
 * of its own. Coalescing restores the "one turn, one bubble" shape
 * that the live stream already produces in memory.
 */
function coalesceAssistantTurn(messages: ChatMessage[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  let current: ChatMessage | null = null;

  const flush = () => {
    if (current) {
      out.push(current);
      current = null;
    }
  };

  for (const msg of messages) {
    if (msg.role === "user") {
      flush();
      out.push(msg);
      continue;
    }
    if (msg.role === "assistant" || msg.role === "tool" || msg.role === "subagent") {
      if (current) {
        current = { ...current, blocks: [...current.blocks, ...msg.blocks] };
      } else {
        // Promote any non-user starter to an assistant-shaped bubble so the
        // render path treats it as the turn's single visible message.
        current = {
          ...msg,
          role: "assistant",
          blocks: [...msg.blocks],
        };
      }
      continue;
    }
    // system / anything else — flush and pass through.
    flush();
    out.push(msg);
  }
  flush();
  return out;
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

// ── Citation URLs extracted directly from tool results (ground truth) ─────────

const CITE_RE = /\[(\d+)\]\s*(.+?)\nCITE THIS EXACT URL \(do not modify\):\s*(.+)/g;

type Citation = { label: string; url: string };

/**
 * Walk the message list once and produce a citation list for each assistant
 * message. Citations are attributed to the assistant message that answers
 * the preceding `skatteverket_search` tool_result.
 */
function buildCitationsByIndex(allMessages: ChatMessage[]): Citation[][] {
  const result: Citation[][] = allMessages.map(() => []);

  const skvToolIds = new Set<string>();
  const citationsByTool = new Map<string, Citation[]>();

  for (let i = 0; i < allMessages.length; i++) {
    for (const block of allMessages[i].blocks) {
      if (block.type === "tool_call" && block.tool_name === "skatteverket_search") {
        skvToolIds.add(block.tool_call_id);
      } else if (block.type === "tool_result" && skvToolIds.has(block.tool_call_id)) {
        const text =
          typeof block.result === "object" && block.result !== null
            ? String((block.result as { text?: string }).text ?? "")
            : "";
        if (!text) continue;
        const list: Citation[] = [];
        CITE_RE.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = CITE_RE.exec(text)) !== null) {
          const url = m[3].trim();
          if (url.startsWith("https://")) {
            list.push({ label: m[2].trim(), url });
          }
        }
        citationsByTool.set(block.tool_call_id, list);
      }
    }
  }

  for (let i = 0; i < allMessages.length; i++) {
    if (allMessages[i].role !== "assistant") continue;
    // An assistant message owns every citation for tool_ids resolved at or
    // before it. We attach them to the first assistant message that follows
    // each tool_result.
    for (const block of allMessages[i].blocks) {
      if (block.type === "tool_result") {
        const hits = citationsByTool.get(block.tool_call_id);
        if (hits) result[i].push(...hits);
      }
    }
  }

  return result;
}

// ── User bubble ────────────────────────────────────────────────────────────────

const UserBubble = memo(function UserBubble({ msg }: { msg: ChatMessage }) {
  const text = msg.blocks
    .filter((b): b is TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  if (!text) return null;
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-[#ee8fe0] px-4 py-2.5 text-sm text-[#171717] leading-relaxed text-pretty whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
});

// ── Upload chip ────────────────────────────────────────────────────────────────

function UploadChip({
  state,
  onRemove,
}: {
  state: UploadState;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs max-w-xs",
        state.phase === "error"
          ? "border-destructive/40 bg-destructive/5 text-destructive"
          : "border-border bg-muted/60 text-foreground",
      )}
    >
      {state.phase === "uploading" && (
        <span className="size-3 rounded-full border-2 border-muted-foreground/40 border-t-foreground animate-spin shrink-0" />
      )}
      {state.phase === "ready" && (
        <FileIcon name={state.filename} className="size-3 shrink-0" />
      )}
      {state.phase === "error" && (
        <AlertCircle className="size-3 shrink-0" />
      )}
      <span className="truncate max-w-[180px]">
        {state.phase === "uploading" ? `Uploading ${state.filename}…` : state.filename}
      </span>
      {state.phase === "error" && (
        <span className="truncate text-destructive/80 max-w-[120px]">{state.error}</span>
      )}
      <button
        onClick={onRemove}
        className="ml-0.5 shrink-0 rounded hover:text-muted-foreground transition-colors"
        aria-label="Remove attachment"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export const ChatAssistantView = ({ onClose }: { onClose?: () => void } = {}) => {
  const { activeCompany } = useCompany();
  const { session } = useChatSession();
  const {
    messages,
    isStreaming,
    isWaiting,
    startNewThread,
    switchThread,
    currentThreadId,
    input: value,
    setInput: setValue,
    submit,
  } = session;
  const renameThread = useRenameThread();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [forcedPane, setForcedPane] = useState<"targets" | "skills" | "files" | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titledThreadsRef = useRef<Set<string>>(new Set());
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // When embedded as a drawer, use the overlay variant so the sidebar
  // doesn't steal horizontal space from the (already narrow) chat column.
  const isDrawer = !!onClose;
  const sidebarVariant: "overlay" | "rail" = isDrawer ? "overlay" : "rail";

  // Only auto-scroll when the user is already near the bottom (within 120px).
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 120) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Auto-grow the composer textarea with content; capped by max-height on the element.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const composerTokens = useMemo(() => renderComposerTokens(value), [value]);

  useEffect(() => {
    if (isStreaming || isWaiting) return;
    if (!currentThreadId) return;
    if (titledThreadsRef.current.has(currentThreadId)) return;

    let firstUserMsg: ChatMessage | undefined;
    let hasAssistant = false;
    let userCount = 0;
    for (const m of messagesRef.current) {
      if (m.role === "user") {
        userCount++;
        if (userCount === 1) firstUserMsg = m;
      } else if (m.role === "assistant" && hasVisibleContent(m)) {
        hasAssistant = true;
      }
    }
    if (userCount !== 1 || !hasAssistant || !firstUserMsg) return;

    const rawText = firstUserMsg.blocks
      .filter((b): b is TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    const text = rawText.replace(/^\[Attached document:.*?\]\n\n/s, "").trim();
    if (!text) return;

    const short =
      text.length > 45
        ? (text.slice(0, 45).replace(/\s+\S*$/, "") || text.slice(0, 45)) + "…"
        : text;

    const fullName = activeCompany ? `[${activeCompany.name}] ${short}` : short;
    titledThreadsRef.current.add(currentThreadId);
    renameThread.mutate({ threadId: currentThreadId, title: fullName });
  }, [isStreaming, isWaiting, currentThreadId, activeCompany, renameThread]);

  const handleSelectThread = useCallback((threadId: string) => {
    switchThread(threadId);
  }, [switchThread]);

  useCompanyThread(activeCompany?.id, startNewThread);

  const handleFile = useCallback(async (file: File) => {
    setUploadState({ phase: "uploading", filename: file.name });
    try {
      const { processId } = await uploadFileToPipeline(file);
      setUploadState({ phase: "ready", filename: file.name, processId });
    } catch (err) {
      setUploadState({
        phase: "error",
        filename: file.name,
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const insertAtCursor = useCallback((text: string) => {
    const el = inputRef.current;
    if (!el) {
      setValue((prev) => prev + text);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + text + value.slice(end);
    setValue(next);
    // Move the cursor to after the inserted text once React flushes.
    requestAnimationFrame(() => {
      const n = start + text.length;
      el.focus();
      el.setSelectionRange(n, n);
    });
  }, [value, setValue]);

  const handlePickDocument = useCallback((doc: BackendDocument) => {
    setUploadState({
      phase: "ready",
      filename: doc.original_filename,
      processId: doc.process_id,
    });
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      return;
    }
    // Hotkeys that open the composer-actions popover at a specific pane.
    // `@` always opens Target. `/` opens Skills only when the field is empty
    // (or only whitespace) so regular slash typing mid-message isn't hijacked.
    if (e.key === "@") {
      e.preventDefault();
      setForcedPane("targets");
      return;
    }
    if (e.key === "/" && !value.trim()) {
      e.preventDefault();
      setForcedPane("skills");
      return;
    }
  };

  const handleSubmit = () => {
    if (isStreaming) return;

    if (uploadState?.phase === "ready") {
      const prefix = `[Attached document: "${uploadState.filename}", pipeline process ID: ${uploadState.processId}]\n\n`;
      const messageText = value.trim()
        ? prefix + value.trim()
        : prefix + "I just uploaded this document to the accounting pipeline. Please acknowledge it.";
      setUploadState(null);
      submit(messageText);
      return;
    }

    if (!value.trim()) return;
    submit();
  };

  // Coalesce first, then build citations from the coalesced list so every
  // tool_result ends up on the same bubble the citations will render under.
  const displayMessages = useMemo(() => coalesceAssistantTurn(messages), [messages]);
  const citationsByIndex = useMemo(
    () => buildCitationsByIndex(displayMessages),
    [displayMessages],
  );

  const isEmpty = messages.length === 0;
  const isLoading = isWaiting || (isStreaming && messages.length === 0);

  // Find the last visible assistant message (the one the stream is writing to).
  // Used to decide which AssistantTurn owns the live "isCurrent" indicator.
  // Indexed against the coalesced list since that's what we render.
  const lastAssistantIdx = useMemo(() => {
    for (let i = displayMessages.length - 1; i >= 0; i--) {
      if (displayMessages[i].role === "assistant") return i;
    }
    return -1;
  }, [displayMessages]);

  // Fallback "Thinking…" row for the pre-first-chunk phase (no assistant
  // message in the list yet, or the one there has no blocks).
  const lastMsg = messages[messages.length - 1];
  const showStandaloneThinking =
    (isWaiting || isStreaming) &&
    (!lastMsg || lastMsg.role === "user" || (lastMsg.role === "assistant" && !hasVisibleContent(lastMsg)));

  return (
    <div
      className="flex h-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Rail-variant sidebar (pushes chat left on standalone mode). */}
      {sidebarVariant === "rail" && (
        <ThreadHistorySidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentThreadId={currentThreadId}
          onSelectThread={handleSelectThread}
          onNewThread={() => startNewThread()}
          variant="rail"
        />
      )}

      {/* Main chat area */}
      <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* Drag-over overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-background/90 backdrop-blur-sm pointer-events-none">
            <Paperclip className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Drop PDF, JPG, or PNG to attach</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2.5 shrink-0 h-[52px]">
          <span className="text-sm font-medium flex-1 text-foreground truncate">
            Chat Assistant
            {activeCompany && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                · {activeCompany.name}
              </span>
            )}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Chat history"
            className="size-8 shrink-0"
          >
            <History className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => startNewThread()}
            aria-label="New chat"
            className="size-8 shrink-0"
          >
            <Plus className="size-4" />
          </Button>
          {onClose && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              aria-label="Close"
              className="size-8 shrink-0"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        {/* Overlay-variant sidebar lives inside the chat column so it covers
            only the chat area, not the header. */}
        {sidebarVariant === "overlay" && (
          <ThreadHistorySidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentThreadId={currentThreadId}
            onSelectThread={handleSelectThread}
            onNewThread={() => startNewThread()}
            variant="overlay"
          />
        )}

        {/* Messages area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          {isEmpty && !isLoading ? (
            /* Empty state */
            <div className="flex h-full flex-col items-center justify-center px-6 pb-6 pt-4">
              <img
                src={owlWise}
                alt="Wise owl assistant"
                className="mb-3 size-24 object-contain drop-shadow-sm"
              />
              <h2 className="mb-1.5 text-lg font-semibold text-foreground text-balance">
                Chat Assistant
              </h2>
              <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground leading-relaxed text-pretty">
                Ask about your finances, invoices, and Swedish tax rules.
                {activeCompany && (
                  <> Connected to <strong>{activeCompany.name}</strong>.</>
                )}
              </p>
              <p className="text-xs text-muted-foreground/60">
                Or drag & drop a PDF, JPG, or PNG receipt to attach it
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-5 px-5 py-5">
              {displayMessages.map((msg, idx) => {
                if (msg.role === "user") {
                  return <UserBubble key={msg.id} msg={msg} />;
                }
                if (msg.role === "tool") return null;
                if (msg.role !== "assistant") return null;
                return (
                  <AssistantTurn
                    key={msg.id}
                    message={msg}
                    threadId={currentThreadId}
                    citations={citationsByIndex[idx]}
                    isStreaming={isStreaming}
                    isCurrent={idx === lastAssistantIdx}
                  />
                );
              })}

              {/* Pre-first-chunk "Thinking" — the StepsSummary inside the current
                  AssistantTurn handles this normally, but when there isn't even
                  an assistant message yet we render a standalone row. */}
              {showStandaloneThinking && (
                <div className="w-full">
                  <StepsSummary
                    message={{
                      id: "__thinking__",
                      role: "assistant",
                      sequence: -1,
                      blocks: [],
                      createdAt: "",
                    }}
                    isStreaming={true}
                    isCurrent={true}
                  />
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t border-border bg-background px-4 py-3 shrink-0">
          <div className="mx-auto max-w-2xl">
            {/* Input card */}
            <div className="flex flex-col gap-1.5 rounded-2xl border border-input bg-background px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
              {/* Attachment chip inside the composer */}
              {uploadState && (
                <div className="flex flex-wrap gap-1.5">
                  <UploadChip state={uploadState} onRemove={() => setUploadState(null)} />
                </div>
              )}

              <div className="flex items-end gap-2">
                {/* Actions popover (+) — Files / Upload / Target / Skills */}
                <ComposerActionsPopover
                  disabled={isStreaming || uploadState?.phase === "uploading"}
                  onUploadClick={() => fileInputRef.current?.click()}
                  onInsertText={insertAtCursor}
                  onPickDocument={handlePickDocument}
                  forcedPane={forcedPane}
                  onPaneConsumed={() => setForcedPane(null)}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {/* Textarea with token-highlight mirror */}
                <div className="relative flex-1 min-w-0">
                  <div
                    ref={mirrorRef}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 py-1 text-sm leading-relaxed whitespace-pre-wrap break-words max-h-36 overflow-hidden text-foreground"
                  >
                    {composerTokens}
                  </div>
                  <textarea
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onScroll={(e) => {
                      if (mirrorRef.current) {
                        mirrorRef.current.scrollTop = e.currentTarget.scrollTop;
                      }
                    }}
                    placeholder={
                      uploadState?.phase === "ready"
                        ? `Add a note about "${uploadState.filename}" or just send…`
                        : "Ask about your finances or Swedish tax rules…"
                    }
                    aria-label="Chat input"
                    rows={1}
                    disabled={isStreaming}
                    style={{ color: "transparent", caretColor: "currentColor" }}
                    className="relative w-full resize-none bg-transparent py-1 text-sm placeholder:text-muted-foreground focus:outline-none max-h-36 leading-relaxed overflow-y-auto"
                  />
                </div>

                {/* Send button */}
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={isStreaming || (!value.trim() && !uploadState)}
                  aria-label="Send message"
                  className="shrink-0 mb-0.5 size-8 rounded-xl"
                >
                  <Send className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
