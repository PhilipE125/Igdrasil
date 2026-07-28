import { ReactNode } from "react";

interface ProfileRowProps {
  label: string;
  children: ReactNode;
}

export function ProfileRow({ label, children }: ProfileRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground min-w-[140px] pt-0.5 shrink-0">{label}</span>
      <div className="text-sm text-foreground text-right">{children}</div>
    </div>
  );
}
