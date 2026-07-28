import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { runtimeConfig } from "@/lib/runtimeConfig";

/** Query key prefixes that include company_id as the second element. */
const COMPANY_SCOPED_KEYS = new Set(["dashboard-summary", "dashboard-activity"]);

/** Map PG table names to react-query key prefixes for invalidation. */
const TABLE_TO_QUERY_KEYS: Record<string, string[][]> = {
  documents: [["pipeline-documents"], ["documents"], ["pipeline-runs"], ["dashboard-summary"], ["dashboard-activity"]],
  pipeline_runs: [["pipeline-runs"]],
  ledger_entries: [["ledger-entries"], ["pipeline-documents"], ["dashboard-summary"]],
  ledger_entry_lines: [["ledger-entries"], ["pipeline-documents"], ["dashboard-summary"]],
  accounting_entry_links: [["ledger-entries"], ["pipeline-documents"]],
  customers: [["ledger-entries"], ["pipeline-documents"], ["accounting-customers"], ["accounting-suppliers"]],
  customer_invoices: [["accounting-customers"]],
  companies: [["companies"]],
  bank_transaction_matches: [["bank-matches"]],
  supplier_invoices: [["accounting-suppliers"]],
  invoices: [["accounting-customers"], ["accounting-suppliers"]],
};

interface RealtimeEvent {
  type: "invalidate";
  table: string;
  id: string;
  company_id: string;
  op: string;
}

interface RealtimeError {
  type: "error";
  code: string;
  message: string;
}

type WsMessage = RealtimeEvent | RealtimeError;

/**
 * Hook that maintains a WebSocket connection to the event-processor
 * and automatically invalidates react-query caches when data changes.
 *
 * Features:
 * - Exponential backoff reconnection (1s → 2s → 4s → max 30s)
 * - Periodic ping keepalive (25s)
 * - Graceful degradation (polling still works if WS fails)
 */
export function useRealtimeEvents() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { activeCompany } = useCompany();
  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(1000);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Holds the latest connect fn so the onclose closure never goes stale.
  const connectRef = useRef<() => void>(() => {});
  const noCompaniesRef = useRef(false);

  const connect = useCallback(() => {
    const token = session?.access_token;
    if (!token) return;
    if (!activeCompany?.id) return;
    if (wsRef.current) return;
    noCompaniesRef.current = false;

    // Connect directly to the event-processor service.
    // If wsBaseUrl is configured, use it directly; otherwise derive from apiBaseUrl.
    let wsBase: string;
    if (runtimeConfig.wsBaseUrl) {
      wsBase = runtimeConfig.wsBaseUrl.replace(/\/+$/, "");
    } else {
      const apiBase = runtimeConfig.apiBaseUrl || window.location.origin.replace("5173", "8000");
      wsBase = apiBase.replace(/\/api\/?$/, "");
    }
    // Upgrade http(s) to ws(s), preserving TLS when the origin uses https.
    wsBase = wsBase.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
    const wsUrl = `${wsBase}/ws`;

    const scheduleReconnect = () => {
      if (reconnectTimerRef.current) return;
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        backoffRef.current = Math.min(backoffRef.current * 2, 30_000);
        connectRef.current();
      }, backoffRef.current);
    };

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        backoffRef.current = 1000;
        ws.send(JSON.stringify({ type: "auth", token }));
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send("ping");
        }, 25_000);
        ws.addEventListener("close", () => clearInterval(pingInterval), { once: true });
      };

      ws.onmessage = (event) => {
        if (event.data === "pong") return;
        try {
          const data: WsMessage = JSON.parse(event.data);
          if (data.type === "error" && data.code === "no_companies") {
            noCompaniesRef.current = true;
            return;
          }
          if (data.type !== "invalidate") return;
          const queryKeys = TABLE_TO_QUERY_KEYS[data.table];
          if (queryKeys) {
            for (const key of queryKeys) {
              // Dashboard query keys include company_id as second element —
              // use scoped invalidation to avoid cross-company refetches.
              // Other queries (pipeline-documents, bank-matches, etc.) don't
              // carry company_id in their key so fall back to broad invalidation.
              const scopedKey = COMPANY_SCOPED_KEYS.has(key[0]) && data.company_id
                ? [...key, data.company_id]
                : key;
              queryClient.invalidateQueries({ queryKey: scopedKey });
            }
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!noCompaniesRef.current) {
          scheduleReconnect();
        }
      };

      ws.onerror = () => {};
    } catch {
      scheduleReconnect();
    }
  }, [session?.access_token, activeCompany?.id, queryClient]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);
}
