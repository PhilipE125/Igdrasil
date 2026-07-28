import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { TimeEntry, getCurrentTimer, startTimer, stopTimer, TimerStartRequest } from "@/lib/timeTrackingApi";

interface TimerContextValue {
  runningEntry: TimeEntry | null;
  elapsedSeconds: number;
  isLoading: boolean;
  startTracking: (data: TimerStartRequest) => Promise<void>;
  stopTracking: () => Promise<TimeEntry | null>;
  refresh: () => Promise<void>;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [runningEntry, setRunningEntry] = useState<TimeEntry | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const entry = await getCurrentTimer();
      setRunningEntry(entry);
      if (entry?.elapsed_seconds != null) {
        setElapsedSeconds(entry.elapsed_seconds);
      }
    } catch {
      // Ignore auth errors on background poll
    }
  }, []);

  // 1-second tick for display
  useEffect(() => {
    if (runningEntry) {
      tickRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [runningEntry?.id]);

  // 60-second server sync
  useEffect(() => {
    refresh();
    pollRef.current = setInterval(refresh, 60_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refresh]);

  const startTracking = useCallback(async (data: TimerStartRequest) => {
    setIsLoading(true);
    try {
      const entry = await startTimer(data);
      setRunningEntry(entry);
      setElapsedSeconds(entry.elapsed_seconds ?? 0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopTracking = useCallback(async () => {
    setIsLoading(true);
    try {
      const stopped = await stopTimer();
      setRunningEntry(null);
      setElapsedSeconds(0);
      return stopped;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <TimerContext.Provider value={{ runningEntry, elapsedSeconds, isLoading, startTracking, stopTracking, refresh }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used inside TimerProvider");
  return ctx;
}
