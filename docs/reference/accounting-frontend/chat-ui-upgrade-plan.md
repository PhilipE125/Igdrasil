# Chat UI Upgrade Plan — Sidekick-style polish + thread history access

## Summary

Refresh the chat sidebar to a Shopify-Sidekick-style layout: assistant replies render as clean flowing typography on the panel background (no muted card shell), a collapsible "N steps completed" group sits above the answer, markdown tables render inline, link/entity cards shrink to a compact icon-label-chevron row, and a minimal icon-only footer (copy / thumbs-up / thumbs-down) appears under each assistant turn. Separately, promote thread history to a first-class action in the chat header alongside new-chat / expand / close, and tighten the header chrome. All backend plumbing for threads already exists (`/chat/sessions`, `/chat/sessions/{id}/messages`, `useChatThreads`, `useChatThreadMessages`), so this is a pure frontend project. We ship visual polish first (Phase A), then the header-level history panel (Phase B) — each shippable independently.

## Current state

**Where chat lives**

- `frontend/src/components/views/ChatAssistantView.tsx` — single view that owns header, messages area, composer, empty state, upload chips, drag-drop overlay, and the history sidebar. ~595 lines.
- Mounted in three places: `frontend/src/pages/Index.tsx:7` (standalone route), `frontend/src/components/layout/MainLayout.tsx:189-197` (right-side slide-in drawer, 420px wide), `frontend/src/components/views/DashboardView.tsx:608-616` (full-screen overlay).

**The "clunky blob" is literally this** — `ChatAssistantView.tsx:167-205` renders every assistant turn with:
- An `AssistantAvatar` circle to the left (`ChatAssistantView.tsx:38-44`).
- Each text block wrapped in `rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3 ... prose prose-sm dark:prose-invert` (line 179). That muted pill is the card shell the user wants gone.
- Markdown rendered inside the pill via `AssistantMarkdown` (`frontend/src/components/chat/AssistantMarkdown.tsx`).
- Source citations as a flex-wrap row of rounded-full blue chips (lines 112-131), always directly below the pill.
- Component blocks render via `ComponentDispatcher` (`frontend/src/components/chat/ComponentDispatcher.tsx`); e.g. `KpiCard` uses shadcn `Card` → contributes to the "boxed blocks inside boxed blobs" feel.
- Subagent disclosure lives in `SubagentBlock` (`frontend/src/components/chat/SubagentBlock.tsx`) — already a collapsible with `bg-muted/30` border, but styled as a bordered card, not a muted inline row.

**How tool-use steps show today** — `frontend/src/components/chat/AgentThinkingThread.tsx`
- Shown only while streaming (condition in `ChatAssistantView.tsx:402-404`), inside its own `rounded-2xl rounded-tl-sm bg-muted/60` pill (line 518). After streaming completes the component unmounts — there is currently **no persistent "N steps completed" summary** visible on a finished assistant turn. That's the missing Sidekick element.
- Renders an animated bead/line SVG column per `ToolCallBlock` with hard-coded labels (e.g. `skatteverket_search` → "Searching Skatteverket").

**Streaming / envelope pipeline** (unchanged by this plan)
- `frontend/src/lib/chat/parseEnvelope.ts` — `applyEnvelope` merges streamed text/tool/thought envelopes into the current assistant message; `finalizeMessage` lifts leaked JSON to component blocks on stream end.
- `frontend/src/lib/hooks/useAcpSession.ts` — drives the optimistic user + empty assistant pair, opens the SSE stream, exposes `messages`, `isStreaming`, `isWaiting`, `currentThreadId`, `startNewThread`, `switchThread`.
- `frontend/src/lib/chat/types.ts` — block taxonomy (`text`, `tool_call`, `tool_result`, `component`, `subagent`, `thought`).

**Thread list / history — already fully wired**
- Hook: `frontend/src/lib/hooks/useChatThreads.ts` (`useChatThreads`, `useChatThreadMessages`, `useRenameThread`, `useArchiveThread`).
- Component: `frontend/src/components/chat/ThreadHistorySidebar.tsx` — a slide-open left rail mounted next to the chat (`ChatAssistantView.tsx:414-420`). Toggled by a `PanelLeft` button at `ChatAssistantView.tsx:446-454`, but **only when `onClose` is not passed**. In drawer mode (MainLayout, DashboardView full-screen) the history toggle is replaced by a back-arrow, so history is unreachable from the drawer — this is the bug the user is indirectly describing.

