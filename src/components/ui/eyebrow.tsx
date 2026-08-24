import { cn } from "@/lib/utils";

/** The uppercase micro-label the landing page uses above every section. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
