import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { supabase } from "@/lib/supabase";
import { authenticatedApiRequest, setActiveCompanyId } from "@/lib/uploadApi";

vi.mock("@/lib/supabase");
vi.mock("@/lib/runtimeConfig");

// Default session returned by supabase.auth.getSession before each test.
// Individual tests override with mockResolvedValueOnce as needed.
const DEFAULT_SESSION = {
  data: { session: { access_token: "test-token" } },
  error: null,
};

let fetchSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  setActiveCompanyId("test-company");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(supabase.auth.getSession).mockResolvedValue(DEFAULT_SESSION as any);
  fetchSpy = vi.spyOn(global, "fetch");
});

afterEach(() => {
  fetchSpy.mockRestore();
});

// ── Response factories ───────────────────────────────────────────────────────

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

function textResponse(body: string, status = 200, contentType = "text/plain"): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    headers: new Headers({ "content-type": contentType }),
    json: async () => { throw new Error("not json"); },
    text: async () => body,
  } as unknown as Response;
}

function response401(): Response {
  return {
    ok: false,
    status: 401,
    statusText: "Unauthorized",
    headers: new Headers(),
    text: async () => "",
  } as unknown as Response;
}

function noContentResponse(): Response {
  return {
    ok: true,
    status: 204,
    statusText: "No Content",
    headers: new Headers(),
  } as unknown as Response;
}

// ── Auth headers ─────────────────────────────────────────────────────────────

describe("auth headers", () => {
  it("always sets Authorization: Bearer token", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ ok: true }));
    await authenticatedApiRequest("/test");
    const [, init] = fetchSpy.mock.calls[0];
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer test-token");
  });

  it("throws 'Not authenticated' when no session and does not call fetch", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    await expect(authenticatedApiRequest("/test")).rejects.toThrow("Not authenticated");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws 'No active company selected' when no company and path requires one", async () => {
    setActiveCompanyId(null);
    await expect(authenticatedApiRequest("/test")).rejects.toThrow("No active company selected");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("does not set X-Company-Id when no active company", async () => {
    setActiveCompanyId(null);
    fetchSpy.mockResolvedValueOnce(jsonResponse({}));
    // Use a company-optional path so the guard doesn't throw
    await authenticatedApiRequest("/companies");
    const [, init] = fetchSpy.mock.calls[0];
    expect(new Headers(init?.headers).get("X-Company-Id")).toBeNull();
  });

  it("sets X-Company-Id after setActiveCompanyId", async () => {
    setActiveCompanyId("co-1");
    fetchSpy.mockResolvedValueOnce(jsonResponse({}));
    await authenticatedApiRequest("/test");
    const [, init] = fetchSpy.mock.calls[0];
    expect(new Headers(init?.headers).get("X-Company-Id")).toBe("co-1");
  });

  it("omits X-Company-Id after setActiveCompanyId(null)", async () => {
    setActiveCompanyId("co-1");
    setActiveCompanyId(null);
    fetchSpy.mockResolvedValueOnce(jsonResponse({}));
    // Use a company-optional path so the guard doesn't throw
    await authenticatedApiRequest("/companies");
    const [, init] = fetchSpy.mock.calls[0];
    expect(new Headers(init?.headers).get("X-Company-Id")).toBeNull();
  });
});

// ── Content-Type ─────────────────────────────────────────────────────────────

describe("Content-Type", () => {
  it("sets Content-Type: application/json for string body", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({}));
    await authenticatedApiRequest("/test", {
      method: "POST",
      body: JSON.stringify({ key: "value" }),
    });
    const [, init] = fetchSpy.mock.calls[0];
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
  });

  it("does not set Content-Type for FormData body", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({}));
    await authenticatedApiRequest("/test", { method: "POST", body: new FormData() });
    const [, init] = fetchSpy.mock.calls[0];
    expect(new Headers(init?.headers).get("Content-Type")).toBeNull();
  });

  it("does not set Content-Type when no body", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({}));
    await authenticatedApiRequest("/test");
    const [, init] = fetchSpy.mock.calls[0];
    expect(new Headers(init?.headers).get("Content-Type")).toBeNull();
  });

  it("does not override caller-provided Content-Type", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({}));
    await authenticatedApiRequest("/test", {
      method: "POST",
      body: "raw data",
      headers: { "Content-Type": "text/plain" },
    });
    const [, init] = fetchSpy.mock.calls[0];
    expect(new Headers(init?.headers).get("Content-Type")).toBe("text/plain");
  });
});

// ── Response handling ────────────────────────────────────────────────────────

describe("response handling", () => {
  it("resolves to parsed JSON body on 200", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ id: 42 }));
    const result = await authenticatedApiRequest<{ id: number }>("/test");
    expect(result).toEqual({ id: 42 });
  });

  it("resolves without throwing on 204 No Content", async () => {
    fetchSpy.mockResolvedValueOnce(noContentResponse());
    await expect(authenticatedApiRequest("/test")).resolves.toBeUndefined();
  });

  it("calls signOut and throws 'Session expired' on 401", async () => {
    fetchSpy.mockResolvedValueOnce(response401());
    await expect(authenticatedApiRequest("/test")).rejects.toThrow("Session expired");
    expect(vi.mocked(supabase.auth.signOut)).toHaveBeenCalledTimes(1);
  });

  it("does not call signOut twice when already signing out (guard)", async () => {
    // Make signOut pause so both requests can hit the guard simultaneously
    let resolveSignOut!: () => void;
    vi.mocked(supabase.auth.signOut).mockReturnValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new Promise<any>((resolve) => { resolveSignOut = resolve; }),
    );
    fetchSpy.mockResolvedValue(response401());

    const [p1, p2] = [
      authenticatedApiRequest("/test"),
      authenticatedApiRequest("/test"),
    ];
    // Let both reach the 401 handler while signOut is still pending
    await vi.waitFor(() => {
      return vi.mocked(supabase.auth.signOut).mock.calls.length >= 1;
    });
    resolveSignOut();
    await Promise.allSettled([p1, p2]);

    expect(vi.mocked(supabase.auth.signOut)).toHaveBeenCalledTimes(1);
  });

  it("throws with detail string on 500", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ detail: "bad input" }, 500));
    await expect(authenticatedApiRequest("/test")).rejects.toThrow("bad input");
  });

  it("joins detail array messages with semicolons", async () => {
    fetchSpy.mockResolvedValueOnce(
      jsonResponse({ detail: [{ msg: "field a required" }, { msg: "field b invalid" }] }, 422),
    );
    await expect(authenticatedApiRequest("/test")).rejects.toThrow(
      "field a required; field b invalid",
    );
  });

  it("throws with plain text body on non-JSON error", async () => {
    fetchSpy.mockResolvedValueOnce(textResponse("Internal server error", 500));
    await expect(authenticatedApiRequest("/test")).rejects.toThrow("Internal server error");
  });

  it("throws mentioning VITE_API_BASE_URL when response is HTML", async () => {
    fetchSpy.mockResolvedValueOnce(textResponse("<!DOCTYPE html>...", 200, "text/html"));
    await expect(authenticatedApiRequest("/test")).rejects.toThrow("VITE_API_BASE_URL");
  });

  it("propagates network errors", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("Network failure"));
    await expect(authenticatedApiRequest("/test")).rejects.toThrow("Network failure");
  });
});
