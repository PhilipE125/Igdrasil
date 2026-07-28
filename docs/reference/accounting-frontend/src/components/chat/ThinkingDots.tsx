import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  inline?: boolean;
}

/**
 * Braille-cell column-fill loader. Keyframes live in `src/index.css` under
 * `.braille-loader` — we just toggle presentation here.
 *
 * The element body is intentionally empty; the characters render via the
 * `::after` pseudo-element's animated `content` property so React children
 * never collide with them. Visual characters are decorative — a11y is handled
 * via `role="status"` + `aria-label`.
 */
export function ThinkingDots({ className, inline = false }: Props) {
  return (
    <span
      className={cn(
        "braille-loader text-muted-foreground/70",
        inline
          ? "align-middle ml-1 text-[13.5px]"
          : "block px-1 py-1 text-[14px]",
        className,
      )}
      aria-label="Loading"
      role="status"
    />
  );
}
