// Minimal SSE parser for `fetch`-based streams.
//
// The native `EventSource` API doesn't support custom headers (our backend
// requires Authorization + X-Company-Id), so we use `fetch` + a hand-rolled
// `event: <type>\ndata: <json>\n\n` parser. Keeps us off `eventsource-parser`.

import { getAuthToken } from "@/lib/uploadApi";
import { runtimeConfig } from "@/lib/runtimeConfig";
import type { SSEEnvelope, SSEEventType } from "./types";

const API_BASE_URL = runtimeConfig.apiBaseUrl.replace(/\/$/, "");

export interface StreamOptions {
  companyId: string;
  body: unknown;
  signal?: AbortSignal;
}

export async function* streamChatTurn(
  opts: StreamOptions,
): AsyncGenerator<SSEEnvelope, void, void> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-Company-Id": opts.companyId,
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify(opts.body),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `chat stream failed: ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`,
    );
  }

  const decoder = new TextDecoder();
  const reader = res.body.getReader();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Split on blank-line boundary (CRLF or LF)
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const envelope = parseBlock(block);
        if (envelope) yield envelope;
        boundary = buffer.indexOf("\n\n");
      }
    }
    if (buffer.trim()) {
      const envelope = parseBlock(buffer);
      if (envelope) yield envelope;
    }
  } finally {
    try { reader.releaseLock(); } catch { /* no-op */ }
  }
}

function parseBlock(block: string): SSEEnvelope | null {
  let event: SSEEventType | null = null;
  const dataLines: string[] = [];
  for (const rawLine of block.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      event = line.slice(6).trim() as SSEEventType;
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }
  if (!event) return null;
  const raw = dataLines.join("\n");
  try {
    const data = raw ? JSON.parse(raw) : {};
    return { type: event, data };
  } catch {
    return { type: event, data: { _raw: raw } };
  }
}
