"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** How long an armed CTA stays armed before releasing itself. */
export const ARM_TIMEOUT_MS = 6000;

/**
 * Two-step CTA state: the first click arms, the second acts.
 *
 * An armed CTA releases on Escape, on any click outside it, or after
 * ARM_TIMEOUT_MS — so a stray tap never leaves the button in a state the
 * visitor didn't choose.
 *
 * Clicks *inside* the returned ref are ignored by the outside-click listener.
 * That containment check is what keeps the arming click from immediately
 * disarming: App Router hydrates the whole document, so React's delegated
 * listener and this one share a node, and stopPropagation would not separate
 * them.
 */
export function useArmedCta(timeoutMs: number = ARM_TIMEOUT_MS) {
  const [armed, setArmed] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!armed) return;

    const disarm = () => setArmed(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return;
      disarm();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") disarm();
    };

    const timer = window.setTimeout(disarm, timeoutMs);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [armed, timeoutMs]);

  const arm = useCallback(() => setArmed(true), []);

  return { armed, arm, ref };
}
