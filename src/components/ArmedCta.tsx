"use client";

import type { CSSProperties } from "react";
import { ARM_TIMEOUT_MS, useArmedCta } from "@/hooks/useArmedCta";
import { cn } from "@/lib/utils";

type ArmedCtaProps = {
  href: string;
  /** Resting label, e.g. "Get started". */
  label: string;
  /** Label once armed — names the destination, e.g. "Go to Igdrasil onboarding →". */
  armedLabel: string;
  /** Host shown beneath the button while armed. */
  caption?: string;
  className?: string;
};

/**
 * A CTA that names its destination before it takes you there.
 *
 * Click once and the label swaps to `armedLabel`; click again to navigate.
 * The button is sized to the wider of the two labels so arming never shifts
 * layout, and a hairline drains along the bottom edge for the armed window so
 * the automatic release reads as deliberate rather than broken.
 */
export function ArmedCta({
  href,
  label,
  armedLabel,
  caption,
  className,
}: ArmedCtaProps) {
  const { armed, arm, ref } = useArmedCta();

  return (
    <span className="flex flex-col items-center">
      <a
        ref={ref}
        href={href}
        // Announce the current state — the second activation must do what the
        // label a screen reader last heard actually promised.
        aria-label={armed ? armedLabel : label}
        onClick={(e) => {
          // Armed: fall through so this stays a real navigation and
          // ⌘-click / middle-click / "copy link address" keep working.
          if (armed) return;
          e.preventDefault();
          arm();
        }}
        style={{ "--drain-duration": `${ARM_TIMEOUT_MS}ms` } as CSSProperties}
        className={cn(
          "relative inline-flex h-11 items-center justify-center overflow-hidden rounded-[10px] px-8 text-base font-semibold text-background transition-colors",
          armed
            ? "bg-foreground-armed"
            : "bg-foreground shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.2)] hover:bg-foreground/85 hover:shadow-none",
          className,
        )}
      >
        {/* Both labels share one grid cell, so the button sizes to the wider
            of the two and arming swaps text without moving anything. */}
        <span className="grid">
          <span
            className={cn(
              "col-start-1 row-start-1 whitespace-nowrap transition-opacity duration-200",
              armed ? "opacity-0" : "opacity-100",
            )}
          >
            {label}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "col-start-1 row-start-1 whitespace-nowrap transition-opacity duration-200",
              armed ? "opacity-100" : "opacity-0",
            )}
          >
            {armedLabel}
          </span>
        </span>

        {armed && (
          <span
            aria-hidden="true"
            className="animate-drain absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent"
          />
        )}
      </a>

      {caption && (
        <span
          aria-hidden="true"
          className={cn(
            "overflow-hidden font-mono text-[11px] text-muted-foreground transition-all duration-300",
            armed ? "mt-3 h-4 opacity-100" : "h-0 opacity-0",
          )}
        >
          {caption}
        </span>
      )}
    </span>
  );
}
