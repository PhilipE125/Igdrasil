import { ReactNode } from "react";

interface ProfileGroupProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function ProfileGroup({ title, children, action }: ProfileGroupProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-semibold uppercase text-muted-foreground">{title}</h2>
        {action}
      </div>
      <div className="rounded-lg border border-border bg-card px-5">{children}</div>
    </div>
  );
}
