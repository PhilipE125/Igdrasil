import { createContext, type ReactNode } from "react";
import { useRealtimeEvents } from "@/lib/hooks/useRealtimeEvents";

const RealtimeContext = createContext(null);

/**
 * Provider that establishes the WebSocket connection to the event-processor.
 * Place inside AuthProvider and QueryClientProvider.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  useRealtimeEvents();
  return <RealtimeContext.Provider value={null}>{children}</RealtimeContext.Provider>;
}
