import { useEffect, useRef } from "react";

/**
 * Calls startNewThread when the active company *changes*, but not on first mount.
 * Prevents wiping the current thread on page navigation.
 */
export function useCompanyThread(
  companyId: string | undefined,
  startNewThread: () => void,
) {
  const prevRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = companyId;
    if (prev !== undefined && prev !== companyId) {
      startNewThread();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);
}
