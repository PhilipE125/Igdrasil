import { vi } from "vitest";

export const supabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithPassword: vi.fn(),
    signOut: vi.fn().mockResolvedValue({}),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    resend: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    upsert: vi.fn().mockReturnThis(),
  })),
};