**Header** (`ChatAssistantView.tsx:434-471`)
- Left: `ArrowLeft` (when in drawer) **or** `PanelLeft` (standalone) — mutually exclusive.
- Middle: "Chat Assistant" label + active company name (right-aligned).
- Right: `Plus` for new chat.
- No history button in drawer mode. No expand button anywhere. The `onClose` prop is used but there is no explicit icon-only "close" button visually distinct from the back arrow.

**Loading indicator**
- Pre-first-chunk: `AgentThinkingThread` with no tool calls renders `ThinkingDots`-adjacent markup (spinner + "Thinking" label) inside a pill — `AgentThinkingThread.tsx:175-189`.
- `ThinkingDots` component exists (`frontend/src/components/chat/ThinkingDots.tsx`) but is currently unused.

**Persistence (for confidence — no changes needed)**
- Supabase tables: `chat_threads` and `chat_messages` (`supabase/migrations/20260417000001_chat_threads_messages_and_llm_config.sql:11-73`). Threads have `(user_id, company_id, title, last_activity_at, created_at, archived_at, goose_session_id, llm_provider, llm_model)`. Messages are scoped to thread and have a monotonic `sequence`.
- Backend routes: `GET/POST /chat/sessions`, `PATCH /chat/sessions/{id}` (rename), `DELETE /chat/sessions/{id}` (archive), `GET /chat/sessions/{id}/messages`, `POST /chat/stream`. All implemented in `backend/app/chat/routes.py` with correct company scoping.

## Target design

**Visual principles (the "Sidekick rules")**

1. **Assistant message = typography on the panel.** No card, no background, no avatar. Direct paragraphs, lists, tables flow on the panel background with tight top/bottom margins. User messages keep today's pink pill (`bg-[#ee8fe0]` right-aligned) — that stays.
2. **"N steps completed" summary** renders as a muted, collapsible single-line row above the assistant prose: a check icon (pink `#ee8fe0`) + "3 steps completed" + chevron. Default collapsed once the turn finishes. Expanded: shows the existing bead/line `AgentThinkingThread` markup (we reuse it, just stop forcing it into a pill).
3. **Markdown tables render raw** via `remark-gfm` — we extend `AssistantMarkdown`'s `components` map to style `<table>/<thead>/<tbody>/<tr>/<th>/<td>` with `border-collapse`, thin dividers, `text-xs`, zebra-free, left-aligned headings. No surrounding card.
4. **Link cards = compact inline row.** Extract the existing `LinkChip` into a promoted `EntityLinkRow` for markdown links that target an internal entity (invoice, supplier, ledger entry) — icon left, short label middle, chevron right, single hover/focus state. External links remain as the smaller `LinkChip` pill (current behavior) — we just drop the chip's border intensity to match a muted row.
5. **Message footer** under finished assistant turns: three 20px icon buttons (`Copy`, `ThumbsUp`, `ThumbsDown`) with muted color, no labels, no background. Hidden during streaming. Copy puts the concatenated text blocks to clipboard; thumbs buttons POST feedback (see Open questions).
6. **Loading indicator inline with stream.** While an assistant is streaming text, append a 4-dot `ThinkingDots`-style element to the end of the current text block rather than rendering it as a separate pill. Existing `ThinkingDots.tsx` has 3 dots; bump to 4 (Sidekick trait) or reuse as-is and accept the minor diff.
7. **Component blocks (`KpiCard`, `LedgerTable`, etc.) lose their surrounding `Card` shell** — replace with a subtle top/bottom rule (`border-y border-border/50`) so they sit visually flush with the prose above and below.
8. **Subagent block** moves from a bordered muted card to a bare collapsible row (same pattern as the steps summary).
9. **Citations row** stays but drops the blue; make them muted grey pills with an `ExternalLink` icon only (match the overall desaturation).

**Sidebar chrome**

