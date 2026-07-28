import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeEvents } from "@/lib/hooks/useRealtimeEvents";
import {
  MockWebSocket,
  buildAuthValue,
  buildCompanyValue,
  mockCompany,
  mockSession,
  createTestWrapper,
} from "@/test/helpers";

vi.mock("@/lib/supabase");
vi.mock("@/lib/runtimeConfig");

// Wrapper that provides a session so the hook creates a WebSocket
function makeWrapper(sessionOverride?: Record<string, unknown>) {
  return createTestWrapper({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authValue: buildAuthValue({ session: mockSession(sessionOverride as any) }),
    companyValue: buildCompanyValue({ activeCompany: mockCompany() }),
  });
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", MockWebSocket);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

// ── Connection ───────────────────────────────────────────────────────────────

describe("connection", () => {
  it("creates a WebSocket with URL ending /ws when session is present", () => {
    renderHook(() => useRealtimeEvents(), { wrapper: makeWrapper() });
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toMatch(/\/ws$/);
  });

  it("does not create a WebSocket when session is null", () => {
    renderHook(() => useRealtimeEvents(), {
      wrapper: createTestWrapper({
        authValue: buildAuthValue({ session: null }),
      }),
    });
    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it("sends auth message with token on open", () => {
    renderHook(() => useRealtimeEvents(), { wrapper: makeWrapper() });
    act(() => { MockWebSocket.instances[0].simulateOpen(); });
    expect(MockWebSocket.instances[0].sentMessages[0]).toBe(
      JSON.stringify({ type: "auth", token: "test-token" }),
    );
  });

  it("calls ws.close() on unmount", () => {
    const { unmount } = renderHook(() => useRealtimeEvents(), { wrapper: makeWrapper() });
    const ws = MockWebSocket.instances[0];
    const closeSpy = vi.spyOn(ws, "close");
    unmount();
    expect(closeSpy).toHaveBeenCalled();
  });

  it("does not reconnect after no_companies error", async () => {
    renderHook(() => useRealtimeEvents(), { wrapper: makeWrapper() });
    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateMessage(JSON.stringify({ type: "error", code: "no_companies", message: "no companies" }));
      ws.simulateClose();
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(MockWebSocket.instances).toHaveLength(1);
  });
});

// ── Backoff ──────────────────────────────────────────────────────────────────

describe("backoff", () => {
  it("reconnects after 1000ms on first close", async () => {
    renderHook(() => useRealtimeEvents(), { wrapper: makeWrapper() });
    act(() => { MockWebSocket.instances[0].simulateClose(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(999); });
    expect(MockWebSocket.instances).toHaveLength(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it("doubles the backoff on second close (reconnects after 2000ms)", async () => {
    renderHook(() => useRealtimeEvents(), { wrapper: makeWrapper() });
    // First close → backoff 1000ms → reconnect
    act(() => { MockWebSocket.instances[0].simulateClose(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(MockWebSocket.instances).toHaveLength(2);

    // Second close → backoff 2000ms
    act(() => { MockWebSocket.instances[1].simulateClose(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(1999); });
    expect(MockWebSocket.instances).toHaveLength(2);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(MockWebSocket.instances).toHaveLength(3);
  });

  it("caps backoff at 30000ms", async () => {
    renderHook(() => useRealtimeEvents(), { wrapper: makeWrapper() });
    // Drive backoff to its cap: delays are 1000→2000→4000→8000→16000→(cap)
    const delaySequence = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < delaySequence.length; i++) {
      act(() => { MockWebSocket.instances[i].simulateClose(); });
      await act(async () => { await vi.advanceTimersByTimeAsync(delaySequence[i]); });
    }
    expect(MockWebSocket.instances).toHaveLength(6);

    // Next close should use the capped 30000ms
    act(() => { MockWebSocket.instances[5].simulateClose(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(29999); });
    expect(MockWebSocket.instances).toHaveLength(6);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(MockWebSocket.instances).toHaveLength(7);
  });

  it("resets backoff to 1000ms after a successful open", async () => {
    renderHook(() => useRealtimeEvents(), { wrapper: makeWrapper() });

    // First close increases backoff to 2000
    act(() => { MockWebSocket.instances[0].simulateClose(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(MockWebSocket.instances).toHaveLength(2);

    // Open resets backoff to 1000
    act(() => { MockWebSocket.instances[1].simulateOpen(); });

    // Next close should reconnect at 1000ms again
    act(() => { MockWebSocket.instances[1].simulateClose(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(999); });
    expect(MockWebSocket.instances).toHaveLength(2);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(MockWebSocket.instances).toHaveLength(3);
  });
});

// ── Keepalive ────────────────────────────────────────────────────────────────

describe("keepalive", () => {
  it("sends ping after 25 seconds post-open", async () => {
    renderHook(() => useRealtimeEvents(), { wrapper: makeWrapper() });
    act(() => { MockWebSocket.instances[0].simulateOpen(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(25_000); });
    expect(MockWebSocket.instances[0].sentMessages).toContain("ping");
  });

  it("sends ping twice after 50 seconds", async () => {
    renderHook(() => useRealtimeEvents(), { wrapper: makeWrapper() });
    act(() => { MockWebSocket.instances[0].simulateOpen(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(50_000); });
    const pings = MockWebSocket.instances[0].sentMessages.filter((m) => m === "ping");
    expect(pings).toHaveLength(2);
  });

  it("does not send ping after close (interval cleared)", async () => {
    renderHook(() => useRealtimeEvents(), { wrapper: makeWrapper() });
    const ws = MockWebSocket.instances[0];
    act(() => { ws.simulateOpen(); ws.simulateClose(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(25_000); });
    expect(ws.sentMessages).not.toContain("ping");
  });
});

// ── Cache invalidation ───────────────────────────────────────────────────────

describe("cache invalidation", () => {
  function setup() {
    let capturedClient: ReturnType<typeof useQueryClient> | null = null;
    const wrapper = makeWrapper();
    renderHook(
      () => {
        useRealtimeEvents();
        capturedClient = useQueryClient();
      },
      { wrapper },
    );
    const ws = MockWebSocket.instances[0];
    act(() => { ws.simulateOpen(); });
    return { ws, getClient: () => capturedClient! };
  }

  it("invalidates pipeline-documents on documents event", () => {
    const { ws, getClient } = setup();
    const spy = vi.spyOn(getClient(), "invalidateQueries");
    act(() => {
      ws.simulateMessage(
        JSON.stringify({ type: "invalidate", table: "documents", id: "1", company_id: "", op: "INSERT" }),
      );
    });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["pipeline-documents"] }));
  });

  it("invalidates dashboard-summary with company_id scope on documents event", () => {
    const { ws, getClient } = setup();
    const spy = vi.spyOn(getClient(), "invalidateQueries");
    act(() => {
      ws.simulateMessage(
        JSON.stringify({ type: "invalidate", table: "documents", id: "1", company_id: "c1", op: "INSERT" }),
      );
    });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["dashboard-summary", "c1"] }),
    );
  });

  it("invalidates dashboard-activity with company_id scope on documents event", () => {
    const { ws, getClient } = setup();
    const spy = vi.spyOn(getClient(), "invalidateQueries");
    act(() => {
      ws.simulateMessage(
        JSON.stringify({ type: "invalidate", table: "documents", id: "1", company_id: "c1", op: "INSERT" }),
      );
    });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["dashboard-activity", "c1"] }),
    );
  });

  it("invalidates ledger-entries on ledger_entries event", () => {
    const { ws, getClient } = setup();
    const spy = vi.spyOn(getClient(), "invalidateQueries");
    act(() => {
      ws.simulateMessage(
        JSON.stringify({ type: "invalidate", table: "ledger_entries", id: "1", company_id: "", op: "UPDATE" }),
      );
    });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["ledger-entries"] }));
  });

  it("does not crash or invalidate on unknown table", () => {
    const { ws, getClient } = setup();
    const spy = vi.spyOn(getClient(), "invalidateQueries");
    act(() => {
      ws.simulateMessage(
        JSON.stringify({ type: "invalidate", table: "unknown_table", id: "1", company_id: "", op: "INSERT" }),
      );
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it("does not crash on pong message", () => {
    const { ws } = setup();
    expect(() => {
      act(() => { ws.simulateMessage("pong"); });
    }).not.toThrow();
  });

  it("does not crash on malformed JSON", () => {
    const { ws } = setup();
    expect(() => {
      act(() => { ws.simulateMessage("not-json!!!"); });
    }).not.toThrow();
  });
});
