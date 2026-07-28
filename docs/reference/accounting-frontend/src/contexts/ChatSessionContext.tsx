/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { useAcpSession, type UseAcpSessionResult } from "@/lib/hooks/useAcpSession";

const WIDTH_STORAGE_KEY = "igdrasil_chat_drawer_width";
const DEFAULT_WIDTH = 440;
const MIN_WIDTH = 340;
const MAX_WIDTH = 900;

interface ChatSessionContextValue {
  session: UseAcpSessionResult;
  /** Drawer visible in the layout. */
  open: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  /** Current drawer width in px (clamped). */
  width: number;
  setWidth: (w: number) => void;
}

const ChatSessionContext = createContext<ChatSessionContextValue | null>(null);

function clampWidth(w: number): number {
  if (Number.isNaN(w)) return DEFAULT_WIDTH;
  return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, w));
}

function readStoredWidth(): number {
  if (typeof window === "undefined") return DEFAULT_WIDTH;
  const raw = window.localStorage.getItem(WIDTH_STORAGE_KEY);
  if (!raw) return DEFAULT_WIDTH;
  const n = Number(raw);
  return Number.isFinite(n) ? clampWidth(n) : DEFAULT_WIDTH;
}

export function ChatSessionProvider({ children }: { children: React.ReactNode }) {
  const { activeCompany } = useCompany();
  const session = useAcpSession(activeCompany?.id);

  const [open, setOpen] = useState(false);
  const [width, setWidthState] = useState<number>(() => readStoredWidth());

  // Persist width changes (debounced via rAF to avoid thrashing localStorage
  // while the user is dragging the handle).
  const pendingWrite = useRef<number | null>(null);
  useEffect(() => {
    if (pendingWrite.current !== null) cancelAnimationFrame(pendingWrite.current);
    pendingWrite.current = requestAnimationFrame(() => {
      try {
        window.localStorage.setItem(WIDTH_STORAGE_KEY, String(width));
      } catch {
        // Safari private mode etc. — width just won't persist, that's fine.
      }
    });
    return () => {
      if (pendingWrite.current !== null) cancelAnimationFrame(pendingWrite.current);
    };
  }, [width]);

  const openChat = useCallback(() => setOpen(true), []);
  const closeChat = useCallback(() => setOpen(false), []);
  const toggleChat = useCallback(() => setOpen((o) => !o), []);
  const setWidth = useCallback((w: number) => setWidthState(clampWidth(w)), []);

  const value = useMemo<ChatSessionContextValue>(() => ({
    session,
    open,
    openChat,
    closeChat,
    toggleChat,
    width,
    setWidth,
  }), [session, open, openChat, closeChat, toggleChat, width, setWidth]);

  return (
    <ChatSessionContext.Provider value={value}>
      {children}
    </ChatSessionContext.Provider>
  );
}

export function useChatSession(): ChatSessionContextValue {
  const ctx = useContext(ChatSessionContext);
  if (!ctx) {
    throw new Error("useChatSession must be used within a ChatSessionProvider");
  }
  return ctx;
}

export const CHAT_WIDTH_BOUNDS = {
  default: DEFAULT_WIDTH,
  min: MIN_WIDTH,
  max: MAX_WIDTH,
};