- Header becomes a single 40px-tall row: slim left label (thread title or "Chat Assistant") + right icon cluster (`History`, `Plus`, `Maximize2`, `X`). No company sub-label — move it into the thread title when present.
- Remove the `SourceCitations`-style chips from the header area; keep only `SidePanel`-matching borders.
- Messages area gains a uniform `max-w-2xl mx-auto px-5 py-5` container (slightly tighter than today's `max-w-3xl px-4 py-6`) and removes all per-message inner borders.

**New / modified components**

| File | Kind | Purpose |
|------|------|---------|
| `frontend/src/components/chat/AssistantTurn.tsx` | **new** | One assistant message: renders `StepsSummary`, then block body (text / component / subagent), then `MessageFooter`. Replaces the `msg.role === "assistant"` branch of `MessageBubble` in `ChatAssistantView.tsx`. |
| `frontend/src/components/chat/StepsSummary.tsx` | **new** | Collapsible "N steps completed" row. Derives steps from `msg.blocks.filter(b => b.type === "tool_call")`. Collapsed by default post-stream; defaults open while `isStreaming && !allDone`. Expanded body reuses `AgentThinkingThread` (pass `toolCalls` prop instead of scanning all messages). |
| `frontend/src/components/chat/MessageFooter.tsx` | **new** | Icon-only copy / thumbs-up / thumbs-down row. Calls `navigator.clipboard.writeText(concatText(msg))`. Thumbs wire a stub `onFeedback(msg.id, "up"|"down")` — real endpoint in open questions. |
| `frontend/src/components/chat/AssistantMarkdown.tsx` | **modify** | Add `table / thead / tbody / tr / th / td / ul / ol / li / p / code` component overrides that produce unboxed, typographic output matching the panel palette. Leave external-link chip behavior. |
| `frontend/src/components/chat/AgentThinkingThread.tsx` | **modify** | Accept `toolCalls: ToolCallBlock[]` directly (instead of scanning `messages`). Drop the outer padding so it nests cleanly inside `StepsSummary`. Keep the bead SVG animation. |
| `frontend/src/components/chat/ThinkingDots.tsx` | **modify** | Add a 4-dot variant; accept `className` for inline use. |
| `frontend/src/components/chat/SubagentBlock.tsx` | **modify** | Drop border + card bg; match `StepsSummary` styling (muted row + chevron). |
| `frontend/src/components/chat/components/*.tsx` | **modify** (each) | Swap `<Card><CardContent>` for a bare `<div className="my-3 ...">` with thin top/bottom dividers. |
| `frontend/src/components/views/ChatAssistantView.tsx` | **modify** | Rebuild header (see below). Replace `MessageBubble` assistant branch with `<AssistantTurn>`. Remove the pill styling (line 179). Move the inline-streaming dots to end of last text block. Always show history toggle (not mutually exclusive with `ArrowLeft`). Add `Maximize2` button when `onClose` is present (drawer / overlay modes). |

**Sidebar header spec**

```
[Title -------------------------------]  [history] [+] [expand] [x]
```

- `history` (`History` icon from lucide) toggles `ThreadHistorySidebar`.
- `+` (`Plus`) calls `startNewThread`.
- `expand` (`Maximize2`) only rendered when embedded as drawer — navigates to `/chat` full-screen via `react-router-dom` `useNavigate`.
- `x` (`X`) only rendered when `onClose` is provided — calls `onClose()`.
- When standalone (no `onClose`), show a back chevron → navigate to previous route instead.

**Thread history panel (the user's explicit ask)**

- Reuse existing `ThreadHistorySidebar` but re-position as an **overlay** on top of the chat column (not a left rail pushing the chat area). In drawer mode the full 420px widget is only 420px — a side-by-side layout breaks. Overlay semantics: slides down from under the header with `absolute inset-x-0 top-[header-height] bottom-0 bg-background z-30`. Close icon in its own mini-header or tap anywhere outside.
- Alternative (simpler, recommended for first iteration): keep it as a left-docked column but narrow to `w-56`, and promote the toggle button to always-visible in the header.

## Implementation steps

Grouped so Phase A (visual polish) and Phase B (history access) ship independently.

### Phase A — Visual polish (assistant turns feel like Sidekick)

**A1. Drop the pill, land typography on background.**
Files: `frontend/src/components/views/ChatAssistantView.tsx` (`MessageBubble` assistant branch, lines 167-205), `frontend/src/components/chat/AssistantMarkdown.tsx`.
Change: remove the wrapping `rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3 ...` div around each assistant text block. Remove `AssistantAvatar`. Replace with `<div className="assistant-prose text-[13.5px] leading-relaxed text-foreground/90 space-y-3">`. In `AssistantMarkdown`, override `p / h1-h3 / ul / ol / li` to thin margins, override `table / th / td` to a minimal bordered style (e.g. `border-b border-border/50`, `px-2 py-1.5`). Keep user message pill untouched.
Acceptance: single-paragraph answers look identical to a paragraph directly in the panel. Tables render inline. No visual regression on existing component blocks.

**A2. Extract `AssistantTurn` + `MessageFooter`.**
Files: create `frontend/src/components/chat/AssistantTurn.tsx`, `frontend/src/components/chat/MessageFooter.tsx`. Modify `ChatAssistantView.tsx` to use them.
Change: `AssistantTurn` owns block iteration (text / component / subagent), renders `MessageFooter` when `!isStreaming || i < messages.length - 1`. `MessageFooter` has three `<button>`s with `Copy`, `ThumbsUp`, `ThumbsDown` icons, `size-6 p-1 text-muted-foreground hover:text-foreground`, `aria-label` on each. Stub `onFeedback`.
Acceptance: copy button puts text to clipboard; thumbs buttons toggle a visual active state; footer hidden mid-stream.

**A3. "N steps completed" summary.**
Files: create `frontend/src/components/chat/StepsSummary.tsx`. Modify `AgentThinkingThread.tsx` to accept `toolCalls` + `latestThought` via props (shift data plumbing from `messages` to props).
Change: `StepsSummary` shows either live progress (while `isStreaming` and any tool incomplete) or a collapsed "`<Check icon>` `<count>` steps completed `<Chevron>`" row. Controlled open state; default collapsed after stream end. When expanded, render `AgentThinkingThread` inline without its outer pill.
Remove the separate pill rendered at `ChatAssistantView.tsx:515-522` — the summary now lives at the top of `AssistantTurn`, and the pre-first-event "Thinking" indicator moves into it too (0 tool calls → renders a 4-dot shimmer).
Acceptance: during streaming, steps show live with the animated beads; after `done`, they collapse into a single muted row; clicking reveals history.

**A4. Inline streaming dots.**
Files: `frontend/src/components/chat/ThinkingDots.tsx`, `AssistantTurn.tsx`.
Change: append a 4-dot shimmer to the very end of the last text block while that message is streaming. When streaming ends, remove. No separate pill.
Acceptance: visible progress while tokens arrive.

**A5. Compact component blocks + subagent row.**
Files: `frontend/src/components/chat/components/KpiCard.tsx`, `LedgerTable.tsx`, `DecisionTree.tsx`, `VATBreakdown.tsx`, `ApprovalCard.tsx`, `frontend/src/components/chat/SubagentBlock.tsx`.
Change: drop the `<Card>` shell; use `my-3 py-2 border-y border-border/40`. `SubagentBlock` loses its border/background and gets the same muted-row look as `StepsSummary`.
Acceptance: cards feel "in the stream", not "in a box".

**A6. Citations desaturation.**
Files: `SourceCitations` in `ChatAssistantView.tsx:112-131`, `LinkChip` in `AssistantMarkdown.tsx`.
Change: remove blue; use `text-muted-foreground border-border bg-background hover:bg-muted`. Move citations row to the line directly above `MessageFooter`.
Acceptance: nothing on an assistant turn draws more attention than the prose.

### Phase B — Thread history access from the header

**B1. History button in header.**
Files: `frontend/src/components/views/ChatAssistantView.tsx:434-471`.
Change: always render history toggle; don't swap with `ArrowLeft`. New icon cluster order: `[History] [Plus] [Maximize2 (if onClose && route)] [X (if onClose)]` / back chevron on the left only when standalone.
Acceptance: drawer and full-screen modes both expose a visible history button.

**B2. Make `ThreadHistorySidebar` work as an overlay in narrow drawer.**
Files: `frontend/src/components/chat/ThreadHistorySidebar.tsx`, `ChatAssistantView.tsx`.
Change: add a `variant` prop: `"rail"` (current behavior, push content) vs `"overlay"` (absolute, covers the chat column, slide-in from the left). Use `overlay` when rendered inside a 420px drawer, `rail` on standalone route.
Acceptance: clicking history in drawer mode shows the thread list on top of the chat; selecting a thread collapses the overlay and replaces messages via `switchThread`.

**B3. Verify `switchThread` flow end-to-end.**
Files: none (pure manual test) — `useAcpSession.ts:63-69` already handles switches by aborting any in-flight stream and setting the new `currentThreadId`; `useChatThreadMessages(threadId)` refetches automatically.
Acceptance: clicking old thread → messages load; new prompt posts into the loaded thread (verify the POST body's `thread_id` matches).

**B4. Header "expand" from drawer to full-screen.**
Files: `ChatAssistantView.tsx`, potentially add a `/chat` route (Index.tsx already mounts `ChatAssistantView` without `onClose`).
Change: when in drawer (`onClose` set), the `Maximize2` button closes the drawer and navigates to `/chat` (full-screen standalone view).
Acceptance: expand returns full-screen with the same active thread id (pass via URL query: `/chat?thread=<id>`). Deferred if router wiring is too invasive — mark as optional.

### Phase C — Cleanup / nice-to-haves

**C1. Remove the company-name right-aligned span** in the header and instead bake company into the thread title (already done on first message via `useRenameThread`, `ChatAssistantView.tsx:324`).
**C2. Collapse the helper "Enter to send · Shift+Enter …" line** below the composer — replace with a single subtle attach icon tooltip to reduce chrome.
**C3. Telemetry stub** for copy / thumbs feedback (no-op today; hits an endpoint TBD).

## Backend work needed

**None required for Phase A or Phase B.**

Everything needed already exists in `backend/app/chat/routes.py`:

- `GET /chat/sessions` → thread list.
- `GET /chat/sessions/{id}/messages` → resume messages.
- `PATCH /chat/sessions/{id}` → rename.
- `DELETE /chat/sessions/{id}` → archive.
- `POST /chat/stream` with `thread_id` in the body → continue existing thread.

**Optional (Phase C only)**: a `POST /chat/messages/{id}/feedback` endpoint if we want real thumbs-up/down persistence. Shape: `{ message_id, feedback: "up"|"down", comment? }`. Would land in a new table `chat_message_feedback` (company_id-scoped, RLS, FK to chat_messages). Out of scope unless explicitly greenlit.

## Open questions (please weigh in before coding)

1. **History scoping — per-company or per-user?** Today `list_threads` filters by both `user_id` and `company_id` (`backend/app/chat/service.py:19-39`), so switching company hides threads from the other company. The user's ask ("list threads … clicking loads its messages") fits the per-company model, but worth confirming that's intentional. If you want a global history across companies, the `useChatThreads` query + backend filter need a new `all_companies=true` mode.
2. **Thumbs up/down — do we ship this wired?** Easy stub, but without a feedback endpoint it's decorative. Suggest: ship as disabled (aria-only) in Phase A, follow up with endpoint in Phase C.
3. **History panel layout in drawer.** Two options: (a) narrow docked left rail that pushes the chat body (space-constrained at 420px), (b) overlay that covers the chat column until a thread is picked. I'd pick (b) for drawer, (a) for standalone. Please confirm or pick one uniformly.
4. **"Steps completed" summary on resumed threads.** The live `AgentThinkingThread` depends on the `tool_call` blocks within an assistant message; those **are** persisted (`chat_messages.role='tool'` with `tool_call_id`/`tool_name`). However `fromStoredRow` (`parseEnvelope.ts:249-327`) attaches them to a separate `role='tool'` message, not nested inside the assistant they belong to. So on resume, today's data shape does not give us a neat "assistant message + its tool calls" grouping. The `StepsSummary` needs a grouping pass either in `useChatThreadMessages` (frontend) or a backend reshape on `GET /chat/sessions/{id}/messages`. Recommended: frontend-only groupAdjacentToolsIntoAssistant helper — confirm scope.
5. **Expand-from-drawer route.** Do we already have a dedicated `/chat` route? `Index.tsx` renders `<ChatAssistantView />` inside `<MainLayout>`, so visiting `/` in that mode shows chat. That's probably not the canonical standalone route the user expects. May need a distinct `/chat` path — confirm if it's worth it or leave as follow-up.
6. **Tambo references.** The user mentioned a Tambo → Goose migration and asked whether to reuse Tambo's old thread sidebar. A repo-wide grep for `tambo|Tambo` in `frontend/**` returned zero hits — all Tambo UI was deleted during migration. So the answer is: nothing to reuse, `ThreadHistorySidebar` is the one true history component.

## Out of scope

- Rewriting the composer (textarea / attach flow / drag-drop). Today's composer stays untouched.
- Changing the LLM backend, streaming protocol, or `parseEnvelope` / `applyEnvelope` logic.
- Any change to `ComponentDispatcher`'s registry or to tool-call behavior.
- Backend RLS / table schema. `chat_threads` and `chat_messages` are untouched.
- Mobile-specific interaction polish (per `goose-chat-plan.md:23`, mobile is out of scope for v1).
- Dark-mode re-tune. We keep today's tokens; any mode-specific tweaks are out of scope.
- A real thumbs-up/down feedback endpoint (Phase C stub only).
- Replacing `react-markdown` or changing the markdown plugin set.
