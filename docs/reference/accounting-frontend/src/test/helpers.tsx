import React, { type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { AuthContext } from "@/contexts/AuthContext";
import { CompanyContext } from "@/contexts/CompanyContext";
import type { User, Session } from "@supabase/supabase-js";

// ── Factory helpers ──────────────────────────────────────────────────────────

export function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "test@example.com",
    aud: "authenticated",
    role: "authenticated",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    app_metadata: {},
    user_metadata: {},
    ...overrides,
  } as User;
}

export function mockSession(overrides: Partial<Session> = {}): Session {
  return {
    access_token: "test-token",
    refresh_token: "refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: mockUser(),
    ...overrides,
  } as Session;
}

export function mockCompany(overrides: Record<string, unknown> = {}) {
  return {
    id: "company-1",
    name: "Test AB",
    org_number: "556000-0001",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

// ── Context value builders ───────────────────────────────────────────────────

export function buildAuthValue(overrides: Record<string, unknown> = {}) {
  return {
    user: null,
    session: null,
    profile: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    resendSignupVerification: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
    refreshProfile: vi.fn(),
    ...overrides,
  };
}

export function buildCompanyValue(overrides: Record<string, unknown> = {}) {
  return {
    companies: [],
    activeCompany: null,
    setActiveCompany: vi.fn(),
    createCompany: vi.fn(),
    refreshCompanies: vi.fn(),
    loadingCompanies: false,
    ...overrides,
  };
}

// ── Stub providers ───────────────────────────────────────────────────────────

export function AuthContextStub({
  children,
  value,
}: {
  children: ReactNode;
  value: ReturnType<typeof buildAuthValue>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <AuthContext.Provider value={value as any}>{children}</AuthContext.Provider>;
}

export function CompanyContextStub({
  children,
  value,
}: {
  children: ReactNode;
  value: ReturnType<typeof buildCompanyValue>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <CompanyContext.Provider value={value as any}>{children}</CompanyContext.Provider>;
}

// ── Test wrapper factory ─────────────────────────────────────────────────────

export function createTestWrapper({
  authValue = buildAuthValue(),
  companyValue = buildCompanyValue(),
  initialEntries = ["/"],
}: {
  authValue?: ReturnType<typeof buildAuthValue>;
  companyValue?: ReturnType<typeof buildCompanyValue>;
  initialEntries?: string[];
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContextStub value={authValue}>
          <CompanyContextStub value={companyValue}>
            <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
          </CompanyContextStub>
        </AuthContextStub>
      </QueryClientProvider>
    );
  };
}

// ── MockWebSocket ────────────────────────────────────────────────────────────

type CloseListenerEntry = {
  handler: EventListenerOrEventHandlerNonNull;
  once: boolean;
};

export class MockWebSocket {
  static OPEN = 1;
  static CONNECTING = 0;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances: MockWebSocket[] = [];

  url: string;
  readyState = 0;
  onopen: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  sentMessages: string[] = [];

  private closeListeners: CloseListenerEntry[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close() {
    if (this.readyState !== MockWebSocket.CLOSED) {
      this.simulateClose();
    }
  }

  addEventListener(
    type: string,
    handler: EventListenerOrEventHandlerNonNull,
    options?: { once?: boolean },
  ) {
    if (type === "close") {
      this.closeListeners.push({ handler, once: options?.once ?? false });
    }
  }

  removeEventListener() {}

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    if (this.onopen) this.onopen(new Event("open"));
  }

  simulateMessage(data: string) {
    if (this.onmessage) this.onmessage(new MessageEvent("message", { data }));
  }

  simulateClose() {
    this.readyState = MockWebSocket.CLOSED;
    const ev = new CloseEvent("close");
    if (this.onclose) this.onclose(ev);
    const fired: CloseListenerEntry[] = [];
    for (const entry of this.closeListeners) {
      entry.handler(ev);
      if (entry.once) fired.push(entry);
    }
    this.closeListeners = this.closeListeners.filter((e) => !fired.includes(e));
  }
}
